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
    chatBg:         attr('data-chat-bg')         || '#f8fafc',
    socialLinks:    {},
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
          if (!attr('data-primary-color') && c.primaryColor) CONFIG.primaryColor = c.primaryColor;
          if (!attr('data-secondary-color') && c.secondaryColor) CONFIG.secondaryColor = c.secondaryColor;
          if (!attr('data-use-gradient') && c.useGradient !== undefined) CONFIG.useGradient = c.useGradient;
          if (!attr('data-theme') && c.widgetTheme) CONFIG.theme = c.widgetTheme;
          if (!attr('data-bot-name') && c.name) CONFIG.botName = c.name;
          if (!attr('data-welcome') && c.welcomeMessage) CONFIG.welcome = c.welcomeMessage;
          if (!attr('data-bot-avatar') && c.botAvatar) CONFIG.botAvatar = c.botAvatar;
          if (!attr('data-chat-bg') && c.chatBg) CONFIG.chatBg = c.chatBg;
          if (!attr('data-popup-bg') && c.popupBg) CONFIG.popupBg = c.popupBg;
          if (!attr('data-faqs') && c.faqs) CONFIG.faqs = c.faqs || [];
          CONFIG.socialLinks = c.socialLinks || {};
          console.log('[InmeTech] Config loaded:', CONFIG);
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
    const socialLayer = $('#maic-w-social');

    // Force Input Styles via JS to defeat caching/conflicts
    if (input) {
      input.style.setProperty('outline', 'none', 'important');
    }

    // Events with safety checks
    if (triggerBtn) triggerBtn.addEventListener('click', toggle);
    if (minBtn) minBtn.addEventListener('click', toggle);
    if (sendBtn) sendBtn.addEventListener('click', send);
    if (input) {
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
      input.addEventListener('input', function () { this.style.height = 'auto'; this.style.height = Math.min(this.scrollHeight, 120) + 'px'; });
    }
    if (leadSubBtn) leadSubBtn.addEventListener('click', submitLead);

    // ─── Welcome Popup Timer (10s) + Browser Notification ───
    const popup = $('#maic-w-popup');
    const pClose = $('#maic-w-p-close');
    const pText = $('#maic-w-p-text');

    // Request notification permission early (silent)
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    if (popup && pText) {
      setTimeout(() => {
        if (!isOpen && !localStorage.getItem('maic_p_closed') && chatWin.classList.contains('maic-w-hidden')) {
          popup.classList.remove('maic-w-hidden');
          popup.style.cssText = 'display:flex !important;visibility:visible !important;opacity:1 !important;pointer-events:auto !important;';
          playNotifSound();
          showBrowserNotification();
        }
      }, 10000);
    }
    if (pClose) pClose.addEventListener('click', (e) => {
      e.stopPropagation();
      popup.style.cssText = '';
      popup.classList.add('maic-w-hidden');
      localStorage.setItem('maic_p_closed', '1');
    });

    function playNotifSound() {
      try {
        // Generate a pleasant notification "ding" via Web Audio API
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.08);
        osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.16);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
      } catch (e) {}
    }

    function showBrowserNotification() {
      try {
        if ('Notification' in window && Notification.permission === 'granted') {
          const n = new Notification(CONFIG.botName + ' says:', {
            body: CONFIG.welcome,
            icon: CONFIG.botAvatar || undefined,
            tag: 'maic-popup-' + CONFIG.agentId,
            silent: true,
          });
          n.onclick = () => { window.focus(); toggle(); n.close(); };
          setTimeout(() => n.close(), 8000);
        }
      } catch (e) {}
    }

    // Initialization complete. Social icons will render on toggle.

    function toggle() {
      isOpen = !isOpen;
      chatWin.classList.toggle('maic-w-hidden', !isOpen);
      popup.style.cssText = ''; // Reset inline overrides
      popup.classList.add('maic-w-hidden');
      iconChat.style.display = isOpen ? 'none' : 'block';
      iconClose.style.display = isOpen ? 'block' : 'none';

      if (socialLayer) {
        if (isOpen) {
          renderSocial(socialLayer);
          socialLayer.classList.add('maic-w-social-show');
        } else {
          socialLayer.classList.remove('maic-w-social-show');
          setTimeout(() => socialLayer.innerHTML = '', 400);
        }
      }

      if (isOpen) {
        if (msgArea.children.length === 0) {
          if (CONFIG.faqs && CONFIG.faqs.length > 0) renderFaqView();
          else addMsg('bot', CONFIG.welcome);
        }
        input.focus();
        scroll();
      }
    }

    function renderFaqView() {
      msgArea.innerHTML = `
        <div class="maic-w-faq-cont">
          <div class="maic-w-faq-h">
            <div class="maic-w-faq-title">Hello :)</div>
            <div class="maic-w-faq-sub">Here's what you can ask me</div>
          </div>
          ${CONFIG.faqs.map(cat => `
            <div class="maic-w-faq-cat-group">
              <div class="maic-w-faq-cat">${cat.category}</div>
              <div class="maic-w-faq-list">
                ${cat.questions.map(q => `
                  <div class="maic-w-faq-pill" data-q="${esc(q)}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <span>${esc(q)}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
          <div class="maic-w-faq-more">+ See all suggestions</div>
        </div>
      `;
      msgArea.querySelectorAll('.maic-w-faq-pill').forEach(p => {
        p.onclick = () => {
          const text = p.getAttribute('data-q');
          msgArea.innerHTML = '';
          sendMessage(text);
        };
      });
    }

    function sendMessage(text) {
      if (!text || isSending) return;
      addMsg('user', text);
      isSending = true;
      showTyping();

      fetch(CONFIG.apiUrl + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Api-Key': CONFIG.apiKey },
        body: JSON.stringify({ agent_id: CONFIG.agentId, session_id: sessionId, message: text, user_info: userInfo, page_url: window.location.href }),
      })
        .then(r => r.json())
        .then(d => {
          hideTyping(); isSending = false;
          if (d.reply) addMsg('bot', d.reply);
          else if (d.data?.reply) addMsg('bot', d.data.reply);
          else addMsg('bot', 'Sorry, something went wrong.');
        })
        .catch(() => { hideTyping(); isSending = false; addMsg('bot', 'Connection error.'); });
    }

    function renderSocial(cont) {
      cont.innerHTML = '';
      const sl = CONFIG.socialLinks;
      const icons = [];
      if (sl.messenger) icons.push({ url: 'https://m.me/' + sl.messenger, color: '#0084FF', svg: '<svg width="20" height="20" fill="#ffffff" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.14 2 11.25c0 2.91 1.45 5.49 3.72 7.12V22l3.5-1.92c.88.24 1.81.37 2.78.37 5.52 0 10-4.14 10-9.25S17.52 2 12 2zm1.14 12.33l-2.58-2.75-5.04 2.75 5.54-5.89 2.58 2.75 5.04-2.75-5.54 5.89z"/></svg>' });
      if (sl.whatsapp) icons.push({ url: 'https://wa.me/' + sl.whatsapp.replace(/\D/g,''), color: '#25D366', svg: '<svg width="22" height="22" fill="#ffffff" viewBox="0 0 24 24"><path d="M12.004 2C6.48 2 2.004 6.48 2.004 12c0 1.88.52 3.63 1.43 5.14l-1.43 5.14 5.31-1.43c1.47.88 3.22 1.43 5.14 1.43 5.52 0 10-4.48 10-10s-4.48-10-10-10zm.003 18.06c-1.63 0-3.14-.42-4.43-1.16l-.32-.19-3.15.85.85-3.15-.19-.32c-.74-1.29-1.16-2.8-1.16-4.43 0-4.63 3.77-8.4 8.4-8.4s8.4 3.77 8.4 8.4-3.77 8.4-8.4 8.4z"/></svg>' });
      if (sl.telegram) icons.push({ url: 'https://t.me/' + sl.telegram, color: '#0088CC', svg: '<svg width="18" height="18" fill="#ffffff" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.14 17.01c-.13.01-.26 0-.38-.05-.12-.05-.23-.13-.31-.22-.08-.1-.13-.21-.15-.34-.02-.13-.01-.26.04-.38l.45-1.25.13-.36-1.58-.75c-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.52-1.4.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.45-.42-1.39-.88.03-.24.37-.48 1.01-.74 3.94-1.72 6.56-2.85 7.87-3.39 3.75-1.55 4.53-1.82 5.04-1.83.11 0 .36.03.52.16.14.11.18.26.2.37.03.11.03.3.01.46z"/></svg>' });

      icons.forEach((ic, i) => {
        const a = document.createElement('a');
        a.href = ic.url; a.target = '_blank'; a.className = 'maic-w-social-icon';
        a.style.background = ic.color; a.style.transitionDelay = (i * 0.05) + 's';
        a.innerHTML = ic.svg; cont.appendChild(a);
      });
    }

    function send() {
      const text = input.value.trim();
      input.value = '';
      input.style.height = 'auto';
      if (msgArea.querySelector('.maic-w-faq-cont')) msgArea.innerHTML = '';
      sendMessage(text);
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

    // ─── Tracking ─────────────────────────────────────
    function track(type) {
      const key = 'maic_t_' + type + '_' + CONFIG.agentId;
      if (sessionStorage.getItem(key)) return;
      fetch(CONFIG.apiUrl + '/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: CONFIG.agentId, type: type }),
      }).then(() => sessionStorage.setItem(key, '1')).catch(() => {});
    }

    track('view');
    triggerBtn.addEventListener('click', () => { if (!isOpen) track('click'); });
  }

  // ─── HTML ─────────────────────────────────────────
  function buildHTML(c) {
    const pos = c.position;
    return `
      <div id="maic-w-social" class="maic-w-pos-${pos}"></div>
      <div id="maic-w-popup" class="maic-w-hidden maic-w-pos-${pos}">
        <div id="maic-w-p-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <div id="maic-w-p-text">${esc(c.welcome)}</div>
        <button id="maic-w-p-close" aria-label="Close popup">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <button id="maic-w-trigger" aria-label="Open chat">
        <svg id="maic-w-ic-chat" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <svg id="maic-w-ic-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:none; color:#ffffff"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <div id="maic-w-chat" class="maic-w-hidden maic-w-pos-${pos}">
        <div id="maic-w-header">
          <div class="maic-w-hleft">
            <div class="maic-w-hav" style="${c.botAvatar ? `background-image:url(${c.botAvatar})` : ''}">${c.botAvatar ? '' : c.botName.charAt(0)}</div>
            <div><div class="maic-w-hname">${esc(c.botName)}</div><div class="maic-w-hstatus"><span class="maic-w-dot"></span> Online</div></div>
          </div>
          <button id="maic-w-min" aria-label="Minimize"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
        </div>
        <div id="maic-w-messages"></div>
        <div id="maic-w-footer">
          <div id="maic-w-bar">
            <textarea id="maic-w-input" rows="1" placeholder="Type a message…"></textarea>
            <button id="maic-w-send" aria-label="Send"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
          </div>
          <div class="maic-w-branding">Powered by <a href="https://inmetech.com" target="_blank">InmeTech.com</a></div>
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

    // Theme-specific overrides dynamically tracking Brand Color (P)
    const themeConfig = {
      bubble:    { chatR:'28px', msgR:'22px', triggerR:'50%', chatBg:'#ffffff', msgBg:'#ffffff', headerBg:grad, areaBg:c.chatBg||'#f8fafc', chatShadow:'0 24px 64px rgba(0,0,0,0.14)', chatBorder:'1px solid rgba(0,0,0,0.06)', blur:'', headerBlur:'', textColor:'#1e293b', mutedText:'#94a3b8', inputBg:'rgba(255,255,255,0.08)', triggerBg:grad },
      glass:     { chatR:'24px', msgR:'16px', triggerR:'50%', chatBg:'rgba(255,255,255,0.92)', msgBg:'rgba(255,255,255,0.75)', headerBg:c.useGradient?`linear-gradient(135deg,${P}dd,${S}dd)`:`${P}dd`, areaBg:c.chatBg||'rgba(248,250,252,0.8)', chatShadow:'0 32px 80px rgba(0,0,0,0.18)', chatBorder:'1px solid rgba(255,255,255,0.25)', blur:'backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);', headerBlur:'backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);', textColor:'#1e293b', mutedText:'#94a3b8', inputBg:'rgba(255,255,255,0.08)', triggerBg:grad },
      minimal:   { chatR:'12px', msgR:'10px', triggerR:'16px', chatBg:'#ffffff', msgBg:'#ffffff', headerBg:grad, areaBg:c.chatBg||'#f8fafc', chatShadow:'0 24px 64px rgba(0,0,0,0.14)', chatBorder:'1px solid rgba(0,0,0,0.06)', blur:'', headerBlur:'', textColor:'#1e293b', mutedText:'#94a3b8', inputBg:'rgba(255,255,255,0.08)', triggerBg:grad },
      mocha:     { chatR:'24px', msgR:'18px', triggerR:'50%', chatBg:'#1a1210', msgBg:'#2a1f1a', headerBg:grad, areaBg:c.chatBg||'#1a1210', chatShadow:'0 32px 80px rgba(0,0,0,0.4)', chatBorder:`1px solid ${P}26`, blur:'', headerBlur:'', textColor:'#f5e6d3', mutedText:`${P}99`, inputBg:`${P}1A`, triggerBg:grad },
      aurora:    { chatR:'24px', msgR:'18px', triggerR:'50%', chatBg:'#ffffff', msgBg:'#f0f4ff', headerBg:`linear-gradient(135deg, ${P}, #06b6d4, ${S||P})`, areaBg:c.chatBg||'#f0f4ff', chatShadow:`0 24px 64px ${P}26`, chatBorder:`1px solid ${P}1F`, blur:'', headerBlur:'', textColor:'#1e293b', mutedText:'#94a3b8', inputBg:`${P}0A`, triggerBg:grad },
      neon:      { chatR:'8px', msgR:'6px', triggerR:'8px', chatBg:'#0a0a0f', msgBg:'#12121a', headerBg:'linear-gradient(135deg, #0a0a0f, #1a1a2e)', areaBg:c.chatBg||'#0a0a0f', chatShadow:`0 0 40px ${P}26, 0 24px 64px rgba(0,0,0,0.5)`, chatBorder:`1px solid ${P}33`, blur:'', headerBlur:'', textColor:'#e0ffe0', mutedText:`${P}80`, inputBg:`${P}0F`, triggerBg:grad },
      gradient:  { chatR:'28px', msgR:'18px', triggerR:'50%', chatBg:`linear-gradient(180deg, ${P}15, ${S || P}15)`, msgBg:'rgba(255,255,255,0.12)', headerBg:grad, areaBg:c.chatBg||`linear-gradient(180deg, ${P}10, #ffffff)`, chatShadow:`0 32px 80px ${P}30`, chatBorder:`1px solid ${P}20`, blur:'backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);', headerBlur:'', textColor:'#1e293b', mutedText:'#94a3b8', inputBg:'rgba(255,255,255,0.15)', triggerBg:grad },
      corporate: { chatR:'4px', msgR:'4px', triggerR:'4px', chatBg:'#ffffff', msgBg:'#f9fafb', headerBg:grad, areaBg:c.chatBg||'#f9fafb', chatShadow:'0 4px 20px rgba(0,0,0,0.08)', chatBorder:'1px solid #e5e7eb', blur:'', headerBlur:'', textColor:'#111827', mutedText:'#6b7280', inputBg:'#f3f4f6', triggerBg:grad },
    };
    
    const T = themeConfig[th] || themeConfig.bubble;
    const areaBg = T.areaBg;
    
    // Brightness detection for auto-text color
    const isDark = (col) => {
      if (!col) return false;
      if (col.startsWith('rgba')) return false;
      if (col.startsWith('linear')) {
        const m = col.match(/#([A-Fa-f0-9]{3,6})/);
        if (m) { const hex = m[1]; if (hex.length < 6) return false; const r=parseInt(hex.substring(0,2),16),g=parseInt(hex.substring(2,4),16),b=parseInt(hex.substring(4,6),16); return (r*0.299+g*0.587+b*0.114)<128; }
        return true;
      }
      const hex = col.replace('#','');
      if (hex.length < 3) return false;
      const r=parseInt(hex.substring(0,2),16),g=parseInt(hex.substring(2,4),16),b=parseInt(hex.substring(4,6),16);
      return (r*0.299+g*0.587+b*0.114)<128;
    };
    const isBgDark = isDark(areaBg) || ['mocha','neon'].includes(th);
    const fgText = isBgDark ? '#f5f5f5' : T.textColor;
    const mutedText = isBgDark ? T.mutedText : T.mutedText;
    const botMsgBg = isBgDark ? T.msgBg : T.msgBg;
    const botMsgColor = isBgDark ? T.textColor : '#1e293b';
    const botMsgBorder = isBgDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0';
    const inputBorder = isBgDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';
    const footerBorder = isBgDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

    // Neon-specific glow effects
    const neonGlow = th === 'neon' ? `
      #maic-w-header{border-bottom:1px solid ${P}33}
      .maic-w-dot{background:${P};box-shadow:0 0 10px ${P},0 0 20px ${P}80}
      #maic-w-send{box-shadow:0 0 12px ${P}4D}
      .maic-w-usr{box-shadow:0 0 12px ${P}26}
      #maic-w-trigger{box-shadow:0 0 30px ${P}4D,0 8px 28px rgba(0,0,0,0.3)}
      #maic-w-trigger::before{background:${P}}
    ` : '';

    // Aurora animated header
    const auroraAnim = th === 'aurora' ? `
      #maic-w-header{background-size:200% 200%;animation:maic-aurora 6s ease infinite}
      @keyframes maic-aurora{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
    ` : '';

    // Mocha warm accent
    const mochaExtra = th === 'mocha' ? `
      .maic-w-dot{background:#d4a574;box-shadow:0 0 8px rgba(212,165,116,0.6)}
      .maic-w-faq-title,.maic-w-faq-sub{color:#f5e6d3 !important}
      .maic-w-faq-cat{color:rgba(212,165,116,0.7) !important}
      .maic-w-faq-pill{background:#2a1f1a !important;color:#f5e6d3 !important;border-color:rgba(212,165,116,0.15) !important}
      .maic-w-faq-pill svg{color:#d4a574 !important}
      .maic-w-faq-more{color:#d4a574 !important}
    ` : '';

    // Corporate extra crispness
    const corpExtra = th === 'corporate' ? `
      .maic-w-hav{border-radius:4px !important;border:1px solid rgba(255,255,255,0.3) !important}
      #maic-w-min{border-radius:4px}
      .maic-w-faq-pill{border-radius:6px !important}
    ` : '';

    return `
      #maic-wgt{position:fixed;bottom:24px;${pos}:24px;z-index:999999;font-family:'Inter',sans-serif;font-size:14px;line-height:1.5;overflow:visible !important;}
      #maic-w-trigger{width:60px;height:60px;border-radius:${T.triggerR};border:none;background:${T.triggerBg};color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 28px rgba(0,0,0,.22);transition:transform .35s;position:relative;z-index:2}
      #maic-w-trigger:hover{transform:scale(1.1) translateY(-3px)}
      #maic-w-trigger::before{content:'';position:absolute;inset:-5px;border-radius:${T.triggerR};background:${P};opacity:0;animation:mwp 2.5s infinite;z-index:-1}
      @keyframes mwp{0%,100%{opacity:0;transform:scale(1)}50%{opacity:.2;transform:scale(1.3)}}
      
      #maic-w-chat{position:absolute;bottom:80px;${pos}:0;width:380px;max-height:620px;background:${T.chatBg};border-radius:${T.chatR};box-shadow:${T.chatShadow};display:flex;flex-direction:column;overflow:hidden;transition:all .35s;border:${T.chatBorder};transform-origin:bottom ${pos};${T.blur}}
      .maic-w-hidden{display:none !important;visibility:hidden !important;opacity:0 !important;pointer-events:none !important}
      #maic-w-chat.maic-w-hidden{display:flex !important;visibility:visible !important;opacity:0;transform:scale(.85) translateY(20px);pointer-events:none}
      #maic-w-header{background:${T.headerBg};color:#fff;padding:18px 22px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;${T.headerBlur}}
      .maic-w-hleft{display:flex;align-items:center;gap:12px}
      .maic-w-hav{width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;flex-shrink:0;background-size:cover;border:2px solid rgba(255,255,255,0.3)}
      .maic-w-hname{font-weight:700;font-size:15px}
      .maic-w-hstatus{font-size:12px;opacity:.9;display:flex;align-items:center;gap:6px}
      .maic-w-dot{width:8px;height:8px;border-radius:50%;background:#4ade80;box-shadow:0 0 6px #4ade80}
      #maic-w-min{background:rgba(255,255,255,.12);border:none;color:#fff;width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;cursor:pointer}

      #maic-w-messages{flex:1;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:16px 15px;display:flex;flex-direction:column;gap:10px;min-height:260px;background:${areaBg};scrollbar-width:none !important;-ms-overflow-style:none !important;}
      #maic-w-messages::-webkit-scrollbar{display:none !important;}
      .maic-w-msg{max-width:84%;padding:8px 14px;border-radius:${T.msgR};font-size:13.5px;line-height:1.4;animation:mwf .3s both}
      @keyframes mwf{from{opacity:0;transform:translateY(10px)}}
      .maic-w-bot{background:${botMsgBg};color:${botMsgColor};border:${botMsgBorder};border-bottom-left-radius:4px}
      .maic-w-usr{align-self:flex-end;background:${th==='neon'?'linear-gradient(135deg,#00ffaa,#00d4ff)':grad};color:${th==='neon'?'#0a0a0f':'#fff'};border-bottom-right-radius:4px}
      .maic-w-row{display:flex;gap:7px;align-items:flex-end}
      .maic-w-av{width:26px;height:26px;border-radius:50%;background:${th==='neon'?'rgba(0,255,170,0.1)':th==='mocha'?'rgba(212,165,116,0.15)':`${P}15`};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:${th==='neon'?'#00ffaa':th==='mocha'?'#d4a574':P};flex-shrink:0;background-size:cover;border:1px solid ${th==='neon'?'rgba(0,255,170,0.2)':th==='mocha'?'rgba(212,165,116,0.2)':`${P}25`}}
      .maic-w-time{font-size:9px;margin-top:2px;opacity:.5;color:${fgText}}
      .maic-w-usr .maic-w-time{text-align:right}
      .maic-w-dots{display:flex;gap:5px;padding:12px 15px}.maic-w-dots span{width:7px;height:7px;border-radius:50%;background:${th==='neon'?'#00ffaa':th==='mocha'?'#d4a574':P};opacity:.4;animation:mwd 1.4s infinite}.maic-w-dots span:nth-child(2){animation-delay:.15s}.maic-w-dots span:nth-child(3){animation-delay:.3s}
      @keyframes mwd{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-4px)}}

      #maic-w-footer{background:${areaBg} !important;border-top:1px solid ${footerBorder} !important}
      .maic-w-branding{text-align:center;padding:0 10px 8px;font-size:11px;color:${mutedText} !important}
      .maic-w-branding a{color:${isBgDark ? '#fff' : P} !important;text-decoration:none !important;font-weight:600 !important}
      #maic-w-bar{display:flex;align-items:flex-end;gap:10px;padding:12px 18px;background:transparent}
      #maic-w-input{flex:1;border:1px solid ${inputBorder};border-radius:${th==='corporate'?'4px':th==='neon'?'4px':'11px'};padding:10px 15px;font-size:14px;font-family:inherit;resize:none;outline:none;max-height:120px;background:${T.inputBg} !important;color:${fgText} !important;-webkit-text-fill-color:${fgText} !important;scrollbar-width:none !important;-ms-overflow-style:none !important;caret-color:${fgText} !important;}
      #maic-w-input::placeholder{color:${mutedText} !important;}
      #maic-w-input::-webkit-scrollbar{display:none !important;}
      #maic-w-input:focus{border-color:${th==='neon'?'#00ffaa':P} !important;box-shadow: 0 0 0 2px ${th==='neon'?'rgba(0,255,170,0.2)':`${P}20`} !important;}
      #maic-w-send{width:42px;height:42px;border-radius:${th==='corporate'?'4px':th==='neon'?'4px':'12px'};border:none;background:${th==='neon'?'linear-gradient(135deg,#00ffaa,#00d4ff)':grad};color:${th==='neon'?'#0a0a0f':'#fff'};cursor:pointer;display:flex;align-items:center;justify-content:center}
      
      #maic-w-social { position:absolute; bottom:10px; display:flex; gap:12px; pointer-events:none; z-index:10; transition:all .4s; }
      #maic-w-social.maic-w-pos-right { right:84px; flex-direction:row-reverse; }
      #maic-w-social.maic-w-pos-left { left:84px; }
      #maic-w-social.maic-w-social-show { pointer-events:auto; }
      .maic-w-social-icon { width:42px; height:42px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; text-decoration:none; box-shadow:0 4px 12px rgba(0,0,0,0.15); opacity:0; transform:scale(0.5); transition:all .3s cubic-bezier(0.18, 0.89, 0.32, 1.28); }
      .maic-w-social-show .maic-w-social-icon { opacity:1; transform:scale(1); }
      .maic-w-social-icon:hover { transform:scale(1.1) translateY(-3px); }
      
      #maic-w-popup { position:absolute; bottom:8px; min-width:160px; max-width:260px; background:${c.popupBg||(isBgDark?'#1e1e2e':'#ffffff')}; padding:10px 30px 10px 12px; border-radius:${th==='corporate'?'6px':th==='minimal'?'8px':'14px'}; box-shadow:0 8px 32px rgba(0,0,0,${isBgDark?'0.45':'0.12'}),0 2px 8px rgba(0,0,0,0.06); border:1px solid ${isBgDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.05)'}; animation:maic-p-mag .5s cubic-bezier(0.34,1.56,0.64,1) both; z-index:5; visibility:visible; display:flex; align-items:center; gap:9px; backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px); }
      #maic-w-popup.maic-w-pos-right { right:74px; }
      #maic-w-popup.maic-w-pos-left { left:74px; }
      #maic-w-popup::after { display:none; }
      #maic-w-p-icon { width:24px; height:24px; min-width:24px; border-radius:50%; background:${grad}; display:flex; align-items:center; justify-content:center; color:${th==='neon'?'#0a0a0f':'#fff'}; flex-shrink:0; }
      #maic-w-p-icon svg { width:11px; height:11px; }
      #maic-w-p-text { font-size:12.5px; color:${isBgDark?'#d4d4d8':'#374151'}; line-height:1.4; font-weight:500; flex:1; word-wrap:break-word; }
      #maic-w-p-close { position:absolute; top:6px; right:6px; width:16px; height:16px; border-radius:50%; background:transparent; border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; color:${isBgDark?'rgba(255,255,255,0.3)':'rgba(0,0,0,0.25)'}; transition:all .2s; padding:0; }
      #maic-w-p-close:hover { background:${isBgDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.06)'}; color:${isBgDark?'rgba(255,255,255,0.6)':'rgba(0,0,0,0.5)'}; }
      @keyframes maic-p-mag { from { opacity:0; transform:translateY(8px) scale(0.92); } to { opacity:1; transform:translateY(0) scale(1); } }
      #maic-w-popup.maic-w-pos-left { animation-name: maic-p-mag; }

      .maic-w-faq-cont { animation:mwf .4s both; }
      .maic-w-faq-h { text-align:center; margin-bottom:20px; }
      .maic-w-faq-title { font-size:20px; font-weight:700; color:${fgText}; margin-bottom:4px; }
      .maic-w-faq-sub { font-size:13px; color:${mutedText}; font-weight:500; }
      .maic-w-faq-cat-group { margin-bottom:18px; }
      .maic-w-faq-cat { font-size:11px; font-weight:800; color:${mutedText}; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:10px; padding-left:2px; }
      .maic-w-faq-list { display:flex; flex-direction:column; gap:9px; }
      .maic-w-faq-pill { display:flex; align-items:center; gap:10px; background:${isBgDark?T.msgBg:'#ffffff'}; padding:10px 14px; border-radius:22px; border:1px solid ${isBgDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.06)'}; box-shadow:0 3px 12px rgba(0,0,0,${isBgDark?'0.2':'0.04'}); cursor:pointer; transition:all 0.2s; color:${fgText}; font-size:13.5px; font-weight:600; }
      .maic-w-faq-pill:hover { transform:translateY(-2px); box-shadow:0 6px 16px rgba(0,0,0,${isBgDark?'0.3':'0.08'}); }
      .maic-w-faq-pill svg { color:${th==='neon'?'#00ffaa':th==='mocha'?'#d4a574':P}; flex-shrink:0; }
      .maic-w-faq-more { font-size:12px; font-weight:700; color:${th==='neon'?'#00ffaa':th==='mocha'?'#d4a574':P}; margin-top:6px; cursor:pointer; padding-left:4px; opacity:0.8; transition:opacity 0.2s; }
      .maic-w-faq-more:hover { opacity:1; }

      ${neonGlow}${auroraAnim}${mochaExtra}${corpExtra}

      @media(max-width:480px){#maic-w-chat{width:calc(100vw - 32px);max-height:calc(100vh - 120px)}}
    `;
  }

})();
