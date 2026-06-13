import supabase from '@/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export const dynamic = 'force-dynamic';

export default async function AuditPage() {
  const { data: logs } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">📋 Activity Audit</h1>
          <p className="text-sm text-zinc-500 mt-1">Every action across the system, timestamped</p>
        </div>
        <Badge variant="outline" className="border-red-500/30 text-red-400">
          Master Admin
        </Badge>
      </div>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-zinc-300">
            Event Log {logs ? `(${logs.length} recent)` : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!logs || logs.length === 0 ? (
            <p className="text-sm text-zinc-600">No audit events recorded yet.</p>
          ) : (
            <div className="space-y-1">
              {logs.map((log: any) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-2 rounded text-xs font-mono hover:bg-zinc-800/50"
                >
                  <span className="text-zinc-600 shrink-0 w-16">
                    {new Date(log.created_at).toLocaleDateString()}
                  </span>
                  <Badge
                    variant="outline"
                    className={`shrink-0 text-[10px] px-1.5 py-0 ${
                      log.level === 'error' || log.level === 'critical'
                        ? 'border-red-500/30 text-red-400'
                        : log.level === 'warn'
                          ? 'border-orange-500/30 text-orange-400'
                          : 'border-zinc-600 text-zinc-400'
                    }`}
                  >
                    {log.level}
                  </Badge>
                  <span className="text-zinc-500">{log.event_type}</span>
                  <span className="text-zinc-300 flex-1">{log.message}</span>
                  {log.agent_id && (
                    <span className="text-zinc-600">agent:{log.agent_id}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
