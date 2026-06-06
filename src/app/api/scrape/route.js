import { createClient } from '@/lib/supabase/server';
import { scrapePage } from '@/lib/scraper';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { url, landingPageId } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Verify ownership if a landingPageId is provided
    if (landingPageId) {
      const { data: lp } = await supabase
        .from('landing_pages')
        .select('id, businesses!inner(user_id)')
        .eq('id', landingPageId)
        .single();

      if (!lp) {
        return NextResponse.json({ error: 'Landing page not found' }, { status: 404 });
      }
      if (lp.businesses?.user_id !== user.id) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
      }
    }

    const result = await scrapePage(url);

    if (landingPageId) {
      if (result.success) {
        await supabase
          .from('landing_pages')
          .update({
            scraped_data: result.data,
            scrape_status: 'success',
            current_step: 'audit',
          })
          .eq('id', landingPageId);
      } else {
        await supabase
          .from('landing_pages')
          .update({
            scrape_status: 'failed',
            pipeline_status: 'error',
            error_message: result.error || 'Scrape failed',
          })
          .eq('id', landingPageId);
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
