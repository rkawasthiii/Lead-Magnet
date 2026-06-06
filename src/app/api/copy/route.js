import { createClient } from '@/lib/supabase/server';
import { invokeBedrock } from '@/lib/bedrock';
import { getSkill } from '@/lib/skills';
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
      return NextResponse.json({ error: 'Bedrock API key not configured' }, { status: 400 });
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

    if (!landingPage.audit_result) {
      return NextResponse.json({ error: 'Audit must complete first' }, { status: 400 });
    }

    const audit = landingPage.audit_result;
    const scraped = landingPage.scraped_data;
    const rawCopy = landingPage.raw_copy;

    const context = `
ALL INPUTS ARE PROVIDED. Generate the copy immediately. Do not ask clarifying questions.

BUSINESS CONTEXT:
- business_name: ${audit.businessName || 'Unknown Business'}
- niche: ${audit.niche || 'Home Services'}
- core_service_offer: ${audit.coreOffer || audit.niche || 'Not specified'}
- city_region: ${audit.city || 'Unknown'}
- current_headline: ${audit.currentHeadline || 'Not detected'}
- current_cta: ${audit.currentCta || 'Not detected'}
- avatar_pain: ${audit.avatarPain || 'Not specified'}
- money_leak: ${audit.leak || 'Generic landing page with no lead capture'}
- lead_magnet_title: ${audit.leadMagnetTitle || ''}

ORIGINAL LANDING PAGE (what visitors see first):
${rawCopy || scraped?.aboveFoldText || scraped?.fullBodyText || 'Not available'}
`;

    const skillContent = await getSkill(supabase, user.id, 'copy');

    const { data: claimed } = await supabase
      .from('landing_pages')
      .update({ current_step: 'copy', pipeline_status: 'running' })
      .eq('id', landingPageId)
      .neq('pipeline_status', 'running')
      .select('id')
      .single();

    if (!claimed) {
      return NextResponse.json({ error: 'Pipeline already running' }, { status: 409 });
    }

    const copyResult = await invokeBedrock(context, settings, { systemPrompt: skillContent, maxTokens: 4096, timeoutMs: 300000, retries: 1 });

    await supabase
      .from('landing_pages')
      .update({ copy_result: copyResult, current_step: 'leadmagnet' })
      .eq('id', landingPageId);

    return NextResponse.json({ copy: copyResult });
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
