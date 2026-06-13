import supabase from '@/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const { data: inventory } = await supabase
    .from('inventory')
    .select('*')
    .order('acquired_at', { ascending: false });

  const { count: bought } = await supabase
    .from('inventory')
    .select('*', { count: 'exact', head: true });

  const { count: sold } = await supabase
    .from('inventory')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'sold');

  const totalInvested = inventory?.reduce((s, i) => s + Number(i.purchase_price), 0) ?? 0;
  const totalValued = inventory?.reduce((s, i) => s + (i.market_price ? Number(i.market_price) : Number(i.purchase_price)), 0) ?? 0;
  const profitLoss = totalValued - totalInvested;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">📈 Reports &amp; P&amp;L</h1>
          <p className="text-sm text-zinc-500 mt-1">Profitability, agent performance, spending analysis</p>
        </div>
        <Badge variant="outline" className="border-red-500/30 text-red-400">Master Admin</Badge>
      </div>

      {/* P&L Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <PLCard title="Cards Bought" value={bought ?? 0} format="number" />
        <PLCard title="Cards Sold" value={sold ?? 0} format="number" />
        <PLCard title="Total Invested" value={totalInvested} format="currency" />
        <PLCard title="Est. Portfolio Value" value={totalValued} format="currency" color={profitLoss >= 0 ? 'text-green-400' : 'text-red-400'} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500">Estimated P&amp;L</p>
            <p className={`text-3xl font-bold mt-1 ${profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {profitLoss >= 0 ? '+' : ''}${profitLoss.toFixed(2)}
            </p>
            <p className="text-xs text-zinc-600 mt-0.5">
              {profitLoss >= 0 ? '📈 Profitable' : '📉 Underwater'} · {(totalInvested > 0 ? ((profitLoss / totalInvested) * 100) : 0).toFixed(1)}% return
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500">Avg Purchase Price</p>
            <p className="text-3xl font-bold text-zinc-100 mt-1">
              ${bought && bought > 0 ? (totalInvested / bought).toFixed(2) : '0.00'}
            </p>
            <p className="text-xs text-zinc-600 mt-0.5">per card</p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Breakdown */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-zinc-300">Card-by-Card P&amp;L</CardTitle>
        </CardHeader>
        <CardContent>
          {!inventory || inventory.length === 0 ? (
            <p className="text-sm text-zinc-600">No cards acquired yet.</p>
          ) : (
            <div className="space-y-1">
              {inventory.map((item: any) => {
                const value = item.market_price ? Number(item.market_price) : Number(item.purchase_price);
                const profit = value - Number(item.purchase_price);
                return (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded text-xs font-mono hover:bg-zinc-800/50">
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-300">{item.card_name}</span>
                      <span className="text-zinc-600">{item.set_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-500">${Number(item.purchase_price).toFixed(2)}</span>
                      <span className="text-zinc-500">→</span>
                      <span className="text-zinc-300">${value.toFixed(2)}</span>
                      <span className={profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {profit >= 0 ? '+' : ''}${profit.toFixed(2)}
                      </span>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${
                        item.status === 'sold' ? 'border-blue-500/30 text-blue-400' :
                        item.status === 'listed' ? 'border-green-500/30 text-green-400' :
                        'border-zinc-600 text-zinc-400'
                      }`}>{item.status}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PLCard({ title, value, format, color }: { title: string; value: number; format: 'number' | 'currency'; color?: string }) {
  return (
    <Card className="border-zinc-800 bg-zinc-900">
      <CardContent className="p-4">
        <p className="text-xs text-zinc-500">{title}</p>
        <p className={`text-2xl font-bold mt-1 ${color ?? 'text-zinc-100'}`}>
          {format === 'currency' ? `$${value.toFixed(2)}` : value}
        </p>
      </CardContent>
    </Card>
  );
}
