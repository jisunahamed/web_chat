'use client';
import { useEffect, useState } from 'react';
import { getAgents, createAgent, deleteAgent, getMe } from '@/lib/api';

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEmbed, setShowEmbed] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [form, setForm] = useState({ name:'', systemPrompt:'', websiteUrl:'', tone:'friendly', model:'gpt-4o-mini', webhookUrl:'', collectLeads:false, primaryColor:'#6C5CE7', welcomeMessage:'Hi there! 👋 How can I help you today?' });
  const [error, setError] = useState('');

  const update = (key) => (e) => { const val = e.target.type==='checkbox' ? e.target.checked : e.target.value; setForm({...form,[key]:val}); };
  const loadAgents = () => { getAgents().then(d => setAgents(d.agents||[])).catch(()=>{}).finally(()=>setLoading(false)); };

  useEffect(() => { loadAgents(); getMe().then(d => setApiKey(d.user.apiKey)).catch(()=>{}); }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setError('');
    try { await createAgent(form); setShowModal(false); setForm({ name:'', systemPrompt:'', websiteUrl:'', tone:'friendly', model:'gpt-4o-mini', webhookUrl:'', collectLeads:false, primaryColor:'#6C5CE7', welcomeMessage:'Hi there! 👋 How can I help you today?' }); loadAgents(); } catch(err) { setError(err.message); }
  };

  const handleDelete = async (id) => { if(!confirm('Delete this agent? All data will be lost.')) return; try { await deleteAgent(id); loadAgents(); } catch(err) { alert(err.message); } };

  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="animate-in">
      <div className="page-header"><h1>Agents</h1><button className="btn btn-primary" onClick={()=>setShowModal(true)}>+ Create Agent</button></div>

      {loading ? <p style={{color:'var(--text-secondary)'}}>Loading…</p> : agents.length===0 ? (
        <div className="card" style={{textAlign:'center',padding:48}}>
          <p style={{fontSize:48,marginBottom:12}}>🤖</p>
          <p style={{color:'var(--text-secondary)',marginBottom:16}}>No agents yet. Create your first AI agent!</p>
          <button className="btn btn-primary" onClick={()=>setShowModal(true)}>Create Agent</button>
        </div>
      ) : (
        <div className="card-grid">
          {agents.map(agent => (
            <div className="card" key={agent.id}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',marginBottom:12}}>
                <div><h3 style={{fontSize:16,fontWeight:600}}>{agent.name}</h3><span className={`badge ${agent.isActive?'badge-active':'badge-inactive'}`}>{agent.isActive?'Active':'Inactive'}</span></div>
                <div style={{display:'flex',gap:8}}><button className="btn btn-secondary btn-sm" onClick={()=>setShowEmbed(agent)}>Embed</button><button className="btn btn-danger btn-sm" onClick={()=>handleDelete(agent.id)}>Delete</button></div>
              </div>
              <div style={{display:'flex',gap:20,fontSize:13,color:'var(--text-secondary)'}}><span>💬 {agent._count?.conversations||0} chats</span><span>📋 {agent._count?.leads||0} leads</span></div>
              <div style={{marginTop:12,fontSize:13,color:'var(--text-secondary)'}}><strong>Tone:</strong> {agent.tone} · <strong>Model:</strong> {agent.model}</div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h2>Create Agent</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-group"><label>Agent Name *</label><input className="form-input" placeholder="Sales Bot" value={form.name} onChange={update('name')} required /></div>
              <div className="form-group"><label>System Prompt *</label><textarea className="form-input" placeholder="You are a helpful sales assistant..." value={form.systemPrompt} onChange={update('systemPrompt')} required /></div>
              <div className="form-group"><label>Website URL</label><input className="form-input" placeholder="https://yoursite.com" value={form.websiteUrl} onChange={update('websiteUrl')} /></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                <div className="form-group"><label>Tone</label><select className="form-input" value={form.tone} onChange={update('tone')}><option value="friendly">Friendly</option><option value="sales">Sales</option><option value="support">Support</option></select></div>
                <div className="form-group"><label>AI Model</label><select className="form-input" value={form.model} onChange={update('model')}><option value="gpt-4o-mini">GPT-4o Mini</option><option value="gpt-4o">GPT-4o</option><option value="gpt-3.5-turbo">GPT-3.5 Turbo</option></select></div>
              </div>
              <div className="form-group"><label>Webhook URL</label><input className="form-input" placeholder="https://hooks.yourapp.com/..." value={form.webhookUrl} onChange={update('webhookUrl')} /></div>
              <div className="form-group"><label>Welcome Message</label><input className="form-input" value={form.welcomeMessage} onChange={update('welcomeMessage')} /></div>
              <div className="form-group"><label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}><input type="checkbox" checked={form.collectLeads} onChange={update('collectLeads')} /> Collect leads</label></div>
              <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create Agent</button></div>
            </form>
          </div>
        </div>
      )}

      {showEmbed && (
        <div className="modal-overlay" onClick={()=>setShowEmbed(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h2>Embed &quot;{showEmbed.name}&quot;</h2>
            <p style={{color:'var(--text-secondary)',marginBottom:16,fontSize:13}}>Add this script before the closing &lt;/body&gt; tag.</p>
            <h3 style={{fontSize:14,fontWeight:600,marginBottom:8}}>JavaScript Widget</h3>
            <div className="code-block">
              <button className="copy-btn" onClick={()=>navigator.clipboard.writeText(`<script src="${appUrl}/widget.js" data-agent-id="${showEmbed.id}" data-api-key="${apiKey}"></script>`)}>Copy</button>
{`<script
  src="${appUrl}/widget.js"
  data-agent-id="${showEmbed.id}"
  data-api-key="${apiKey}"
></script>`}
            </div>
            <h3 style={{fontSize:14,fontWeight:600,marginTop:20,marginBottom:8}}>WordPress Plugin</h3>
            <div className="code-block" style={{marginTop:8}}>
{`API Base URL: ${appUrl}
Agent ID:     ${showEmbed.id}
API Key:      ${apiKey}`}
            </div>
            <div className="modal-actions"><button className="btn btn-secondary" onClick={()=>setShowEmbed(null)}>Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
