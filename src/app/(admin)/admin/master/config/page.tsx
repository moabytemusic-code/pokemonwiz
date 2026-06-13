import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import supabase from '@/db';

export const dynamic = 'force-dynamic';

export default async function ConfigPage() {
  const { count: profileCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">⚙️ Configuration</h1>
          <p className="text-sm text-zinc-500 mt-1">System-wide settings and integrations</p>
        </div>
        <Badge variant="outline" className="border-red-500/30 text-red-400">Master Admin</Badge>
      </div>

      {/* System Info */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-zinc-300">System Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between py-2 border-b border-zinc-800">
            <span className="text-sm text-zinc-400">Database</span>
            <span className="text-sm text-zinc-200">Supabase PostgreSQL</span>
          </div>
          <div className="flex justify-between py-2 border-b border-zinc-800">
            <span className="text-sm text-zinc-400">Auth</span>
            <span className="text-sm text-zinc-200">Password (PoC) → Supabase Auth (prod)</span>
          </div>
          <div className="flex justify-between py-2 border-b border-zinc-800">
            <span className="text-sm text-zinc-400">Deployment</span>
            <span className="text-sm text-zinc-200">Vercel</span>
          </div>
          <div className="flex justify-between py-2 border-b border-zinc-800">
            <span className="text-sm text-zinc-400">Profiles</span>
            <span className="text-sm text-zinc-200">{profileCount}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-zinc-400">Agent Runtime</span>
            <span className="text-sm text-zinc-200">Python (not yet deployed)</span>
          </div>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-zinc-300">Integrations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-zinc-800">
            <div>
              <p className="text-sm text-zinc-200">Stripe</p>
              <p className="text-xs text-zinc-500">Fiat payment processing</p>
            </div>
            <Badge variant="outline" className="border-zinc-600 text-zinc-500">Not configured</Badge>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-zinc-800">
            <div>
              <p className="text-sm text-zinc-200">Crypto Payments</p>
              <p className="text-xs text-zinc-500">USDT/SOL/BTC deposits</p>
            </div>
            <Badge variant="outline" className="border-zinc-600 text-zinc-500">Not configured</Badge>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-zinc-800">
            <div>
              <p className="text-sm text-zinc-200">Telegram Alerts</p>
              <p className="text-xs text-zinc-500">Agent activity notifications</p>
            </div>
            <Badge variant="outline" className="border-zinc-600 text-zinc-500">Not configured</Badge>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm text-zinc-200">Shipping (Shippo/PirateShip)</p>
              <p className="text-xs text-zinc-500">USPS/FedEx label generation</p>
            </div>
            <Badge variant="outline" className="border-zinc-600 text-zinc-500">Not configured</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-900/50 bg-red-950/20 border">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-red-400">⚠️ Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-zinc-500">
            These actions are irreversible. Proceed with caution.
          </p>
          <div className="flex gap-3">
            <div className="text-xs text-zinc-400 border border-zinc-700 rounded px-3 py-2">
              Reset All Agents
            </div>
            <div className="text-xs text-zinc-400 border border-zinc-700 rounded px-3 py-2">
              Clear Audit Logs
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
