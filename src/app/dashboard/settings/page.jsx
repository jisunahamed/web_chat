'use client';
import { useEffect, useState, useCallback } from 'react';
import { getMe, logout, updateAiConfig, testAiConnection } from '@/lib/api';

const AI_PROVIDERS = [
  { id: 'openai', name: 'OpenAI', desc: 'GPT-4o, GPT-4o-mini, o1', icon: '🤖', color: '#10a37f' },
  { id: 'gemini', name: 'Google Gemini', desc: 'Gemini 2.0 Flash, Pro', icon: '✨', color: '#4285f4' },
  { id: 'groq', name: 'Groq', desc: 'LLaMA, Mixtral, Gemma', icon: '⚡', color: '#f55036' },
  { id: 'custom', name: 'Custom / Local', desc: 'Any OpenAI-compatible API', icon: '🔧', color: '#f59e0b' },
];

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);

  // AI Config state
  const [aiProvider, setAiProvider] = useState('openai');
  const [aiApiKey, setAiApiKey] = useState('');
  const [aiBaseUrl, setAiBaseUrl] = useState('');
  const [aiModel, setAiModel] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [availableModels, setAvailableModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(false);

  useEffect(() => {
    getMe().then(d => {
      setUser(d.user);
      if (d.user.aiProvider) setAiProvider(d.user.aiProvider);
      if (d.user.aiBaseUrl) setAiBaseUrl(d.user.aiBaseUrl);
      if (d.user.aiModel) setAiModel(d.user.aiModel);
    }).catch(() => {});
  }, []);

  const copyKey = () => {
    if (user?.apiKey) {
      navigator.clipboard.writeText(user.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Fetch models from provider
  const fetchModels = useCallback(async (provider, key, baseUrl) => {
    if (!key && !user?.hasAiKey) return;
    setLoadingModels(true);
    setAvailableModels([]);
    try {
      const res = await testAiConnection({
        aiProvider: provider || aiProvider,
        aiApiKey: key || undefined,
        aiBaseUrl: baseUrl || undefined,
      });
      if (res.success && res.models) {
        setAvailableModels(res.models);
        setTestResult({ success: true, message: res.message });
      }
    } catch (err) {
      // Silently fail on auto-fetch
    } finally {
      setLoadingModels(false);
    }
  }, [aiProvider, user]);

  // Auto-fetch models when user has a saved key and changes provider
  useEffect(() => {
    if (user?.hasAiKey && !aiApiKey) {
      fetchModels(aiProvider, null, aiBaseUrl);
    }
  }, [aiProvider, user?.hasAiKey]);

  const handleSaveAi = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await updateAiConfig({ aiProvider, aiApiKey: aiApiKey || undefined, aiBaseUrl: aiBaseUrl || undefined, aiModel: aiModel || undefined });
      setSaved(true);
      // Refresh user data
      const d = await getMe();
      setUser(d.user);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTestAndFetchModels = async () => {
    if (!aiApiKey && !user?.hasAiKey) {
      alert('Please enter an API key first.');
      return;
    }
    setTesting(true);
    setTestResult(null);
    setAvailableModels([]);
    try {
      const res = await testAiConnection({
        aiProvider,
        aiApiKey: aiApiKey || undefined,
        aiBaseUrl: aiBaseUrl || undefined,
      });
      setTestResult({ success: res.success, message: res.success ? res.message : (res.error || 'Connection failed') });
      if (res.models) setAvailableModels(res.models);
    } catch (err) {
      setTestResult({ success: false, message: err.message || 'Connection failed' });
    } finally {
      setTesting(false);
    }
  };

  // When API key is pasted/typed and seems complete, auto-fetch models
  const handleApiKeyChange = (val) => {
    setAiApiKey(val);
    setAvailableModels([]);
    setTestResult(null);
  };

  if (!user) return <p style={{ color: 'var(--text-secondary)' }}>Loading…</p>;

  return (
    <div className="animate-in" style={{ maxWidth: 880, margin: '0 auto' }}>
      <div className="page-header"><h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>Settings</h1></div>

      {/* ─── AI CONFIGURATION ─── */}
      <div className="card" style={{ marginBottom: 24, padding: 28, borderRadius: 20, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #7C3AED, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🧠</div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>AI Configuration</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>Choose your AI provider, enter your API key, and select a model. All your agents will use this.</p>
          </div>
        </div>

        {/* Provider Selection */}
        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 10 }}>Select AI Provider</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
          {AI_PROVIDERS.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setAiProvider(p.id);
                setAvailableModels([]);
                setAiModel('');
                setTestResult(null);
              }}
              style={{
                padding: '16px 12px',
                borderRadius: 14,
                cursor: 'pointer',
                textAlign: 'center',
                background: aiProvider === p.id ? `${p.color}15` : 'var(--bg-input)',
                border: aiProvider === p.id ? `2px solid ${p.color}` : '1px solid var(--border)',
                transition: 'all .2s',
                position: 'relative',
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>{p.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 13, color: aiProvider === p.id ? p.color : 'var(--text-primary)', marginBottom: 2 }}>{p.name}</div>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', opacity: 0.8 }}>{p.desc}</div>
              {aiProvider === p.id && (
                <div style={{ position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* API Key Input */}
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            API Key {user?.hasAiKey && <span style={{ color: '#10b981', fontWeight: 600 }}>✓ Configured</span>}
          </label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                className="form-input"
                type={showKey ? 'text' : 'password'}
                value={aiApiKey}
                onChange={e => handleApiKeyChange(e.target.value)}
                placeholder={user?.hasAiKey ? 'Enter new key to replace existing one' : 'sk-... or AIza... (paste your API key)'}
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 12 }}
              >
                {showKey ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
        </div>

        {/* Custom Base URL (only for custom provider) */}
        {aiProvider === 'custom' && (
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Custom API Base URL</label>
            <input
              className="form-input"
              value={aiBaseUrl}
              onChange={e => setAiBaseUrl(e.target.value)}
              placeholder="https://your-api-server.com/v1"
            />
          </div>
        )}

        {/* Fetch Models Button */}
        <div style={{ marginBottom: 16 }}>
          <button
            className="btn btn-secondary"
            onClick={handleTestAndFetchModels}
            disabled={testing || loadingModels}
            style={{ width: '100%' }}
          >
            {testing || loadingModels ? '⏳ Connecting & fetching models...' : '🔌 Connect & Load Models'}
          </button>
        </div>

        {/* Test Result */}
        {testResult && (
          <div style={{
            padding: '12px 16px',
            borderRadius: 12,
            marginBottom: 16,
            background: testResult.success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${testResult.success ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            color: testResult.success ? '#10b981' : '#ef4444',
            fontSize: 13,
            fontWeight: 600,
          }}>
            {testResult.success ? '✅ ' : '❌ '}{testResult.message}
          </div>
        )}

        {/* Model Selection — only shows after models are fetched */}
        <div className="form-group" style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 8 }}>
            Select Model
            {availableModels.length > 0 && (
              <span style={{ fontSize: 10, fontWeight: 500, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 10 }}>
                {availableModels.length} models available
              </span>
            )}
          </label>
          {availableModels.length > 0 ? (
            <select className="form-input" value={aiModel} onChange={e => setAiModel(e.target.value)} style={{ fontSize: 14 }}>
              <option value="">— Select a model —</option>
              {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          ) : (
            <div style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center' }}>
              {loadingModels ? '⏳ Loading models...' : '☝️ Click "Connect & Load Models" above to see available models'}
            </div>
          )}
          {aiModel && (
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Selected:</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-light)', background: 'rgba(124,58,237,0.12)', padding: '4px 10px', borderRadius: 8 }}>{aiModel}</span>
            </div>
          )}
        </div>

        {/* Save Button */}
        <button
          className="btn btn-primary"
          onClick={handleSaveAi}
          disabled={saving}
          style={{ width: '100%' }}
        >
          {saved ? '✅ Saved!' : saving ? '⏳ Saving...' : '💾 Save AI Configuration'}
        </button>
      </div>

      {/* ─── ACCOUNT ─── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Account</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group"><label>Name</label><input className="form-input" value={user.name} readOnly /></div>
          <div className="form-group"><label>Email</label><input className="form-input" value={user.email} readOnly /></div>
          <div className="form-group"><label>Company</label><input className="form-input" value={user.company || '–'} readOnly /></div>
          <div className="form-group"><label>Member Since</label><input className="form-input" value={new Date(user.createdAt).toLocaleDateString()} readOnly /></div>
        </div>
      </div>

      {/* ─── API KEY ─── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Platform API Key</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>Use this key for your WordPress plugin or JS widget.</p>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <code className="code-block" style={{ flex: 1, margin: 0 }}>{user.apiKey}</code>
          <button className="btn btn-secondary" onClick={copyKey}>{copied ? '✓ Copied' : 'Copy'}</button>
        </div>
      </div>

      {/* ─── DANGER ZONE ─── */}
      <div className="card" style={{ borderColor: 'rgba(255,107,107,.3)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--danger)' }}>Danger Zone</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>Sign out of your account.</p>
        <button className="btn btn-danger" onClick={logout}>Sign Out</button>
      </div>
    </div>
  );
}
