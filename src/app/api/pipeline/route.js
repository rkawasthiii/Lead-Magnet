import { createClient } from '@/lib/supabase/server';
import { publishStep } from '@/lib/qstash';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { landingPageId } = await request.json();
  if (!landingPageId) return NextResponse.json({ error: 'landingPageId required' }, { status: 400 });

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

  const { data: claimed } = await supabase
    .from('landing_pages')
    .update({ pipeline_status: 'running', current_step: 'audit' })
    .eq('id', landingPageId)
    .neq('pipeline_status', 'running')
    .select('id')
    .single();

  if (!claimed) {
    return NextResponse.json({ error: 'Pipeline already running' }, { status: 409 });
  }

  await publishStep('audit', { landingPageId, userId: user.id });

  return NextResponse.json({ status: 'started' });
}

export async function DELETE(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { landingPageId } = await request.json();

  const { data: lp } = await supabase
    .from('landing_pages')
    .select('pipeline_status, businesses!inner(user_id)')
    .eq('id', landingPageId)
    .single();

  if (!lp) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (lp.businesses?.user_id !== user.id) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  if (lp.pipeline_status !== 'running') return NextResponse.json({ error: 'Pipeline not running' }, { status: 400 });

  await supabase.from('landing_pages').update({
    pipeline_status: 'stopped',
    error_message: 'Manually stopped',
  }).eq('id', landingPageId);

  return NextResponse.json({ status: 'stopped' });
}
