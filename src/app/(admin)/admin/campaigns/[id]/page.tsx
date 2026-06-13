import supabase from '@/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single();

  if (!campaign) notFound();

  const { data: assignedAgents } = await supabase
    .from('campaign_agents')
    .select('agent_id, is_lead, assigned_at')
    .eq('campaign_id', id);

  const { data: agents } = await supabase
    .from('agents')
    .select('id, name, outlet, fund_balance, status')
    .in('id', assignedAgents?.map((a: any) => a.agent_id) ?? [0]);

  const { data: purchases } = await supabase
    .from('inventory')
    .select('*')
    .eq('campaign_id', id)
    .order('acquired_at', { ascending: false });

  const agentMap = new Map(agents?.map((a: any) => [a.id, a]));
  const progress = campaign.target_quantity > 0
    ? Math.round((campaign.fulfilled / campaign.target_quantity) * 100)
    : 0;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-100">{campaign.name}</h1>
            <Badge variant="outline" className={
              campaign.status === 'active' ? 'border-green-500/30 text-green-400' :
              campaign.status === 'completed' ? 'border-blue-500/30 text-blue-400' :
              'border-zinc-600 text-zinc-400'
            }>{campaign.status}</Badge>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            {campaign.card_name}{campaign.set_name ? ` · ${campaign.set_name}` : ''}
            {campaign.card_number ? ` · #${campaign.card_number}` : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <form action={`/api/campaigns/${id}`} method="POST">
            <input type="hidden" name="_method" value="PATCH" />
          </form>
          <Link href="/admin/campaigns">
            <Button variant="ghost" className="text-zinc-400">← Back</Button>
          </Link>
        </div>
      </div>

      {/* Stats + Progress */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-3">
            <p className="text-xs text-zinc-500">Progress</p>
            <p className="text-lg font-bold text-zinc-100">{progress}%</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-3">
            <p className="text-xs text-zinc-500">Fulfilled</p>
            <p className="text-lg font-bold text-zinc-100">{campaign.fulfilled}/{campaign.target_quantity}</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-3">
            <p className="text-xs text-zinc-500">Total Spent</p>
            <p className="text-lg font-bold text-yellow-400">${Number(campaign.total_spent).toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-3">
            <p className="text-xs text-zinc-500">Max Price</p>
            <p className="text-lg font-bold text-zinc-100">${Number(campaign.max_price).toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${progress >= 100 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${Math.min(progress, 100)}%` }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Agents */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-zinc-300">🤖 Assigned Agents</CardTitle>
          </CardHeader>
          <CardContent>
            {!assignedAgents || assignedAgents.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-zinc-600">No agents assigned yet</p>
                <p className="text-xs text-zinc-600 mt-1">Agents will be assignable from the Agent management page</p>
              </div>
            ) : (
              <div className="space-y-2">
                {assignedAgents.map((aa: any) => {
                  const agent = agentMap.get(aa.agent_id);
                  return (
                    <div key={aa.agent_id} className="flex items-center justify-between p-2 rounded bg-zinc-800/40">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-200">{agent?.name ?? `Agent #${aa.agent_id}`}</span>
                        {aa.is_lead && <Badge variant="outline" className="text-[10px] border-yellow-500/30 text-yellow-400">Lead</Badge>}
                      </div>
                      <Badge variant="outline" className="text-[10px] border-zinc-600 text-zinc-400">{agent?.outlet ?? '—'}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Purchase Log */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-zinc-300">📦 Purchase Log</CardTitle>
          </CardHeader>
          <CardContent>
            {!purchases || purchases.length === 0 ? (
              <p className="text-sm text-zinc-600 text-center py-6">No purchases yet</p>
            ) : (
              <div className="space-y-1">
                {purchases.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-2 rounded text-xs font-mono hover:bg-zinc-800/40">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-300">{p.card_name}</span>
                      <Badge variant="outline" className="text-[10px] border-zinc-600 text-zinc-400">{p.condition ?? '—'}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400">${Number(p.purchase_price).toFixed(2)}</span>
                      <Badge variant="outline" className={
                        p.status === 'sold' ? 'text-[10px] border-blue-500/30 text-blue-400' :
                        'text-[10px] border-green-500/30 text-green-400'
                      }>{p.status}</Badge>
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
