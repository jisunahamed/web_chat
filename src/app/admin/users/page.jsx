'use client';
import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, MoreVertical, 
  Shield, CreditCard, Clock, CheckCircle, 
  XSquare, Mail, Calendar, UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UserRow = ({ user, index }) => {
  const [showActions, setShowActions] = useState(false);
  
  const getStatusBadge = () => {
    if (user.isPremium) return <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-full border border-emerald-500/20 uppercase tracking-widest">Premium</span>;
    if (new Date(user.trialEndsAt) > new Date()) return <span className="px-2.5 py-1 bg-violet-600/10 text-violet-600 text-[10px] font-black rounded-full border border-violet-600/20 uppercase tracking-widest">Active Trial</span>;
    return <span className="px-2.5 py-1 bg-rose-500/10 text-rose-500 text-[10px] font-black rounded-full border border-rose-500/20 uppercase tracking-widest">Expired</span>;
  };

  return (
    <tr className="group border-b border-white/5 hover:bg-white/[0.02] transition-colors">
      <td className="py-5 pl-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-600/10 rounded-xl flex items-center justify-center font-black text-violet-500 group-hover:bg-violet-600 group-hover:text-white transition-all">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="text-sm font-bold text-white">{user?.name || 'Unknown User'}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">{user?.email || 'No Email'}</p>
          </div>
        </div>
      </td>
      <td className="py-5 font-medium text-zinc-400 text-sm">
        {user.role === 'admin' ? (
          <div className="flex items-center gap-1.5 text-amber-500 text-[10px] font-black uppercase tracking-widest">
            <Shield size={12} /> Administrator
          </div>
        ) : (
          <span className="text-[10px] font-black uppercase tracking-widest">Standard User</span>
        )}
      </td>
      <td className="py-5">{getStatusBadge()}</td>
      <td className="py-5 font-mono text-zinc-500 text-[10px] tracking-tighter">
        {user?.apiKey ? `${user.apiKey.slice(0, 8)}...${user.apiKey.slice(-8)}` : 'No Key'}
      </td>
      <td className="py-5 text-right pr-4 relative">
        <button onClick={() => setShowActions(!showActions)} className="p-2 hover:bg-white/5 rounded-lg text-zinc-600 hover:text-white transition-all">
          <MoreVertical size={16} />
        </button>
        <AnimatePresence>
          {showActions && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute right-12 top-0 w-48 bg-[#121214] border border-white/10 rounded-2xl shadow-2xl z-50 p-2 overflow-hidden"
            >
               <button className="w-full text-left px-4 py-2.5 text-xs hover:bg-white/5 rounded-xl transition-all flex items-center gap-2">
                  <CreditCard size={14} /> Upgrade to Premium
               </button>
               <button className="w-full text-left px-4 py-2.5 text-xs hover:bg-white/5 rounded-xl transition-all flex items-center gap-2">
                  <Clock size={14} /> Extend Trial
               </button>
               <button className="w-full text-left px-4 py-2.5 text-xs hover:bg-white/5 rounded-xl transition-all flex items-center gap-2 text-rose-400">
                  <XSquare size={14} /> Deactivate Account
               </button>
            </motion.div>
          )}
        </AnimatePresence>
      </td>
    </tr>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Placeholder fetching for real build
  useEffect(() => {
    setUsers([
      { id: '1', name: 'Jisun Ahamed', email: 'jisun@inmetech.com', role: 'admin', isPremium: true, trialEndsAt: '2026-05-01', apiKey: '8x2y-9z1w-5v3u-4t2k' },
      { id: '2', name: 'Abir Rahman', email: 'abir@gmail.com', role: 'user', isPremium: false, trialEndsAt: '2026-04-15', apiKey: '3v2b-7n9m-4r3c-8x1q' },
      { id: '3', name: 'Sakib Hasan', email: 'sakib@outlook.com', role: 'user', isPremium: false, trialEndsAt: '2026-03-10', apiKey: '5f4g-3h2j-1k9l-7p0o' },
    ]);
  }, []);

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h2 className="text-3xl font-black tracking-tight text-white mb-2 uppercase">Ecosystem Residents</h2>
           <p className="text-zinc-500 text-sm">Managing {users.length} active users and subscription tiers.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 pr-6 py-3 bg-[#0c0c0e] border border-white/5 rounded-2xl text-sm outline-none w-[280px] focus:border-violet-600 transition-all font-medium" 
                placeholder="Search by ID, name, email..." 
              />
           </div>
           <button className="p-3 bg-violet-600 text-white rounded-2xl shadow-lg shadow-violet-600/20 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
              <UserPlus size={20} />
           </button>
        </div>
      </header>

      <div className="bg-[#0c0c0e] border border-white/5 rounded-[32px] overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
           <div className="flex bg-white/5 p-1 rounded-xl">
              <button className="px-4 py-1.5 bg-white/10 rounded-lg text-xs font-bold text-white uppercase tracking-widest leading-none">All Users</button>
              <button className="px-4 py-1.5 text-xs text-zinc-500 hover:text-white transition-all uppercase tracking-widest leading-none">Premium Only</button>
              <button className="px-4 py-1.5 text-xs text-zinc-500 hover:text-white transition-all uppercase tracking-widest leading-none">Free Trials</button>
           </div>
           <button className="flex items-center gap-2 text-zinc-500 hover:text-white text-xs font-bold transition-all">
              <Filter size={14} /> Filter Results
           </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.01]">
                <th className="py-4 pl-6 text-[10px] font-black uppercase text-zinc-600 tracking-widest">Identity</th>
                <th className="py-4 text-[10px] font-black uppercase text-zinc-600 tracking-widest">Privileges</th>
                <th className="py-4 text-[10px] font-black uppercase text-zinc-600 tracking-widest">Subscription</th>
                <th className="py-4 text-[10px] font-black uppercase text-zinc-600 tracking-widest">Secret Key</th>
                <th className="py-4 pr-6 text-right text-[10px] font-black uppercase text-zinc-600 tracking-widest">Modality</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <UserRow key={user.id} user={user} index={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
