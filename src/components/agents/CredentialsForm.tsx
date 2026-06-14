'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Credentials {
  id: number;
  agent_id: number;
  outlet: string;
  login_email: string;
  login_password_encrypted: string;
  api_key_encrypted: string;
  profile_url: string;
}

export default function AgentCredentialsForm({ agentId }: { agentId: number }) {
  const [creds, setCreds] = useState<Credentials | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    login_email: '',
    login_password_encrypted: '',
    api_key_encrypted: '',
    profile_url: '',
    shipping_name: '',
    mailing_address: '',
  });

  useEffect(() => {
    fetch(`/api/agents/${agentId}/credentials`)
      .then(r => r.json())
      .then(data => {
        if (data && data.id) {
          setCreds(data);
          setForm({
            login_email: data.login_email || '',
            login_password_encrypted: data.login_password_encrypted || '',
            api_key_encrypted: data.api_key_encrypted || '',
            profile_url: data.profile_url || '',
            shipping_name: data.shipping_name || '',
            mailing_address: data.mailing_address || '',
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [agentId]);

  async function handleSave() {
    setSaving(true);
    setMessage('');
    const res = await fetch(`/api/agents/${agentId}/credentials`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login_email: form.login_email,
        login_password_encrypted: form.login_password_encrypted,
        api_key_encrypted: form.api_key_encrypted,
        profile_url: form.profile_url,
        shipping_name: form.shipping_name,
        mailing_address: form.mailing_address,
      }),
    });
    if (res.ok) {
      setMessage('✅ Saved');
      setTimeout(() => setMessage(''), 2000);
    } else {
      const err = await res.json();
      setMessage(`❌ ${err.error || 'Failed'}`);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <Card className="border-zinc-800 bg-zinc-900">
        <CardContent className="p-4 text-center text-sm text-zinc-500">Loading credentials...</CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900 border-blue-500/20">
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-zinc-300">🔑 Outlet Credentials</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!creds ? (
          <p className="text-sm text-zinc-600 text-center py-4">No credentials set up yet</p>
        ) : (
          <>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-zinc-500">Login Email</label>
                <input
                  value={form.login_email}
                  onChange={e => setForm(f => ({ ...f, login_email: e.target.value }))}
                  className={`w-full h-9 rounded-md border px-2 text-xs text-zinc-100 bg-zinc-800 border-zinc-700 ${form.login_email.startsWith('UPDATE-ME') ? 'border-yellow-500/50' : ''}`}
                  placeholder="agent@email.com"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500">Password (encrypted)</label>
                <input
                  value={form.login_password_encrypted}
                  onChange={e => setForm(f => ({ ...f, login_password_encrypted: e.target.value }))}
                  className={`w-full h-9 rounded-md border px-2 text-xs text-zinc-100 bg-zinc-800 border-zinc-700 ${form.login_password_encrypted === 'UPDATE-ME' ? 'border-yellow-500/50' : ''}`}
                  placeholder="Encrypted password"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500">API Key (encrypted)</label>
                <input
                  value={form.api_key_encrypted}
                  onChange={e => setForm(f => ({ ...f, api_key_encrypted: e.target.value }))}
                  className={`w-full h-9 rounded-md border px-2 text-xs text-zinc-100 bg-zinc-800 border-zinc-700 ${form.api_key_encrypted === 'UPDATE-ME' ? 'border-yellow-500/50' : ''}`}
                  placeholder="API key if applicable"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500">Profile URL</label>
                <input
                  value={form.profile_url}
                  onChange={e => setForm(f => ({ ...f, profile_url: e.target.value }))}
                  className={`w-full h-9 rounded-md border px-2 text-xs text-zinc-100 bg-zinc-800 border-zinc-700 ${form.profile_url.startsWith('UPDATE-ME') ? 'border-yellow-500/50' : ''}`}
                  placeholder="https://ebay.com/usr/..."
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500">Shipping Name (cards addressed to)</label>
                <input
                  value={form.shipping_name}
                  onChange={e => setForm(f => ({ ...f, shipping_name: e.target.value }))}
                  className="w-full h-9 rounded-md border px-2 text-xs text-zinc-100 bg-zinc-800 border-zinc-700"
                  placeholder="Your name for deliveries"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500">Mailing Address</label>
                <input
                  value={form.mailing_address}
                  onChange={e => setForm(f => ({ ...f, mailing_address: e.target.value }))}
                  className="w-full h-9 rounded-md border px-2 text-xs text-zinc-100 bg-zinc-800 border-zinc-700"
                  placeholder="123 Your Street, City, State ZIP"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Button onClick={handleSave} disabled={saving} className="bg-blue-500 hover:bg-blue-600 text-white text-xs h-8">
                {saving ? 'Saving...' : 'Save Credentials'}
              </Button>
              {message && <span className="text-xs">{message}</span>}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
