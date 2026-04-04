'use client';
import { useEffect, useState } from 'react';
import { getMe, logout } from '@/lib/api';

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { getMe().then(d=>setUser(d.user)).catch(()=>{}); }, []);

  const copyKey = () => { if(user?.apiKey){navigator.clipboard.writeText(user.apiKey);setCopied(true);setTimeout(()=>setCopied(false),2000);} };

  if(!user) return <p style={{color:'var(--text-secondary)'}}>Loading…</p>;

  return (
    <div className="animate-in">
      <div className="page-header"><h1>Settings</h1></div>
      <div className="card" style={{marginBottom:20}}>
        <h2 style={{fontSize:18,fontWeight:600,marginBottom:16}}>Account</h2>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <div className="form-group"><label>Name</label><input className="form-input" value={user.name} readOnly /></div>
          <div className="form-group"><label>Email</label><input className="form-input" value={user.email} readOnly /></div>
          <div className="form-group"><label>Company</label><input className="form-input" value={user.company||'–'} readOnly /></div>
          <div className="form-group"><label>Member Since</label><input className="form-input" value={new Date(user.createdAt).toLocaleDateString()} readOnly /></div>
        </div>
      </div>
      <div className="card" style={{marginBottom:20}}>
        <h2 style={{fontSize:18,fontWeight:600,marginBottom:8}}>API Key</h2>
        <p style={{color:'var(--text-secondary)',fontSize:13,marginBottom:16}}>Use this key for your WordPress plugin or JS widget.</p>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <code className="code-block" style={{flex:1,margin:0}}>{user.apiKey}</code>
          <button className="btn btn-secondary" onClick={copyKey}>{copied?'✓ Copied':'Copy'}</button>
        </div>
      </div>
      <div className="card" style={{borderColor:'rgba(255,107,107,.3)'}}>
        <h2 style={{fontSize:18,fontWeight:600,marginBottom:8,color:'var(--danger)'}}>Danger Zone</h2>
        <p style={{color:'var(--text-secondary)',fontSize:13,marginBottom:16}}>Sign out of your account.</p>
        <button className="btn btn-danger" onClick={logout}>Sign Out</button>
      </div>
    </div>
  );
}
