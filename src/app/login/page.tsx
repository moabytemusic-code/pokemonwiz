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
  const [role, setRole] = useState<'master' | 'user'>('user');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, role: role === 'master' ? 'master' : 'client' }),
    });

    if (res.ok) {
      router.push('/');
      router.refresh();
    } else {
      setError('Invalid password');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 relative">
      <Card className="w-full max-w-sm border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="text-3xl mb-2">⚡</div>
          <CardTitle className="text-xl font-bold text-yellow-400 tracking-tight">
            Pokemon Wiz
          </CardTitle>
          <CardDescription className="text-zinc-500 text-xs">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-800/80 border-zinc-700 text-zinc-100 h-10 text-sm"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold h-10 text-sm"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Master Admin link — subtle, bottom-right */}
      <button
        onClick={() => {
          setRole('master');
          setError('');
          // Focus the password input
          const input = document.querySelector('input[type="password"]') as HTMLInputElement;
          if (input) {
            input.placeholder = 'Master admin password';
            input.focus();
          }
        }}
        className={`fixed bottom-3 right-3 text-[10px] transition-colors ${
          role === 'master' ? 'text-red-500' : 'text-zinc-700 hover:text-zinc-500'
        }`}
        title="Master Admin Login"
      >
        🔒 Admin
      </button>
    </div>
  );
}
