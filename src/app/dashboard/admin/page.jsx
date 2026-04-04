'use client';
import { useEffect, useState } from 'react';
import { getAdminSettings, updateAdminSettings, getAdminUsers } from '@/lib/api';

export default function AdminPage() {
  const [settings, setSettings] = useState(null);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [model, setModel] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [availableModels, setAvailableModels] = useState([]);
  const [fetchingModels, setFetchingModels] = useState(false);

  useEffect(() => {
    Promise.all([getAdminSettings(), getAdminUsers()])
      .then(([s, u]) => {
        setSettings(s.settings);
        setModel(s.settings.aiModel || 'openai-gpt-oss-120b');
        setBaseUrl(s.settings.aiBaseUrl || '');
        setApiKey(s.settings.aiApiKey || '');
        setUsers(u.users || []);
        setStats(u.stats || {});
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true); setSaved(false);
    try {
      const res = await updateAdminSettings({ aiModel: model, aiBaseUrl: baseUrl || null, aiApiKey: apiKey || null });
      setSettings(res.settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleFetchModels = async () => {
    setFetchingModels(true);
    setError('');
    try {
      const { fetchAdminModels } = await import('@/lib/api');
      const res = await fetchAdminModels(baseUrl, apiKey);
      if (res.models && res.models.length > 0) {
        setAvailableModels(res.models);
        // If current model is not in the fetched list, select the first one
        if (!res.models.includes(model)) {
          setModel(res.models[0]);
        }
      } else {
        setError('No models returned from this endpoint.');
      }
    } catch (err) {
      setError('Failed to fetch models: ' + err.message);
    } finally {
      setFetchingModels(false);
    }
  };

  if (loading) return <p style={{color:'var(--text-secondary)'}}>Loading admin panel...</p>;
  if (error && !settings) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="animate-in">
      <div className="page-header"><h1>Admin Panel</h1></div>

      {/* Platform Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Users</div>
          <div className="stat-value" style={{color:'var(--primary-light)'}}>{stats.totalUsers || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Agents</div>
          <div className="stat-value" style={{color:'var(--success)'}}>{stats.totalAgents || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Conversations</div>
          <div className="stat-value" style={{color:'var(--warning)'}}>{stats.totalConversations || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Leads</div>
          <div className="stat-value" style={{color:'#e17055'}}>{stats.totalLeads || 0}</div>
        </div>
      </div>

      {/* AI Model Settings */}
      <div className="card" style={{marginBottom:20}}>
        <h2 style={{fontSize:18,fontWeight:600,marginBottom:16}}>AI Model Configuration</h2>
        <p style={{color:'var(--text-secondary)',fontSize:13,marginBottom:20}}>These settings apply globally to all new agents created on the platform.</p>

        {error && <div className="alert alert-error" style={{marginBottom:16}}>{error}</div>}
        {saved && <div className="alert alert-success" style={{marginBottom:16}}>Settings saved successfully.</div>}

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <div className="form-group">
            <label>AI API Key (optional)</label>
            <input className="form-input" type="password" placeholder="Overrides Vercel OPENAI_API_KEY" value={apiKey} onChange={e => setApiKey(e.target.value)} />
          </div>
          <div className="form-group">
            <label>OpenAI Base URL (optional)</label>
            <div style={{display:'flex',gap:8}}>
              <input className="form-input" placeholder="https://api.openai.com/v1" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} />
              <button className="btn btn-secondary" onClick={handleFetchModels} disabled={fetchingModels} style={{flexShrink:0}}>
                {fetchingModels ? '...' : 'Fetch Models'}
              </button>
            </div>
          </div>
        </div>

        <div className="form-group" style={{maxWidth:'50%'}}>
          <label>Select AI Model</label>
          <select className="form-input" value={model} onChange={e => setModel(e.target.value)}>
            {availableModels.length > 0 ? (
              availableModels.map(m => <option key={m} value={m}>{m}</option>)
            ) : (
              <>
                <option value="openai-gpt-oss-120b">OpenAI GPT OSS 120B</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="gpt-4.1-mini">GPT-4.1 Mini</option>
                <option value="gpt-4.1">GPT-4.1</option>
              </>
            )}
          </select>
        </div>

        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Users Table */}
      <div className="card" style={{padding:0}}>
        <div style={{padding:'18px 24px',borderBottom:'1px solid var(--border)'}}>
          <h2 style={{fontSize:18,fontWeight:600}}>All Users ({users.length})</h2>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Company</th><th>Role</th><th>Agents</th><th>API Calls (24h/7d/30d/All)</th><th>Joined</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{fontWeight:500}}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.company || '--'}</td>
                  <td><span className={`badge ${u.role==='admin'?'badge-active':'badge-inactive'}`} style={u.role!=='admin'?{background:'rgba(162,155,254,.15)',color:'var(--primary-light)'}:{}}>{u.role}</span></td>
                  <td>{u._count?.agents || 0}</td>
                  <td style={{color:'var(--text-secondary)', fontSize: 13}}>
                    <span style={{fontWeight:500,color:'var(--text-primary)'}}>{u.apiStats?.last24h || 0}</span> / {u.apiStats?.last7d || 0} / {u.apiStats?.last30d || 0} / {u.apiStats?.lifetime || 0}
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
