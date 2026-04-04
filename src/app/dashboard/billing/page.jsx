'use client';
import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Smartphone, Zap, CheckCircle, 
  Shield, AlertCircle, ArrowRight, Loader2,
  Copy, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PaymentBox = ({ title, number, color, icon: Icon }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`p-8 bg-[#0c0c0e] border border-white/5 rounded-[32px] group hover:border-${color}-500/30 transition-all`}>
       <div className="flex items-center gap-4 mb-6">
          <div className={`w-12 h-12 bg-${color}-500/10 rounded-2xl flex items-center justify-center text-${color}-500`}>
             <Icon size={24} />
          </div>
          <div>
             <h4 className="font-black text-lg tracking-tight uppercase">{title}</h4>
             <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Personal Account</p>
          </div>
       </div>
       <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
          <span className="font-mono text-lg font-bold tracking-wider">{number}</span>
          <button onClick={handleCopy} className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-all">
             {copied ? <CheckCircle size={18} className="text-emerald-500" /> : <Copy size={18} />}
          </button>
       </div>
    </div>
  );
};

const BillingPage = () => {
  const [trxId, setTrxId] = useState('');
  const [method, setMethod] = useState('');
  const [amount, setAmount] = useState('500');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!trxId || !method) return;
    setSubmitting(true);
    // Real build will hit /api/payments
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <header>
         <h1 className="text-3xl font-black tracking-tight mb-2 uppercase">Subscription & Billing</h1>
         <p className="text-zinc-500 text-sm">Upgrade to Professional to unlock 10 AI Agents and unlimited messages.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <PaymentBox title="bKash" number="017XXXXXXXX" color="rose" icon={Smartphone} />
         <PaymentBox title="Nagad" number="018XXXXXXXX" color="orange" icon={Smartphone} />
      </div>

      <div className="bg-[#0c0c0e] border border-white/5 rounded-[32px] p-10 relative overflow-hidden">
         <div className="flex flex-col lg:flex-row gap-16">
            <div className="flex-1 space-y-8">
               <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                     <CreditCard size={20} className="text-violet-500" /> Confirm your payment
                  </h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                     Once you send the money to any of our numbers above, please provide the <b>Transaction ID</b> below for manual verification. 
                     Our team will approve your request within 1-2 hours.
                  </p>
               </div>

               <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest ml-1">Payment Method</label>
                        <select 
                          value={method}
                          onChange={(e) => setMethod(e.target.value)}
                          className="w-full px-6 py-3.5 bg-white/5 border border-white/5 rounded-2xl text-sm font-medium outline-none focus:border-violet-600 transition-all cursor-pointer"
                        >
                           <option value="">Select Method</option>
                           <option value="BKASH">bKash</option>
                           <option value="NAGAD">Nagad</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest ml-1">Amount (BDT)</label>
                        <input disabled value="500৳" className="w-full px-6 py-3.5 bg-white/5 border border-white/5 rounded-2xl text-sm font-medium opacity-50" />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest ml-1">Transaction ID (TRX ID)</label>
                     <input 
                       value={trxId}
                       onChange={(e) => setTrxId(e.target.value)}
                       placeholder="e.g. 8X3Y2Z1W"
                       className="w-full px-6 py-3.5 bg-white/5 border border-white/5 rounded-2xl text-sm font-bold tracking-widest outline-none focus:border-violet-600 transition-all font-mono uppercase" 
                     />
                  </div>

                  <button 
                    disabled={submitting || submitted}
                    className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${submitted ? 'bg-emerald-500 text-white' : 'bg-violet-600 text-white hover:scale-[1.01] active:scale-95 shadow-xl shadow-violet-600/20'}`}
                  >
                     {submitting ? <div className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={16} /> Verifying Transaction...</div> : (submitted ? <div className="flex items-center justify-center gap-2"><CheckCircle size={16} /> Request Submitted Successfully</div> : 'Confirm Payment')}
                  </button>
               </form>
            </div>

            <div className="w-full lg:w-[350px] space-y-6">
               <div className="p-8 bg-violet-600/5 border border-violet-600/10 rounded-[32px]">
                  <h4 className="font-bold text-sm mb-6 uppercase tracking-widest flex items-center gap-2">
                     <Zap size={16} className="text-violet-500" /> Pro Benefits
                  </h4>
                  <ul className="space-y-4">
                     {[
                       "10 Smart AI Agents",
                       "Unlimited Conversations",
                       "Priority AI Models",
                       "WhatsApp Integration",
                       "Premium Analytics",
                       "White-label Widget"
                     ].map((f, i) => (
                       <li key={i} className="flex items-center gap-3 text-xs text-zinc-400">
                          <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" /> {f}
                       </li>
                     ))}
                  </ul>
               </div>

               <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-[32px] flex items-start gap-4">
                  <Info size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-zinc-500 leading-relaxed uppercase tracking-tight">
                     Incorrect TRX IDs will be automatically declined. Double check before submitting.
                  </p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default BillingPage;
