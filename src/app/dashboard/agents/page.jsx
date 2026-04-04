'use client';
import { useEffect, useState } from 'react';
import { getAgents, createAgent, deleteAgent, getMe } from '@/lib/api';

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEmbed, setShowEmbed] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [form, setForm] = useState({ name:'', systemPrompt:'', websiteUrl:'', tone:'friendly', webhookUrl:'', collectLeads:false, welcomeMessage:'Hi there! How can I help you today?' });
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const [creating, setCreating] = useState(false);

  const update = (key) => (e) => { const val = e.target.type==='checkbox' ? e.target.checked : e.target.value; setForm({...form,[key]:val}); };
  const loadAgents = () => { getAgents().then(d => setAgents(d.agents||[])).catch(()=>{}).finally(()=>setLoading(false)); };

  useEffect(() => { loadAgents(); getMe().then(d => setApiKey(d.user.apiKey)).catch(()=>{}); }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setError(''); setCreating(true);
    try {
      await createAgent(form);
      setShowModal(false);
      setForm({ name:'', systemPrompt:'', websiteUrl:'', tone:'friendly', webhookUrl:'', collectLeads:false, welcomeMessage:'Hi there! How can I help you today?' });
      loadAgents();
    } catch(err) {
      console.error('Agent creation failed:', err);
      setError(err.message || 'Unknown error occurred');
    } finally {
      setCreating(false);
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
    <div className="animate-in">
      <div className="page-header"><h1>Agents</h1><button className="btn btn-primary" onClick={()=>setShowModal(true)}>+ New Agent</button></div>

      {loading ? <p style={{color:'var(--text-secondary)'}}>Loading...</p> : agents.length===0 ? (
        <div className="card" style={{textAlign:'center',padding:60}}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary-light)" strokeWidth="1.5" style={{margin:'0 auto 16px',opacity:.6}}><path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          <p style={{color:'var(--text-secondary)',marginBottom:16,fontSize:15}}>No agents created yet</p>
          <p style={{color:'var(--text-secondary)',marginBottom:20,fontSize:13}}>Create your first AI agent to start handling customer conversations.</p>
          <button className="btn btn-primary" onClick={()=>setShowModal(true)}>Create Your First Agent</button>
        </div>
      ) : (
        <div className="card-grid">
          {agents.map(agent => (
            <div className="card" key={agent.id}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',marginBottom:14}}>
                <div>
                  <h3 style={{fontSize:16,fontWeight:600,marginBottom:6}}>{agent.name}</h3>
                  <span className={`badge ${agent.isActive?'badge-active':'badge-inactive'}`}>{agent.isActive?'Active':'Inactive'}</span>
                </div>
              </div>
              <div style={{display:'flex',gap:20,fontSize:13,color:'var(--text-secondary)',marginBottom:14}}>
                <span>{agent._count?.conversations||0} conversations</span>
                <span>{agent._count?.leads||0} leads</span>
              </div>
              <div style={{fontSize:13,color:'var(--text-secondary)',marginBottom:16}}>
                <strong>Tone:</strong> {agent.tone} &middot; <strong>Model:</strong> {agent.model}
              </div>
              <div style={{display:'flex',gap:8}}>
                <button className="btn btn-secondary btn-sm" style={{flex:1}} onClick={()=>setShowEmbed(agent)}>Get Embed Code</button>
                <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(agent.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Agent Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h2>Create New Agent</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-group"><label>Agent Name *</label><input className="form-input" placeholder="e.g. Sales Assistant" value={form.name} onChange={update('name')} required /></div>
              <div className="form-group"><label>System Prompt *</label><textarea className="form-input" style={{minHeight:120}} placeholder="Define how your AI agent should behave. Example: You are a helpful sales assistant for..." value={form.systemPrompt} onChange={update('systemPrompt')} required /></div>
              <div className="form-group"><label>Website URL</label><input className="form-input" placeholder="https://yourwebsite.com" value={form.websiteUrl} onChange={update('websiteUrl')} /></div>
              <div className="form-group">
                <label>Tone</label>
                <select className="form-input" value={form.tone} onChange={update('tone')}>
                  <option value="friendly">Friendly</option>
                  <option value="sales">Sales-focused</option>
                  <option value="support">Customer Support</option>
                </select>
              </div>
              <div className="form-group"><label>Webhook URL (optional)</label><input className="form-input" placeholder="https://hooks.yourapp.com/..." value={form.webhookUrl} onChange={update('webhookUrl')} /></div>
              <div className="form-group"><label>Welcome Message</label><input className="form-input" value={form.welcomeMessage} onChange={update('welcomeMessage')} /></div>
              <div className="form-group"><label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}><input type="checkbox" checked={form.collectLeads} onChange={update('collectLeads')} /> Enable lead collection</label></div>
              <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={creating}>{creating ? 'Creating...' : 'Create Agent'}</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Embed Code Modal */}
      {showEmbed && (
        <div className="modal-overlay" onClick={()=>setShowEmbed(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()} style={{maxWidth:620}}>
            <h2>Connect &quot;{showEmbed.name}&quot; to Your Website</h2>

            <div style={{marginBottom:24}}>
              <h3 style={{fontSize:14,fontWeight:600,marginBottom:8,color:'var(--text)'}}>Option 1: JavaScript Widget</h3>
              <p style={{color:'var(--text-secondary)',fontSize:13,marginBottom:10}}>Paste this code before the closing <code style={{background:'var(--bg-input)',padding:'2px 6px',borderRadius:4}}>&lt;/body&gt;</code> tag on your website.</p>
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
              <h3 style={{fontSize:14,fontWeight:600,marginBottom:8,color:'var(--text)'}}>Option 2: WordPress Plugin</h3>
              <p style={{color:'var(--text-secondary)',fontSize:13,marginBottom:10}}>Install the <strong>Messenger AI Chatbot</strong> plugin and enter these credentials:</p>
              <div className="code-block">
                <button className="copy-btn" onClick={()=>copyText(`${appUrl}\n${showEmbed.id}\n${apiKey}`, 'wp')}>{copied==='wp'?'Copied!':'Copy'}</button>
{`API Base URL:  ${appUrl}
Agent ID:      ${showEmbed.id}
API Key:       ${apiKey}`}
              </div>
            </div>

            <div style={{padding:14,background:'rgba(108,92,231,.08)',borderRadius:'var(--radius)',border:'1px solid rgba(108,92,231,.15)',fontSize:13,color:'var(--text-secondary)'}}>
              <strong style={{color:'var(--primary-light)'}}>Tip:</strong> For detailed setup instructions, visit the <a href="/dashboard/docs" style={{color:'var(--primary-light)',textDecoration:'underline'}}>Documentation</a> page.
            </div>

            <div className="modal-actions"><button className="btn btn-secondary" onClick={()=>setShowEmbed(null)}>Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
