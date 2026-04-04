/**
 * Messenger AI – Embeddable Chat Widget
 *
 * Usage:
 * <script src="https://your-domain.com/widget.js" data-agent-id="AGENT_ID" data-api-key="API_KEY"></script>
 *
 * Optional attributes:
 *   data-position="right"        (left | right)
 *   data-primary-color="#6C5CE7"
 *   data-bot-name="AI Assistant"
 *   data-welcome="Hi! How can I help?"
 *   data-api-url="https://your-domain.com"
 */

(function () {
  'use strict';

  // ─── Read Config from Script Tag ─────────────────────
  const scriptTag = document.currentScript;
  if (!scriptTag) return;

  const CONFIG = {
    agentId:      scriptTag.getAttribute('data-agent-id')      || '',
    apiKey:       scriptTag.getAttribute('data-api-key')       || '',
    apiUrl:       scriptTag.getAttribute('data-api-url')       || scriptTag.src.replace(/\/widget\.js.*$/, ''),
    position:     scriptTag.getAttribute('data-position')      || 'right',
    primaryColor: scriptTag.getAttribute('data-primary-color') || '#6C5CE7',
    botName:      scriptTag.getAttribute('data-bot-name')      || 'AI Assistant',
    welcome:      scriptTag.getAttribute('data-welcome')       || 'Hi there! 👋 How can I help you today?',
    botAvatar:    scriptTag.getAttribute('data-bot-avatar')     || '',
  };

  if (!CONFIG.agentId || !CONFIG.apiKey) {
    console.warn('[Messenger AI] Missing data-agent-id or data-api-key.');
    return;
  }

  // ─── Session ID ──────────────────────────────────────
  let sessionId = localStorage.getItem('maic_wgt_sid');
  if (!sessionId) {
    sessionId = 'ws_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
    localStorage.setItem('maic_wgt_sid', sessionId);
  }

  // User info state.
  const userInfo = {
    name: localStorage.getItem('maic_wgt_name') || '',
    email: localStorage.getItem('maic_wgt_email') || '',
    phone: localStorage.getItem('maic_wgt_phone') || '',
  };

  let isOpen = false;
  let isSending = false;
  let leadShown = false;

  // ─── Inject Styles ──────────────────────────────────
  const style = document.createElement('style');
  style.textContent = buildCSS(CONFIG);
  document.head.appendChild(style);

  // ─── Inject Font ────────────────────────────────────
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
  document.head.appendChild(fontLink);

  // ─── Build DOM ──────────────────────────────────────
  const root = document.createElement('div');
  root.id = 'maic-wgt';
  root.innerHTML = buildHTML(CONFIG);
  document.body.appendChild(root);

  // ─── DOM Refs ───────────────────────────────────────
  const $ = (sel) => root.querySelector(sel);
  const triggerBtn  = $('#maic-w-trigger');
  const chatWin     = $('#maic-w-chat');
  const msgArea     = $('#maic-w-messages');
  const input       = $('#maic-w-input');
  const sendBtn     = $('#maic-w-send');
  const minBtn      = $('#maic-w-min');
  const leadForm    = $('#maic-w-lead');
  const leadNameEl  = $('#maic-w-lname');
  const leadCtEl    = $('#maic-w-lcontact');
  const leadSubBtn  = $('#maic-w-lsub');
  const iconChat    = $('#maic-w-ic-chat');
  const iconClose   = $('#maic-w-ic-close');

  // ─── Events ─────────────────────────────────────────
  triggerBtn.addEventListener('click', toggle);
  minBtn.addEventListener('click', toggle);
  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
  input.addEventListener('input', function () { this.style.height = 'auto'; this.style.height = Math.min(this.scrollHeight, 100) + 'px'; });
  leadSubBtn.addEventListener('click', submitLead);

  // ─── Toggle ─────────────────────────────────────────
  function toggle() {
    isOpen = !isOpen;
    chatWin.classList.toggle('maic-w-hidden', !isOpen);
    iconChat.style.display  = isOpen ? 'none' : 'block';
    iconClose.style.display = isOpen ? 'block' : 'none';
    if (isOpen) {
      if (msgArea.children.length === 0) addMsg('bot', CONFIG.welcome);
      input.focus();
      scroll();
    }
  }

  // ─── Send ───────────────────────────────────────────
  function send() {
    const text = input.value.trim();
    if (!text || isSending) return;
    addMsg('user', text);
    input.value = '';
    input.style.height = 'auto';
    isSending = true;
    showTyping();

    const body = { agent_id: CONFIG.agentId, session_id: sessionId, message: text, user_info: userInfo };

    fetch(CONFIG.apiUrl + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': CONFIG.apiKey },
      body: JSON.stringify(body),
    })
      .then((r) => r.json())
      .then((d) => {
        hideTyping();
        isSending = false;
        if (d.reply) addMsg('bot', d.reply);
        else if (d.data?.reply) addMsg('bot', d.data.reply);
        else addMsg('bot', 'Sorry, something went wrong.');
        if ((d.collect_user_data || d.data?.collect_user_data) && !leadShown) showLead();
      })
      .catch(() => { hideTyping(); isSending = false; addMsg('bot', 'Connection error.'); });
  }

  // ─── Messages ───────────────────────────────────────
  function addMsg(who, text) {
    const div = document.createElement('div');
    const t = document.createElement('div');
    t.className = 'maic-w-time';
    t.textContent = timeStr();

    if (who === 'bot') {
      div.className = 'maic-w-row';
      const av = document.createElement('div');
      av.className = 'maic-w-av';
      if (CONFIG.botAvatar) av.style.backgroundImage = 'url(' + CONFIG.botAvatar + ')';
      else av.textContent = CONFIG.botName.charAt(0);
      const bub = document.createElement('div');
      bub.className = 'maic-w-msg maic-w-bot';
      bub.innerHTML = fmt(text);
      bub.appendChild(t);
      div.appendChild(av);
      div.appendChild(bub);
    } else {
      div.className = 'maic-w-msg maic-w-usr';
      div.textContent = text;
      div.appendChild(t);
    }
    msgArea.appendChild(div);
    scroll();
  }

  function showTyping() {
    if ($('#maic-w-typing')) return;
    const d = document.createElement('div'); d.className = 'maic-w-row'; d.id = 'maic-w-typing';
    d.innerHTML = '<div class="maic-w-av">' + CONFIG.botName.charAt(0) + '</div><div class="maic-w-dots"><span></span><span></span><span></span></div>';
    msgArea.appendChild(d); scroll();
  }
  function hideTyping() { const el = $('#maic-w-typing'); if (el) el.remove(); }

  // ─── Lead ───────────────────────────────────────────
  function showLead() { leadShown = true; leadForm.classList.remove('maic-w-hidden'); }

  function submitLead() {
    const n = leadNameEl.value.trim();
    const c = leadCtEl.value.trim();
    if (!n || !c) return;
    const isEmail = c.includes('@');
    userInfo.name = n;
    userInfo.email = isEmail ? c : '';
    userInfo.phone = isEmail ? '' : c;
    localStorage.setItem('maic_wgt_name', n);
    localStorage.setItem('maic_wgt_email', userInfo.email);
    localStorage.setItem('maic_wgt_phone', userInfo.phone);

    fetch(CONFIG.apiUrl + '/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': CONFIG.apiKey },
      body: JSON.stringify({ agent_id: CONFIG.agentId, session_id: sessionId, user_info: userInfo }),
    }).catch(() => {});

    leadForm.classList.add('maic-w-hidden');
    addMsg('bot', 'Thank you, ' + n + '! How can I help you further?');
  }

  // ─── Helpers ────────────────────────────────────────
  function scroll() { requestAnimationFrame(() => { msgArea.scrollTop = msgArea.scrollHeight; }); }
  function timeStr() { const d = new Date(); let h = d.getHours(), m = d.getMinutes(), a = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return h + ':' + (m < 10 ? '0' : '') + m + ' ' + a; }
  function fmt(t) {
    return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,'<em>$1</em>')
      .replace(/`(.+?)`/g,'<code>$1</code>')
      .replace(/\n/g,'<br>');
  }

  // ─── HTML Template ──────────────────────────────────
  function buildHTML(c) {
    const pos = c.position;
    return `
      <button id="maic-w-trigger" aria-label="Open chat">
        <svg id="maic-w-ic-chat" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <svg id="maic-w-ic-close" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <div id="maic-w-chat" class="maic-w-hidden maic-w-pos-${pos}">
        <div id="maic-w-header">
          <div class="maic-w-hleft">
            <div class="maic-w-hav">${c.botAvatar ? '' : c.botName.charAt(0)}</div>
            <div><div class="maic-w-hname">${esc(c.botName)}</div><div class="maic-w-hstatus"><span class="maic-w-dot"></span> Online</div></div>
          </div>
          <button id="maic-w-min" aria-label="Minimize"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
        </div>
        <div id="maic-w-messages"></div>
        <div id="maic-w-lead" class="maic-w-hidden">
          <p class="maic-w-ltitle">Please share your details:</p>
          <input id="maic-w-lname" placeholder="Your name"/>
          <input id="maic-w-lcontact" placeholder="Email or WhatsApp number"/>
          <button id="maic-w-lsub">Submit</button>
        </div>
        <div id="maic-w-bar">
          <textarea id="maic-w-input" rows="1" placeholder="Type a message…"></textarea>
          <button id="maic-w-send" aria-label="Send"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
        </div>
      </div>`;
  }

  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  // ─── CSS Template ───────────────────────────────────
  function buildCSS(c) {
    const P = c.primaryColor;
    const pos = c.position;
    return `
      #maic-wgt{position:fixed;bottom:24px;${pos}:24px;z-index:999999;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;line-height:1.5}
      #maic-w-trigger{width:60px;height:60px;border-radius:50%;border:none;background:${P};color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,.2);transition:transform .3s cubic-bezier(.34,1.56,.64,1);position:relative;z-index:2}
      #maic-w-trigger:hover{transform:scale(1.08)}
      #maic-w-trigger::before{content:'';position:absolute;inset:-4px;border-radius:50%;background:${P};opacity:0;animation:mwp 2.5s ease-in-out infinite;z-index:-1}
      @keyframes mwp{0%,100%{opacity:0;transform:scale(1)}50%{opacity:.25;transform:scale(1.25)}}
      #maic-w-chat{position:absolute;bottom:76px;${pos}:0;width:380px;max-height:560px;background:#fff;border-radius:16px;box-shadow:0 12px 48px rgba(0,0,0,.15);display:flex;flex-direction:column;overflow:hidden;transition:opacity .3s,transform .3s cubic-bezier(.34,1.56,.64,1);border:1px solid #e5e7eb;transform-origin:bottom ${pos}}
      #maic-w-chat.maic-w-hidden{opacity:0;transform:scale(.85) translateY(20px);pointer-events:none}
      #maic-w-chat:not(.maic-w-hidden){opacity:1;transform:scale(1) translateY(0)}
      #maic-w-header{background:${P};color:#fff;padding:16px 18px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
      .maic-w-hleft{display:flex;align-items:center;gap:12px}
      .maic-w-hav{width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;flex-shrink:0;background-size:cover;background-position:center}
      .maic-w-hname{font-weight:600;font-size:15px}
      .maic-w-hstatus{font-size:12px;opacity:.85;display:flex;align-items:center;gap:5px}
      .maic-w-dot{width:7px;height:7px;border-radius:50%;background:#55efc4;display:inline-block;animation:mwb 2s ease-in-out infinite}
      @keyframes mwb{0%,100%{opacity:1}50%{opacity:.4}}
      #maic-w-min{background:rgba(255,255,255,.15);border:none;color:#fff;width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .2s}
      #maic-w-min:hover{background:rgba(255,255,255,.3)}
      #maic-w-messages{flex:1 1 auto;overflow-y:auto;padding:18px 16px;display:flex;flex-direction:column;gap:12px;min-height:250px;max-height:360px;background:#f7f8fa}
      #maic-w-messages::-webkit-scrollbar{width:5px}#maic-w-messages::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:10px}
      .maic-w-msg{max-width:82%;padding:10px 14px;border-radius:16px;font-size:14px;line-height:1.55;word-break:break-word;animation:mwf .3s ease both}
      @keyframes mwf{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      .maic-w-bot{align-self:flex-start;background:#fff;color:#1a1a2e;border:1px solid #e5e7eb;border-bottom-left-radius:4px;box-shadow:0 1px 3px rgba(0,0,0,.04)}
      .maic-w-usr{align-self:flex-end;background:${P};color:#fff;border-bottom-right-radius:4px}
      .maic-w-row{display:flex;gap:8px;align-items:flex-end}
      .maic-w-av{width:28px;height:28px;border-radius:50%;background:${P}22;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:${P};flex-shrink:0;background-size:cover;background-position:center}
      .maic-w-time{font-size:11px;margin-top:4px;opacity:.6}
      .maic-w-usr .maic-w-time{color:rgba(255,255,255,.7);text-align:right}
      .maic-w-dots{display:flex;gap:4px;padding:12px 16px}.maic-w-dots span{width:8px;height:8px;border-radius:50%;background:#adb5bd;animation:mwd 1.4s ease-in-out infinite}.maic-w-dots span:nth-child(2){animation-delay:.15s}.maic-w-dots span:nth-child(3){animation-delay:.3s}
      @keyframes mwd{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
      #maic-w-lead{padding:14px 16px;background:#fff;border-top:1px solid #e5e7eb;display:flex;flex-direction:column;gap:8px}
      #maic-w-lead.maic-w-hidden{display:none}
      .maic-w-ltitle{margin:0;font-weight:600;font-size:13px}
      #maic-w-lead input{border:1px solid #e5e7eb;border-radius:8px;padding:9px 12px;font-size:13px;font-family:inherit;outline:none;transition:border-color .2s}
      #maic-w-lead input:focus{border-color:${P}}
      #maic-w-lsub{background:${P};color:#fff;border:none;border-radius:8px;padding:9px;font-size:13px;font-weight:600;cursor:pointer;transition:opacity .2s}#maic-w-lsub:hover{opacity:.9}
      #maic-w-bar{display:flex;align-items:flex-end;gap:8px;padding:12px 14px;border-top:1px solid #e5e7eb;background:#fff;flex-shrink:0}
      #maic-w-input{flex:1;border:1px solid #e5e7eb;border-radius:12px;padding:10px 14px;font-size:14px;font-family:inherit;resize:none;outline:none;max-height:100px;line-height:1.4;transition:border-color .2s}
      #maic-w-input:focus{border-color:${P}}
      #maic-w-send{width:40px;height:40px;border-radius:12px;border:none;background:${P};color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:transform .15s}#maic-w-send:hover{transform:scale(1.05)}
      @media(max-width:480px){#maic-wgt{bottom:12px;${pos}:12px}#maic-w-chat{width:calc(100vw - 24px);max-height:calc(100vh - 100px);bottom:72px;${pos}:-12px}#maic-w-trigger{width:54px;height:54px}#maic-w-messages{max-height:calc(100vh - 260px)}}
      .maic-w-msg code{background:#f0f0f0;padding:1px 5px;border-radius:4px;font-size:13px}
    `;
  }

})();
