import { createClient } from '@/lib/supabase/server';
import { getSkill, getDefaultSkill } from '@/lib/skills';
import { NextResponse } from 'next/server';

const VALID_SKILLS = ['audit', 'copy', 'leadmagnet', 'outreach'];

export async function GET(request, { params }) {
  try {
    const { name } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!VALID_SKILLS.includes(name)) {
      return NextResponse.json({ error: 'Invalid skill name' }, { status: 400 });
    }

    const content = await getSkill(supabase, user.id, name);
    return NextResponse.json({ name, content });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { name } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!VALID_SKILLS.includes(name)) {
      return NextResponse.json({ error: 'Invalid skill name' }, { status: 400 });
    }

    const { content } = await request.json();

    const { error } = await supabase
      .from('skills')
      .upsert(
        {
          user_id: user.id,
          name,
          content,
          is_default: false,
        },
        { onConflict: 'user_id,name' }
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { name } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!VALID_SKILLS.includes(name)) {
      return NextResponse.json({ error: 'Invalid skill name' }, { status: 400 });
    }

    const defaultContent = getDefaultSkill(name);

    const { error } = await supabase
      .from('skills')
      .upsert(
        {
          user_id: user.id,
          name,
          content: defaultContent,
          is_default: true,
        },
        { onConflict: 'user_id,name' }
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, content: defaultContent });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
