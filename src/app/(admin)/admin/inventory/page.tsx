import supabase from '@/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const { data: items } = await supabase
    .from('inventory')
    .select('*')
    .order('acquired_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">📦 Inventory</h1>
        <p className="text-sm text-zinc-500 mt-1">All cards acquired by your agents</p>
      </div>

      {!items || items.length === 0 ? (
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-12 text-center">
            <p className="text-3xl mb-2">📦</p>
            <p className="text-zinc-400 font-medium">No cards yet</p>
            <p className="text-sm text-zinc-600 mt-1">Cards will appear here once agents start buying</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left p-3 text-zinc-500 font-medium text-xs">Card</th>
                    <th className="text-left p-3 text-zinc-500 font-medium text-xs">Set</th>
                    <th className="text-left p-3 text-zinc-500 font-medium text-xs">Condition</th>
                    <th className="text-right p-3 text-zinc-500 font-medium text-xs">Purchase Price</th>
                    <th className="text-right p-3 text-zinc-500 font-medium text-xs">Market Value</th>
                    <th className="text-center p-3 text-zinc-500 font-medium text-xs">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: any) => (
                    <tr key={item.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="p-3 text-zinc-200">{item.card_name}</td>
                      <td className="p-3 text-zinc-500">{item.set_name}</td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-[10px] border-zinc-600 text-zinc-400">
                          {item.condition ?? '—'}
                        </Badge>
                      </td>
                      <td className="p-3 text-right font-mono text-zinc-300">
                        ${Number(item.purchase_price).toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-mono text-zinc-300">
                        ${Number(item.market_price ?? item.purchase_price).toFixed(2)}
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="outline" className={`text-[10px] ${
                          item.status === 'sold' ? 'border-blue-500/30 text-blue-400' :
                          item.status === 'listed' ? 'border-green-500/30 text-green-400' :
                          'border-zinc-600 text-zinc-400'
                        }`}>{item.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
