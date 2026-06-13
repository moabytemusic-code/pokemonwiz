import supabase from '@/db';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function AgentsPage() {
  const { data: agents } = await supabase
    .from('agents')
    .select('*')
    .order('name');

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, name')
    .eq('status', 'active');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">🤖 Agents</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage your bot army — create, fund, assign to campaigns</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/agents/bulk">
            <Button variant="outline" className="border-zinc-700 text-zinc-300">
              Bulk Spawn
            </Button>
          </Link>
          <Link href="/admin/agents/new">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
              + New Agent
            </Button>
          </Link>
        </div>
      </div>

      {!agents || agents.length === 0 ? (
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-12 text-center">
            <p className="text-3xl mb-2">🤖</p>
            <p className="text-zinc-400 font-medium">No agents yet</p>
            <p className="text-sm text-zinc-600 mt-1">Create your first agent to start buying cards</p>
            <Link href="/admin/agents/new">
              <Button className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black">
                + Create Agent
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-zinc-300">Agent Roster</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {agents.map((a: any) => (
                <Link key={a.id} href={`/admin/agents/${a.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/40 hover:bg-zinc-800/70 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={
                        a.status === 'running' ? 'border-green-500/30 text-green-400' :
                        a.status === 'paused' ? 'border-yellow-500/30 text-yellow-400' :
                        a.status === 'error' || a.status === 'banned' ? 'border-red-500/30 text-red-400' :
                        'border-zinc-600 text-zinc-400'
                      }>{a.status}</Badge>
                      <div>
                        <p className="text-sm font-medium text-zinc-200">{a.name}</p>
                        <p className="text-xs text-zinc-500">{a.outlet ?? 'No outlet'} · {a.outlet_account_label ?? ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <span className="font-mono text-zinc-300">${Number(a.fund_balance).toFixed(2)}</span>
                      <span>{a.cards_bought} cards</span>
                      <span>${Number(a.total_spent).toFixed(0)} spent</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
