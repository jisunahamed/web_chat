'use client';
import { useEffect, useState, useCallback } from 'react';
import { getMe, logout, updateAiConfig, testAiConnection } from '@/lib/api';

const OpenAI_Icon = (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0462 6.0462 0 0 0 5.45-3.1 6.0462 6.0462 0 0 0 3.572-6.5789ZM20.309 9.5298a4.4078 4.4078 0 0 1 .91 3.94l-2.073-1.196L19.146 9.38v2.392a1.5369 1.5369 0 0 0 .769 1.332Zm-4.966-2.58A4.4078 4.4078 0 0 1 19.3 5.429L17.227 6.625l-2.073 1.196V5.429a1.5369 1.5369 0 0 0-.769-1.332Zm-6.58-1.52A4.4078 4.4078 0 0 1 12.72 2.879l-2.073 1.196L8.574 5.271v-2.39a1.5369 1.5369 0 0 0-1.538 0ZM4.6 14.47A4.4078 4.4078 0 0 1 3.69 10.53l2.073 1.196L7.836 12.92v-2.39a1.5369 1.5369 0 0 0-.769-1.332Zm4.966 2.58A4.4078 4.4078 0 0 1 4.7 18.571l2.073-1.196L8.846 16.18v2.392a1.5369 1.5369 0 0 0 .769 1.332ZM15.237 18.57A4.4078 4.4078 0 0 1 11.28 21.121l2.073-1.196L15.426 18.73v2.39a1.5369 1.5369 0 0 0 1.538 0ZM13.882 14.07v-4.14l-3.585-2.07-3.585 2.07v4.14l3.585 2.07 3.585-2.07ZM12.09 11.33L10.3 12.36v-2.06l1.79-1.03 1.79 1.03v2.06Z"/>
  </svg>
);

const Gemini_Icon = (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.9961 24C12.3023 17.5312 17.5324 12.3012 24 11.9951V11.9514C17.5324 11.6453 12.3023 6.41527 11.9961 0H11.9523C11.6462 6.41527 6.41617 11.6453 0 11.9514V11.9951C6.41617 12.3012 11.6462 17.5312 11.9523 24H11.9961Z"/>
  </svg>
);

const Groq_Icon = (
  <svg width="44" height="22" viewBox="0 0 200 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{marginTop: 5}}>
    <path fillRule="evenodd" clipRule="evenodd" d="M37.89 83.21c-22.1 0-36.96-14.73-36.96-33.21s14.86-33.21 36.96-33.21c21.84 0 35.53 14.73 35.53 29.35v37.07H52.54v-31.5H19.78v-4.15h52.32c-3.15-18.06-18.06-25.26-34.21-25.26-15.01 0-26.68 9.15-26.68 27.71s11.67 27.7 26.68 27.7c15.68 0 20.3-6.52 22.36-11.83l9.46 3.52c-4.47 11.16-16.14 23.8-31.82 23.8ZM109.84 83.21h-10.74V34.52h9.72l-.76 7.42h.38c2.86-5.46 7.82-8.38 15.07-8.38 2.38 0 4.1.28 4.76.57v11.73c-.95-.38-3.05-.76-6.48-.76-6.38 0-11.91 3.53-11.91 14.12v23.99ZM154.67 84.16c-18.33 0-29.3-11.6-29.3-25.3h10.95c0 8.01 5.92 15.1 18.35 15.1 12.02 0 17.58-6.72 17.58-15.1 0-8.29-5.46-14.82-17.58-14.82-12.09 0-18.35 6.64-18.35 14.82h-10.95c0-13.8 11.23-25.23 29.3-25.23 18.07 0 28.53 11.43 28.53 25.23s-10.46 25.3-28.53 25.3ZM203.22 83.21h-10.75V34.52h9.73l-.77 5.61h.38c4.27-5 10.37-6.56 16.5-6.56 12.38 0 21.04 8.76 21.04 25.13 0 16.48-9.04 25.43-21.6 25.43-5.23 0-10.45-1.15-14.54-5.62h-.37v22.95h-10.43V83.21Zm15.22-39.7c-9.02 0-14.44 6.82-14.44 15.35s5.32 15.35 14.44 15.35 14.55-6.82 14.55-15.35-5.53-15.35-14.55-15.35Z"/>
  </svg>
);

const Custom_Icon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const AI_PROVIDERS = [
  { id: 'openai', name: 'OpenAI', desc: 'GPT-4o, GPT-4o-mini, o1', icon: OpenAI_Icon, color: '#10a37f' },
  { id: 'gemini', name: 'Google Gemini', desc: 'Gemini 2.0 Flash, Pro', icon: Gemini_Icon, color: '#4285f4' },
  { id: 'groq', name: 'Groq', desc: 'LLaMA, Mixtral, Gemma', icon: Groq_Icon, color: '#f55036' },
  { id: 'custom', name: 'Custom / Local', desc: 'Any OpenAI-compatible API', icon: Custom_Icon, color: '#f59e0b' },
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
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6, color: aiProvider === p.id ? p.color : 'inherit' }}>{p.icon}</div>
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
