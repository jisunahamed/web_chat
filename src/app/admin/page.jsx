'use client';
import React, { useState, useEffect } from 'react';
import { 
  Users, Bot, CreditCard, Activity, TrendingUp, 
  Search, ArrowUpRight, ArrowDownRight, Zap,
  Clock, CheckCircle, XCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, subtext, icon: Icon, trend, color }) => (
  <motion.div 
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    className="p-6 bg-[#0c0c0e] border border-white/5 rounded-3xl group hover:border-violet-500/30 transition-all duration-300"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 ${color.replace('text-', 'bg-')} group-hover:scale-110 transition-transform`}>
        <Icon size={20} className={color} />
      </div>
      {trend && (
        <span className={`flex items-center gap-1 text-xs font-bold ${trend > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest mb-1">{title}</p>
    <h3 className="text-2xl font-black text-white">{value}</h3>
    <p className="text-[10px] text-zinc-600 mt-2">{subtext}</p>
  </motion.div>
);

import { getAdminStats } from '@/app/actions/adminActions';

const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    paidUsers: 0,
    activeAgents: 0,
    revenue: 0,
    pendingPayments: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    const data = await getAdminStats();
    if (data) setStats(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h2 className="text-3xl font-black tracking-tight text-white mb-2">Systems Overview</h2>
           <p className="text-zinc-500 text-sm">Real-time performance metrics and user traffic.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-all">Export JSON</button>
           <button className="px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-600/20 hover:scale-105 transition-all active:scale-95">Update System</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Ecosystem Users" 
          value={stats.totalUsers} 
          subtext="+12 joined this week"
          icon={Users} 
          trend={8}
          color="text-violet-400" 
        />
        <StatCard 
          title="Premium Subscriptions" 
          value={stats.paidUsers} 
          subtext="31% conversion rate"
          icon={CreditCard} 
          trend={12}
          color="text-emerald-400" 
        />
        <StatCard 
          title="Live AI Agents" 
          value={stats.activeAgents} 
          subtext="85% uptime last 24h"
          icon={Bot} 
          trend={-2}
          color="text-amber-400" 
        />
        <StatCard 
          title="Monthly Recurring" 
          value={stats.revenue} 
          subtext="Target: 50,000৳"
          icon={TrendingUp} 
          trend={15}
          color="text-indigo-400" 
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         <div className="xl:col-span-2 space-y-6">
            <div className="bg-[#0c0c0e] border border-white/5 rounded-[32px] p-8 overflow-hidden relative">
               <div className="flex items-center justify-between mb-8">
                  <h4 className="font-bold">Recent System Activity</h4>
                  <Search size={18} className="text-zinc-500" />
               </div>
               <div className="space-y-6">
                  {[1,2,3,4].map((_, i) => (
                    <div key={i} className="flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center font-bold text-zinc-400 group-hover:bg-violet-600 group-hover:text-white transition-all">U</div>
                        <div>
                          <p className="text-sm font-bold text-white">New user registered via Google</p>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest leading-none mt-1">5 minutes ago • IP: 103.xxx.xxx.xxx</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-zinc-700 group-hover:text-white transition-all" />
                    </div>
                  ))}
               </div>
               <button className="w-full mt-10 py-3 bg-white/5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-colors">View All Logs</button>
            </div>
         </div>

         <div className="space-y-6">
            <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-[32px] p-8 text-white relative overflow-hidden group shadow-2xl shadow-violet-600/10">
               <Zap className="absolute top-6 right-6 text-white/20 group-hover:scale-125 transition-transform" size={48} />
               <h4 className="text-lg font-black mb-1 uppercase tracking-tighter">System Health</h4>
               <p className="text-white/70 text-sm mb-6">Database connected and synced.</p>
               <div className="flex items-center gap-2 text-2xl font-black">
                  99.9% <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">OPTIMAL</span>
               </div>
               <div className="mt-8 h-1 w-full bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full w-[90%] bg-white animate-pulse" />
               </div>
            </div>

            <div className="bg-[#0c0c0e] border border-white/5 rounded-[32px] p-8">
               <h4 className="font-bold mb-6">Pending Payments</h4>
               <div className="space-y-4">
                  {stats.pendingPayments > 0 ? (
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="p-4 bg-white/5 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                           <CreditCard size={18} className="text-rose-400" />
                           <div>
                              <p className="text-xs font-bold text-white">TRX: 8X3Y2Z...</p>
                              <p className="text-[10px] text-zinc-500 mt-0.5">500৳ via bKash</p>
                           </div>
                        </div>
                        <CheckCircle size={16} className="text-emerald-500 opacity-0 group-hover:opacity-100" />
                      </div>
                    ))
                  ) : (
                    <p className="text-zinc-500 text-xs py-10 text-center">No pending payments.</p>
                  )}
               </div>
               <Link href="/admin/payments" className="block text-center mt-6 text-xs font-bold text-violet-400 hover:text-violet-300">Manage All Payments</Link>
            </div>
         </div>
      </div>
    </div>
  );
};

const ChevronRight = ({...props}) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);

export default AdminOverview;
