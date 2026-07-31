'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Table2, UserCog, LogOut, Users, Building2, History, FileText, Calendar } from 'lucide-react';
import ConfirmDialog from '@/components/confirm-dialog';
import SealLogo from '@/components/seal-logo';
import { logoutAction } from '@/app/actions/auth';
import type { SessionPayload } from '@/lib/auth';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  STAFF: 'Staf Protokom',
  ATASAN: 'Pimpinan',
};

export default function AppShell({
  user,
  children,
}: {
  user: SessionPayload;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const logoutFormRef = useRef<HTMLFormElement>(null);

  const navItems = [
    { href: '/dashboard', label: 'Dasbor', icon: <LayoutDashboard size={16} /> },
    { href: '/kalender', label: 'Kalender', icon: <Calendar size={16} /> },
    { href: '/worksheet', label: 'Worksheet Kegiatan', icon: <Table2 size={16} /> },
    { href: '/laporan', label: 'Laporan', icon: <FileText size={16} />},
    { href: '/master-petugas', label: 'Master Petugas', icon: <Users size={16} /> },
    { href: '/master-leading-sector', label: 'Master Leading Sector', icon: <Building2 size={16} /> },
  ];
  if (user.role === 'ADMIN') {
    navItems.push({ href: '/users', label: 'Kelola Pengguna', icon: <UserCog size={16} /> });
    navItems.push({ href: '/activity-log', label: 'Activity Log', icon: <History size={16} /> });
  }

  return (
    <div className="min-h-screen bg-app">
      <header className="bg-navy text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SealLogo size={36} />
            <div>
              <p className="font-display font-semibold text-sm leading-tight">Sistem Manajemen SPJ</p>
              <p className="text-xs text-white/60 leading-tight">Protokom Sekda Brebes</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium leading-tight">{user.nama}</p>
              <p className="text-xs text-white/60 leading-tight">{ROLE_LABELS[user.role]}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              aria-label="Keluar"
              className="p-2 rounded-lg hover:bg-white/10"  
            >
               <LogOut size={17} />
            </button>
          </div>
        </div>
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-1 border-t border-white/10 overflow-x-auto">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-sm border-b-2 whitespace-nowrap transition-colors ${
                  active ? 'border-gold text-white' : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                {item.icon} {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">{children}</main>

      <ConfirmDialog
        open={showLogoutConfirm}
        title="Keluar dari akun?"
        message="Anda akan dikembalikan ke halaman login."
        confirmLabel="Keluar"
        onConfirm={() => {
          setShowLogoutConfirm(false);
          logoutFormRef.current?.requestSubmit();
        }}
        onCancel={() => setShowLogoutConfirm(false)}
        />
        <form 
          ref={logoutFormRef} 
          action={logoutAction} 
          className="hidden" 
        />
    </div>
  );
}