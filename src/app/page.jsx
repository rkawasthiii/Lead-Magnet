'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    async function check() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      router.replace(user ? '/dashboard' : '/login');
    }
    check();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080808]">
      <div className="animate-pulse text-[#777]">Loading...</div>
    </div>
  );
}
