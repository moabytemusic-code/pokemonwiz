'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const NAV_ITEMS = [
  { href: '/', label: 'Command Center', icon: '📊' },
  { href: '/admin/wallet', label: 'Wallet', icon: '💰' },
  { href: '/admin/campaigns', label: 'Campaigns', icon: '🎯' },
  { href: '/admin/agents', label: 'Agents', icon: '🤖' },
  { href: '/admin/inventory', label: 'Inventory', icon: '📦' },
  { href: '/admin/shop', label: 'Shop', icon: '🏪' },
];

const MASTER_ITEMS = [
  { href: '/admin/master/audit', label: 'Activity Audit', icon: '📋' },
  { href: '/admin/master/health', label: 'System Health', icon: '🩺' },
  { href: '/admin/master/financial', label: 'Financial Audit', icon: '🔍' },
  { href: '/admin/reports', label: 'Reports & P&L', icon: '📈' },
  { href: '/admin/master/config', label: 'Configuration', icon: '⚙️' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/login', { method: 'DELETE' });
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-900 flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-zinc-800">
          <h1 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
            ⚡ Pokemon Wiz
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Master Admin</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Master Admin Oversight Section */}
          <div className="pt-4 pb-1">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
              Master Oversight
            </p>
          </div>
          {MASTER_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-zinc-800">
          <Button
            variant="ghost"
            className="w-full justify-start text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
            onClick={handleLogout}
          >
            🚪 Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
