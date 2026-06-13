'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewAgentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    outlet: 'tcgplayer',
    outlet_account_label: '',
    login_email: '',
    login_password: '',
    api_key: '',
    profile_url: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/admin/agents/${data.id}`);
      router.refresh();
    } else {
      const err = await res.json();
      setError(err.error || 'Failed to create agent');
      setLoading(false);
    }
  }

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">🤖 New Agent</h1>
        <p className="text-sm text-zinc-500 mt-1">Create a new bot account for card purchasing</p>
      </div>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-zinc-300">Agent Identity</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400">Agent Name</label>
                <Input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Agent-Alpha-01" className="bg-zinc-800 border-zinc-700 text-zinc-100" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400">Outlet</label>
                <select value={form.outlet} onChange={(e) => update('outlet', e.target.value)} className="w-full h-10 rounded-md border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-100">
                  <option value="tcgplayer">TCGPlayer</option>
                  <option value="pokemoncenter">Pokemon Center</option>
                  <option value="ebay">eBay</option>
                  <option value="whatnot">WhatNot</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400">Account Label</label>
              <Input value={form.outlet_account_label} onChange={(e) => update('outlet_account_label', e.target.value)} placeholder="e.g. AlphaTCG" className="bg-zinc-800 border-zinc-700 text-zinc-100" />
            </div>

            <div className="border-t border-zinc-800 pt-4">
              <p className="text-xs font-semibold text-zinc-500 mb-3 uppercase">Outlet Credentials (encrypted at rest)</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400">Login Email</label>
                  <Input type="email" value={form.login_email} onChange={(e) => update('login_email', e.target.value)} placeholder="email@example.com" className="bg-zinc-800 border-zinc-700 text-zinc-100" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400">Login Password</label>
                  <Input type="password" value={form.login_password} onChange={(e) => update('login_password', e.target.value)} placeholder="••••••••" className="bg-zinc-800 border-zinc-700 text-zinc-100" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400">API Key (if applicable)</label>
                  <Input value={form.api_key} onChange={(e) => update('api_key', e.target.value)} placeholder="API key" className="bg-zinc-800 border-zinc-700 text-zinc-100" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400">Profile URL</label>
                  <Input value={form.profile_url} onChange={(e) => update('profile_url', e.target.value)} placeholder="https://..." className="bg-zinc-800 border-zinc-700 text-zinc-100" />
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading} className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                {loading ? 'Creating...' : 'Create Agent'}
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
