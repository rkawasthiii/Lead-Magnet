'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Layout from '@/components/Layout';
import BusinessHeader from '@/components/business/BusinessHeader';
import URLInputPanel from '@/components/business/URLInputPanel';
import ProgressStepper from '@/components/business/ProgressStepper';
import AuditTab from '@/components/business/tabs/AuditTab';
import CopyTab from '@/components/business/tabs/CopyTab';
import LeadMagnetTab from '@/components/business/tabs/LeadMagnetTab';
import OutreachTab from '@/components/business/tabs/OutreachTab';
import TrackingTable from '@/components/tracking/TrackingTable';
import Toast from '@/components/ui/Toast';

const TABS = [
  { key: 'audit', label: 'Audit' },
  { key: 'copy', label: 'New Copy' },
  { key: 'leadmagnet', label: 'Lead Magnet' },
  { key: 'outreach', label: 'Outreach' },
  { key: 'tracking', label: 'Tracking' },
];

const POLL_STATUS_FIELDS = 'id, pipeline_status, current_step, error_message, scrape_status, updated_at, created_at';

export default function BusinessPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const [business, setBusiness] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [landingPage, setLandingPage] = useState(null);
  const [tracking, setTracking] = useState([]);
  const [activeTab, setActiveTab] = useState('audit');
  const activeTabRef = useRef(activeTab);
  const userSelectedTabRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [toast, setToast] = useState(null);

  const loadData = useCallback(async () => {
    const [bizRes, allBizRes, lpRes, trackRes] = await Promise.all([
      supabase.from('businesses').select('id, name, niche, city, status, website_url, created_at, updated_at').eq('id', id).single(),
      supabase.from('businesses').select('id, name, niche, city, status, website_url, updated_at').order('created_at', { ascending: false }),
      supabase.from('landing_pages').select('*').eq('business_id', id).order('created_at', { ascending: false }).limit(1),
      supabase.from('deal_tracking').select('*').eq('business_id', id),
    ]);

    setBusiness(bizRes.data);
    setBusinesses(allBizRes.data || []);

    const latestLp = lpRes.data?.[0] || null;
    if (latestLp?.pipeline_status === 'error' && !latestLp?.audit_result) {
      const { data: successfulRuns } = await supabase
        .from('landing_pages')
        .select('*')
        .eq('business_id', id)
        .eq('pipeline_status', 'complete')
        .order('created_at', { ascending: false })
        .limit(1);
      if (successfulRuns?.[0]) {
        setLandingPage(successfulRuns[0]);
      } else {
        setLandingPage(latestLp);
      }
    } else {
      setLandingPage(latestLp);
    }

    setTracking(trackRes.data || []);
    setLoading(false);
  }, [id, supabase]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);

  const pollingRef = useRef(null);
  const activeLandingPageRef = useRef(null);
  const lastStepRef = useRef(null);

  function cleanupPolling() {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }

  function startPolling(lpId) {
    activeLandingPageRef.current = lpId;
    setPipelineRunning(true);
    userSelectedTabRef.current = false;
    lastStepRef.current = null;
    let lastUpdatedAt = 0;

    cleanupPolling();
    pollingRef.current = setInterval(async () => {
      const { data } = await supabase
        .from('landing_pages')
        .select(POLL_STATUS_FIELDS)
        .eq('id', lpId)
        .single();

      if (!data) return;

      const updatedAtMs = new Date(data.updated_at).getTime();
      if (updatedAtMs <= lastUpdatedAt) return;
      lastUpdatedAt = updatedAtMs;

      const stepChanged = data.current_step !== lastStepRef.current;
      lastStepRef.current = data.current_step;

      if (stepChanged || data.pipeline_status === 'complete') {
        const { data: full } = await supabase
          .from('landing_pages')
          .select('*')
          .eq('id', lpId)
          .single();
        if (full) {
          setLandingPage(full);

          if (!userSelectedTabRef.current) {
            const tab = activeTabRef.current;
            if (full.outreach_result && tab !== 'outreach') {
              setActiveTab('outreach');
            } else if (full.lead_magnet_result && !full.outreach_result && tab !== 'leadmagnet') {
              setActiveTab('leadmagnet');
            } else if (full.copy_result && !full.lead_magnet_result && tab !== 'copy') {
              setActiveTab('copy');
            } else if (full.audit_result && !full.copy_result && tab !== 'audit') {
              setActiveTab('audit');
            }
          }
        }
      } else {
        setLandingPage((prev) => prev ? { ...prev, ...data } : data);
      }

      if (data.pipeline_status === 'complete') {
        cleanupPolling();
        setPipelineRunning(false);
        setStopping(false);
        setToast({ message: 'Pipeline complete!', type: 'success' });
        await loadData();
      } else if (data.pipeline_status === 'error' || data.pipeline_status === 'stopped') {
        cleanupPolling();
        setPipelineRunning(false);
        setStopping(false);
        if (data.pipeline_status === 'stopped') {
          setToast({ message: 'Pipeline stopped.', type: 'success' });
        } else {
          setToast({ message: data.error_message || 'Pipeline failed', type: 'error' });
        }
        await loadData();
      } else if (data.pipeline_status === 'running' || data.pipeline_status === 'scraping') {
        const startedAt = new Date(data.updated_at || data.created_at).getTime();
        const now = Date.now();
        const maxAge = data.pipeline_status === 'scraping' ? 120000 : 600000;
        if (now - startedAt > maxAge) {
          cleanupPolling();
          setPipelineRunning(false);
          setStopping(false);
          await supabase.from('landing_pages').update({
            pipeline_status: 'error',
            error_message: data.pipeline_status === 'scraping'
              ? 'Scrape timed out. Try again or paste copy manually.'
              : 'Pipeline timed out. Please try again.',
          }).eq('id', lpId);
          setToast({ message: 'Pipeline timed out. Please try again.', type: 'error' });
          await loadData();
        }
      }
    }, 2000);
  }

  useEffect(() => {
    if (!landingPage?.id || pollingRef.current) {
      return cleanupPolling;
    }

    if (landingPage.pipeline_status === 'running') {
      startPolling(landingPage.id);
    } else if (landingPage.pipeline_status === 'scraping' && landingPage.scrape_status === 'success') {
      runPipeline(landingPage.id);
    } else if (landingPage.pipeline_status === 'scraping') {
      startPolling(landingPage.id);
    }

    return cleanupPolling;
  }, [landingPage?.id, landingPage?.pipeline_status, landingPage?.scrape_status]);

  async function runPipeline(landingPageId) {
    if (pollingRef.current) return;
    try {
      const res = await fetch('/api/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ landingPageId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status !== 409) {
          setToast({ message: err.error || 'Pipeline failed to start', type: 'error' });
        }
        setPipelineRunning(false);
        return;
      }
    } catch {
      setToast({ message: 'Network error — pipeline may not have started', type: 'error' });
      setPipelineRunning(false);
      return;
    }
    startPolling(landingPageId);
  }

  async function stopPipeline() {
    if (!activeLandingPageRef.current) return;
    setStopping(true);
    const res = await fetch('/api/pipeline', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ landingPageId: activeLandingPageRef.current }),
    });
    if (!res.ok) {
      setStopping(false);
      const err = await res.json().catch(() => ({}));
      setToast({ message: err.error || 'Failed to stop pipeline', type: 'error' });
    }
  }

  async function handleURL(url) {
    try {
      const { data: lp, error: insertError } = await supabase
        .from('landing_pages')
        .insert({
          business_id: id,
          url,
          scrape_status: 'pending',
          pipeline_status: 'scraping',
          current_step: 'scrape',
        })
        .select()
        .single();

      if (insertError || !lp) {
        setToast({ message: insertError?.message || 'Failed to create landing page record', type: 'error' });
        return;
      }

      const { error: urlError } = await supabase.from('businesses').update({ website_url: url }).eq('id', id);
      if (urlError) {
        setToast({ message: `Warning: could not save URL — ${urlError.message}`, type: 'error' });
      }

      setLandingPage(lp);
      setPipelineRunning(true);

      const scrapeRes = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, landingPageId: lp.id }),
      });

      if (!scrapeRes.ok) {
        const errData = await scrapeRes.json().catch(() => ({}));
        throw new Error(errData.error || `Scrape request failed (${scrapeRes.status})`);
      }

      const scrapeData = await scrapeRes.json();

      if (!scrapeData.success) {
        const { error: updateErr } = await supabase.from('landing_pages').update({
          pipeline_status: 'error',
          error_message: 'Scrape failed — paste copy manually',
        }).eq('id', lp.id);
        if (updateErr) {
          setToast({ message: `Scrape failed and could not update status: ${updateErr.message}`, type: 'error' });
        } else {
          setToast({ message: 'Could not scrape this page. Please paste the copy manually.', type: 'error' });
        }
        setPipelineRunning(false);
        await loadData();
        return;
      }

      await loadData();
      await runPipeline(lp.id);
    } catch (error) {
      setToast({ message: error.message, type: 'error' });
      setPipelineRunning(false);
    }
  }

  async function handleManualCopy(rawCopy) {
    try {
      const { data: lp, error: insertError } = await supabase
        .from('landing_pages')
        .insert({
          business_id: id,
          raw_copy: rawCopy,
          scrape_status: 'manual',
          pipeline_status: 'running',
          current_step: 'audit',
        })
        .select()
        .single();

      if (insertError || !lp) {
        setToast({ message: insertError?.message || 'Failed to create landing page record', type: 'error' });
        return;
      }

      setLandingPage(lp);
      await runPipeline(lp.id);
    } catch (error) {
      setToast({ message: error.message, type: 'error' });
      setPipelineRunning(false);
    }
  }

  async function handleRegenerate() {
    if (!landingPage?.id) return;
    setRegenerating(true);
    try {
      const res = await fetch('/api/leadmagnet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ landingPageId: landingPage.id }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Regeneration failed');
      await loadData();
      setToast({ message: 'Lead magnet regenerated!', type: 'success' });
    } catch (error) {
      setToast({ message: error.message, type: 'error' });
    } finally {
      setRegenerating(false);
    }
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

  if (!business) {
    return (
      <Layout businesses={businesses}>
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <p className="text-[#777] text-lg">Business not found</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-[#222] text-white rounded-lg hover:bg-[#333] transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  const hasResults = landingPage?.pipeline_status === 'complete' || landingPage?.audit_result;

  return (
    <Layout businesses={businesses} activeBusiness={business}>
      <div className="p-8 max-w-5xl">
        <BusinessHeader business={business} />

        <div className="mt-6">
          <URLInputPanel
            onSubmitURL={handleURL}
            onSubmitManual={handleManualCopy}
            loading={pipelineRunning}
            lastUrl={landingPage?.url || business.website_url}
            hasResults={hasResults}
          />
        </div>

        {landingPage && landingPage.pipeline_status !== 'idle' && (
          <div className="mt-6">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <ProgressStepper
                  currentStep={landingPage.current_step}
                  pipelineStatus={landingPage.pipeline_status}
                  scrapeStatus={landingPage.scrape_status}
                />
              </div>
              {(landingPage.pipeline_status === 'running' || landingPage.pipeline_status === 'scraping') && (
                <button
                  onClick={stopPipeline}
                  disabled={stopping}
                  className="shrink-0 px-4 py-2 text-sm border border-[#EF4444] text-[#EF4444] rounded-lg hover:bg-[#1A0808] transition-colors disabled:opacity-50"
                >
                  {stopping ? 'Stopping...' : 'Stop'}
                </button>
              )}
            </div>
          </div>
        )}

        {landingPage?.error_message && landingPage.pipeline_status === 'error' && (
          <div className="mt-4 bg-[#1A0808] border border-[#3A1212] rounded-lg p-4 text-sm text-[#EF4444]">
            Error: {landingPage.error_message}
          </div>
        )}

        {hasResults && (
          <div className="mt-6">
            <div className="flex items-center gap-1 border-b border-[#222] mb-6">
              {TABS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => { userSelectedTabRef.current = true; setActiveTab(key); }}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === key
                      ? 'border-[#F5FF5C] text-white'
                      : 'border-transparent text-[#777] hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {activeTab === 'audit' && <AuditTab auditResult={landingPage.audit_result} />}
            {activeTab === 'copy' && <CopyTab copyResult={landingPage.copy_result} />}
            {activeTab === 'leadmagnet' && (
              <LeadMagnetTab
                leadMagnetResult={landingPage.lead_magnet_result}
                onRegenerate={handleRegenerate}
                regenerating={regenerating}
              />
            )}
            {activeTab === 'outreach' && <OutreachTab outreachResult={landingPage.outreach_result} />}
            {activeTab === 'tracking' && (
              tracking.length > 0 ? (
                <TrackingTable tracking={tracking} businesses={[business]} onUpdate={loadData} />
              ) : (
                <div className="text-center py-12">
                  <p className="text-[#777] mb-4">No deal tracking started for this business yet.</p>
                  <button
                    onClick={async () => {
                      const { error } = await supabase
                        .from('deal_tracking')
                        .upsert({ business_id: id }, { onConflict: 'business_id', ignoreDuplicates: true });
                      if (error) {
                        setToast({ message: `Failed to start tracking: ${error.message}`, type: 'error' });
                        return;
                      }
                      await loadData();
                      setToast({ message: 'Tracking started.', type: 'success' });
                    }}
                    className="px-5 py-2.5 bg-[#F5FF5C] text-black font-medium rounded-lg hover:bg-[#E8F050] transition-colors"
                  >
                    Start Tracking
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Layout>
  );
}
