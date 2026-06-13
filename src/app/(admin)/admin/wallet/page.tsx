import supabase from '@/db';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function WalletPage() {
  const { data: deposits } = await supabase
    .from('deposits')
    .select('amount, method, status, created_at, tx_hash')
    .order('created_at', { ascending: false })
    .limit(20);

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  const totalDeposited = deposits?.reduce((s, d) => s + Number(d.amount), 0) ?? 0;
  const pendingDeposits = deposits?.filter(d => d.status === 'pending').length ?? 0;
  const confirmedDeposits = deposits?.filter(d => d.status === 'confirmed').length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">💰 Wallet</h1>
          <p className="text-sm text-zinc-500 mt-1">Main balance, deposits, and funding</p>
        </div>
        <Link href="/admin/wallet/deposit">
          <Button className="bg-green-500 hover:bg-green-600 text-white font-semibold">
            + Deposit Funds
          </Button>
        </Link>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500">Main Balance</p>
            <p className="text-3xl font-bold text-yellow-400 mt-1">$0.00</p>
            <p className="text-xs text-zinc-600 mt-1">Available for agent top-ups</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500">Total Deposited</p>
            <p className="text-3xl font-bold text-green-400 mt-1">
              ${totalDeposited.toFixed(2)}
            </p>
            <p className="text-xs text-zinc-600 mt-1">{confirmedDeposits} confirmed · {pendingDeposits} pending</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500">Agent Funds Pool</p>
            <p className="text-3xl font-bold text-blue-400 mt-1">$0.00</p>
            <p className="text-xs text-zinc-600 mt-1">Distributed to agent accounts</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deposit History */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-zinc-300">Deposit History</CardTitle>
          </CardHeader>
          <CardContent>
            {!deposits || deposits.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-zinc-500 mb-3">No deposits yet</p>
                <Link href="/admin/wallet/deposit">
                  <Button variant="outline" className="border-green-500/30 text-green-400">
                    Make Your First Deposit
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {deposits.map((d: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded text-xs font-mono hover:bg-zinc-800/50">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-600">{new Date(d.created_at).toLocaleDateString()}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-zinc-600 text-zinc-400">{d.method}</Badge>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${
                        d.status === 'confirmed' ? 'border-green-500/30 text-green-400' :
                        d.status === 'failed' ? 'border-red-500/30 text-red-400' :
                        'border-yellow-500/30 text-yellow-400'
                      }`}>{d.status}</Badge>
                    </div>
                    <span className="text-zinc-300">${Number(d.amount).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-zinc-300">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {!transactions || transactions.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-8">No transactions yet</p>
            ) : (
              <div className="space-y-1">
                {transactions.map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between p-2 rounded text-xs font-mono hover:bg-zinc-800/50">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-600">{new Date(t.created_at).toLocaleDateString()}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-zinc-600 text-zinc-400">{t.type}</Badge>
                      <span className="text-zinc-500 truncate max-w-[120px]">{t.description}</span>
                    </div>
                    <span className="text-zinc-300">${Number(t.amount).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
