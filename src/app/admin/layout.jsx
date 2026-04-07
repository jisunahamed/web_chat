'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LineChart, Users, CreditCard, Settings, Package, 
  LogOut, Shield, Zap, Bell, Search, Menu, X, ChevronRight,
  Bot, Ticket
} from 'lucide-react';
import { getMe, logout, getToken } from '@/lib/api';

const AdminLayout = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (!token) {
        console.log('No token found, redirecting to login...');
        router.replace('/login');
        return;
      }

      try {
        const data = await getMe();
        const userData = data?.user;
        
        if (!userData) {
          throw new Error('User data not found in session');
        }

        // Primary admin bypass or role verification
        const isPrimaryAdmin = userData.email?.toLowerCase()?.trim() === 'jisunahamed525@gmail.com';
        
        if (userData.role === 'admin' || isPrimaryAdmin) {
          setUser(userData);
          setLoading(false);
        } else {
          console.warn('Unauthorized access attempt by:', userData.email);
          router.replace('/dashboard');
        }
      } catch (err) {
        console.error('Auth verification failed:', err);
        logout();
      }
    };

    checkAuth();
  }, [router]);

  const navItems = [
    { name: 'Overview', href: '/admin', icon: LineChart },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard },
    { name: 'Coupons', href: '/admin/coupons', icon: Ticket },
    { name: 'Plugin Settings', href: '/admin/plugin', icon: Package },
    { name: 'System Settings', href: '/admin/settings', icon: Settings },
  ];

  if (loading || !user) {
     return (
       <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white/50">
          <Bot className="text-violet-500 animate-bounce mb-4" size={48} />
          <p className="text-lg font-medium tracking-tighter uppercase">Initializing Systems...</p>
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100 flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0c0c0e] border-r border-white/5 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 flex flex-col`}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <Bot className="text-violet-500" size={24} />
            <span className="font-black text-xl tracking-tighter uppercase text-white">Admin Panel</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-zinc-500">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
           <button onClick={() => logout()} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-400/10 transition-all">
              <LogOut size={18} />
              Logout
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#070708]/50 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-zinc-400">
              <Menu size={24} />
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
              <Search size={16} className="text-zinc-500" />
              <input className="bg-transparent border-none text-xs text-zinc-300 outline-none w-48" placeholder="Search systems..." />
            </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="relative">
                <Bell size={20} className="text-zinc-400" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-violet-600 rounded-full border border-[#070708]" />
             </div>
             <div className="flex items-center gap-3 pl-6 border-l border-white/5">
                <div className="text-right">
                   <p className="text-sm font-bold text-white">{user?.name || 'Admin'}</p>
                   <p className="text-[10px] text-zinc-500 uppercase tracking-widest leading-none">Super Administrator</p>
                </div>
                <div className="w-10 h-10 bg-violet-600 rounded-lg flex items-center justify-center font-black shadow-lg shadow-violet-600/10 text-white">
                   {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 lg:p-12 relative text-white">
           {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
