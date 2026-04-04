/**
 * Messenger AI – Premium Embeddable Chat Widget
 *
 * Usage:
 * <script src="https://your-domain.com/widget.js" data-agent-id="AGENT_ID" data-api-key="API_KEY"></script>
 *
 * Settings are auto-fetched from the agent config. Manual overrides available via:
 *   data-position="right"
 *   data-primary-color="#7C3AED"
 *   data-secondary-color="#EC4899"
 *   data-use-gradient="true"
 *   data-theme="bubble"  (bubble | glass | minimal)
 *   data-bot-name="AI Assistant"
 *   data-welcome="Hi! How can I help?"
 */

(function () {
  'use strict';

  const scriptTag = document.currentScript;
  if (!scriptTag) return;

  const attr = (n) => scriptTag.getAttribute(n);

  // Defaults - can be overridden by agent config or data attributes
  let CONFIG = {
    agentId:        attr('data-agent-id')      || '',
    apiKey:         attr('data-api-key')        || '',
    apiUrl:         attr('data-api-url')        || scriptTag.src.replace(/\/widget\.js.*$/, ''),
    position:       attr('data-position')       || 'right',
    primaryColor:   attr('data-primary-color')  || '#7C3AED',
    secondaryColor: attr('data-secondary-color')|| '',
    useGradient:    attr('data-use-gradient') === 'true',
    theme:          attr('data-theme')          || 'bubble',
    botName:        attr('data-bot-name')       || 'AI Assistant',
    welcome:        attr('data-welcome')        || 'Hi there! 👋 How can I help you today?',
    botAvatar:      attr('data-bot-avatar')     || '',
  };

  if (!CONFIG.agentId || !CONFIG.apiKey) {
    console.warn('[Messenger AI] Missing data-agent-id or data-api-key.');
    return;
  }

  // ─── Fetch Config from Server ──────────────────────
  function fetchConfig() {
    return fetch(CONFIG.apiUrl + '/api/agents/' + CONFIG.agentId + '/config', {
      headers: { 'X-Api-Key': CONFIG.apiKey },
    })
      .then(r => r.json())
      .then(d => {
        if (d.config) {
          const c = d.config;
          // Only apply server settings if user didn't override via data- attributes
          if (!attr('data-primary-color') && c.primaryColor) CONFIG.primaryColor = c.primaryColor;
          if (!attr('data-secondary-color') && c.secondaryColor) CONFIG.secondaryColor = c.secondaryColor;
          if (!attr('data-use-gradient') && c.useGradient !== undefined) CONFIG.useGradient = c.useGradient;
          if (!attr('data-theme') && c.widgetTheme) CONFIG.theme = c.widgetTheme;
          if (!attr('data-bot-name') && c.name) CONFIG.botName = c.name;
          if (!attr('data-welcome') && c.welcomeMessage) CONFIG.welcome = c.welcomeMessage;
          if (!attr('data-bot-avatar') && c.botAvatar) CONFIG.botAvatar = c.botAvatar;
        }
      })
      .catch(() => {});
  }

  // ─── Session ──────────────────────────────────────
  let sessionId = localStorage.getItem('maic_wgt_sid');
  if (!sessionId) {
    sessionId = 'ws_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
    localStorage.setItem('maic_wgt_sid', sessionId);
  }

  const userInfo = {
    name: localStorage.getItem('maic_wgt_name') || '',
    email: localStorage.getItem('maic_wgt_email') || '',
    phone: localStorage.getItem('maic_wgt_phone') || '',
  };

  let isOpen = false, isSending = false, leadShown = false;

  // ─── Init ─────────────────────────────────────────
  fetchConfig().then(buildWidget);
  function buildWidget() {
    // Inject Font
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    document.head.appendChild(fontLink);

    // Inject Styles
    const style = document.createElement('style');
    style.textContent = buildCSS(CONFIG);
    document.head.appendChild(style);

    // Build DOM
    const root = document.createElement('div');
    root.id = 'maic-wgt';
    root.innerHTML = buildHTML(CONFIG);
    document.body.appendChild(root);

    // Refs
    const $ = (sel) => root.querySelector(sel);
    const triggerBtn = $('#maic-w-trigger');
    const chatWin = $('#maic-w-chat');
    const msgArea = $('#maic-w-messages');
    const input = $('#maic-w-input');
    const sendBtn = $('#maic-w-send');
    const minBtn = $('#maic-w-min');
    const leadForm = $('#maic-w-lead');
    const leadNameEl = $('#maic-w-lname');
    const leadCtEl = $('#maic-w-lcontact');
    const leadSubBtn = $('#maic-w-lsub');
    const iconChat = $('#maic-w-ic-chat');
    const iconClose = $('#maic-w-ic-close');

    // Events
    triggerBtn.addEventListener('click', toggle);
    minBtn.addEventListener('click', toggle);
    sendBtn.addEventListener('click', send);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
    input.addEventListener('input', function () { this.style.height = 'auto'; this.style.height = Math.min(this.scrollHeight, 120) + 'px'; });
    leadSubBtn.addEventListener('click', submitLead);

    function toggle() {
      isOpen = !isOpen;
      chatWin.classList.toggle('maic-w-hidden', !isOpen);
      iconChat.style.display = isOpen ? 'none' : 'block';
      iconClose.style.display = isOpen ? 'block' : 'none';
      if (isOpen) {
        if (msgArea.children.length === 0) addMsg('bot', CONFIG.welcome);
        input.focus();
        scroll();
      }
    }

    function send() {
      const text = input.value.trim();
      if (!text || isSending) return;
      addMsg('user', text);
      input.value = '';
      input.style.height = 'auto';
      isSending = true;
      showTyping();

      fetch(CONFIG.apiUrl + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Api-Key': CONFIG.apiKey },
        body: JSON.stringify({ agent_id: CONFIG.agentId, session_id: sessionId, message: text, user_info: userInfo }),
      })
        .then(r => r.json())
        .then(d => {
          hideTyping(); isSending = false;
          if (d.reply) addMsg('bot', d.reply);
          else if (d.data?.reply) addMsg('bot', d.data.reply);
          else addMsg('bot', 'Sorry, something went wrong.');
          if ((d.collect_user_data || d.data?.collect_user_data) && !leadShown) showLead();
        })
        .catch(() => { hideTyping(); isSending = false; addMsg('bot', 'Connection error.'); });
    }

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

    function scroll() { requestAnimationFrame(() => { msgArea.scrollTop = msgArea.scrollHeight; }); }
    function timeStr() { const d = new Date(); let h = d.getHours(), m = d.getMinutes(), a = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return h + ':' + (m < 10 ? '0' : '') + m + ' ' + a; }
    function fmt(t) {
      return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
    }
  }

  // ─── HTML ─────────────────────────────────────────
  function buildHTML(c) {
    const pos = c.position;
    const th = c.theme;
    const triggerR = th === 'minimal' ? '16px' : '50%';
    return `
      <button id="maic-w-trigger" aria-label="Open chat">
        <svg id="maic-w-ic-chat" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <svg id="maic-w-ic-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <div id="maic-w-chat" class="maic-w-hidden maic-w-pos-${pos}">
        <div id="maic-w-header">
          <div class="maic-w-hleft">
            <div class="maic-w-hav">${c.botAvatar ? '' : c.botName.charAt(0)}</div>
            <div><div class="maic-w-hname">${esc(c.botName)}</div><div class="maic-w-hstatus"><span class="maic-w-dot"></span> Online</div></div>
          </div>
          <button id="maic-w-min" aria-label="Minimize"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
        </div>
        <div id="maic-w-messages"></div>
        <div id="maic-w-lead" class="maic-w-hidden">
          <p class="maic-w-ltitle">📋 Share your details:</p>
          <input id="maic-w-lname" placeholder="Your name"/>
          <input id="maic-w-lcontact" placeholder="Email or WhatsApp number"/>
          <button id="maic-w-lsub">Submit</button>
        </div>
        <div id="maic-w-bar">
          <textarea id="maic-w-input" rows="1" placeholder="Type a message…"></textarea>
          <button id="maic-w-send" aria-label="Send"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
        </div>
      </div>`;
  }

  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  // ─── CSS ──────────────────────────────────────────
  function buildCSS(c) {
    const P = c.primaryColor;
    const S = c.secondaryColor || P;
    const grad = c.useGradient ? `linear-gradient(135deg, ${P}, ${S})` : P;
    const pos = c.position;
    const th = c.theme;

    // Theme-based values
    const triggerR = th === 'minimal' ? '16px' : '50%';
    const chatR = th === 'minimal' ? '12px' : th === 'glass' ? '24px' : '28px';
    const msgR = th === 'minimal' ? '10px' : th === 'glass' ? '16px' : '22px';
    const headerR = chatR;
    const chatBg = th === 'glass' ? 'rgba(255,255,255,0.92)' : '#ffffff';
    const msgBg = th === 'glass' ? 'rgba(255,255,255,0.75)' : '#ffffff';
    const areaBg = th === 'glass' ? 'rgba(248,250,252,0.8)' : '#f8fafc';
    const chatShadow = th === 'glass' ? '0 32px 80px rgba(0,0,0,0.18)' : '0 24px 64px rgba(0,0,0,0.14)';
    const chatBorder = th === 'glass' ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(0,0,0,0.06)';
    const blurVal = th === 'glass' ? 'backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);' : '';
    const headerBlur = th === 'glass' ? 'backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);' : '';
    const headerBg = th === 'glass'
      ? (c.useGradient ? `linear-gradient(135deg, ${P}dd, ${S}dd)` : `${P}dd`)
      : grad;

    return `
      #maic-wgt{position:fixed;bottom:24px;${pos}:24px;z-index:999999;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;line-height:1.5}
      #maic-w-trigger{width:62px;height:62px;border-radius:${triggerR};border:none;background:${grad};color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 28px rgba(0,0,0,.22);transition:transform .35s cubic-bezier(.34,1.56,.64,1);position:relative;z-index:2}
      #maic-w-trigger:hover{transform:scale(1.1) translateY(-3px)}
      #maic-w-trigger::before{content:'';position:absolute;inset:-5px;border-radius:${triggerR};background:${P};opacity:0;animation:mwp 2.5s ease-in-out infinite;z-index:-1}
      @keyframes mwp{0%,100%{opacity:0;transform:scale(1)}50%{opacity:.2;transform:scale(1.3)}}

      #maic-w-chat{position:absolute;bottom:80px;${pos}:0;width:380px;max-height:620px;background:${chatBg};border-radius:${chatR};box-shadow:${chatShadow};display:flex;flex-direction:column;overflow:hidden;transition:opacity .35s,transform .35s cubic-bezier(.34,1.56,.64,1);border:${chatBorder};transform-origin:bottom ${pos};${blurVal}}
      #maic-w-chat.maic-w-hidden{opacity:0;transform:scale(.85) translateY(20px);pointer-events:none}
      #maic-w-chat:not(.maic-w-hidden){opacity:1;transform:scale(1) translateY(0)}

      #maic-w-header{background:${headerBg};color:#fff;padding:18px 22px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;border-top-left-radius:${headerR};border-top-right-radius:${headerR};${headerBlur}}
      .maic-w-hleft{display:flex;align-items:center;gap:12px}
      .maic-w-hav{width:44px;height:44px;border-radius:${th==='minimal'?'10px':'50%'};background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;flex-shrink:0;background-size:cover;background-position:center;border:2px solid rgba(255,255,255,0.3)}
      .maic-w-hname{font-weight:700;font-size:15px;letter-spacing:-.3px}
      .maic-w-hstatus{font-size:12px;opacity:.9;display:flex;align-items:center;gap:6px;font-weight:500}
      .maic-w-dot{width:8px;height:8px;border-radius:50%;background:#4ade80;display:inline-block;animation:mwb 2s ease-in-out infinite;box-shadow:0 0 6px #4ade80}
      @keyframes mwb{0%,100%{opacity:1}50%{opacity:.5}}
      #maic-w-min{background:rgba(255,255,255,.12);border:none;color:#fff;width:34px;height:34px;border-radius:${th==='minimal'?'8px':'10px'};display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s}
      #maic-w-min:hover{background:rgba(255,255,255,.28);transform:scale(1.05)}

      #maic-w-messages{flex:1 1 auto;overflow-y:auto;padding:22px 18px;display:flex;flex-direction:column;gap:14px;min-height:260px;max-height:380px;background:${areaBg}}
      #maic-w-messages::-webkit-scrollbar{width:5px}#maic-w-messages::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:10px}
      .maic-w-msg{max-width:84%;padding:11px 15px;border-radius:${msgR};font-size:14px;line-height:1.5;word-break:break-word;animation:mwf .4s cubic-bezier(0.16,1,0.3,1) both}
      @keyframes mwf{from{opacity:0;transform:translateY(10px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
      .maic-w-bot{align-self:flex-start;background:${msgBg};color:#1e293b;border:${th==='glass'?'1px solid rgba(255,255,255,0.35)':'1px solid #e2e8f0'};border-bottom-left-radius:${th==='minimal'?'2px':'4px'};box-shadow:0 1px 4px rgba(0,0,0,.04);${th==='glass'?'backdrop-filter:blur(8px);':''}}
      .maic-w-usr{align-self:flex-end;background:${grad};color:#fff;border-bottom-right-radius:${th==='minimal'?'2px':'4px'};box-shadow:0 3px 10px rgba(0,0,0,.1)}
      .maic-w-row{display:flex;gap:9px;align-items:flex-end}
      .maic-w-av{width:28px;height:28px;border-radius:${th==='minimal'?'8px':'50%'};background:${P}15;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:${P};flex-shrink:0;background-size:cover;background-position:center;border:1px solid ${P}25}
      .maic-w-time{font-size:10.5px;margin-top:5px;opacity:.6;font-weight:500}
      .maic-w-usr .maic-w-time{color:rgba(255,255,255,.75);text-align:right}
      .maic-w-dots{display:flex;gap:5px;padding:13px 16px}.maic-w-dots span{width:7px;height:7px;border-radius:50%;background:${P};opacity:.6;animation:mwd 1.4s ease-in-out infinite}.maic-w-dots span:nth-child(2){animation-delay:.15s}.maic-w-dots span:nth-child(3){animation-delay:.3s}
      @keyframes mwd{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}

      #maic-w-lead{padding:16px 20px;background:#fff;border-top:1px solid #e2e8f0;display:flex;flex-direction:column;gap:10px}
      #maic-w-lead.maic-w-hidden{display:none}
      .maic-w-ltitle{margin:0;font-weight:600;font-size:13px;color:#334155}
      #maic-w-lead input{border:1px solid #cbd5e1;border-radius:${th==='minimal'?'8px':'12px'};padding:10px 14px;font-size:13.5px;font-family:inherit;outline:none;transition:all .2s;background:#f8fafc}
      #maic-w-lead input:focus{border-color:${P};background:#fff;box-shadow:0 0 0 3px ${P}15}
      #maic-w-lsub{background:${grad};color:#fff;border:none;border-radius:${th==='minimal'?'8px':'12px'};padding:11px;font-size:13.5px;font-weight:600;cursor:pointer;transition:all .2s;box-shadow:0 3px 10px ${P}30}#maic-w-lsub:hover{transform:translateY(-1px)}
      #maic-w-bar{display:flex;align-items:flex-end;gap:10px;padding:14px 18px;border-top:1px solid #e2e8f0;background:#fff;flex-shrink:0}
      #maic-w-input{flex:1;border:1px solid #cbd5e1;border-radius:${th==='minimal'?'10px':'18px'};padding:11px 16px;font-size:14px;font-family:inherit;resize:none;outline:none;max-height:120px;line-height:1.5;transition:all .2s;background:#f8fafc}
      #maic-w-input:focus{border-color:${P};background:#fff;box-shadow:0 0 0 3px ${P}15}
      #maic-w-send{width:44px;height:44px;border-radius:${th==='minimal'?'10px':'14px'};border:none;background:${grad};color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s;box-shadow:0 3px 10px ${P}25}
      #maic-w-send:hover{transform:scale(1.06) translateY(-2px)}
      @media(max-width:480px){#maic-wgt{bottom:14px;${pos}:14px}#maic-w-chat{width:calc(100vw - 28px);max-height:calc(100vh - 110px);bottom:78px;${pos}:0}#maic-w-trigger{width:54px;height:54px}#maic-w-messages{max-height:calc(100vh - 280px)}}
      .maic-w-msg code{background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:13px;color:#ef4444}
    `;
  }

})();
