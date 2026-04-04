'use client';
import React, { useState, useEffect } from 'react';
import { 
  Settings, CreditCard, Shield, Globe, 
  Save, AlertTriangle, CheckCircle, 
  Smartphone, Key, Mail, Lock
} from 'lucide-react';
import { motion } from 'framer-motion';

const ConfigSection = ({ title, desc, icon: Icon, children }) => (
  <div className="bg-[#0c0c0e] border border-white/5 rounded-[32px] p-10 overflow-hidden relative">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-white/5">
       <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-violet-600/10 rounded-2xl flex items-center justify-center text-violet-500">
             <Icon size={24} />
          </div>
          <div>
             <h4 className="font-black text-lg tracking-tight text-white mb-1 uppercase">{title}</h4>
             <p className="text-zinc-500 text-xs">{desc}</p>
          </div>
       </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
       {children}
    </div>
  </div>
);

const InputGroup = ({ label, value, onChange, placeholder, type = "text", icon: Icon }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest pl-1">{label}</label>
    <div className="relative group">
       <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-hover:text-violet-500 transition-colors">
          <Icon size={16} />
       </div>
       <input 
         type={type}
         value={value}
         onChange={(e) => onChange(e.target.value)}
         placeholder={placeholder}
         className="w-full pl-12 pr-6 py-3.5 bg-white/5 border border-white/5 rounded-2xl text-sm font-medium outline-none focus:border-violet-600 focus:bg-white/[0.08] transition-all"
       />
    </div>
  </div>
);

const GlobalSettings = () => {
  const [bkash, setBkash] = useState('');
  const [nagad, setNagad] = useState('');
  const [googleId, setGoogleId] = useState('');
  const [googleSecret, setGoogleSecret] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Placeholder for real build fetching from /api/admin/settings
    setBkash('017XXXXXXXX');
    setNagad('018XXXXXXXX');
    setGoogleId('XXXXXXXX-XXXXXX.apps.googleusercontent.com');
    setGoogleSecret('GOCSPX-XXXXXXXXXXXXXX');
  }, []);

  const handleSave = () => {
    setSaving(true);
    // Real build will hit /api/admin/settings
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-12">
      <header className="flex items-end justify-between">
        <div>
           <h2 className="text-3xl font-black tracking-tight text-white mb-2 uppercase">System Configuration</h2>
           <p className="text-zinc-500 text-sm">Managing payment gateways, authentication, and core parameters.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${saved ? 'bg-emerald-500 text-white' : 'bg-violet-600 text-white hover:scale-105 active:scale-95 shadow-xl shadow-violet-600/20'}`}
        >
          {saved ? <CheckCircle size={18} /> : (saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />)}
          {saved ? 'System Updated' : (saving ? 'Syncing...' : 'Save Configuration')}
        </button>
      </header>

      <ConfigSection 
        title="Payment Gateways" 
        desc="Update active mobile banking numbers for user subscriptions."
        icon={CreditCard}
      >
        <InputGroup label="bKash Personal Number" value={bkash} onChange={setBkash} placeholder="Enter 11-digit number" icon={Smartphone} />
        <InputGroup label="Nagad Personal Number" value={nagad} onChange={setNagad} placeholder="Enter 11-digit number" icon={Smartphone} />
      </ConfigSection>

      <ConfigSection 
        title="Google OAuth Credentials" 
        desc="Managing the identity bridge (Social Login)."
        icon={Shield}
      >
        <InputGroup label="Google Client ID" value={googleId} onChange={setGoogleId} placeholder="XXXXXXXX-XXXXXX.apps..." icon={Key} />
        <InputGroup label="Google Client Secret" value={googleSecret} onChange={setGoogleSecret} placeholder="GOCSPX-XXXXXXXXXXXXXX" type="password" icon={Lock} />
      </ConfigSection>

      <div className="p-8 bg-amber-500/10 border border-amber-500/20 rounded-[32px] flex items-start gap-6">
         <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
            <AlertTriangle size={24} />
         </div>
         <div>
            <h4 className="font-bold text-amber-500 mb-1">Warning: Cryptographic Sensitivity</h4>
            <p className="text-amber-500/60 text-xs leading-relaxed max-w-3xl">
              Updating the Google Client Secret will immediately affect all active login sessions. 
              Ensure those credentials match your project configuration in the Google Cloud Console to avoid "Unauthorized Redirect" errors.
            </p>
         </div>
      </div>
    </div>
  );
};

export default GlobalSettings;
