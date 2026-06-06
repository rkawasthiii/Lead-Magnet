'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Layout from '@/components/Layout';
import DashboardStats from '@/components/dashboard/DashboardStats';
import BusinessCard from '@/components/dashboard/BusinessCard';
import AddBusinessModal from '@/components/dashboard/AddBusinessModal';

export default function DashboardPage() {
  const [businesses, setBusinesses] = useState([]);
  const [tracking, setTracking] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const loadData = useCallback(async () => {
    const { data: bizData } = await supabase
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: trackData } = await supabase
      .from('deal_tracking')
      .select('*');

    setBusinesses(bizData || []);
    setTracking(trackData || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetch('/api/auth/seed-skills', { method: 'POST' }).catch(() => {});
    loadData();
  }, [loadData]);

  function getTrackingForBusiness(bizId) {
    return tracking.find((t) => t.business_id === bizId);
  }

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
      <div className="p-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#F5FF5C] text-black font-medium rounded-lg hover:bg-[#E8F050] transition-colors"
          >
            <Plus size={16} />
            Add Business
          </button>
        </div>

        <DashboardStats businesses={businesses} tracking={tracking} />

        <div className="mt-8">
          {businesses.length === 0 ? (
            <div className="text-center py-16 text-[#777]">
              <p className="text-lg mb-2">No businesses yet</p>
              <p className="text-sm">Click "Add Business" to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {businesses.map((biz) => (
                <BusinessCard
                  key={biz.id}
                  business={biz}
                  tracking={getTrackingForBusiness(biz.id)}
                  onDelete={loadData}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AddBusinessModal open={showAdd} onClose={() => { setShowAdd(false); loadData(); }} />
    </Layout>
  );
}
