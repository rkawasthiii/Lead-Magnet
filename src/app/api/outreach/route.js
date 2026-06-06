import { createClient } from '@/lib/supabase/server';
import { invokeBedrock } from '@/lib/bedrock';
import { getSkill } from '@/lib/skills';
import { parseOutreachResponse } from '@/lib/parsers';
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
    const leadMagnetTitle = landingPage.lead_magnet_result?.title || audit.leadMagnetTitle || `${audit.niche || 'Home Service'} Checklist for ${audit.city || 'Local'} Homeowners`;

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

    const skillContent = await getSkill(supabase, user.id, 'outreach');

    const { data: claimed } = await supabase
      .from('landing_pages')
      .update({ current_step: 'outreach', pipeline_status: 'running' })
      .eq('id', landingPageId)
      .neq('pipeline_status', 'running')
      .select('id')
      .single();

    if (!claimed) {
      return NextResponse.json({ error: 'Pipeline already running' }, { status: 409 });
    }

    const response = await invokeBedrock(context, settings, { systemPrompt: skillContent, maxTokens: 8000, timeoutMs: 300000, retries: 1 });
    const scripts = parseOutreachResponse(response);

    await supabase
      .from('landing_pages')
      .update({
        outreach_result: { scripts },
        current_step: 'done',
        pipeline_status: 'complete',
      })
      .eq('id', landingPageId);

    if (landingPage.business_id) {
      await supabase
        .from('deal_tracking')
        .upsert(
          { business_id: landingPage.business_id },
          { onConflict: 'business_id', ignoreDuplicates: true }
        );
    }

    return NextResponse.json({ scripts });
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
