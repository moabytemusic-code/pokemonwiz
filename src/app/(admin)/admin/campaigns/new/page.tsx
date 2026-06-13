'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    card_name: '',
    set_name: '',
    card_number: '',
    max_price: '',
    target_quantity: '10',
    priority: 'normal',
    sources: 'tcgplayer,pokemoncenter,ebay',
    notes: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        max_price: parseFloat(form.max_price) || null,
        target_quantity: parseInt(form.target_quantity) || 10,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/admin/campaigns/${data.id}`);
      router.refresh();
    } else {
      const err = await res.json();
      setError(err.error || 'Failed to create campaign');
      setLoading(false);
    }
  }

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">🎯 New Campaign</h1>
        <p className="text-sm text-zinc-500 mt-1">Define a card buying mission</p>
      </div>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-zinc-300">Campaign Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400">Campaign Name</label>
                <Input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Charizard Rush" className="bg-zinc-800 border-zinc-700 text-zinc-100" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400">Priority</label>
                <select value={form.priority} onChange={(e) => update('priority', e.target.value)} className="w-full h-10 rounded-md border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-100">
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400">Card Name</label>
                <Input value={form.card_name} onChange={(e) => update('card_name', e.target.value)} placeholder="e.g. Charizard" className="bg-zinc-800 border-zinc-700 text-zinc-100" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400">Set Name</label>
                <Input value={form.set_name} onChange={(e) => update('set_name', e.target.value)} placeholder="e.g. Base Set" className="bg-zinc-800 border-zinc-700 text-zinc-100" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400">Card Number</label>
                <Input value={form.card_number} onChange={(e) => update('card_number', e.target.value)} placeholder="e.g. 4/102" className="bg-zinc-800 border-zinc-700 text-zinc-100" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400">Max Price ($)</label>
                <Input type="number" step="0.01" min="0" value={form.max_price} onChange={(e) => update('max_price', e.target.value)} placeholder="200" className="bg-zinc-800 border-zinc-700 text-zinc-100" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400">Target Quantity</label>
                <Input type="number" min="1" value={form.target_quantity} onChange={(e) => update('target_quantity', e.target.value)} placeholder="10" className="bg-zinc-800 border-zinc-700 text-zinc-100" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400">Sources to Monitor (comma separated)</label>
              <Input value={form.sources} onChange={(e) => update('sources', e.target.value)} placeholder="tcgplayer,pokemoncenter,ebay" className="bg-zinc-800 border-zinc-700 text-zinc-100" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400">Notes</label>
              <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} rows={3} className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500" placeholder="Any special instructions..." />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading} className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                {loading ? 'Creating...' : 'Create Campaign'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => router.back()} className="text-zinc-400">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
