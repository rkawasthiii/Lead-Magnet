import { createClient, createServiceClient } from '@/lib/supabase/server';
import { seedSkillsForUser } from '@/lib/skills';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use service client to bypass RLS for seeding
    const serviceClient = await createServiceClient();
    await seedSkillsForUser(serviceClient, user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
