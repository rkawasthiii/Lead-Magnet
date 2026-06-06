'use client';

import { Building2, Send, DollarSign, TrendingUp } from 'lucide-react';

export default function DashboardStats({ businesses = [], tracking = [] }) {
  const total = businesses.length;
  const pitched = tracking.filter((t) => t.loom_sent).length;
  const revenue = tracking
    .filter((t) => t.payment_received)
    .reduce((sum, t) => sum + (parseFloat(t.payment_amount) || 0), 0);
  const closed = tracking.filter((t) => t.payment_received).length;
  const conversionRate = pitched > 0 ? Math.round((closed / pitched) * 100) : 0;

  const stats = [
    { label: 'Total Businesses', value: total, icon: Building2, color: 'text-[#F5FF5C]' },
    { label: 'Deals Pitched', value: pitched, icon: Send, color: 'text-[#3B82F6]' },
    { label: 'Revenue', value: `$${revenue.toLocaleString()}`, icon: DollarSign, color: 'text-[#3ECF8E]' },
    { label: 'Conversion Rate', value: `${conversionRate}%`, icon: TrendingUp, color: 'text-[#F0A500]' },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-[#111] border border-[#222] rounded-xl p-5">
          <div className="flex items-center gap-3">
            <Icon size={18} className={color} />
            <p className="text-[#777] text-sm">{label}</p>
          </div>
          <p className={`text-2xl font-semibold mt-2 ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  );
}
