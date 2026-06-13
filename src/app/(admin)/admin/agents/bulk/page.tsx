'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function BulkSpawnPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any[] | null>(null);
  const [form, setForm] = useState({
    count: '5',
    name_prefix: 'Agent',
    outlet: 'ebay',
    starting_balance: '0',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    const res = await fetch('/api/agents/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        count: parseInt(form.count) || 5,
        name_prefix: form.name_prefix,
        outlet: form.outlet,
        starting_balance: parseFloat(form.starting_balance) || 0,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setResult(data);
    } else {
      const err = await res.json();
      setError(err.error || 'Failed to spawn agents');
    }
    setLoading(false);
  }

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">🧬 Bulk Spawn Agents</h1>
        <p className="text-sm text-zinc-500 mt-1">Create multiple agent accounts at once</p>
      </div>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-zinc-300">Spawning Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400">Number of Agents</label>
                <Input type="number" min="1" max="100" value={form.count} onChange={(e) => update('count', e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400">Outlet</label>
                <select value={form.outlet} onChange={(e) => update('outlet', e.target.value)} className="w-full h-10 rounded-md border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-100">
                  <option value="tcgplayer">TCGPlayer</option>
                  <option value="pokemoncenter">Pokemon Center</option>
                  <option value="ebay">eBay</option>
                  <option value="whatnot">WhatNot</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400">Name Prefix</label>
                <Input value={form.name_prefix} onChange={(e) => update('name_prefix', e.target.value)} placeholder="Agent" className="bg-zinc-800 border-zinc-700 text-zinc-100" />
                <p className="text-[10px] text-zinc-600">Agents will be named {form.name_prefix}-01, {form.name_prefix}-02, etc.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400">Starting Balance ($)</label>
                <Input type="number" step="0.01" min="0" value={form.starting_balance} onChange={(e) => update('starting_balance', e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
              </div>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <Button type="submit" disabled={loading} className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
              {loading ? 'Spawning...' : `🚀 Spawn ${form.count} Agents`}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card className="border-green-800 bg-green-950/20 mt-6">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-green-400">✅ Successfully Created {result.length} Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {result.map((agent: any) => (
                <div key={agent.id} className="text-xs text-zinc-300 font-mono">
                  #{agent.id} · {agent.name} ({agent.outlet})
                </div>
              ))}
            </div>
            <Button
              className="mt-4 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => router.push('/admin/agents')}
            >
              View All Agents
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
