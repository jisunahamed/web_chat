'use client';
import { useEffect, useState } from 'react';
import { getAgents, createAgent, updateAgent, deleteAgent, getMe } from '@/lib/api';

const THEMES = [
  { id: 'bubble', label: 'Bubble', desc: 'Rounded, soft, modern' },
  { id: 'glass', label: 'Glass', desc: 'Frosted glassmorphism' },
  { id: 'minimal', label: 'Minimal', desc: 'Clean, sharp edges' },
  { id: 'mocha', label: 'Mocha', desc: 'Warm coffee/chocolate dark' },
  { id: 'aurora', label: 'Aurora', desc: 'Animated gradient header' },
  { id: 'neon', label: 'Neon', desc: 'Cyberpunk glow effects' },
  { id: 'gradient', label: 'Gradient', desc: 'Full immersive gradient' },
  { id: 'corporate', label: 'Corporate', desc: 'Ultra-clean professional' },
];

const LANGUAGES = [
  { code: 'bn', name: 'Bangla', native: 'বাংলা' },
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'zh', name: 'Chinese', native: '中文' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe' },
  { code: 'id', name: 'Indonesian', native: 'Indonesia' },
  { code: 'th', name: 'Thai', native: 'ไทย' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
];

function colorBg(form) {
  if (form.useGradient && form.secondaryColor) {
    return `linear-gradient(135deg, ${form.primaryColor}, ${form.secondaryColor})`;
  }
  return form.primaryColor;
}

// ────────────────────────────── LIVE PREVIEW ──────────────────────────────
function WidgetPreview({ form }) {
  const t = form.widgetTheme || 'bubble';
  const P = form.primaryColor || '#7C3AED';
  const S = form.secondaryColor || P;
  const grad = form.useGradient ? `linear-gradient(135deg, ${P}, ${S})` : P;
  
  const themeConfig = {
    bubble:    { chatR:28, msgR:22, triggerR:'50%', chatBg:'#ffffff', msgBg:'#ffffff', headerBg:grad, areaBg:form.chatBg||'#f8fafc', chatShadow:'0 24px 64px rgba(0,0,0,0.14)', chatBorder:'1px solid rgba(0,0,0,0.06)', blur:'none', headerBlur:'none', textColor:'#1e293b', mutedText:'#94a3b8', inputBg:'rgba(255,255,255,0.08)', triggerBg:grad, dark:false },
    glass:     { chatR:24, msgR:16, triggerR:'50%', chatBg:'rgba(255,255,255,0.92)', msgBg:'rgba(255,255,255,0.75)', headerBg:form.useGradient?`linear-gradient(135deg,${P}dd,${S}dd)`:`${P}dd`, areaBg:form.chatBg||'rgba(248,250,252,0.8)', chatShadow:'0 32px 80px rgba(0,0,0,0.18)', chatBorder:'1px solid rgba(255,255,255,0.25)', blur:'blur(20px)', headerBlur:'blur(16px)', textColor:'#1e293b', mutedText:'#94a3b8', inputBg:'rgba(255,255,255,0.08)', triggerBg:grad, dark:false },
    minimal:   { chatR:12, msgR:10, triggerR:'16px', chatBg:'#ffffff', msgBg:'#ffffff', headerBg:grad, areaBg:form.chatBg||'#f8fafc', chatShadow:'0 24px 64px rgba(0,0,0,0.14)', chatBorder:'1px solid rgba(0,0,0,0.06)', blur:'none', headerBlur:'none', textColor:'#1e293b', mutedText:'#94a3b8', inputBg:'rgba(255,255,255,0.08)', triggerBg:grad, dark:false },
    mocha:     { chatR:24, msgR:18, triggerR:'50%', chatBg:'#1a1210', msgBg:'#2a1f1a', headerBg:grad, areaBg:form.chatBg||'#1a1210', chatShadow:'0 32px 80px rgba(0,0,0,0.4)', chatBorder:`1px solid ${P}26`, blur:'none', headerBlur:'none', textColor:'#f5e6d3', mutedText:`${P}99`, inputBg:`${P}1A`, triggerBg:grad, dark:true },
    aurora:    { chatR:24, msgR:18, triggerR:'50%', chatBg:'#ffffff', msgBg:'#f0f4ff', headerBg:`linear-gradient(135deg, ${P}, #06b6d4, ${S})`, areaBg:form.chatBg||'#f0f4ff', chatShadow:`0 24px 64px ${P}26`, chatBorder:`1px solid ${P}1F`, blur:'none', headerBlur:'none', textColor:'#1e293b', mutedText:'#94a3b8', inputBg:`${P}0A`, triggerBg:grad, dark:false },
    neon:      { chatR:8, msgR:6, triggerR:'8px', chatBg:'#0a0a0f', msgBg:'#12121a', headerBg:'linear-gradient(135deg, #0a0a0f, #1a1a2e)', areaBg:form.chatBg||'#0a0a0f', chatShadow:`0 0 40px ${P}26, 0 24px 64px rgba(0,0,0,0.5)`, chatBorder:`1px solid ${P}33`, blur:'none', headerBlur:'none', textColor:'#e0ffe0', mutedText:`${P}80`, inputBg:`${P}0F`, triggerBg:grad, dark:true },
    gradient:  { chatR:28, msgR:18, triggerR:'50%', chatBg:`linear-gradient(180deg, ${P}15, ${S}15)`, msgBg:'rgba(255,255,255,0.12)', headerBg:grad, areaBg:form.chatBg||`linear-gradient(180deg, ${P}10, #ffffff)`, chatShadow:`0 32px 80px ${P}30`, chatBorder:`1px solid ${P}20`, blur:'blur(12px)', headerBlur:'none', textColor:'#1e293b', mutedText:'#94a3b8', inputBg:'rgba(255,255,255,0.15)', triggerBg:grad, dark:false },
    corporate: { chatR:4, msgR:4, triggerR:'4px', chatBg:'#ffffff', msgBg:'#f9fafb', headerBg:grad, areaBg:form.chatBg||'#f9fafb', chatShadow:'0 4px 20px rgba(0,0,0,0.08)', chatBorder:'1px solid #e5e7eb', blur:'none', headerBlur:'none', textColor:'#111827', mutedText:'#6b7280', inputBg:'#f3f4f6', triggerBg:grad, dark:false },
  };

  const T = themeConfig[t] || themeConfig.bubble;
  const isDark = T.dark;
  
  const chatRadius = T.chatR;
  const msgRadius = T.msgR;
  const headerBg = T.headerBg;
  const chatBg = T.areaBg;
  const popupBg = form.popupBg || (isDark ? '#1a1a2e' : '#ffffff');
  const faqs = form.faqs || [];
  
  const textColor = isDark ? '#f5f5f5' : T.textColor;
  const mutedTextColor = T.mutedText;

  const sl = form.socialLinks || {};

  // Accent color for neon effects
  const accent = P;

  return (
    <div style={{width:'100%',maxWidth:350,display:'flex',flexDirection:'column',alignItems:'center',gap:0}}>

      {/* ═══════ SECTION 1: Chat Window Preview ═══════ */}
      <div style={{width:'100%',marginBottom:16}}>
        <div style={{fontSize:10,fontWeight:700,color:'var(--text-secondary)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8,opacity:0.6}}>💬 Chat Preview</div>
        <div style={{width:'100%',background:T.chatBg,borderRadius:chatRadius,boxShadow:T.chatShadow,display:'flex',flexDirection:'column',overflow:'hidden',border:T.chatBorder,backdropFilter:T.blur}}>
          {/* Header */}
          <div style={{background:headerBg,color: isDark && t==='neon' ? accent : '#fff',padding:'16px 18px',display:'flex',alignItems:'center',justifyContent:'space-between',borderTopLeftRadius:chatRadius,borderTopRightRadius:chatRadius,backdropFilter:T.headerBlur, borderBottom: t==='neon' ? `1px solid ${accent}33` : 'none'}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:38,height:38,borderRadius:t==='minimal'?8:t==='corporate'?4:'50%',background:'rgba(255,255,255,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:700,backgroundImage:form.botAvatar?`url(${form.botAvatar})`:'none',backgroundSize:'cover',border: t==='neon' ? `2px solid ${accent}80` : '2px solid rgba(255,255,255,0.35)'}}>
                {!form.botAvatar && (form.name ? form.name.charAt(0) : 'A')}
              </div>
              <div>
                <div style={{fontWeight:700,fontSize:14}}>{form.name || 'AI Assistant'}</div>
                <div style={{fontSize:11,opacity:.9,display:'flex',alignItems:'center',gap:5}}><span style={{width:6,height:6,borderRadius:'50%',background: t==='neon'?accent:'#4ade80',boxShadow: t==='neon'?`0 0 8px ${accent}`:'0 0 6px #4ade80'}}></span> Online</div>
              </div>
            </div>
            <div style={{width:28,height:28,borderRadius:t==='minimal'?6:t==='corporate'?4:8,background:'rgba(255,255,255,.15)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
          </div>

          {/* Messages Area */}
          <div style={{padding:'16px 14px',background:chatBg,display:'flex',flexDirection:'column',gap:12,minHeight:160,maxHeight:240,overflowY:'auto'}}>
            {faqs.length > 0 ? (
              <div>
                <div style={{textAlign:'center',marginBottom:16}}>
                  <div style={{fontSize:16,fontWeight:700,color:textColor,marginBottom:3}}>Hello :)</div>
                  <div style={{fontSize:11,opacity:0.6,color:textColor}}>Here's what you can ask me</div>
                </div>
                {faqs.slice(0, 2).map((cat, ci) => (
                  <div key={ci} style={{marginBottom:12}}>
                    <div style={{fontSize:9,fontWeight:700,color:mutedTextColor,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:6,opacity:0.7}}>{cat.category}</div>
                    <div style={{display:'flex',flexDirection:'column',gap:6}}>
                      {cat.questions.slice(0, 2).map((q, qi) => (
                        <div key={qi} style={{background:T.msgBg,padding:'7px 11px',borderRadius:18,fontSize:11,fontWeight:600,color:textColor,display:'flex',alignItems:'center',gap:7,boxShadow: isDark ? `0 0 8px ${accent}1A` : '0 2px 6px rgba(0,0,0,0.04)',border: isDark ? `1px solid ${accent}33` : '1px solid rgba(0,0,0,0.05)'}}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{color: isDark ? accent : P, flexShrink:0}}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                          {q}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Bot message */}
                <div style={{display:'flex',gap:7,alignItems:'flex-end'}}>
                  <div style={{width:24,height:24,borderRadius:t==='minimal'?5:t==='corporate'?2:'50%',background: isDark ? `${accent}26` : `${P}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:isDark?accent:P,border: isDark?`1px solid ${accent}4D`:`1px solid ${P}25`,flexShrink:0}}>
                    {form.name ? form.name.charAt(0) : 'A'}
                  </div>
                  <div style={{maxWidth:'80%',padding:'9px 13px',borderRadius:msgRadius,fontSize:12.5,background:T.msgBg,color:textColor,border: isDark?`1px solid ${accent}33`:t==='glass'?'1px solid rgba(255,255,255,0.3)':'1px solid #e2e8f0',borderBottomLeftRadius:t==='minimal'||t==='corporate'?2:4,boxShadow: isDark?`0 0 8px ${accent}1A`:'0 1px 3px rgba(0,0,0,0.04)',backdropFilter:T.blur}}>
                    {form.welcomeMessage || 'Hi there! 👋 How can I help?'}
                  </div>
                </div>
                {/* User message */}
                <div style={{alignSelf:'flex-end',maxWidth:'80%',padding:'9px 13px',borderRadius:msgRadius,fontSize:12.5,background:T.triggerBg,color:t==='neon'?'#0a0a0f':'#fff',borderBottomRightRadius:t==='minimal'||t==='corporate'?2:4,boxShadow:isDark?`0 0 12px ${accent}33`:'0 2px 8px rgba(0,0,0,0.1)'}}>
                  I have a question!
                </div>
              </>
            )}
          </div>

          {/* Input Footer */}
          <div style={{background:T.chatBg,borderTop: isDark ? `1px solid ${accent}14` : '1px solid rgba(0,0,0,0.06)'}}>
            <div style={{display:'flex',alignItems:'center',gap:7,padding:'10px 14px'}}>
              <div style={{flex:1,border: isDark ? `1px solid ${accent}26` : '1px solid rgba(0,0,0,0.1)',borderRadius:t==='minimal'?6:t==='corporate'?4:12,padding:'8px 12px',fontSize:12.5,color:mutedTextColor,background:T.inputBg}}>Type a message...</div>
              <div style={{width:34,height:34,borderRadius:t==='minimal'?6:t==='corporate'?4:10,background:T.triggerBg,display:'flex',alignItems:'center',justifyContent:'center',color:t==='neon'?'#0a0a0f':'#fff'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </div>
            </div>
            <div style={{textAlign:'center',paddingBottom:6,fontSize:10,color:mutedTextColor}}>
              Powered by <a href="https://inmetech.com" target="_blank" rel="noreferrer" style={{color:isDark ? '#f8fafc' : P,fontWeight:600,textDecoration:'none'}}>InmeTech.com</a>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ SECTION 2: Trigger Button + Social Icons ═══════ */}
      <div style={{width:'100%',display:'flex',justifyContent:'flex-end',alignItems:'center',gap:10,marginBottom:16}}>
        {sl.whatsapp && (
          <div style={{width:38, height:38, borderRadius:'50%', background:'#25D366', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', boxShadow:'0 4px 10px rgba(0,0,0,0.12)'}}>
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12.004 2C6.48 2 2.004 6.48 2.004 12c0 1.88.52 3.63 1.43 5.14l-1.43 5.14 5.31-1.43c1.47.88 3.22 1.43 5.14 1.43 5.52 0 10-4.48 10-10s-4.48-10-10-10zm.003 18.06c-1.63 0-3.14-.42-4.43-1.16l-.32-.19-3.15.85.85-3.15-.19-.32c-.74-1.29-1.16-2.8-1.16-4.43 0-4.63 3.77-8.4 8.4-8.4s8.4 3.77 8.4 8.4-3.77 8.4-8.4 8.4z"/></svg>
          </div>
        )}
        {sl.messenger && (
          <div style={{width:38, height:38, borderRadius:'50%', background:'#0084FF', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', boxShadow:'0 4px 10px rgba(0,0,0,0.12)'}}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.14 2 11.25c0 2.91 1.45 5.49 3.72 7.12V22l3.5-1.92c.88.24 1.81.37 2.78.37 5.52 0 10-4.44 10-9.25S17.52 2 12 2zm1.14 12.33l-2.58-2.75-5.04 2.75 5.54-5.89 2.58 2.75 5.04-2.75-5.54 5.89z"/></svg>
          </div>
        )}
        <div style={{width:52, height:52, borderRadius:T.triggerR, background:T.triggerBg, display:'flex', alignItems:'center', justifyContent:'center', color: t==='neon'?'#0a0a0f':'#fff', boxShadow: isDark?`0 0 24px ${accent}66,0 6px 20px rgba(0,0,0,0.5)`:'0 6px 22px rgba(0,0,0,0.22)'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
      </div>

      {/* ═══════ SECTION 3: Welcome Popup Preview ═══════ */}
      <div style={{width:'100%'}}>
        <div style={{fontSize:10,fontWeight:700,color:'var(--text-secondary)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8,opacity:0.6}}>🔔 Welcome Popup (10s delay + 🔊 + 🔔 Browser Notif)</div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{flex:1,background:popupBg,padding:'9px 28px 9px 10px',borderRadius:t==='corporate'?6:t==='minimal'?8:14,boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.45)' : '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)',display:'flex',alignItems:'center',gap:8,position:'relative'}}>
            <div style={{width:22,height:22,borderRadius:'50%',background:T.triggerBg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={t==='neon'?'#0a0a0f':'white'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div style={{fontSize:11.5,color:isDark?'#d4d4d8':'#374151',fontWeight:500,lineHeight:1.4,flex:1}}>
              {form.welcomeMessage || 'Hi there! 👋 How can I help you today?'}
            </div>
            <div style={{position:'absolute',top:5,right:5,width:14,height:14,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
              <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke={isDark?'rgba(255,255,255,0.3)':'rgba(0,0,0,0.25)'} strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────── MAIN PAGE ──────────────────────────────
export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAgent, setEditingAgent] = useState(null);
  const [showEmbed, setShowEmbed] = useState(null);
  const [apiKey, setApiKey] = useState('');

  const [showTypeSelection, setShowTypeSelection] = useState(false);

  const defaultForm = {
    welcomeMessage: 'Hi there! 👋 How can I help you today?',
    primaryColor: '#7C3AED', secondaryColor: '#EC4899', chatBg: '#f8fafc',
    useGradient: false, widgetTheme: 'bubble', botAvatar: '',
    integrationType: 'both',
    socialLinks: { messenger: '', whatsapp: '', telegram: '' },
    faqs: [],
    languages: [],
    useCustomAi: false,
    agentAiProvider: '',
    agentAiApiKey: '',
    agentAiBaseUrl: '',
  };
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const [saving, setSaving] = useState(false);

  const upd = (key) => (e) => { const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value; setForm({ ...form, [key]: val }); };
  const updSocial = (key) => (e) => { setForm({ ...form, socialLinks: { ...(form.socialLinks || {}), [key]: e.target.value } }); };
  const loadAgents = () => { getAgents().then(d => setAgents(d.agents || [])).catch(() => {}).finally(() => setLoading(false)); };

  useEffect(() => { loadAgents(); getMe().then(d => setApiKey(d.user.apiKey)).catch(() => {}); }, []);

  const handleEdit = (agent) => {
    setForm({
      name: agent.name || '', companyName: agent.companyName || '',
      systemPrompt: agent.systemPrompt || '',
      integrationType: agent.integrationType || 'both',
      websiteUrl: agent.websiteUrl || '', tone: agent.tone || 'friendly',
      webhookUrl: agent.webhookUrl || '', collectLeads: Boolean(agent.collectLeads),
      welcomeMessage: agent.welcomeMessage || 'Hi there! 👋 How can I help you today?',
      primaryColor: agent.primaryColor || '#7C3AED',
      secondaryColor: agent.secondaryColor || '#EC4899',
      chatBg: agent.chatBg || '#f8fafc',
      popupBg: agent.popupBg || '',
      useGradient: Boolean(agent.useGradient), widgetTheme: agent.widgetTheme || 'bubble',
      botAvatar: agent.botAvatar || '',
      socialLinks: agent.socialLinks || { messenger: '', whatsapp: '', telegram: '' },
      faqs: agent.faqs || [],
      languages: agent.languages || [],
      useCustomAi: Boolean(agent.agentAiProvider || agent.agentAiApiKey),
      agentAiProvider: agent.agentAiProvider || '',
      agentAiApiKey: agent.agentAiApiKey || '',
      agentAiBaseUrl: agent.agentAiBaseUrl || '',
    });
    setEditingAgent(agent);
  };

  const openNew = () => { setForm(defaultForm); setShowTypeSelection(true); };

  const handleSelectType = (type) => {
    setForm({ ...defaultForm, integrationType: type });
    setShowTypeSelection(false);
    setEditingAgent('new');
  };

  const handleSave = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      if (editingAgent === 'new') await createAgent(form);
      else await updateAgent(editingAgent.id, form);
      setEditingAgent(null); loadAgents();
    } catch (err) { setError(err.message || 'Error'); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this agent?')) return;
    try { await deleteAgent(id); loadAgents(); } catch (err) { alert(err.message); }
  };

  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const copyText = (text, label) => { navigator.clipboard.writeText(text); setCopied(label); setTimeout(() => setCopied(''), 2000); };

  return (
    <>
      <div className="animate-in">
        <div className="page-header">
          <h1>Agents</h1>
          <button className="btn btn-primary" onClick={openNew}>+ New Agent</button>
        </div>

        {loading ? <p style={{ color: 'var(--text-secondary)' }}>Loading...</p> : agents.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary-light)" strokeWidth="1.5" style={{ margin: '0 auto 16px', opacity: .6 }}><path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>No agents yet</p>
            <button className="btn btn-primary" onClick={openNew}>Create Your First Agent</button>
          </div>
        ) : (
          <div className="card-grid">
            {agents.map(agent => (
              <div className="card" key={agent.id} style={{ cursor: 'pointer', overflow: 'hidden' }} onClick={() => handleEdit(agent)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{agent.name}</h3>
                    <span className={`badge ${agent.isActive ? 'badge-active' : 'badge-inactive'}`}>{agent.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: agent.useGradient && agent.secondaryColor ? `linear-gradient(135deg, ${agent.primaryColor}, ${agent.secondaryColor})` : agent.primaryColor || '#7C3AED', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}></div>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  <span><strong>{agent._count?.conversations || 0}</strong> chats</span>
                  <span><strong>{agent._count?.leads || 0}</strong> leads</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
                  <strong>Theme:</strong> <span style={{ textTransform: 'capitalize' }}>{agent.widgetTheme || 'bubble'}</span> · <strong>Tone:</strong> <span style={{ textTransform: 'capitalize' }}>{agent.tone}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => setShowEmbed(agent)}>Embed</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(agent)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(agent.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── TYPE SELECTION MODAL ─── */}
      {showTypeSelection && (
        <div className="modal-overlay" onClick={() => setShowTypeSelection(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <h2 style={{ marginBottom: 8 }}>Choose Integration Type</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>Where will you use this agent?</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button className="btn btn-secondary" style={{ padding: '16px', textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }} onClick={() => handleSelectType('plugin')}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>WordPress Plugin</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 400 }}>I will install and use the InmeTech plugin on my site.</div>
              </button>
              
              <button className="btn btn-secondary" style={{ padding: '16px', textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }} onClick={() => handleSelectType('custom')}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Custom Code</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 400 }}>I will embed the JS code manually.</div>
              </button>

              <button className="btn btn-secondary" style={{ padding: '16px', textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }} onClick={() => handleSelectType('both')}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Both / Not Sure</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 400 }}>I might use both methods.</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── EDIT/CREATE MODAL ─── */}
      {editingAgent && (
        <div className="modal-overlay" onClick={() => setEditingAgent(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ display: 'flex', padding: 0, overflow: 'hidden', maxWidth: 1060, maxHeight: '90vh' }}>

            {/* LEFT: FORM */}
            <div style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', borderRight: '1px solid var(--border)' }}>
              <h2 style={{ marginBottom: 20 }}>{editingAgent === 'new' ? '✨ Create New Agent' : '✏️ Edit Agent'}</h2>
              {error && <div className="alert alert-error">{error}</div>}

              <form onSubmit={handleSave}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Agent Name *</label>
                    <input className="form-input" placeholder="e.g. Sales Assistant" value={form.name} onChange={upd('name')} required />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Company Name *</label>
                    <input className="form-input" placeholder="e.g. InmeTech" value={form.companyName} onChange={upd('companyName')} required />
                  </div>
                </div>

                <div className="form-group">
                  <label>System Prompt * <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>(Instructions for AI)</span></label>
                  <textarea className="form-input" style={{ minHeight: 120 }} placeholder="Define how the AI should behave..." value={form.systemPrompt} onChange={upd('systemPrompt')} required />
                </div>

                {form.integrationType === 'both' && (
                  <div className="alert alert-warning" style={{ marginBottom: 16 }}>
                    Note: If you use this in the WordPress plugin, the visual design and message setup should be done from the plugin setup inside your WP Admin.
                  </div>
                )}

                {form.integrationType === 'plugin' && (
                  <div className="alert alert-warning" style={{ marginBottom: 16 }}>
                    Since you selected WordPress Plugin, visual design and message setup are managed directly inside your WP plugin settings.
                  </div>
                )}

                {form.integrationType !== 'plugin' && (
                  <>
                <div className="form-group">
                  <label>Welcome Message</label>
                  <input className="form-input" value={form.welcomeMessage} onChange={upd('welcomeMessage')} />
                </div>

                {/* ─── WIDGET THEME ─── */}
                <div className="form-group">
                  <label>Widget Theme</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 8 }}>
                    {THEMES.slice(0, 4).map(th => (
                      <button type="button" key={th.id} onClick={() => setForm({ ...form, widgetTheme: th.id })}
                        style={{
                          padding: '10px 8px', borderRadius: 12, cursor: 'pointer', textAlign: 'center',
                          background: form.widgetTheme === th.id ? 'rgba(124,58,237,0.12)' : 'var(--bg-input)',
                          border: form.widgetTheme === th.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                          color: form.widgetTheme === th.id ? 'var(--primary-light)' : 'var(--text-secondary)',
                          transition: 'all .2s',
                        }}>
                        <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 1 }}>{th.label}</div>
                        <div style={{ fontSize: 9, opacity: .8 }}>{th.desc}</div>
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    {THEMES.slice(4).map(th => (
                      <button type="button" key={th.id} onClick={() => setForm({ ...form, widgetTheme: th.id })}
                        style={{
                          padding: '10px 8px', borderRadius: 12, cursor: 'pointer', textAlign: 'center',
                          background: form.widgetTheme === th.id ? 'rgba(124,58,237,0.12)' : 'var(--bg-input)',
                          border: form.widgetTheme === th.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                          color: form.widgetTheme === th.id ? 'var(--primary-light)' : 'var(--text-secondary)',
                          transition: 'all .2s',
                        }}>
                        <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 1 }}>{th.label}</div>
                        <div style={{ fontSize: 9, opacity: .8 }}>{th.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ─── COLOR CONTROLS ─── */}
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Brand Color</span>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: form.useGradient ? 'var(--primary-light)' : 'var(--text-secondary)' }}>
                      <input type="checkbox" checked={form.useGradient} onChange={upd('useGradient')} style={{ width: 16, height: 16, accentColor: 'var(--primary)' }} />
                      Use Gradient
                    </label>
                  </label>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <input type="color" value={form.primaryColor} onChange={upd('primaryColor')} style={{ width: 44, height: 44, padding: 0, border: 'none', borderRadius: 10, cursor: 'pointer', background: 'transparent' }} />
                    <input className="form-input" style={{ flex: 1 }} value={form.primaryColor} onChange={upd('primaryColor')} placeholder="#7C3AED" />
                    {form.useGradient && (
                      <>
                        <input type="color" value={form.secondaryColor || '#EC4899'} onChange={upd('secondaryColor')} style={{ width: 44, height: 44, padding: 0, border: 'none', borderRadius: 10, cursor: 'pointer', background: 'transparent' }} />
                        <input className="form-input" style={{ flex: 1 }} value={form.secondaryColor || ''} onChange={upd('secondaryColor')} placeholder="#EC4899" />
                      </>
                    )}
                  </div>
                  {/* Color Preview Bar */}
                  <div style={{ marginTop: 8, height: 6, borderRadius: 3, background: colorBg(form) }}></div>
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Chat Area Background Color</span>
                    <button 
                      type="button"
                      onClick={() => {
                        const bg = colorBg(form);
                        setForm({ ...form, chatBg: bg });
                      }}
                      className="text-[10px] font-black uppercase text-violet-500 hover:text-violet-400 tracking-widest pl-1"
                    >
                      ✨ Use Brand Color
                    </button>
                  </label>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <input type="color" value={form.chatBg?.startsWith('linear') ? '#ffffff' : (form.chatBg || '#f8fafc')} onChange={upd('chatBg')} style={{ width: 44, height: 44, padding: 0, border: 'none', borderRadius: 10, cursor: 'pointer', background: 'transparent' }} />
                    <input className="form-input" style={{ flex: 1 }} value={form.chatBg || ''} onChange={upd('chatBg')} placeholder="#f8fafc" />
                  </div>
                  <div style={{ marginTop: 8, height: 6, borderRadius: 3, background: form.chatBg }}></div>
                </div>

                <div className="form-group">
                  <label>Popup Background Color</label>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <input type="color" value={form.popupBg || '#ffffff'} onChange={upd('popupBg')} style={{ width: 44, height: 44, padding: 0, border: 'none', borderRadius: 10, cursor: 'pointer', background: 'transparent' }} />
                    <input className="form-input" style={{ flex: 1 }} value={form.popupBg || ''} onChange={upd('popupBg')} placeholder="#ffffff" />
                  </div>
                  <div style={{ marginTop: 8, height: 6, borderRadius: 3, background: form.popupBg || '#ffffff' }}></div>
                </div>

                <div className="form-group">
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                    <label style={{margin:0}}>FAQ / Starter Questions</label>
                    <button type="button" onClick={() => setForm({...form, faqs: [...(form.faqs||[]), {category:'', questions:['']}]})} style={{fontSize:12,padding:'4px 10px',background:form.primaryColor+'15',color:form.primaryColor,border:'none',borderRadius:6,fontWeight:600,cursor:'pointer'}}>+ Add Category</button>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:16}}>
                    {(form.faqs || []).map((cat, ci) => (
                      <div key={ci} style={{background:'#f8fafc',padding:12,borderRadius:12,border:'1px solid #e2e8f0'}}>
                        <div style={{display:'flex',gap:8,marginBottom:12}}>
                          <input className="form-input" style={{flex:1,fontWeight:700,fontSize:12}} value={cat.category} placeholder="Category Name (e.g. SHOPPING)" onChange={(e)=>{
                            const n = [...form.faqs]; n[ci].category = e.target.value.toUpperCase(); setForm({...form, faqs:n});
                          }} />
                          <button type="button" onClick={()=>{
                            const n = [...form.faqs]; n.splice(ci,1); setForm({...form, faqs:n});
                          }} style={{padding:'4px 8px',background:'#fee2e2',color:'#ef4444',border:'none',borderRadius:6,cursor:'pointer'}}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          </button>
                        </div>
                        <div style={{display:'flex',flexDirection:'column',gap:8}}>
                          {cat.questions.map((q, qi) => (
                            <div key={qi} style={{display:'flex',gap:8}}>
                              <input className="form-input" style={{flex:1,fontSize:12}} value={q} placeholder="Question..." onChange={(e)=>{
                                const n = [...form.faqs]; n[ci].questions[qi] = e.target.value; setForm({...form, faqs:n});
                              }} />
                              <button type="button" onClick={()=>{
                                const n = [...form.faqs]; n[ci].questions.splice(qi,1); setForm({...form, faqs:n});
                              }} style={{padding:8,opacity:0.5,border:'none',background:'transparent',cursor:'pointer'}}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                              </button>
                            </div>
                          ))}
                          <button type="button" onClick={()=>{
                            const n = [...form.faqs]; n[ci].questions.push(''); setForm({...form, faqs:n});
                          }} style={{alignSelf:'flex-start',fontSize:11,fontWeight:600,color:form.primaryColor,background:'none',border:'none',padding:'4px 0',cursor:'pointer'}}>+ Add Question</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Bot Avatar URL</label>
                    <input className="form-input" placeholder="https://..." value={form.botAvatar} onChange={upd('botAvatar')} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Tone</label>
                    <select className="form-input" value={form.tone} onChange={upd('tone')}>
                      <option value="friendly">Friendly</option>
                      <option value="sales">Sales-focused</option>
                      <option value="support">Customer Support</option>
                      <option value="professional">Professional</option>
                    </select>
                  </div>
                </div>
                  </>
                )}

                {/* ─── LANGUAGE SELECTION ─── */}
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Response Languages <span style={{ fontWeight: 400, color: 'var(--text-secondary)', fontSize: 12 }}>(max 2)</span></span>
                  </label>
                  {/* Selected chips */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                    {(form.languages || []).map(code => {
                      const lang = LANGUAGES.find(l => l.code === code);
                      return lang ? (
                        <span key={code} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, background: 'rgba(124,58,237,0.12)', color: 'var(--primary-light)', fontSize: 12, fontWeight: 600, border: '1px solid rgba(124,58,237,0.25)' }}>
                          {lang.native} ({lang.name})
                          <button type="button" onClick={() => setForm({ ...form, languages: form.languages.filter(l => l !== code) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
                        </span>
                      ) : null;
                    })}
                  </div>
                  {/* Selector */}
                  {(form.languages || []).length < 2 && (
                    <select
                      className="form-input"
                      value=""
                      onChange={e => {
                        if (e.target.value && !(form.languages || []).includes(e.target.value)) {
                          setForm({ ...form, languages: [...(form.languages || []), e.target.value] });
                        }
                      }}
                    >
                      <option value="">+ Add a language...</option>
                      {LANGUAGES.filter(l => !(form.languages || []).includes(l.code)).map(l => (
                        <option key={l.code} value={l.code}>{l.native} — {l.name}</option>
                      ))}
                    </select>
                  )}
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6, opacity: 0.7 }}>
                    Your agent will only respond in the selected language(s). If empty, it follows user's language.
                  </p>
                </div>

                {/* ─── ADVANCED AI OVERRIDE ─── */}
                <div style={{ marginTop: 8, marginBottom: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', background: 'var(--bg-input)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <input type="checkbox" checked={form.useCustomAi || false} onChange={e => setForm({ ...form, useCustomAi: e.target.checked })} style={{ width: 18, height: 18, accentColor: 'var(--primary)' }} />
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 600, display: 'block' }}>Use custom AI for this agent</span>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Override your default AI settings for this specific agent</span>
                    </div>
                  </label>

                  {form.useCustomAi && (
                    <div style={{ marginTop: 16, padding: 16, background: 'rgba(124,58,237,0.04)', borderRadius: 14, border: '1px solid rgba(124,58,237,0.15)' }}>
                      <div className="form-group" style={{ marginBottom: 12 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>AI Provider</label>
                        <select className="form-input" value={form.agentAiProvider || ''} onChange={e => setForm({ ...form, agentAiProvider: e.target.value })}>
                          <option value="">Use default (from Settings)</option>
                          <option value="openai">OpenAI</option>
                          <option value="gemini">Google Gemini</option>
                          <option value="groq">Groq</option>
                          <option value="custom">Custom API</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ marginBottom: 12 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>API Key</label>
                        <input className="form-input" type="password" value={form.agentAiApiKey || ''} onChange={e => setForm({ ...form, agentAiApiKey: e.target.value })} placeholder="Leave empty to use your default key" />
                      </div>
                      {form.agentAiProvider === 'custom' && (
                        <div className="form-group">
                          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Custom Base URL</label>
                          <input className="form-input" value={form.agentAiBaseUrl || ''} onChange={e => setForm({ ...form, agentAiBaseUrl: e.target.value })} placeholder="https://your-api.com/v1" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="form-group"><label>Website URL</label><input className="form-input" placeholder="https://..." value={form.websiteUrl} onChange={upd('websiteUrl')} /></div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Social Media Links (Connect directly to platforms)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group">
                      <label style={{ fontSize: 12 }}>WhatsApp Number</label>
                      <input className="form-input" placeholder="e.g. 88017..." value={form.socialLinks?.whatsapp || ''} onChange={updSocial('whatsapp')} />
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: 12 }}>Messenger Username</label>
                      <input className="form-input" placeholder="e.g. inmetech" value={form.socialLinks?.messenger || ''} onChange={updSocial('messenger')} />
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: 12 }}>Telegram Username</label>
                      <input className="form-input" placeholder="e.g. inme_tech" value={form.socialLinks?.telegram || ''} onChange={updSocial('telegram')} />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', background: 'var(--bg-input)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <input type="checkbox" checked={form.collectLeads} onChange={upd('collectLeads')} style={{ width: 18, height: 18, accentColor: 'var(--primary)' }} />
                    <span style={{ fontSize: 14, fontWeight: 500 }}>Collect leads automatically</span>
                  </label>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setEditingAgent(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Agent'}</button>
                </div>
              </form>
            </div>

            {/* RIGHT: LIVE PREVIEW */}
            {form.integrationType !== 'plugin' ? (
              <div style={{ width: 400, background: '#f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '48px 24px 24px', overflowY: 'auto' }}>
                <div style={{ position: 'absolute', top: 16, left: 0, right: 0, textAlign: 'center', color: '#64748b', fontWeight: 600, fontSize: 12, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Live Preview</div>
                <WidgetPreview form={form} />
              </div>
            ) : (
              <div style={{ width: 400, background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary-light)" strokeWidth="1.5" style={{ opacity: .6, marginBottom: 16 }}><path d="M4 14l2 2 4-4M16 8l4 4-4 4M21 21H3V3h18v18z" /></svg>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Preview Disabled</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>Live preview is disabled for the WordPress Plugin integration type. Please configure and preview the widget directly within your WordPress site.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── EMBED MODAL ─── */}
      {showEmbed && (
        <div className="modal-overlay" onClick={() => setShowEmbed(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 620 }}>
            <h2>Connect &quot;{showEmbed.name}&quot;</h2>

            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>JavaScript Widget</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 10 }}>Paste before <code style={{ background: 'var(--bg-input)', padding: '2px 6px', borderRadius: 4 }}>&lt;/body&gt;</code></p>
              <div className="code-block">
                <button className="copy-btn" onClick={() => copyText(`<script src="${appUrl}/widget.js" data-agent-id="${showEmbed.id}" data-api-key="${apiKey}"></script>`, 'widget')}>{copied === 'widget' ? 'Copied!' : 'Copy'}</button>
{`<script
  src="${appUrl}/widget.js"
  data-agent-id="${showEmbed.id}"
  data-api-key="${apiKey}"
></script>`}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>WordPress Plugin</h3>
              <div className="code-block">
                <button className="copy-btn" onClick={() => copyText(`${appUrl}/api\n${showEmbed.id}\n${apiKey}`, 'wp')}>{copied === 'wp' ? 'Copied!' : 'Copy'}</button>
{`API Base URL:  ${appUrl}/api
Agent ID:      ${showEmbed.id}
API Key:       ${apiKey}`}
              </div>
            </div>

            <div className="modal-actions"><button className="btn btn-primary btn-block" onClick={() => setShowEmbed(null)}>Close</button></div>
          </div>
        </div>
      )}
    </>
  );
}
