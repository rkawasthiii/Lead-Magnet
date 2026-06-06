'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Layout from '@/components/Layout';
import DashboardStats from '@/components/dashboard/DashboardStats';
import TrackingTable from '@/components/tracking/TrackingTable';

export default function TrackingPage() {
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;
  const [businesses, setBusinesses] = useState([]);
  const [tracking, setTracking] = useState([]);
  const [selectedBiz, setSelectedBiz] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const [bizRes, trackRes] = await Promise.all([
      supabase.from('businesses').select('*').order('created_at', { ascending: false }),
      supabase.from('deal_tracking').select('*'),
    ]);
    setBusinesses(bizRes.data || []);
    setTracking(trackRes.data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredTracking = selectedBiz === 'all'
    ? tracking
    : tracking.filter((t) => t.business_id === selectedBiz);

  if (loading) {
    return (
      <Layout businesses={[]}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse text-[#777]">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout businesses={businesses}>
      <div className="p-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">Deal Tracking</h1>
          <select
            value={selectedBiz}
            onChange={(e) => setSelectedBiz(e.target.value)}
            className="bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-sm text-[#ccc]"
          >
            <option value="all">All Businesses</option>
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <DashboardStats businesses={businesses} tracking={tracking} />

        <div className="mt-8 bg-[#111] border border-[#222] rounded-xl p-4">
          {filteredTracking.length === 0 ? (
            <p className="text-[#777] text-center py-8">No deals tracked yet. Run the pipeline on a business to start tracking.</p>
          ) : (
            <TrackingTable tracking={filteredTracking} businesses={businesses} onUpdate={loadData} />
          )}
        </div>
      </div>
    </Layout>
  );
}
