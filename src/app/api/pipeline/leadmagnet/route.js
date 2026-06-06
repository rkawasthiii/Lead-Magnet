import { createBackgroundClient } from '@/lib/supabase/server';
import { invokeBedrock } from '@/lib/bedrock';
import { getSkill } from '@/lib/skills';
import { parseLeadMagnetResponse } from '@/lib/parsers';
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

  if (lp.lead_magnet_result) {
    await publishStep('outreach', { landingPageId, userId });
    return NextResponse.json({ status: 'already-done' });
  }

  if (!lp.audit_result) {
    await supabase.from('landing_pages').update({
      pipeline_status: 'error',
      error_message: 'Audit step did not complete. Please re-run the pipeline.',
    }).eq('id', landingPageId);
    return NextResponse.json({ status: 'error', reason: 'missing_audit_result' });
  }

  const { data: settings } = await supabase
    .from('user_settings')
    .select('bearer_token, model_id, aws_region')
    .eq('user_id', userId)
    .single();

  try {
    const audit = lp.audit_result;

    const context = `
ALL INPUTS ARE PROVIDED. Generate the lead magnet prompt immediately. Do not ask clarifying questions.

BUSINESS CONTEXT:
- business_name: ${audit.businessName || 'Unknown Business'}
- niche: ${audit.niche || 'Home Services'}
- core_offer: ${audit.coreOffer || audit.niche || 'Not specified'}
- city_region: ${audit.city || 'Unknown'}
- avatar_pain: ${audit.avatarPain || 'Not specified'}
- money_leak: ${audit.leak || 'Generic landing page with no lead capture'}
- current_cta: ${audit.currentCta || 'Not detected'}
- lead_magnet_title (USE THIS EXACT TITLE): ${audit.leadMagnetTitle || ''}
`;

    const lmSkill = await getSkill(supabase, userId, 'leadmagnet');
    const lmRaw = await invokeBedrock(context, settings, { systemPrompt: lmSkill, maxTokens: 4096, timeoutMs: 300000 });

    const { data: fresh } = await supabase.from('landing_pages').select('pipeline_status').eq('id', landingPageId).single();
    if (fresh?.pipeline_status === 'stopped') {
      return NextResponse.json({ status: 'stopped-during-execution' });
    }

    const leadMagnetResult = parseLeadMagnetResponse(lmRaw);

    await supabase.from('landing_pages').update({ lead_magnet_result: leadMagnetResult, current_step: 'outreach' }).eq('id', landingPageId);

    await publishStep('outreach', { landingPageId, userId });

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error(`[pipeline/leadmagnet] Failed for ${landingPageId}:`, error.message);
    await supabase.from('landing_pages').update({
      pipeline_status: 'error',
      error_message: error.message || 'Lead magnet generation failed',
    }).eq('id', landingPageId).then(null, (dbErr) => {
      console.error(`[pipeline/leadmagnet] Failed to write error state for ${landingPageId}:`, dbErr.message);
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
