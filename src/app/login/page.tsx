'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'master' | 'client'>('master');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, role }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push('/');
      router.refresh();
    } else {
      setError('Invalid password');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <Card className="w-full max-w-sm border-zinc-800 bg-zinc-900">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-yellow-400">
            ⚡ Pokemon Wiz
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Select your role and enter your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRole('master')}
                className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium border transition-colors ${
                  role === 'master'
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-zinc-600'
                }`}
              >
                🔒 Master Admin
              </button>
              <button
                type="button"
                onClick={() => setRole('client')}
                className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium border transition-colors ${
                  role === 'client'
                    ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-zinc-600'
                }`}
              >
                👤 User
              </button>
            </div>

            <div>
              <Input
                type="password"
                placeholder={role === 'master' ? 'Master admin password' : 'Client password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 text-center">{error}</p>
            )}

            <Button
              type="submit"
              className={`w-full font-semibold ${
                role === 'master'
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-yellow-500 hover:bg-yellow-600 text-black'
              }`}
              disabled={loading}
            >
              {loading
                ? 'Verifying...'
                : role === 'master'
                  ? 'Enter Master Command'
                  : 'Enter Dashboard'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
