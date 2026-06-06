'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import Layout from '@/components/Layout';
import Toast from '@/components/ui/Toast';
import { Save, Eye, EyeOff, Trash2, Zap, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;
  const [bearerToken, setBearerToken] = useState('');
  const [modelId, setModelId] = useState('us.anthropic.claude-opus-4-6-v1');
  const [region, setRegion] = useState('us-east-1');
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [email, setEmail] = useState('');
  const [businesses, setBusinesses] = useState([]);

  // Test connection state
  const [testing, setTesting] = useState(false);
  const [testLogs, setTestLogs] = useState([]);
  const [testStatus, setTestStatus] = useState(null); // null | 'success' | 'error'

  useEffect(() => { loadSettings(); }, []);

  async function loadSettings() {
    const { data: { user } } = await supabase.auth.getUser();
    setEmail(user?.email || '');

    const { data: bizData } = await supabase.from('businesses').select('*').order('created_at', { ascending: false });
    setBusinesses(bizData || []);

    const { data } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setBearerToken(data.bearer_token || '');
      setModelId(data.model_id || 'us.anthropic.claude-opus-4-6-v1');
      setRegion(data.aws_region || 'us-east-1');
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('user_settings')
      .upsert(
        {
          user_id: user.id,
          bearer_token: bearerToken,
          model_id: modelId,
          aws_region: region,
        },
        { onConflict: 'user_id' }
      );

    setSaving(false);
    if (error) {
      setToast({ message: `Failed to save: ${error.message}`, type: 'error' });
    } else {
      setToast({ message: 'Settings saved.', type: 'success' });
    }
  }

  async function handleClearToken() {
    setBearerToken('');
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('user_settings').update({ bearer_token: '' }).eq('user_id', user.id);
    setToast({ message: 'Token cleared.', type: 'success' });
  }

  async function handleTestConnection() {
    if (!bearerToken.trim()) {
      setToast({ message: 'Enter a bearer token first.', type: 'error' });
      return;
    }

    setTesting(true);
    setTestLogs([]);
    setTestStatus(null);

    const addLog = (msg, type = 'info') => {
      setTestLogs((prev) => [...prev, { msg, type, time: new Date().toLocaleTimeString() }]);
    };

    addLog('Starting connection test...');
    addLog(`Region: ${region}`);
    addLog(`Model: ${modelId}`);
    addLog(`Endpoint: bedrock-runtime.${region}.amazonaws.com`);

    try {
      addLog('Sending test prompt: "Say hello in one word"');

      const startTime = Date.now();

      const response = await fetch('/api/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bearerToken, modelId, region }),
      });

      const elapsed = Date.now() - startTime;
      const data = await response.json();

      if (!response.ok || !data.success) {
        const status = data.status || response.status;
        addLog(`HTTP ${status}: ${data.statusText || data.error || 'Failed'}`, 'error');
        if (data.error) addLog(`Response: ${data.error.slice(0, 300)}`, 'error');

        if (status === 403) {
          addLog('Token is invalid or expired. Generate a new one in AWS Console.', 'error');
        } else if (status === 404) {
          addLog('Model not found. Check your model ID and region.', 'error');
        } else if (status === 400) {
          addLog('Bad request. The model ID format may be incorrect.', 'error');
        }

        if (data.elapsed) addLog(`Failed after ${data.elapsed}ms`, 'error');
        setTestStatus('error');
      } else {
        addLog(`Response received in ${data.elapsed}ms`, 'success');
        addLog(`Model replied: "${data.text}"`, 'success');
        addLog(`Input tokens: ${data.inputTokens || '?'}`, 'info');
        addLog(`Output tokens: ${data.outputTokens || '?'}`, 'info');
        addLog('Connection successful!', 'success');
        setTestStatus('success');
      }
    } catch (error) {
      addLog(`Error: ${error.message}`, 'error');
      setTestStatus('error');
    } finally {
      setTesting(false);
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

  return (
    <Layout businesses={businesses}>
      <div className="p-8 max-w-2xl">
        <h1 className="text-2xl font-semibold mb-8">Settings</h1>

        <div className="space-y-8">
          <section className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-medium">Amazon Bedrock</h2>
            <p className="text-sm text-[#777]">
              Enter your Bedrock bearer token and model ID. Generate your key at AWS Console → Bedrock → API Keys.
            </p>

            <div>
              <label className="block text-sm text-[#777] mb-1.5">Bearer Token</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={bearerToken}
                    onChange={(e) => setBearerToken(e.target.value)}
                    placeholder="Enter your Bedrock API key"
                    className="w-full px-4 py-2.5 bg-[#0C0C0C] border border-[#222] rounded-lg text-white placeholder-[#555] focus:border-[#F5FF5C] focus:outline-none pr-10 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777] hover:text-white"
                  >
                    {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <button
                  onClick={handleClearToken}
                  className="px-3 py-2 border border-[#333] rounded-lg text-[#777] hover:text-[#EF4444] hover:border-[#EF4444] transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#777] mb-1.5">Model ID</label>
              <input
                type="text"
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0C0C0C] border border-[#222] rounded-lg text-white placeholder-[#555] focus:border-[#F5FF5C] focus:outline-none font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-[#777] mb-1.5">Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0C0C0C] border border-[#222] rounded-lg text-white focus:border-[#F5FF5C] focus:outline-none"
              >
                <option value="us-east-1">us-east-1</option>
                <option value="us-west-2">us-west-2</option>
                <option value="eu-west-1">eu-west-1</option>
                <option value="eu-west-2">eu-west-2</option>
                <option value="ap-northeast-1">ap-northeast-1</option>
                <option value="ap-southeast-1">ap-southeast-1</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#F5FF5C] text-black font-medium rounded-lg hover:bg-[#E8F050] transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>

              <button
                onClick={handleTestConnection}
                disabled={testing || !bearerToken.trim()}
                className="flex items-center gap-2 px-5 py-2.5 border border-[#333] text-[#ccc] font-medium rounded-lg hover:border-[#F5FF5C] hover:text-[#F5FF5C] transition-colors disabled:opacity-50"
              >
                {testing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                {testing ? 'Testing...' : 'Test Connection'}
              </button>
            </div>

            <p className="text-[11px] text-[#555]">
              Stored securely in your account. Never shared or exposed to the client.
            </p>
          </section>

          {/* Test Connection Logs */}
          {testLogs.length > 0 && (
            <section className={`border rounded-xl p-5 ${
              testStatus === 'success' ? 'bg-[#081A0E] border-[#0E3A1E]' :
              testStatus === 'error' ? 'bg-[#1A0808] border-[#3A1212]' :
              'bg-[#111] border-[#222]'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                {testStatus === 'success' && <CheckCircle size={16} className="text-[#3ECF8E]" />}
                {testStatus === 'error' && <XCircle size={16} className="text-[#EF4444]" />}
                {testing && <Loader2 size={16} className="text-[#F5FF5C] animate-spin" />}
                <h3 className="text-sm font-medium text-white">
                  {testStatus === 'success' ? 'Connection Successful' :
                   testStatus === 'error' ? 'Connection Failed' :
                   'Testing...'}
                </h3>
              </div>

              <div className="space-y-1 font-mono text-xs max-h-[250px] overflow-y-auto">
                {testLogs.map((log, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-[#555] shrink-0">{log.time}</span>
                    <span className={
                      log.type === 'success' ? 'text-[#3ECF8E]' :
                      log.type === 'error' ? 'text-[#EF4444]' :
                      'text-[#999]'
                    }>
                      {log.msg}
                    </span>
                  </div>
                ))}
                {testing && (
                  <div className="flex gap-2">
                    <span className="text-[#555]">{new Date().toLocaleTimeString()}</span>
                    <span className="text-[#F5FF5C] animate-pulse">Waiting for response...</span>
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="bg-[#111] border border-[#222] rounded-xl p-6">
            <h2 className="text-lg font-medium mb-3">Account</h2>
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#777]">{email}</p>
            </div>
          </section>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Layout>
  );
}
