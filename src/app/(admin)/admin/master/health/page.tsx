import supabase from '@/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export default async function HealthPage() {
  const { data: agents } = await supabase
    .from('agents')
    .select('id, name, status, outlet, fund_balance, cards_bought, total_spent, last_active, is_active')
    .order('name');

  const { count: totalLogs } = await supabase
    .from('audit_logs')
    .select('*', { count: 'exact', head: true });

  const { count: errorLogs } = await supabase
    .from('audit_logs')
    .select('*', { count: 'exact', head: true })
    .in('level', ['error', 'critical']);

  const running = agents?.filter(a => a.status === 'running').length ?? 0;
  const idle = agents?.filter(a => a.status === 'idle').length ?? 0;
  const error = agents?.filter(a => a.status === 'error' || a.status === 'banned').length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">🩺 System Health</h1>
          <p className="text-sm text-zinc-500 mt-1">Agent status, uptime, and error monitoring</p>
        </div>
        <Badge variant="outline" className="border-red-500/30 text-red-400">Master Admin</Badge>
      </div>

      {/* Health cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <HealthCard title="Agents" value={agents?.length ?? 0} color="text-zinc-100" />
        <HealthCard title="Running" value={running} color="text-green-400" />
        <HealthCard title="Idle" value={idle} color="text-yellow-400" />
        <HealthCard title="Errors" value={error} color="text-red-400" />
        <HealthCard title="Total Events" value={totalLogs ?? 0} color="text-blue-400" />
      </div>

      {/* Agent roster */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-zinc-300">Agent Roster</CardTitle>
        </CardHeader>
        <CardContent>
          {!agents || agents.length === 0 ? (
            <p className="text-sm text-zinc-600">No agents created yet.</p>
          ) : (
            <div className="space-y-2">
              {agents.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/40">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={
                        a.status === 'running' ? 'border-green-500/30 text-green-400' :
                        a.status === 'error' || a.status === 'banned' ? 'border-red-500/30 text-red-400' :
                        'border-zinc-600 text-zinc-400'
                      }
                    >
                      {a.status}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium text-zinc-200">{a.name}</p>
                      <p className="text-xs text-zinc-500">{a.outlet ?? 'No outlet'} · ${Number(a.fund_balance).toFixed(2)} balance</p>
                    </div>
                  </div>
                  <div className="text-right text-xs text-zinc-500">
                    <p>{a.cards_bought} cards</p>
                    <p>${Number(a.total_spent).toFixed(0)} spent</p>
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

function HealthCard({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <Card className="border-zinc-800 bg-zinc-900">
      <CardContent className="p-3 text-center">
        <p className={`text-lg font-bold ${color}`}>{value}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{title}</p>
      </CardContent>
    </Card>
  );
}
