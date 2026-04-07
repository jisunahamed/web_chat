'use client';

import React, { useState, useEffect } from 'react';
import { 
  Ticket, Plus, Trash2, Calendar, 
  Percent, Hash, Clock, CheckCircle, 
  XCircle, Filter, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createCoupon, deleteCoupon, getCoupons } from '@/app/actions/adminActions';

const CouponCard = ({ coupon, onDelete }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="p-8 bg-[#0c0c0e] border border-white/5 rounded-[32px] group hover:border-violet-600/30 transition-all relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 p-4 bg-violet-600/10 rounded-bl-3xl text-violet-500 font-black text-[10px] uppercase tracking-widest border-l border-b border-white/5">
       {coupon.type === 'PERCENT' ? `${coupon.discount}% OFF` : `${coupon.discount}৳ FLAT`}
    </div>
    
    <div className="flex items-center gap-4 mb-6">
       <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500 group-hover:text-white transition-colors">
          <Ticket size={24} />
       </div>
       <div>
          <h4 className="text-xl font-black text-white italic tracking-tighter uppercase">{coupon.code}</h4>
          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5">Valid for {coupon.durationMonths} Months</p>
       </div>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-8">
       <div className="p-4 bg-white/5 rounded-2xl">
          <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em] mb-1">Uses</p>
          <p className="text-sm text-white font-bold">{coupon.usedCount} / {coupon.maxUses || '∞'}</p>
       </div>
       <div className="p-4 bg-white/5 rounded-2xl">
          <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em] mb-1">Status</p>
          <span className={`text-[10px] font-bold ${coupon.isActive ? 'text-emerald-500' : 'text-rose-500'}`}>
            {coupon.isActive ? 'ACTIVE' : 'EXPIRED'}
          </span>
       </div>
    </div>

    <button 
      onClick={() => onDelete(coupon.id)}
      className="w-full py-4 bg-white/5 border border-white/5 rounded-2xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest"
    >
      Void Coupon
    </button>
  </motion.div>
);
const CouponsManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '', discount: '', type: 'PERCENT', durationMonths: 1, maxUses: ''
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const data = await getCoupons();
      setCoupons(data || []);
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const result = await createCoupon(newCoupon);
    if (result.success) {
      setShowAdd(false);
      setNewCoupon({ code: '', discount: '', type: 'PERCENT', durationMonths: 1, maxUses: '' });
      fetchCoupons();
    } else {
      alert(result.error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to void this coupon?')) return;
    const result = await deleteCoupon(id);
    if (result.success) fetchCoupons();
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
           <h2 className="text-3xl font-black tracking-tight text-white mb-2 uppercase italic leading-none">Campaign Console</h2>
           <p className="text-zinc-500 text-sm font-medium">Manage promotional discount codes and subscription vouchers.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="px-8 py-3.5 bg-violet-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-violet-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
          <Plus size={18} /> New Coupon
        </button>
      </header>

      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-[#0c0c0e] border border-violet-500/20 rounded-[48px] p-10 mb-12 shadow-2xl"
          >
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Coupon Code</label>
                  <input required value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} placeholder="E.G. RAMADAN100" className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl text-sm font-bold uppercase outline-none focus:border-violet-600" />
               </div>
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Discount Amount</label>
                  <div className="relative">
                    <input required type="number" value={newCoupon.discount} onChange={e => setNewCoupon({...newCoupon, discount: e.target.value})} placeholder="10.0" className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl text-sm font-bold outline-none focus:border-violet-600" />
                    <select value={newCoupon.type} onChange={e => setNewCoupon({...newCoupon, type: e.target.value})} className="absolute right-2 top-2 bg-zinc-900 border border-white/10 rounded-lg p-2 text-[10px] font-black outline-none">
                       <option value="PERCENT">%</option>
                       <option value="FLAT">৳</option>
                    </select>
                  </div>
               </div>
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Pro Duration (Months)</label>
                  <input required type="number" value={newCoupon.durationMonths} onChange={e => setNewCoupon({...newCoupon, durationMonths: e.target.value})} className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl text-sm font-bold outline-none focus:border-violet-600" />
               </div>
               <div className="md:col-span-2 space-y-4">
                  <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Max Usage Limit (Optional)</label>
                  <input type="number" value={newCoupon.maxUses} onChange={e => setNewCoupon({...newCoupon, maxUses: e.target.value})} placeholder="Unlimited" className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl text-sm font-bold outline-none focus:border-violet-600" />
               </div>
               <div className="flex items-end gap-4">
                  <button type="submit" className="flex-1 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200">Generate Coupon</button>
                  <button type="button" onClick={() => setShowAdd(false)} className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-zinc-500 hover:text-white">Cancel</button>
               </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 text-zinc-600">
             <div className="w-10 h-10 border-4 border-white/5 border-t-violet-600 rounded-full animate-spin" />
             <p className="text-xs font-bold uppercase tracking-widest">Compiling Database...</p>
          </div>
        ) : coupons.length > 0 ? (
          coupons.map((c) => <CouponCard key={c.id} coupon={c} onDelete={handleDelete} />)
        ) : (
          <div className="col-span-full py-32 bg-[#0c0c0e] border border-dashed border-white/5 rounded-[48px] flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-zinc-700 mb-6">
                <Ticket size={32} />
             </div>
             <h4 className="text-white font-bold mb-2">No Active Coupons</h4>
             <p className="text-zinc-500 text-sm max-w-xs">Your system currently has no promotional codes. Generate a new one to start your campaign.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponsManager;
