'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Target, FileText, Settings, LogOut, Building2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tracking', label: 'Tracking', icon: Target },
  { href: '/skills', label: 'Skills', icon: FileText },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ businesses = [], activeBusiness = null }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <aside className="w-[220px] h-screen flex flex-col bg-[#0A0A0A] border-r border-[#222] shrink-0">
      <div className="p-5">
        <Link href="/dashboard" className="text-lg font-semibold">
          <span className="text-[#F5FF5C]">LeadGen</span>
          <span className="text-[#555]"> Machine</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-[#181818] text-white border-l-2 border-[#F5FF5C]'
                  : 'text-[#777] hover:text-white hover:bg-[#111]'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}

        <div className="pt-4 pb-2 px-3">
          <p className="text-[10px] uppercase tracking-wider text-[#444] font-medium">Businesses</p>
        </div>

        <div className="space-y-0.5 max-h-[300px] overflow-y-auto">
          {businesses.map((biz) => {
            const active = activeBusiness?.id === biz.id;
            return (
              <Link
                key={biz.id}
                href={`/business/${biz.id}`}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-[#181818] text-white border-l-2 border-[#F5FF5C]'
                    : 'text-[#777] hover:text-white hover:bg-[#111]'
                }`}
              >
                <Building2 size={14} />
                <span className="truncate">{biz.name}</span>
                {biz.niche && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-[#222] text-[#777]">
                    {biz.niche}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-3 border-t border-[#222]">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3 py-2 w-full rounded-lg text-sm text-[#777] hover:text-white hover:bg-[#111] transition-colors"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
