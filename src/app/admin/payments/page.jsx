'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, CheckCircle, XCircle, 
  Clock, Search, Filter, ArrowUpRight, 
  User, Hash, Calendar, Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { handlePaymentAction } from '@/app/actions/adminActions';

const PaymentRow = ({ payment, onUpdate }) => {
  const [processing, setProcessing] = useState(false);

  const handleAction = async (action) => {
    if (!confirm(`Are you sure you want to ${action.toLowerCase()} this payment?`)) return;
    setProcessing(true);
    const result = await handlePaymentAction(payment.id, action);
    if (result.success) {
      onUpdate();
    } else {
      alert(result.error);
    }
    setProcessing(false);
  };

  const statusColors = {
    PENDING: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    APPROVED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    DECLINED: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="group bg-[#0c0c0e] border border-white/5 hover:border-white/10 rounded-3xl p-6 transition-all"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500 group-hover:scale-110 transition-transform">
            <Smartphone size={24} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h4 className="font-black text-white uppercase tracking-tight italic">
                {payment?.method || 'N/A'} – {payment?.amount || 0}৳
              </h4>
              <span className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusColors[payment?.status || 'PENDING']}`}>
                {payment?.status || 'UNKNOWN'}
              </span>
            </div>
            <p className="text-zinc-400 text-xs font-medium">TRX ID: <span className="text-white font-bold">{payment?.trxId || 'N/A'}</span> • Plan: {payment?.plan || 'Standard'}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-10">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-600">
               <User size={14} />
             </div>
             <div>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">User</p>
                <p className="text-xs text-zinc-400 font-medium">{payment.user?.email || 'Unknown'}</p>
             </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-600">
               <Calendar size={14} />
             </div>
             <div>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Requested</p>
                <p className="text-xs text-zinc-400 font-medium">{new Date(payment.createdAt).toLocaleDateString()}</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
           {payment.status === 'PENDING' && (
             <>
               <button 
                 onClick={() => handleAction('APPROVE')}
                 disabled={processing}
                 className="flex-1 lg:flex-none px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
               >
                 Approve
               </button>
               <button 
                 onClick={() => handleAction('DECLINE')}
                 disabled={processing}
                 className="flex-1 lg:flex-none px-6 py-3 bg-white/5 border border-white/10 text-rose-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-500/10 transition-all disabled:opacity-50"
               >
                 Decline
               </button>
             </>
           )}
        </div>
      </div>
    </motion.div>
  );
};

const PaymentsQueue = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/payments?status=${filter}`);
      const data = await res.json();
      setPayments(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPayments();
  }, [filter]);

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
           <h2 className="text-3xl font-black tracking-tight text-white mb-2 uppercase italic">Transaction Queue</h2>
           <p className="text-zinc-500 text-sm font-medium">Verify and confirm manual subscription upgrades.</p>
        </div>
        
        <div className="flex items-center bg-[#0c0c0e] border border-white/5 rounded-2xl p-1.5 p-1.5">
           {['PENDING', 'APPROVED', 'DECLINED'].map((s) => (
             <button 
               key={s}
               onClick={() => setFilter(s)}
               className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === s ? 'bg-white/10 text-white shadow-xl' : 'text-zinc-600 hover:text-zinc-400'}`}
             >
               {s}
             </button>
           ))}
        </div>
      </header>

      <div className="space-y-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-zinc-600">
             <div className="w-10 h-10 border-4 border-white/5 border-t-violet-600 rounded-full animate-spin" />
             <p className="text-xs font-bold uppercase tracking-widest">Scanning Blockchain...</p>
          </div>
        ) : payments.length > 0 ? (
          <AnimatePresence>
            {payments.map((p) => (
              <PaymentRow key={p.id} payment={p} onUpdate={fetchPayments} />
            ))}
          </AnimatePresence>
        ) : (
          <div className="py-32 bg-[#0c0c0e] border border-dashed border-white/5 rounded-[48px] flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-zinc-700 mb-6">
                <Filter size={32} />
             </div>
             <h4 className="text-white font-bold mb-2">No Transactions Found</h4>
             <p className="text-zinc-500 text-sm max-w-xs">There are no {filter.toLowerCase()} payments in the system matching this criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsQueue;
