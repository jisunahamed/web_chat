'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getMe, logout, getToken } from '@/lib/api';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/dashboard/agents', label: 'Agents', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { href: '/dashboard/conversations', label: 'Conversations', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  { href: '/dashboard/leads', label: 'Leads', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { href: '/dashboard/billing', label: 'Billing', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { href: '/dashboard/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

function NavIcon({ d }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

import { useSession } from 'next-auth/react';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      
      // If we have neither a custom token nor a NextAuth session, redirect to login
      if (!token && status === 'unauthenticated') {
        router.replace('/login');
        return;
      }

      // If we are still loading the session, wait
      if (status === 'loading') return;

      try {
        const d = await getMe();
        setUser(d.user);
      } catch (err) {
        // If API fails but we have a session, maybe try again or logout
        if (!session) logout();
      }
    };

    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/conversations/unread-count');
        const data = await res.json();
        setUnreadCount(data.count || 0);
      } catch (err) {}
    };

    checkAuth();
    fetchUnread();
    // Poll for new messages every 30 seconds
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [router, status, session]);

  if (status === 'loading' || (!user && status === 'authenticated')) return <div className="auth-wrapper"><p style={{color:'var(--text-secondary)'}}>Initializing Ecosystem...</p></div>;
  if (!user && status === 'unauthenticated') return null;

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-logo" style={{ background: 'none', webkitTextFillColor: 'initial', color: 'white' }}>
           <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.05em', textTransform: 'uppercase', fontStyle: 'italic' }}>
              INMETECH
              <span style={{ color: 'var(--primary-light)', marginLeft: 6 }}>BOT</span>
           </span>
        </div>
        <nav className="sidebar-nav">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className={`sidebar-link ${pathname === item.href ? 'active' : ''}`} style={{justifyContent:'space-between'}}>
              <div style={{display:'flex', alignItems:'center', gap:12}}>
                <NavIcon d={item.icon} />
                {item.label}
              </div>
              {item.label === 'Conversations' && unreadCount > 0 && (
                <span style={{background:'var(--danger)', color:'white', fontSize:9, fontWeight:900, padding:'2px 6px', borderRadius:10, minWidth:18, textAlign:'center'}}>
                  {unreadCount}
                </span>
              )}
            </Link>
          ))}
          {user.role === 'admin' && (
             <Link href="/admin" className="sidebar-link" style={{marginTop:20, color:'var(--primary-light)'}}>
                <NavIcon d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                Admin Panel
             </Link>
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-avatar">{user.name?.charAt(0).toUpperCase()}</div>
          <div style={{flex:1}}>
            <div className="sidebar-user-name" style={{fontSize:12,fontWeight:700}}>{user.name}</div>
            <div className="sidebar-user-email" style={{fontSize:10,opacity:0.6}}>{user.email}</div>
          </div>
          <button onClick={() => logout()} style={{background:'none',border:'none',color:'var(--danger)',cursor:'pointer'}}>
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          </button>
        </div>
      </aside>
      <main className="main-content" style={{background:'#09090b'}}>{children}</main>
    </div>
  );
}

import Link from 'next/link';
