'use client';
import { useEffect, useState } from 'react';
import { getAgents, createAgent, updateAgent, deleteAgent, getMe } from '@/lib/api';

const THEMES = [
  { id: 'bubble', label: 'Bubble', desc: 'Rounded, soft, modern bubble style' },
  { id: 'glass', label: 'Glass', desc: 'Glassmorphism with frosted panels' },
  { id: 'minimal', label: 'Minimal', desc: 'Clean, sharp, professional edges' },
];

function colorBg(form) {
  if (form.useGradient && form.secondaryColor) {
    return `linear-gradient(135deg, ${form.primaryColor}, ${form.secondaryColor})`;
  }
  return form.primaryColor;
}

// ────────────────────────────── LIVE PREVIEW ──────────────────────────────
function WidgetPreview({ form }) {
  const bg = colorBg(form);
  const t = form.widgetTheme || 'bubble';
  const radius = t === 'minimal' ? 8 : t === 'glass' ? 20 : 28;
  const chatRadius = t === 'minimal' ? 4 : t === 'glass' ? 12 : 20;
  const msgRadius = t === 'minimal' ? 8 : t === 'glass' ? 14 : 20;
  const headerBg = t === 'glass'
    ? `linear-gradient(135deg, ${form.primaryColor}cc, ${form.useGradient && form.secondaryColor ? form.secondaryColor + 'cc' : form.primaryColor + '99'})`
    : bg;
  const chatBg = t === 'glass' ? 'rgba(248,250,252,0.85)' : '#f8fafc';
  const cardShadow = t === 'glass' ? '0 20px 60px rgba(0,0,0,0.15)' : '0 20px 40px rgba(0,0,0,0.12)';
  const cardBorder = t === 'glass' ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.06)';
  const backdropFilter = t === 'glass' ? 'blur(16px)' : 'none';

  return (
    <div style={{width:'100%',maxWidth:350,display:'flex',flexDirection:'column',alignItems:'center',gap:16}}>
      {/* Chat Window */}
      <div style={{width:'100%',background:'#fff',borderRadius:chatRadius,boxShadow:cardShadow,display:'flex',flexDirection:'column',overflow:'hidden',border:cardBorder,backdropFilter}}>
        {/* Header */}
        <div style={{background:headerBg,color:'#fff',padding:'18px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',borderTopLeftRadius:chatRadius,borderTopRightRadius:chatRadius,backdropFilter:t==='glass'?'blur(12px)':'none'}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:42,height:42,borderRadius:t==='minimal'?8:'50%',background:'rgba(255,255,255,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:700,backgroundImage:form.botAvatar?`url(${form.botAvatar})`:'none',backgroundSize:'cover',border:'2px solid rgba(255,255,255,0.35)'}}>
              {!form.botAvatar && (form.name ? form.name.charAt(0) : 'A')}
            </div>
            <div>
              <div style={{fontWeight:700,fontSize:15}}>{form.name || 'AI Assistant'}</div>
              <div style={{fontSize:12,opacity:.9,display:'flex',alignItems:'center',gap:5}}><span style={{width:7,height:7,borderRadius:'50%',background:'#4ade80',boxShadow:'0 0 6px #4ade80'}}></span> Online</div>
            </div>
          </div>
          <div style={{width:30,height:30,borderRadius:t==='minimal'?6:8,background:'rgba(255,255,255,.15)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
        </div>

        {/* Messages */}
        <div style={{padding:'20px 16px',background:chatBg,display:'flex',flexDirection:'column',gap:14,minHeight:200}}>
          {/* Bot */}
          <div style={{display:'flex',gap:8,alignItems:'flex-end'}}>
            <div style={{width:26,height:26,borderRadius:t==='minimal'?6:'50%',background:`${form.primaryColor}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:form.primaryColor,border:`1px solid ${form.primaryColor}25`,flexShrink:0}}>
              {form.name ? form.name.charAt(0) : 'A'}
            </div>
            <div style={{maxWidth:'80%',padding:'10px 14px',borderRadius:msgRadius,fontSize:13.5,background:t==='glass'?'rgba(255,255,255,0.7)':'#fff',color:'#1e293b',border:t==='glass'?'1px solid rgba(255,255,255,0.3)':'1px solid #e2e8f0',borderBottomLeftRadius:t==='minimal'?2:4,boxShadow:'0 1px 4px rgba(0,0,0,0.04)',backdropFilter:t==='glass'?'blur(8px)':'none'}}>
              {form.welcomeMessage || 'Hi there! 👋 How can I help?'}
            </div>
          </div>
          {/* User */}
          <div style={{alignSelf:'flex-end',maxWidth:'80%',padding:'10px 14px',borderRadius:msgRadius,fontSize:13.5,background:bg,color:'#fff',borderBottomRightRadius:t==='minimal'?2:4,boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}>
            I have a question!
          </div>
        </div>

        {/* Input */}
        <div style={{display:'flex',alignItems:'center',gap:8,padding:'14px 16px',borderTop:'1px solid #e2e8f0',background:'#fff'}}>
          <div style={{flex:1,border:'1px solid #cbd5e1',borderRadius:t==='minimal'?6:14,padding:'9px 14px',fontSize:13.5,color:'#94a3b8',background:'#f8fafc'}}>Type a message...</div>
          <div style={{width:38,height:38,borderRadius:t==='minimal'?6:12,background:bg,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff'}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </div>
        </div>
      </div>

      {/* Trigger */}
      <div style={{alignSelf:'flex-end',width:56,height:56,borderRadius:t==='minimal'?14:'50%',background:bg,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',boxShadow:'0 6px 20px rgba(0,0,0,0.2)'}}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
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
    name: '', companyName: '', systemPrompt: '', websiteUrl: '', tone: 'friendly',
    webhookUrl: '', collectLeads: false,
    welcomeMessage: 'Hi there! 👋 How can I help you today?',
    primaryColor: '#7C3AED', secondaryColor: '#EC4899',
    useGradient: false, widgetTheme: 'bubble', botAvatar: '',
    integrationType: 'both'
  };
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const [saving, setSaving] = useState(false);

  const upd = (key) => (e) => { const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value; setForm({ ...form, [key]: val }); };
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
      useGradient: Boolean(agent.useGradient), widgetTheme: agent.widgetTheme || 'bubble',
      botAvatar: agent.botAvatar || ''
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
                  <div style={{ display: 'flex', gap: 10 }}>
                    {THEMES.map(th => (
                      <button type="button" key={th.id} onClick={() => setForm({ ...form, widgetTheme: th.id })}
                        style={{
                          flex: 1, padding: '14px 12px', borderRadius: 12, cursor: 'pointer', textAlign: 'center',
                          background: form.widgetTheme === th.id ? 'rgba(124,58,237,0.12)' : 'var(--bg-input)',
                          border: form.widgetTheme === th.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                          color: form.widgetTheme === th.id ? 'var(--primary-light)' : 'var(--text-secondary)',
                          transition: 'all .2s'
                        }}>
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{th.label}</div>
                        <div style={{ fontSize: 11, opacity: .8 }}>{th.desc}</div>
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

                <div className="form-group"><label>Website URL</label><input className="form-input" placeholder="https://..." value={form.websiteUrl} onChange={upd('websiteUrl')} /></div>
                <div className="form-group"><label>Webhook URL</label><input className="form-input" placeholder="https://hooks...." value={form.webhookUrl} onChange={upd('webhookUrl')} /></div>

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
