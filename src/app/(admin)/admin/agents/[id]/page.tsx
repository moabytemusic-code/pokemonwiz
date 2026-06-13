import supabase from '@/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: agent } = await supabase
    .from('agents')
    .select('*')
    .eq('id', id)
    .single();

  if (!agent) notFound();

  const { data: campaigns } = await supabase
    .from('campaign_agents')
    .select('campaign_id, is_lead')
    .eq('agent_id', id);

  const campaignIds = campaigns?.map((c: any) => c.campaign_id) ?? [0];
  const { data: campaignDetails } = await supabase
    .from('campaigns')
    .select('id, name, status')
    .in('id', campaignIds);

  const { data: purchases } = await supabase
    .from('inventory')
    .select('*')
    .eq('acquired_by', id)
    .order('acquired_at', { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-zinc-100">{agent.name}</h1>
              <Badge variant="outline" className={
                agent.status === 'running' ? 'border-green-500/30 text-green-400' :
                agent.status === 'error' || agent.status === 'banned' ? 'border-red-500/30 text-red-400' :
                agent.status === 'paused' ? 'border-yellow-500/30 text-yellow-400' :
                'border-zinc-600 text-zinc-400'
              }>{agent.status}</Badge>
            </div>
            <p className="text-sm text-zinc-400 mt-1">{agent.outlet ?? 'No outlet'} · {agent.outlet_account_label ?? 'No label'}</p>
          </div>
        </div>
        <Link href="/admin/agents">
          <Button variant="ghost" className="text-zinc-400">← Back</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-3">
            <p className="text-xs text-zinc-500">Fund Balance</p>
            <p className="text-lg font-bold text-green-400">${Number(agent.fund_balance).toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-3">
            <p className="text-xs text-zinc-500">Cards Bought</p>
            <p className="text-lg font-bold text-zinc-100">{agent.cards_bought}</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-3">
            <p className="text-xs text-zinc-500">Total Spent</p>
            <p className="text-lg font-bold text-zinc-100">${Number(agent.total_spent).toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-3">
            <p className="text-xs text-zinc-500">Last Active</p>
            <p className="text-lg font-bold text-zinc-100 text-sm">{agent.last_active ? new Date(agent.last_active).toLocaleDateString() : 'Never'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Top-up form */}
      <Card className="border-zinc-800 bg-zinc-900 border-yellow-500/20">
        <CardContent className="p-4">
          <form action={`/api/agents/${id}/topup`} method="POST" className="flex items-end gap-3">
            <div className="flex-1 space-y-1">
              <label className="text-xs text-zinc-400">Top Up Agent Funds</label>
              <input type="number" name="amount" step="0.01" min="0.01" placeholder="500.00" className="w-full h-10 rounded-md border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-100" required />
            </div>
            <button type="submit" className="h-10 px-4 rounded-md bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-sm">
              Add Funds
            </button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Assignments */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-zinc-300">🎯 Campaign Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {!campaignDetails || campaignDetails.length === 0 ? (
              <p className="text-sm text-zinc-600 text-center py-6">Not assigned to any campaigns</p>
            ) : (
              <div className="space-y-2">
                {campaignDetails.map((c: any) => {
                  const ca = campaigns?.find((ca: any) => ca.campaign_id === c.id);
                  return (
                    <Link key={c.id} href={`/admin/campaigns/${c.id}`}>
                      <div className="flex items-center justify-between p-2 rounded bg-zinc-800/40 hover:bg-zinc-800/70 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-zinc-200">{c.name}</span>
                          {ca?.is_lead && <Badge variant="outline" className="text-[10px] border-yellow-500/30 text-yellow-400">Lead</Badge>}
                        </div>
                        <Badge variant="outline" className="text-[10px] border-zinc-600 text-zinc-400">{c.status}</Badge>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Purchase History */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-zinc-300">📦 Purchase History</CardTitle>
          </CardHeader>
          <CardContent>
            {!purchases || purchases.length === 0 ? (
              <p className="text-sm text-zinc-600 text-center py-6">No purchases yet</p>
            ) : (
              <div className="space-y-1">
                {purchases.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-2 rounded text-xs font-mono hover:bg-zinc-800/40">
                    <span className="text-zinc-300">{p.card_name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400">${Number(p.purchase_price).toFixed(2)}</span>
                      <Badge variant="outline" className="text-[10px] border-zinc-600 text-zinc-400">{p.status}</Badge>
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
