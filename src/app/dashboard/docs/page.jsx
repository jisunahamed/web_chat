'use client';
import { useEffect, useState } from 'react';
import { getMe } from '@/lib/api';

export default function DocsPage() {
  const [apiKey, setApiKey] = useState('YOUR_API_KEY');
  const [copied, setCopied] = useState('');

  useEffect(() => { getMe().then(d => setApiKey(d.user.apiKey)).catch(()=>{}); }, []);

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-app.vercel.app';

  const copy = (text, label) => { navigator.clipboard.writeText(text); setCopied(label); setTimeout(()=>setCopied(''),2000); };

  return (
    <div className="animate-in">
      <div className="page-header"><h1>Documentation</h1></div>

      {/* Quick Start */}
      <div className="card" style={{marginBottom:20}}>
        <h2 style={{fontSize:18,fontWeight:600,marginBottom:8}}>Quick Start Guide</h2>
        <p style={{color:'var(--text-secondary)',fontSize:14,marginBottom:20}}>Connect InmeTech to your website in under 2 minutes.</p>

        <div style={{display:'flex',flexDirection:'column',gap:20}}>
          <div style={{display:'flex',gap:16,alignItems:'flex-start'}}>
            <div style={{width:32,height:32,borderRadius:'50%',background:'rgba(108,92,231,.15)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:14,color:'var(--primary-light)',flexShrink:0}}>1</div>
            <div><h4 style={{fontWeight:600,marginBottom:4}}>Create an Agent</h4><p style={{color:'var(--text-secondary)',fontSize:13}}>Go to the <a href="/dashboard/agents">Agents</a> page, click "New Agent", fill in your system prompt and preferences.</p></div>
          </div>
          <div style={{display:'flex',gap:16,alignItems:'flex-start'}}>
            <div style={{width:32,height:32,borderRadius:'50%',background:'rgba(108,92,231,.15)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:14,color:'var(--primary-light)',flexShrink:0}}>2</div>
            <div><h4 style={{fontWeight:600,marginBottom:4}}>Get Your Embed Code</h4><p style={{color:'var(--text-secondary)',fontSize:13}}>Click "Get Embed Code" on your agent card. Copy the JavaScript snippet or WordPress plugin credentials.</p></div>
          </div>
          <div style={{display:'flex',gap:16,alignItems:'flex-start'}}>
            <div style={{width:32,height:32,borderRadius:'50%',background:'rgba(108,92,231,.15)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:14,color:'var(--primary-light)',flexShrink:0}}>3</div>
            <div><h4 style={{fontWeight:600,marginBottom:4}}>Add to Your Website</h4><p style={{color:'var(--text-secondary)',fontSize:13}}>Paste the code into your website. The chat widget will appear automatically.</p></div>
          </div>
        </div>
      </div>

      {/* JavaScript Widget */}
      <div className="card" style={{marginBottom:20}}>
        <h2 style={{fontSize:18,fontWeight:600,marginBottom:8}}>JavaScript Widget (Custom Websites)</h2>
        <p style={{color:'var(--text-secondary)',fontSize:13,marginBottom:16}}>Works with any website — HTML, React, Vue, Shopify, Squarespace, Wix, etc.</p>

        <h4 style={{fontWeight:600,marginBottom:8,fontSize:14}}>Basic Integration</h4>
        <div className="code-block" style={{marginBottom:16}}>
          <button className="copy-btn" onClick={()=>copy(`<script src="${appUrl}/widget.js" data-agent-id="YOUR_AGENT_ID" data-api-key="${apiKey}"></script>`, 'basic')}>{copied==='basic'?'Copied!':'Copy'}</button>
{`<script
  src="${appUrl}/widget.js"
  data-agent-id="YOUR_AGENT_ID"
  data-api-key="${apiKey}"
></script>`}
        </div>

        <h4 style={{fontWeight:600,marginBottom:8,fontSize:14}}>Full Configuration</h4>
        <div className="code-block" style={{marginBottom:16}}>
          <button className="copy-btn" onClick={()=>copy(`<script\n  src="${appUrl}/widget.js"\n  data-agent-id="YOUR_AGENT_ID"\n  data-api-key="${apiKey}"\n  data-position="right"\n  data-primary-color="#6C5CE7"\n  data-bot-name="AI Assistant"\n  data-welcome="Hello! How can I help you?"\n></script>`, 'full')}>{copied==='full'?'Copied!':'Copy'}</button>
{`<script
  src="${appUrl}/widget.js"
  data-agent-id="YOUR_AGENT_ID"
  data-api-key="${apiKey}"
  data-position="right"
  data-primary-color="#6C5CE7"
  data-bot-name="AI Assistant"
  data-welcome="Hello! How can I help you?"
></script>`}
        </div>

        <h4 style={{fontWeight:600,marginBottom:10,fontSize:14}}>Widget Attributes</h4>
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr><th>Attribute</th><th>Required</th><th>Default</th><th>Description</th></tr></thead>
            <tbody>
              <tr><td><code style={{background:'var(--bg-input)',padding:'2px 6px',borderRadius:4}}>data-agent-id</code></td><td>Yes</td><td>--</td><td>Your agent ID from the dashboard</td></tr>
              <tr><td><code style={{background:'var(--bg-input)',padding:'2px 6px',borderRadius:4}}>data-api-key</code></td><td>Yes</td><td>--</td><td>Your API key from Settings</td></tr>
              <tr><td><code style={{background:'var(--bg-input)',padding:'2px 6px',borderRadius:4}}>data-position</code></td><td>No</td><td>right</td><td>Widget position: left or right</td></tr>
              <tr><td><code style={{background:'var(--bg-input)',padding:'2px 6px',borderRadius:4}}>data-primary-color</code></td><td>No</td><td>#6C5CE7</td><td>Brand color (hex)</td></tr>
              <tr><td><code style={{background:'var(--bg-input)',padding:'2px 6px',borderRadius:4}}>data-bot-name</code></td><td>No</td><td>AI Assistant</td><td>Display name of the bot</td></tr>
              <tr><td><code style={{background:'var(--bg-input)',padding:'2px 6px',borderRadius:4}}>data-welcome</code></td><td>No</td><td>Hi there!</td><td>Welcome message</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* WordPress Plugin */}
      <div className="card" style={{marginBottom:20}}>
        <h2 style={{fontSize:18,fontWeight:600,marginBottom:8}}>WordPress Plugin</h2>
        <p style={{color:'var(--text-secondary)',fontSize:13,marginBottom:16}}>For WordPress and WooCommerce websites.</p>

        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div>
            <h4 style={{fontWeight:600,marginBottom:6,fontSize:14}}>Step 1: Install the Plugin</h4>
            <p style={{color:'var(--text-secondary)',fontSize:13}}>Download and install the <strong>InmeTech Chatbot</strong> WordPress plugin. Go to Plugins &rarr; Add New &rarr; Upload Plugin.</p>
          </div>
          <div>
            <h4 style={{fontWeight:600,marginBottom:6,fontSize:14}}>Step 2: Configure the Plugin</h4>
            <p style={{color:'var(--text-secondary)',fontSize:13,marginBottom:10}}>Go to <strong>InmeTech</strong> in your WordPress dashboard and enter:</p>
            <div className="code-block">
              <button className="copy-btn" onClick={()=>copy(`${appUrl}/api`, 'wpurl')}>{copied==='wpurl'?'Copied!':'Copy'}</button>
{`API Base URL:  ${appUrl}/api
Agent ID:      (from your agent's embed code)
API Key:       ${apiKey}`}
            </div>
          </div>
          <div>
            <h4 style={{fontWeight:600,marginBottom:6,fontSize:14}}>Step 3: Activate</h4>
            <p style={{color:'var(--text-secondary)',fontSize:13}}>Toggle the chatbot ON and save. The widget will appear on all public pages of your WordPress site.</p>
          </div>
        </div>
      </div>

      {/* API Reference */}
      <div className="card">
        <h2 style={{fontSize:18,fontWeight:600,marginBottom:8}}>API Reference</h2>
        <p style={{color:'var(--text-secondary)',fontSize:13,marginBottom:16}}>For custom integrations and advanced use cases.</p>

        <h4 style={{fontWeight:600,marginBottom:8,fontSize:14}}>Chat API</h4>
        <div className="code-block" style={{marginBottom:16}}>
{`POST ${appUrl}/api/chat

Headers:
  Content-Type: application/json
  X-Api-Key: ${apiKey}

Body:
{
  "agent_id": "YOUR_AGENT_ID",
  "session_id": "unique_session_id",
  "message": "Hello!",
  "user_info": {
    "name": "John",
    "email": "john@example.com"
  }
}

Response:
{
  "reply": "Hello! How can I help you?",
  "collect_user_data": false
}`}
        </div>

        <h4 style={{fontWeight:600,marginBottom:8,fontSize:14}}>Lead Submission API</h4>
        <div className="code-block">
{`POST ${appUrl}/api/lead

Headers:
  Content-Type: application/json
  X-Api-Key: ${apiKey}

Body:
{
  "agent_id": "YOUR_AGENT_ID",
  "session_id": "session_id",
  "user_info": {
    "name": "John",
    "email": "john@example.com",
    "phone": "+880123456789"
  }
}`}
        </div>
      </div>
    </div>
  );
}
