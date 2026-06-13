import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import supabase from '@/db';

export const dynamic = 'force-dynamic';

async function getStats() {
  const { count: invCount } = await supabase
    .from('inventory')
    .select('*', { count: 'exact', head: true });

  const { count: campCount } = await supabase
    .from('campaigns')
    .select('*', { count: 'exact', head: true });

  const { count: agentCount } = await supabase
    .from('agents')
    .select('*', { count: 'exact', head: true });

  const { count: activeCamps } = await supabase
    .from('campaigns')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const { data: recentPurchases } = await supabase
    .from('inventory')
    .select('id, card_name, purchase_price, acquired_at, status')
    .order('acquired_at', { ascending: false })
    .limit(10);

  const { data: activeCampList } = await supabase
    .from('campaigns')
    .select('id, name, card_name, fulfilled, target_quantity, priority')
    .eq('status', 'active')
    .limit(5);

  return {
    totalCards: invCount ?? 0,
    totalCampaigns: campCount ?? 0,
    totalAgents: agentCount ?? 0,
    activeCampaigns: activeCamps ?? 0,
    recentPurchases: recentPurchases ?? [],
    activeCampList: activeCampList ?? [],
  };
}

export default async function CommandCenter() {
  const stats = await getStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">⚡ Command Center</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Master overview of the entire operation
          </p>
        </div>
        <Badge variant="outline" className="text-yellow-400 border-yellow-500/30">
          Live
        </Badge>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Cards Acquired" value={stats.totalCards} icon="📦" />
        <StatCard title="Total Spent" value="$0" icon="💵" />
        <StatCard title="Active Campaigns" value={stats.activeCampaigns} icon="🎯" />
        <StatCard title="Total Campaigns" value={stats.totalCampaigns} icon="📋" />
        <StatCard title="Agents" value={stats.totalAgents} icon="🤖" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Campaigns */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-zinc-300">
              🎯 Active Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.activeCampList.length === 0 ? (
              <p className="text-sm text-zinc-600">No active campaigns</p>
            ) : (
              <div className="space-y-3">
                {stats.activeCampList.map((c: any) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50"
                  >
                    <div>
                      <p className="text-sm font-medium text-zinc-200">{c.name}</p>
                      <p className="text-xs text-zinc-500">
                        {c.card_name} — {c.fulfilled}/{c.target_quantity} filled
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        c.priority === 'urgent'
                          ? 'border-red-500/30 text-red-400'
                          : c.priority === 'high'
                            ? 'border-orange-500/30 text-orange-400'
                            : 'border-zinc-600 text-zinc-400'
                      }
                    >
                      {c.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Purchases */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-zinc-300">
              📦 Recent Acquisitions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentPurchases.length === 0 ? (
              <p className="text-sm text-zinc-600">No cards acquired yet</p>
            ) : (
              <div className="space-y-2">
                {stats.recentPurchases.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded bg-zinc-800/30"
                  >
                    <span className="text-xs text-zinc-500">{item.card_name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-zinc-400">
                        ${Number(item.purchase_price).toLocaleString()}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 ${
                          item.status === 'inventory'
                            ? 'border-green-500/30 text-green-400'
                            : 'border-zinc-600 text-zinc-400'
                        }`}
                      >
                        {item.status}
                      </Badge>
                    </div>
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

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: string }) {
  return (
    <Card className="border-zinc-800 bg-zinc-900">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-zinc-500">{title}</p>
            <p className="text-2xl font-bold text-zinc-100 mt-1">{value}</p>
          </div>
          <span className="text-xl">{icon}</span>
        </div>
      </CardContent>
    </Card>
  );
}
