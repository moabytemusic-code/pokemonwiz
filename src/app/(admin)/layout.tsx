'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/admin/wallet', label: 'Wallet', icon: '💰' },
  { href: '/admin/campaigns', label: 'Campaigns', icon: '🎯' },
  { href: '/admin/agents', label: 'Agents', icon: '🤖' },
  { href: '/admin/inventory', label: 'Inventory', icon: '📦' },
  { href: '/admin/shop', label: 'Shop', icon: '🏪' },
];

const SOURCES = [
  { label: 'TCGPlayer', status: 'connected' as const },
  { label: 'eBay', status: 'pending' as const },
  { label: 'Pokemon Center', status: 'connected' as const },
  { label: 'Amazon', status: 'connected' as const },
  { label: 'WhatNot', status: 'connected' as const },
];

const STATUS_COLORS = {
  connected: 'bg-emerald-500',
  pending: 'bg-amber-500',
  error: 'bg-red-500',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<'master' | 'client' | null>(null);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => setRole(data.role))
      .catch(() => setRole(null));
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/login', { method: 'DELETE' });
    router.push('/login');
    router.refresh();
  }

  const isMaster = role === 'master';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      {/* Sidebar */}
      <aside className="w-56 border-r border-zinc-800/60 bg-zinc-900/50 flex flex-col backdrop-blur-sm">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-zinc-800/40">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">⚡</span>
            <div>
              <h1 className="text-[15px] font-bold text-yellow-400 leading-tight tracking-tight">
                Pokemon Wiz
              </h1>
              <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
                {isMaster ? 'Master Admin' : 'User'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
            Main
          </p>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all ${
                  isActive
                    ? 'bg-yellow-500/10 text-yellow-400 shadow-sm border border-yellow-500/15'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                <span className="text-[15px]">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Sources */}
          <div className="pt-5 pb-1.5">
            <p className="px-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
              Sources
            </p>
          </div>
          {SOURCES.map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12px] text-zinc-500"
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_COLORS[s.status]}`} />
              <span>{s.label}</span>
              <span className="text-[9px] text-zinc-600 ml-auto font-medium uppercase tracking-wider">
                {s.status === 'connected' ? 'Live' : 'Setup'}
              </span>
            </div>
          ))}

          {/* Master Admin — hidden link at bottom of sidebar */}
          {isMaster && (
            <>
              <div className="pt-5 pb-1.5">
                <p className="px-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                  Admin
                </p>
              </div>
              {[
                { href: '/admin/master/audit', label: 'Activity Audit', icon: '📋' },
                { href: '/admin/master/health', label: 'System Health', icon: '🩺' },
                { href: '/admin/master/financial', label: 'Financial Audit', icon: '🔍' },
                { href: '/admin/reports', label: 'Reports & P&L', icon: '📈' },
                { href: '/admin/master/config', label: 'Configuration', icon: '⚙️' },
              ].map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all ${
                      isActive
                        ? 'bg-red-500/10 text-red-400 border border-red-500/15'
                        : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60'
                    }`}
                  >
                    <span className="text-[15px]">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Bottom */}
        <div className="px-2 py-2.5 border-t border-zinc-800/40">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-[12px] text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 transition-all"
          >
            <span>🚪</span>
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto relative">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>

        {/* Master Admin link — subtle, bottom-right */}
        {!isMaster && (
          <Link
            href="/login"
            className="fixed bottom-3 right-3 text-[10px] text-zinc-700 hover:text-zinc-500 transition-colors"
            title="Master Admin Login"
          >
            🔒 Admin
          </Link>
        )}
      </main>
    </div>
  );
}
