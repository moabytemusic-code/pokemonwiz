import supabase from '@/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export default async function FinancialAuditPage() {
  const { data: deposits } = await supabase
    .from('deposits')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  const totalDeposits = deposits?.reduce((s, d) => s + Number(d.amount), 0) ?? 0;
  const totalTx = transactions?.reduce((s, t) => s + Number(t.amount), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">🔍 Financial Audit</h1>
          <p className="text-sm text-zinc-500 mt-1">All money movement: deposits, top-ups, purchases</p>
        </div>
        <Badge variant="outline" className="border-red-500/30 text-red-400">Master Admin</Badge>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500">Total Deposits</p>
            <p className="text-2xl font-bold text-green-400 mt-1">${totalDeposits.toFixed(2)}</p>
            <p className="text-xs text-zinc-600 mt-0.5">{deposits?.length ?? 0} transactions</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500">Total Transaction Volume</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">${totalTx.toFixed(2)}</p>
            <p className="text-xs text-zinc-600 mt-0.5">{transactions?.length ?? 0} entries</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500">Net Position</p>
            <p className="text-2xl font-bold text-yellow-400 mt-1">${(totalDeposits - totalTx).toFixed(2)}</p>
            <p className="text-xs text-zinc-600 mt-0.5">deposits minus spending</p>
          </CardContent>
        </Card>
      </div>

      {/* Deposits */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-zinc-300">Deposits</CardTitle>
        </CardHeader>
        <CardContent>
          {!deposits || deposits.length === 0 ? (
            <p className="text-sm text-zinc-600">No deposits yet.</p>
          ) : (
            <div className="space-y-1">
              {deposits.map((d: any) => (
                <div key={d.id} className="flex items-center justify-between p-2 rounded text-xs font-mono hover:bg-zinc-800/50">
                  <div className="flex items-center gap-3">
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

      {/* Transactions */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-zinc-300">All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {!transactions || transactions.length === 0 ? (
            <p className="text-sm text-zinc-600">No transactions yet.</p>
          ) : (
            <div className="space-y-1">
              {transactions.map((t: any) => (
                <div key={t.id} className="flex items-center justify-between p-2 rounded text-xs font-mono hover:bg-zinc-800/50">
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-600">{new Date(t.created_at).toLocaleDateString()}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-zinc-600 text-zinc-400">{t.type}</Badge>
                    <span className="text-zinc-500">{t.description}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-300">${Number(t.amount).toFixed(2)}</span>
                    {t.from_entity && <span className="text-zinc-600">from:{t.from_entity}</span>}
                    {t.to_entity && <span className="text-zinc-600">→ {t.to_entity}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
