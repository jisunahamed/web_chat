'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getMe, logout, getToken } from '@/lib/api';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/dashboard/agents', label: 'Agents', icon: '🤖' },
  { href: '/dashboard/conversations', label: 'Conversations', icon: '💬' },
  { href: '/dashboard/leads', label: 'Leads', icon: '📋' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
];

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!getToken()) { router.replace('/login'); return; }
    getMe().then((d) => setUser(d.user)).catch(() => logout());
  }, [router]);

  if (!user) return <div className="auth-wrapper"><p style={{color:'var(--text-secondary)'}}>Loading…</p></div>;

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-logo">🚀 Messenger AI</div>
        <nav className="sidebar-nav">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}>
              <span>{item.icon}</span>{item.label}
            </a>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-avatar">{user.name?.charAt(0).toUpperCase()}</div>
          <div><div className="sidebar-user-name">{user.name}</div><div className="sidebar-user-email">{user.email}</div></div>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
