import { createBackgroundClient } from '@/lib/supabase/server';
import { invokeBedrock } from '@/lib/bedrock';
import { getSkill } from '@/lib/skills';
import { parseOutreachResponse } from '@/lib/parsers';
import { verifyQStashSignature } from '@/lib/verify-qstash';
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

  if (lp.outreach_result) {
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
    const leadMagnetTitle = lp.lead_magnet_result?.title || audit.leadMagnetTitle || `${audit.niche || 'Home Service'} Checklist for ${audit.city || 'Local'} Homeowners`;

    const context = `
ALL INPUTS ARE PROVIDED. Generate all 9 scripts immediately. Do not ask clarifying questions.

BUSINESS CONTEXT:
- business_name: ${audit.businessName || 'Unknown Business'}
- niche: ${audit.niche || 'Home Services'}
- city_region: ${audit.city || 'Unknown'}
- money_leak: ${audit.leak || 'Generic landing page with no lead capture'}
- avatar_pain: ${audit.avatarPain || 'Fear of hiring the wrong contractor'}
- loom_hook: ${audit.loomHook || 'I found something on your landing page that is costing you leads every day.'}
- lead_magnet_title: ${leadMagnetTitle}
`;

    const outreachSkill = await getSkill(supabase, userId, 'outreach');
    const outreachRaw = await invokeBedrock(context, settings, { systemPrompt: outreachSkill, maxTokens: 8000, timeoutMs: 300000 });

    const { data: fresh } = await supabase.from('landing_pages').select('pipeline_status').eq('id', landingPageId).single();
    if (fresh?.pipeline_status === 'stopped') {
      return NextResponse.json({ status: 'stopped-during-execution' });
    }

    const scripts = parseOutreachResponse(outreachRaw);

    await supabase.from('landing_pages').update({
      outreach_result: { scripts },
      current_step: 'done',
      pipeline_status: 'complete',
    }).eq('id', landingPageId);

    if (lp.business_id) {
      await supabase
        .from('deal_tracking')
        .upsert(
          { business_id: lp.business_id },
          { onConflict: 'business_id', ignoreDuplicates: true }
        );
    }

    return NextResponse.json({ status: 'complete' });
  } catch (error) {
    console.error(`[pipeline/outreach] Failed for ${landingPageId}:`, error.message);
    await supabase.from('landing_pages').update({
      pipeline_status: 'error',
      error_message: error.message || 'Outreach generation failed',
    }).eq('id', landingPageId).then(null, (dbErr) => {
      console.error(`[pipeline/outreach] Failed to write error state for ${landingPageId}:`, dbErr.message);
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
