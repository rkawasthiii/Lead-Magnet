import { createClient } from '@/lib/supabase/server';
import { getDefaultSkill } from '@/lib/skills';
import { NextResponse } from 'next/server';

const SKILL_NAMES = ['audit', 'copy', 'leadmagnet', 'outreach'];

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: skills } = await supabase
      .from('skills')
      .select('name, content')
      .eq('user_id', user.id);

    const result = {};
    for (const name of SKILL_NAMES) {
      const dbSkill = (skills || []).find((s) => s.name === name);
      result[name] = dbSkill?.content || getDefaultSkill(name);
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
