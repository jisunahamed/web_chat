'use client';
import React, { useState } from 'react';
import { 
  CreditCard, Shield, Globe, 
  Save, CheckCircle, 
  Smartphone, Key, Mail, Lock, Settings
} from 'lucide-react';
import { updateSystemSettings } from '@/app/actions/adminActions';

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

const TextAreaGroup = ({ label, value, onChange, placeholder, rows = 4, icon: Icon }) => (
  <div className="space-y-2 col-span-1 md:col-span-2">
    <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest pl-1">{label}</label>
    <div className="relative group">
       <div className="absolute left-4 top-4 text-zinc-600 group-hover:text-violet-500 transition-colors">
          <Icon size={16} />
       </div>
       <textarea 
         value={value}
         onChange={(e) => onChange(e.target.value)}
         placeholder={placeholder}
         rows={rows}
         className="w-full pl-12 pr-6 py-3.5 bg-white/5 border border-white/5 rounded-2xl text-sm font-medium outline-none focus:border-violet-600 focus:bg-white/[0.08] transition-all resize-y"
       />
    </div>
  </div>
);

const GlobalSettings = ({ initialSettings }) => {
  const [bkash, setBkash] = useState(initialSettings?.bkashNumber || '');
  const [nagad, setNagad] = useState(initialSettings?.nagadNumber || '');
  const [googleId, setGoogleId] = useState(initialSettings?.googleClientId || '');
  const [googleSecret, setGoogleSecret] = useState(initialSettings?.googleClientSecret || '');
  const [siteName, setSiteName] = useState(initialSettings?.siteName || 'InmeTech Bot');
  const [siteLogo, setSiteLogo] = useState(initialSettings?.siteLogo || '');
  const [siteDesc, setSiteDesc] = useState(initialSettings?.siteDescription || '');
  const [siteColor, setSiteColor] = useState(initialSettings?.sitePrimaryColor || '#7C3AED');
  const [supportEmail, setSupportEmail] = useState(initialSettings?.supportEmail || '');

  const [planFreeTitle, setPlanFreeTitle] = useState(initialSettings?.planFreeTitle || 'Free Prototype');
  const [planFreePrice, setPlanFreePrice] = useState(initialSettings?.planFreePrice || 'Free');
  const [planFreeFeatures, setPlanFreeFeatures] = useState(initialSettings?.planFreeFeatures || '1 Autonomous Agent Node\nFree Forever\nWhatsApp & Web Integration\nStandard Response Core\nVisual Customization');

  const [planProTitle, setPlanProTitle] = useState(initialSettings?.planProTitle || 'Sovereign Protocol');
  const [planProPrice, setPlanProPrice] = useState(initialSettings?.planProPrice || '600');
  const [planProFeatures, setPlanProFeatures] = useState(initialSettings?.planProFeatures || 'Unlimited Agent Nodes\nInfinite Usage Lifecycle\nPriority Neural Processing\nWhitelabel Integration\nAdvanced Lead Analytics\n24/7 Priority Support');
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateSystemSettings({
      bkashNumber: bkash,
      nagadNumber: nagad,
      googleClientId: googleId,
      googleClientSecret: googleSecret,
      pluginZipPath: initialSettings?.pluginZipPath,
      pluginVersion: initialSettings?.pluginVersion,
      siteName,
      siteLogo,
      siteDescription: siteDesc,
      sitePrimaryColor: siteColor,
      supportEmail,
      planFreeTitle,
      planFreePrice,
      planFreeFeatures,
      planProTitle,
      planProPrice,
      planProFeatures
    });
    
    if (result.success) {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setSaving(false);
      alert(result.error);
    }
  };

  return (
    <div className="space-y-12">
      <header className="flex items-end justify-between">
        <div>
           <h2 className="text-3xl font-black tracking-tight text-white mb-2 uppercase">System Configuration</h2>
           <p className="text-zinc-500 text-sm">Managing branding, payment gateways, and core parameters.</p>
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
        title="Branding & API" 
        desc="Synchronize your site identity and social identity bridge."
        icon={Globe}
      >
        <InputGroup label="Site Branding Name" value={siteName} onChange={setSiteName} placeholder="InmeTech Bot" icon={Globe} />
        <InputGroup label="Site Logo URL" value={siteLogo} onChange={setSiteLogo} placeholder="https://example.com/logo.png" icon={Smartphone} />
        <InputGroup label="Google Client ID" value={googleId} onChange={setGoogleId} placeholder="XXXXXXXX-XXXXXX.apps..." icon={Key} />
        <InputGroup label="Google Client Secret" value={googleSecret} onChange={setGoogleSecret} placeholder="GOCSPX-XXXXXXXXXXXXXX" type="password" icon={Lock} />
      </ConfigSection>

      <ConfigSection 
        title="Visuals & Connectivity" 
        desc="Manage theme colors and support contact information."
        icon={Settings}
      >
        <InputGroup label="Primary Theme Color" value={siteColor} onChange={setSiteColor} placeholder="#7C3AED" icon={Settings} />
        <InputGroup label="Support Contact Email" value={supportEmail} onChange={setSupportEmail} placeholder="support@inmetech.com" icon={Mail} />
      </ConfigSection>

      <ConfigSection 
        title="Payment Gateways" 
        desc="Update active mobile banking numbers for user subscriptions."
        icon={CreditCard}
      >
        <InputGroup label="bKash Personal Number" value={bkash} onChange={setBkash} placeholder="Enter 11-digit number" icon={Smartphone} />
        <InputGroup label="Nagad Personal Number" value={nagad} onChange={setNagad} placeholder="Enter 11-digit number" icon={Smartphone} />
      </ConfigSection>

      <ConfigSection 
        title="Free Plan Configuration" 
        desc="Modify the free plan title, price, and features (one per line)."
        icon={Shield}
      >
        <InputGroup label="Plan Title" value={planFreeTitle} onChange={setPlanFreeTitle} placeholder="Free Prototype" icon={Settings} />
        <InputGroup label="Plan Price" value={planFreePrice} onChange={setPlanFreePrice} placeholder="Free" icon={CreditCard} />
        <TextAreaGroup label="Features (One per line)" value={planFreeFeatures} onChange={setPlanFreeFeatures} placeholder="- Feature 1\n- Feature 2" icon={Shield} />
      </ConfigSection>

      <ConfigSection 
        title="Pro Plan Configuration" 
        desc="Modify the premium plan title, price, and features (one per line)."
        icon={Shield}
      >
        <InputGroup label="Plan Title" value={planProTitle} onChange={setPlanProTitle} placeholder="Sovereign Protocol" icon={Settings} />
        <InputGroup label="Plan Price (BDT)" value={planProPrice} onChange={setPlanProPrice} placeholder="600" icon={CreditCard} />
        <TextAreaGroup label="Features (One per line)" value={planProFeatures} onChange={setPlanProFeatures} placeholder="- Feature 1\n- Feature 2" icon={Shield} />
      </ConfigSection>
    </div>
  );
};

export default GlobalSettings;
