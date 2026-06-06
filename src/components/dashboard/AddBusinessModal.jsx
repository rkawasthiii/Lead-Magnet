'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Modal from '../ui/Modal';

export default function AddBusinessModal({ open, onClose }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Session expired. Please sign in again.');
      setLoading(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from('businesses')
      .insert({ user_id: user.id, name: name.trim() })
      .select()
      .single();

    if (insertError || !data) {
      setError(insertError?.message || 'Failed to create business');
      setLoading(false);
      return;
    }

    setName('');
    onClose();
    router.push(`/business/${data.id}`);
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Business">
      <form onSubmit={handleCreate} className="space-y-4">
        <input
          type="text"
          placeholder="Business name (e.g. Johnson Roofing Co.)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          className="w-full px-4 py-3 bg-[#0C0C0C] border border-[#222] rounded-lg text-white placeholder-[#555] focus:border-[#F5FF5C] focus:outline-none"
        />
        {error && <p className="text-[#EF4444] text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="w-full py-3 bg-[#F5FF5C] text-black font-medium rounded-lg hover:bg-[#E8F050] transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Business'}
        </button>
      </form>
    </Modal>
  );
}
