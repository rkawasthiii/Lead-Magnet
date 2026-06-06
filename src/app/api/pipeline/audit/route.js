import { createBackgroundClient } from '@/lib/supabase/server';
import { invokeBedrock } from '@/lib/bedrock';
import { getSkill } from '@/lib/skills';
import { parseAuditResponse } from '@/lib/parsers';
import { verifyQStashSignature } from '@/lib/verify-qstash';
import { publishStep } from '@/lib/qstash';
import { NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(request) {
  const payload = await verifyQStashSignature(request);
  if (!payload) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });

  const { landingPageId, userId } = payload;
  const supabase = createBackgroundClient();

  const { data: lp } = await supabase
    .from('landing_pages')
    .select('*')
    .eq('id', landingPageId)
    .single();

  if (!lp || lp.pipeline_status === 'stopped') {
    return NextResponse.json({ status: 'skipped' });
  }

  if (lp.audit_result) {
    await publishStep('copy', { landingPageId, userId });
    return NextResponse.json({ status: 'already-done' });
  }

  const { data: settings } = await supabase
    .from('user_settings')
    .select('bearer_token, model_id, aws_region')
    .eq('user_id', userId)
    .single();

  try {
    const scrapedData = lp.scraped_data;
    const rawCopy = lp.raw_copy;

    let pageContent;
    if (rawCopy) {
      pageContent = `LANDING PAGE CONTENT (manually pasted):\n\n${rawCopy}`;
    } else {
      const aboveFold = scrapedData?.aboveFoldText || scrapedData?.fullBodyText || '';
      if (aboveFold.length < 100) {
        await supabase.from('landing_pages').update({ pipeline_status: 'error', error_message: 'Not enough content scraped. Paste manually.' }).eq('id', landingPageId);
        return NextResponse.json({ status: 'error' });
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
${(scrapedData?.fullBodyText || '').slice(0, 2000)}
Meta Description: ${scrapedData?.metaDescription || 'N/A'}`;
    }

    const auditSkill = await getSkill(supabase, userId, 'audit');
    const auditRaw = await invokeBedrock(pageContent, settings, { systemPrompt: auditSkill, timeoutMs: 300000 });

    const { data: fresh } = await supabase.from('landing_pages').select('pipeline_status').eq('id', landingPageId).single();
    if (fresh?.pipeline_status === 'stopped') {
      return NextResponse.json({ status: 'stopped-during-execution' });
    }

    const auditResult = parseAuditResponse(auditRaw);

    await supabase.from('landing_pages').update({ audit_result: auditResult, current_step: 'copy' }).eq('id', landingPageId);

    const updates = {};
    if (auditResult.niche) updates.niche = auditResult.niche;
    if (auditResult.city) updates.city = auditResult.city;
    if (Object.keys(updates).length > 0 && lp.business_id) {
      await supabase.from('businesses').update(updates).eq('id', lp.business_id);
    }

    await publishStep('copy', { landingPageId, userId });

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error(`[pipeline/audit] Failed for ${landingPageId}:`, error.message);
    await supabase.from('landing_pages').update({
      pipeline_status: 'error',
      error_message: error.message || 'Audit failed',
    }).eq('id', landingPageId).then(null, (dbErr) => {
      console.error(`[pipeline/audit] Failed to write error state for ${landingPageId}:`, dbErr.message);
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
