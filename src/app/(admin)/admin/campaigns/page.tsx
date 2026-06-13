import { Card, CardContent } from '@/components/ui/card';

export default async function CampaignsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">🎯 Campaigns</h1>
        <p className="text-sm text-zinc-500 mt-1">Create and manage card buying missions here.</p>
      </div>
      <Card className="border-zinc-800 bg-zinc-900">
        <CardContent className="p-8 text-center">
          <p className="text-zinc-500">Coming in the next build iteration.</p>
        </CardContent>
      </Card>
    </div>
  );
}
