import { createClient } from '@/lib/supabase/server';
import { invokeBedrock } from '@/lib/bedrock';
import { getSkill } from '@/lib/skills';
import { parseAuditResponse } from '@/lib/parsers';
import { NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let landingPageId;

  try {
    ({ landingPageId } = await request.json());

    const { data: settings } = await supabase
      .from('user_settings')
      .select('bearer_token, model_id, aws_region')
      .eq('user_id', user.id)
      .single();

    if (!settings?.bearer_token) {
      return NextResponse.json({ error: 'Bedrock API key not configured. Go to Settings.' }, { status: 400 });
    }

    const { data: landingPage } = await supabase
      .from('landing_pages')
      .select('*, businesses!inner(user_id)')
      .eq('id', landingPageId)
      .single();

    if (!landingPage) {
      return NextResponse.json({ error: 'Landing page not found' }, { status: 404 });
    }

    if (landingPage.businesses?.user_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const scrapedData = landingPage.scraped_data;
    const rawCopy = landingPage.raw_copy;

    let pageContent;
    if (rawCopy) {
      pageContent = `LANDING PAGE CONTENT (manually pasted):\n\n${rawCopy}`;
    } else {
      const aboveFold = scrapedData?.aboveFoldText || scrapedData?.fullBodyText || '';
      const fullBody = scrapedData?.fullBodyText || '';

      if (aboveFold.length < 100) {
        return NextResponse.json({
          error: 'Not enough content scraped from this page (likely JavaScript-rendered). Please paste the landing page copy manually.',
        }, { status: 400 });
      }

      pageContent = `URL: ${scrapedData?.url || 'N/A'}
Title: ${scrapedData?.title || 'N/A'}

ABOVE THE FOLD (what the visitor sees first — AUDIT THIS):
${aboveFold}

CTAs visible on page: ${(scrapedData?.ctaTexts || []).join(', ')}
Phone numbers on page: ${(scrapedData?.phones || []).join(', ') || 'None found'}
Has Email Capture Form: ${scrapedData?.hasEmailCapture ? 'Yes' : 'No'}
Images on page: ${(scrapedData?.imageAlts || []).join(', ') || 'None detected'}

ADDITIONAL CONTEXT (rest of page — use for niche/business detection only, NOT for auditing):
Headings: ${(scrapedData?.headings || []).join(', ')}
${fullBody.slice(0, 2000)}
Meta Description: ${scrapedData?.metaDescription || 'N/A'}`;
    }

    const skillContent = await getSkill(supabase, user.id, 'audit');

    const { data: claimed } = await supabase
      .from('landing_pages')
      .update({ current_step: 'audit', pipeline_status: 'running' })
      .eq('id', landingPageId)
      .neq('pipeline_status', 'running')
      .select('id')
      .single();

    if (!claimed) {
      return NextResponse.json({ error: 'Pipeline already running' }, { status: 409 });
    }

    const response = await invokeBedrock(pageContent, settings, { systemPrompt: skillContent, timeoutMs: 300000, retries: 1 });
    const auditResult = parseAuditResponse(response);

    await supabase
      .from('landing_pages')
      .update({
        audit_result: auditResult,
        current_step: 'copy',
        copy_result: null,
        lead_magnet_result: null,
        outreach_result: null,
      })
      .eq('id', landingPageId);

    const updates = {};
    if (auditResult.niche) updates.niche = auditResult.niche;
    if (auditResult.city) updates.city = auditResult.city;

    if (Object.keys(updates).length > 0 && landingPage.business_id) {
      await supabase.from('businesses').update(updates).eq('id', landingPage.business_id);
    }

    return NextResponse.json({ auditResult });
  } catch (error) {
    if (landingPageId) {
      await supabase.from('landing_pages').update({
        pipeline_status: 'error',
        error_message: error.message,
      }).eq('id', landingPageId);
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
