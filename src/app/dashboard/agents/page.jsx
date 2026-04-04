'use client';
import { useEffect, useState } from 'react';
import { getAgents, createAgent, updateAgent, deleteAgent, getMe } from '@/lib/api';

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states: 'new', null, or agent object
  const [editingAgent, setEditingAgent] = useState(null);
  
  const [showEmbed, setShowEmbed] = useState(null);
  const [apiKey, setApiKey] = useState('');
  
  const defaultForm = { 
    name: '', systemPrompt: '', websiteUrl: '', tone: 'friendly', 
    webhookUrl: '', collectLeads: false, welcomeMessage: 'Hi there! 👋 How can I help you today?',
    primaryColor: '#6C5CE7', botAvatar: '' 
  };
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (key) => (e) => { const val = e.target.type==='checkbox' ? e.target.checked : e.target.value; setForm({...form,[key]:val}); };
  const loadAgents = () => { getAgents().then(d => setAgents(d.agents||[])).catch(()=>{}).finally(()=>setLoading(false)); };

  useEffect(() => { loadAgents(); getMe().then(d => setApiKey(d.user.apiKey)).catch(()=>{}); }, []);

  const handleEdit = (agent) => {
    setForm({
      name: agent.name || '',
      systemPrompt: agent.systemPrompt || '',
      websiteUrl: agent.websiteUrl || '',
      tone: agent.tone || 'friendly',
      webhookUrl: agent.webhookUrl || '',
      collectLeads: Boolean(agent.collectLeads),
      welcomeMessage: agent.welcomeMessage || 'Hi there! 👋 How can I help you today?',
      primaryColor: agent.primaryColor || '#6C5CE7',
      botAvatar: agent.botAvatar || ''
    });
    setEditingAgent(agent);
  };

  const openNew = () => {
    setForm(defaultForm);
    setEditingAgent('new');
  };

  const handleSave = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      if (editingAgent === 'new') {
        await createAgent(form);
      } else {
        await updateAgent(editingAgent.id, form);
      }
      setEditingAgent(null);
      loadAgents();
    } catch(err) {
      console.error('Agent save failed:', err);
      setError(err.message || 'Unknown error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => { if(!confirm('Delete this agent? All conversations and leads will be permanently deleted.')) return; try { await deleteAgent(id); loadAgents(); } catch(err) { alert(err.message); } };

  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const copyText = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <>
      <div className="animate-in">
        <div className="page-header">
          <h1>Agents</h1>
          <button className="btn btn-primary" onClick={openNew}>+ New Agent</button>
        </div>

      {loading ? <p style={{color:'var(--text-secondary)'}}>Loading...</p> : agents.length===0 ? (
        <div className="card" style={{textAlign:'center',padding:60}}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary-light)" strokeWidth="1.5" style={{margin:'0 auto 16px',opacity:.6}}><path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          <p style={{color:'var(--text-secondary)',marginBottom:16,fontSize:15}}>No agents created yet</p>
          <p style={{color:'var(--text-secondary)',marginBottom:20,fontSize:13}}>Create your first AI agent to start handling customer conversations.</p>
          <button className="btn btn-primary" onClick={openNew}>Create Your First Agent</button>
        </div>
      ) : (
        <div className="card-grid">
          {agents.map(agent => (
            <div className="card" key={agent.id} style={{position:'relative',cursor:'pointer',overflow:'hidden'}} onClick={()=>handleEdit(agent)}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',marginBottom:14}}>
                <div>
                  <h3 style={{fontSize:18,fontWeight:700,marginBottom:6,letterSpacing:'-0.5px'}}>{agent.name}</h3>
                  <span className={`badge ${agent.isActive?'badge-active':'badge-inactive'}`}>{agent.isActive?'Active':'Inactive'}</span>
                </div>
                <div style={{width:16,height:16,borderRadius:'50%',background:agent.primaryColor||'#6C5CE7',boxShadow:'0 2px 8px rgba(0,0,0,0.2)'}} title="Theme Color"></div>
              </div>
              <div style={{display:'flex',gap:20,fontSize:13,color:'var(--text-secondary)',marginBottom:14}}>
                <span><strong>{agent._count?.conversations||0}</strong> chats</span>
                <span><strong>{agent._count?.leads||0}</strong> leads</span>
              </div>
              <div style={{fontSize:13,color:'var(--text-secondary)',marginBottom:20,lineHeight:1.5}}>
                <strong>Tone:</strong> <span style={{textTransform:'capitalize'}}>{agent.tone}</span><br />
                <strong>Model:</strong> {agent.model}
              </div>
              <div style={{display:'flex',gap:10}} onClick={e=>e.stopPropagation()}>
                <button className="btn btn-secondary btn-sm" style={{flex:1}} onClick={()=>setShowEmbed(agent)}>Embed</button>
                <button className="btn btn-secondary btn-sm" onClick={()=>handleEdit(agent)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(agent.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
      
    {/* Edit/Create Modal */}
    {editingAgent && (
      <div className="modal-overlay" onClick={()=>setEditingAgent(null)}>
          <div className="modal modal-lg" onClick={e=>e.stopPropagation()} style={{display:'flex',padding:0,overflow:'hidden'}}>
            
            {/* LEFT: FORM */}
            <div style={{flex:1,padding:32,maxHeight:'85vh',overflowY:'auto',borderRight:'1px solid var(--border)'}}>
              <h2>{editingAgent === 'new' ? 'Create New Agent' : 'Edit Agent'}</h2>
              {error && <div className="alert alert-error">{error}</div>}
              
              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label>Agent Name *</label>
                  <input className="form-input" placeholder="e.g. Sales Assistant" value={form.name} onChange={update('name')} required />
                </div>
                
                <div className="form-group">
                  <label>System Prompt * (Instructions for AI)</label>
                  <textarea className="form-input" style={{minHeight:140}} placeholder="Define exactly how your AI agent should behave. Example: You are a helpful sales assistant..." value={form.systemPrompt} onChange={update('systemPrompt')} required />
                </div>

                <div className="form-group">
                  <label>Welcome Message</label>
                  <input className="form-input" value={form.welcomeMessage} onChange={update('welcomeMessage')} />
                </div>

                <div style={{display:'flex',gap:16}}>
                  <div className="form-group" style={{flex:1}}>
                    <label>Brand Primary Color</label>
                    <div style={{display:'flex',gap:10,alignItems:'center'}}>
                      <input type="color" value={form.primaryColor} onChange={update('primaryColor')} style={{width:40,height:40,padding:0,border:'none',borderRadius:8,cursor:'pointer',background:'transparent'}} />
                      <input className="form-input" value={form.primaryColor} onChange={update('primaryColor')} placeholder="#6C5CE7" />
                    </div>
                  </div>
                  <div className="form-group" style={{flex:1}}>
                    <label>Bot Avatar URL</label>
                    <input className="form-input" placeholder="https://..." value={form.botAvatar} onChange={update('botAvatar')} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Tone</label>
                  <select className="form-input" value={form.tone} onChange={update('tone')}>
                    <option value="friendly">Friendly</option>
                    <option value="sales">Sales-focused</option>
                    <option value="support">Customer Support</option>
                    <option value="professional">Professional</option>
                  </select>
                </div>

                <div className="form-group"><label>Website URL (optional)</label><input className="form-input" placeholder="https://yourwebsite.com" value={form.websiteUrl} onChange={update('websiteUrl')} /></div>
                <div className="form-group"><label>Webhook URL (optional)</label><input className="form-input" placeholder="https://hooks.yourapp.com/..." value={form.webhookUrl} onChange={update('webhookUrl')} /></div>
                
                <div className="form-group" style={{marginTop:8}}>
                  <label style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',background:'var(--bg-input)',padding:'12px 16px',borderRadius:12,border:'1px solid var(--border)'}}>
                    <input type="checkbox" checked={form.collectLeads} onChange={update('collectLeads')} style={{width:18,height:18,accentColor:'var(--primary)'}} /> 
                    <span style={{fontSize:14,fontWeight:500,color:'var(--text)'}}>Automatically collect leads (Name & Contact)</span>
                  </label>
                </div>

                <div className="modal-actions" style={{position:'sticky',bottom:-32,background:'var(--bg-card)',paddingBottom:32,zIndex:10}}>
                  <button type="button" className="btn btn-secondary" onClick={()=>setEditingAgent(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Agent'}</button>
                </div>
              </form>
            </div>

            {/* RIGHT: LIVE PREVIEW */}
            <div style={{width:400,background:'#e2e8f0',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-end',position:'relative',overflow:'hidden',padding:24}}>
              <div style={{position:'absolute',top:24,left:0,right:0,textAlign:'center',color:'#64748b',fontWeight:600,fontSize:13,letterSpacing:1,textTransform:'uppercase'}}>Live Widget Preview</div>
              
              {/* Simulated Widget Window */}
              <div style={{width:340,background:'#ffffff',borderRadius:20,boxShadow:'0 20px 40px rgba(0,0,0,0.1)',display:'flex',flexDirection:'column',overflow:'hidden',marginBottom:16,border:'1px solid rgba(0,0,0,0.05)'}}>
                
                {/* Header */}
                <div style={{background:`linear-gradient(135deg, ${form.primaryColor}, #9b59b6)`,color:'#fff',padding:'20px 24px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <div style={{width:42,height:42,borderRadius:'50%',background:'rgba(255,255,255,.25)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:700,backgroundImage:form.botAvatar?`url(${form.botAvatar})`:'none',backgroundSize:'cover',border:'2px solid rgba(255,255,255,0.4)',boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}}>
                      {!form.botAvatar && (form.name ? form.name.charAt(0) : 'A')}
                    </div>
                    <div>
                      <div style={{fontWeight:700,fontSize:15,letterSpacing:'-0.3px'}}>{form.name || 'AI Assistant'}</div>
                      <div style={{fontSize:12,opacity:.9,display:'flex',alignItems:'center',gap:6,fontWeight:500}}><span style={{width:8,height:8,borderRadius:'50%',background:'#55efc4',boxShadow:'0 0 6px #55efc4'}}></span> Online</div>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div style={{padding:'24px 20px',background:'#f8fafc',display:'flex',flexDirection:'column',gap:16,minHeight:240}}>
                  {/* Bot Welcome Message */}
                  <div style={{display:'flex',gap:10,alignItems:'flex-end'}}>
                    <div style={{width:28,height:28,borderRadius:'50%',background:`${form.primaryColor}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:form.primaryColor,border:`1px solid ${form.primaryColor}30`,backgroundImage:form.botAvatar?`url(${form.botAvatar})`:'none',backgroundSize:'cover'}}>
                       {!form.botAvatar && (form.name ? form.name.charAt(0) : 'A')}
                    </div>
                    <div style={{maxWidth:'85%',padding:'12px 16px',borderRadius:16,fontSize:14,background:'#fff',color:'#0f172a',border:'1px solid #e2e8f0',borderBottomLeftRadius:4,boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
                      {form.welcomeMessage || 'Hi there! 👋 How can I help you today?'}
                    </div>
                  </div>
                  
                  {/* User Mock Message */}
                  <div style={{display:'flex',gap:10,alignItems:'flex-end',alignSelf:'flex-end'}}>
                    <div style={{maxWidth:'85%',padding:'12px 16px',borderRadius:16,fontSize:14,background:`linear-gradient(135deg, ${form.primaryColor}, #9b59b6)`,color:'#fff',borderBottomRightRadius:4,boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
                      I have a question about this.
                    </div>
                  </div>
                </div>

                {/* Input Area */}
                <div style={{display:'flex',alignItems:'center',gap:10,padding:'16px 20px',borderTop:'1px solid #e2e8f0',background:'#fff'}}>
                  <div style={{flex:1,border:'1px solid #cbd5e1',borderRadius:16,padding:'10px 16px',fontSize:14,color:'#94a3b8',background:'#f8fafc'}}>Type a message...</div>
                  <div style={{width:40,height:40,borderRadius:12,background:`linear-gradient(135deg, ${form.primaryColor}, #9b59b6)`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',boxShadow:`0 4px 12px ${form.primaryColor}40`}}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  </div>
                </div>
              </div>
              
              {/* Trigger Button Mock */}
              <div style={{alignSelf:'flex-end',width:60,height:60,borderRadius:'50%',background:`linear-gradient(135deg, ${form.primaryColor}, #9b59b6)`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',boxShadow:`0 8px 24px rgba(0,0,0,0.2)`}}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Embed Code Modal */}
      {showEmbed && (
        <div className="modal-overlay" onClick={()=>setShowEmbed(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()} style={{maxWidth:620}}>
            <h2>Connect &quot;{showEmbed.name}&quot; to Your Website</h2>

            <div style={{marginBottom:24}}>
              <h3 style={{fontSize:15,fontWeight:600,marginBottom:8,color:'var(--text)'}}>Option 1: JavaScript Widget</h3>
              <p style={{color:'var(--text-secondary)',fontSize:13,marginBottom:10}}>Paste this code before the closing <code style={{background:'var(--bg-input)',padding:'2px 6px',borderRadius:4}}>&lt;/body&gt;</code> tag.</p>
              <div className="code-block">
                <button className="copy-btn" onClick={()=>copyText(`<script src="${appUrl}/widget.js" data-agent-id="${showEmbed.id}" data-api-key="${apiKey}"></script>`, 'widget')}>{copied==='widget'?'Copied!':'Copy'}</button>
{`<script
  src="${appUrl}/widget.js"
  data-agent-id="${showEmbed.id}"
  data-api-key="${apiKey}"
></script>`}
              </div>
            </div>

            <div style={{marginBottom:24}}>
              <h3 style={{fontSize:15,fontWeight:600,marginBottom:8,color:'var(--text)'}}>Option 2: WordPress Plugin</h3>
              <p style={{color:'var(--text-secondary)',fontSize:13,marginBottom:10}}>Install the Messenger AI plugin and configure it:</p>
              <div className="code-block">
                <button className="copy-btn" onClick={()=>copyText(`${appUrl}/api\n${showEmbed.id}\n${apiKey}`, 'wp')}>{copied==='wp'?'Copied!':'Copy'}</button>
{`API Base URL:  ${appUrl}/api
Agent ID:      ${showEmbed.id}
API Key:       ${apiKey}`}
              </div>
            </div>

            <div className="modal-actions"><button className="btn btn-primary btn-block" onClick={()=>setShowEmbed(null)}>Close</button></div>
          </div>
        </div>
      )}
    </>
  );
}
