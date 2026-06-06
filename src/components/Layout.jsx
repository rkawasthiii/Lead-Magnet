'use client';

import Sidebar from './Sidebar';

export default function Layout({ children, businesses = [], activeBusiness = null }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar businesses={businesses} activeBusiness={activeBusiness} />
      <main className="flex-1 overflow-y-auto bg-[#080808]">
        {children}
      </main>
    </div>
  );
}
