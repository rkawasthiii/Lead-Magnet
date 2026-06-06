'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Badge from '../ui/Badge';

export default function BusinessHeader({ business }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }

    setDeleting(true);
    setError('');
    const supabase = createClient();
    const { error: deleteError, count } = await supabase
      .from('businesses')
      .delete({ count: 'exact' })
      .eq('id', business.id);

    if (deleteError) {
      setError(`Delete failed: ${deleteError.message}`);
      setDeleting(false);
      setConfirming(false);
      return;
    }

    if (count === 0) {
      setError('Delete blocked — try signing out and back in');
      setDeleting(false);
      setConfirming(false);
      return;
    }

    router.push('/dashboard');
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">{business.name}</h1>
          {business.niche && <Badge variant="accent">{business.niche}</Badge>}
          {business.city && <Badge>{business.city}</Badge>}
        </div>

        <div className="flex items-center gap-2">
          {error && <span className="text-[11px] text-[#EF4444]">{error}</span>}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              confirming
                ? 'border-[#EF4444] text-[#EF4444] bg-[#1A0808]'
                : 'border-[#333] text-[#777] hover:text-[#EF4444] hover:border-[#EF4444]'
            }`}
          >
            <Trash2 size={14} />
            {confirming ? 'Confirm Delete' : 'Delete'}
          </button>
        </div>
      </div>

      {business.website_url && (
        <a
          href={business.website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-[#777] hover:text-[#F5FF5C] transition-colors"
        >
          <ExternalLink size={12} />
          {business.website_url}
        </a>
      )}
    </div>
  );
}
