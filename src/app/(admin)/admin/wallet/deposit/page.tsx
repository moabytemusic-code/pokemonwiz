'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DepositPage() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'stripe' | 'crypto'>('stripe');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cryptoAddress] = useState('TXYZq...CryptoWalletAddress...ABC123');
  const [cryptoTxId, setCryptoTxId] = useState('');

  async function handleStripeDeposit() {
    const amt = parseFloat(amount);
    if (!amt || amt < 1) {
      setError('Minimum deposit is $1.00');
      return;
    }
    setLoading(true);
    setError('');

    const res = await fetch('/api/payments/stripe/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: amt }),
    });

    if (res.ok) {
      const { url } = await res.json();
      window.location.href = url;
    } else {
      const err = await res.json();
      setError(err.error || 'Failed to create checkout');
      setLoading(false);
    }
  }

  async function handleCryptoConfirm() {
    const amt = parseFloat(amount);
    if (!amt || amt < 1) {
      setError('Minimum deposit is $1.00');
      return;
    }
    if (!cryptoTxId.trim()) {
      setError('Please enter the transaction ID');
      return;
    }
    setLoading(true);
    setError('');

    const res = await fetch('/api/payments/crypto/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: amt, tx_hash: cryptoTxId, method: 'usdt' }),
    });

    if (res.ok) {
      router.push('/admin/wallet?deposit=confirmed');
      router.refresh();
    } else {
      const err = await res.json();
      setError(err.error || 'Failed to record deposit');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">💰 Deposit Funds</h1>
        <p className="text-sm text-zinc-500 mt-1">Add funds to your main balance</p>
      </div>

      {/* Method selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setMethod('stripe')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
            method === 'stripe'
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
              : 'bg-zinc-800 border-zinc-700 text-zinc-500'
          }`}
        >
          💳 Credit / Debit Card
        </button>
        <button
          onClick={() => setMethod('crypto')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
            method === 'crypto'
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-zinc-800 border-zinc-700 text-zinc-500'
          }`}
        >
          ₿ Crypto (USDT/BTC/SOL)
        </button>
      </div>

      {/* Amount input */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardContent className="p-6">
          <div className="space-y-1.5 mb-4">
            <label className="text-xs text-zinc-400">Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-lg">$</span>
              <Input
                type="number"
                step="0.01"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100.00"
                className="bg-zinc-800 border-zinc-700 text-zinc-100 text-lg pl-8 h-12"
              />
            </div>
          </div>

          {method === 'stripe' ? (
            <>
              <p className="text-xs text-zinc-500 mb-3">Pay with credit or debit card via Stripe. Funds credited instantly.</p>
              <Button
                onClick={handleStripeDeposit}
                disabled={loading || !amount}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold h-11"
              >
                {loading ? 'Redirecting to Stripe...' : `Deposit $${parseFloat(amount || '0').toFixed(2)}`}
              </Button>
            </>
          ) : (
            <>
              <p className="text-xs text-zinc-500 mb-3">Send USDT (TRC-20) to the address below, then enter the TX ID to confirm.</p>
              <div className="bg-zinc-800 rounded-md p-3 mb-3">
                <p className="text-xs text-zinc-500 mb-1">Deposit Address (USDT)</p>
                <p className="text-sm font-mono text-yellow-400 break-all">{cryptoAddress}</p>
              </div>
              <div className="space-y-1.5 mb-3">
                <label className="text-xs text-zinc-400">Transaction ID</label>
                <Input
                  value={cryptoTxId}
                  onChange={(e) => setCryptoTxId(e.target.value)}
                  placeholder="Paste TX hash..."
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                />
              </div>
              <Button
                onClick={handleCryptoConfirm}
                disabled={loading || !amount || !cryptoTxId}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold h-11"
              >
                {loading ? 'Confirming...' : 'Confirm Deposit'}
              </Button>
            </>
          )}

          {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
        </CardContent>
      </Card>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">ℹ️</Badge>
            <p className="text-zinc-400">Deposits go to your main balance. From there you can top up individual agent accounts.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
