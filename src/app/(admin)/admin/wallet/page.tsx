import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import db from '@/db';
import { deposits, transactions } from '@/db/schema';
import { sum, sql } from 'drizzle-orm';

export default async function WalletPage() {
  const totalDeposits = await db
    .select({ value: sum(deposits.amount) })
    .from(deposits);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">💰 Wallet</h1>
        <p className="text-sm text-zinc-500 mt-1">Main balance &amp; funding</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500">Main Balance</p>
            <p className="text-3xl font-bold text-yellow-400 mt-1">$0.00</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500">Total Deposited</p>
            <p className="text-3xl font-bold text-green-400 mt-1">
              ${Number(totalDeposits[0]?.value ?? 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500">Agent Funds Pool</p>
            <p className="text-3xl font-bold text-blue-400 mt-1">$0.00</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-zinc-300">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-zinc-500">
            Stripe and crypto deposit integration coming in Phase 3.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
