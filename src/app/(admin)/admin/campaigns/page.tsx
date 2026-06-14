import supabase from '@/db';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; error?: string }>;
}) {
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  const sp = await searchParams;
  const deleted = sp.deleted;
  const error = sp.error;

  return (
    <div className="space-y-6">
      {/* Success/Error banners */}
      {deleted === 'true' && (
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
          ✅ Campaign deleted successfully
        </div>
      )}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          ❌ {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">🎯 Campaigns</h1>
          <p className="text-sm text-zinc-500 mt-1">Create and manage card buying missions</p>
        </div>
        <Link href="/admin/campaigns/new">
          <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
            + New Campaign
          </Button>
        </Link>
      </div>

      {!campaigns || campaigns.length === 0 ? (
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-12 text-center">
            <p className="text-3xl mb-2">🎯</p>
            <p className="text-zinc-400 font-medium">No campaigns yet</p>
            <p className="text-sm text-zinc-600 mt-1">Create your first card buying mission</p>
            <Link href="/admin/campaigns/new">
              <Button className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black">
                + Create Campaign
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {campaigns.map((c: any) => {
            const progress = c.target_quantity > 0
              ? Math.round((c.fulfilled / c.target_quantity) * 100)
              : 0;
            return (
              <Link key={c.id} href={`/admin/campaigns/${c.id}`}>
                <Card className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800/80 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-zinc-200">{c.name}</h3>
                        <Badge variant="outline" className={
                          c.status === 'active' ? 'border-green-500/30 text-green-400' :
                          c.status === 'completed' ? 'border-blue-500/30 text-blue-400' :
                          c.status === 'paused' ? 'border-yellow-500/30 text-yellow-400' :
                          c.status === 'draft' ? 'border-zinc-600 text-zinc-400' :
                          'border-red-500/30 text-red-400'
                        }>{c.status}</Badge>
                        <Badge variant="outline" className={
                          c.priority === 'urgent' ? 'border-red-500/30 text-red-400' :
                          c.priority === 'high' ? 'border-orange-500/30 text-orange-400' :
                          'border-zinc-600 text-zinc-400'
                        }>{c.priority}</Badge>
                      </div>
                      <span className="text-xs text-zinc-500 font-mono">
                        ${Number(c.max_price).toFixed(2)} max · {c.sources?.split(',').length ?? 0} sources
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            progress >= 100 ? 'bg-green-500' :
                            progress >= 50 ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-zinc-400 shrink-0 font-mono">
                        {c.fulfilled}/{c.target_quantity}
                      </span>
                      <span className="text-xs text-zinc-500 shrink-0">
                        {c.card_name}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
