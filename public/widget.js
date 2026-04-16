(function() {
  var JUT_API = 'https://getjut.io';
  var script = document.currentScript || (function() { var scripts = document.getElementsByTagName('script'); return scripts[scripts.length - 1]; })();
  var WIDGET_KEY = script.getAttribute('data-key');
  var PRIMARY_COLOR = script.getAttribute('data-color') || '#ED1966';
  var POSITION = script.getAttribute('data-position') || 'right';
  var WELCOME = script.getAttribute('data-welcome') || 'Hi! How can I help you today?';
  var AGENT_NAME = script.getAttribute('data-agent') || 'Assistant';
  if (!WIDGET_KEY) { console.error('JUT Widget: data-key is required'); return; }

  var isOpen = false;
  var history = [];
  var visitorId = localStorage.getItem('jut_visitor') || ('v_' + Math.random().toString(36).slice(2));
  localStorage.setItem('jut_visitor', visitorId);

  var css = [
    '#jut-widget-btn { position:fixed; ' + POSITION + ':24px; bottom:24px; z-index:99999; width:58px; height:58px; border-radius:50%; background:' + PRIMARY_COLOR + '; border:none; cursor:pointer; box-shadow:0 4px 24px rgba(0,0,0,0.25); display:flex; align-items:center; justify-content:center; transition:transform 0.2s; }',
    '#jut-widget-btn:hover { transform:scale(1.08); }',
    '#jut-widget-box { position:fixed; ' + POSITION + ':24px; bottom:94px; z-index:99998; width:360px; height:520px; border-radius:20px; background:#0e0e16; border:1px solid rgba(255,255,255,0.1); box-shadow:0 12px 60px rgba(0,0,0,0.5); display:none; flex-direction:column; overflow:hidden; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }',
    '#jut-widget-box.open { display:flex; }',
    '#jut-widget-header { padding:16px 18px; background:' + PRIMARY_COLOR + '; display:flex; align-items:center; gap:10px; }',
    '#jut-widget-header .avatar { width:36px; height:36px; border-radius:50%; background:rgba(255,255,255,0.25); display:flex; align-items:center; justify-content:center; font-weight:800; color:#fff; font-size:14px; flex-shrink:0; }',
    '#jut-widget-header .info { flex:1; }',
    '#jut-widget-header .name { color:#fff; font-weight:700; font-size:14px; }',
    '#jut-widget-header .status { color:rgba(255,255,255,0.75); font-size:11px; display:flex; align-items:center; gap:4px; }',
    '#jut-widget-header .status-dot { width:7px; height:7px; border-radius:50%; background:#4ade80; display:inline-block; }',
    '#jut-widget-header .close { background:none; border:none; color:rgba(255,255,255,0.8); cursor:pointer; font-size:20px; padding:0; line-height:1; }',
    '#jut-widget-msgs { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:10px; }',
    '#jut-widget-msgs::-webkit-scrollbar { width:3px; }',
    '#jut-widget-msgs::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.15); border-radius:2px; }',
    '.jut-msg { display:flex; gap:8px; max-width:85%; }',
    '.jut-msg.user { align-self:flex-end; flex-direction:row-reverse; }',
    '.jut-msg-bubble { padding:10px 13px; border-radius:14px; font-size:13px; line-height:1.55; }',
    '.jut-msg.agent .jut-msg-bubble { background:#1a1a2a; color:#e0e0f0; border-radius:4px 14px 14px 14px; border:1px solid rgba(255,255,255,0.08); }',
    '.jut-msg.user .jut-msg-bubble { background:' + PRIMARY_COLOR + '; color:#fff; border-radius:14px 4px 14px 14px; }',
    '.jut-msg-avatar { width:28px; height:28px; border-radius:50%; background:' + PRIMARY_COLOR + '30; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; color:' + PRIMARY_COLOR + '; flex-shrink:0; margin-top:2px; }',
    '.jut-typing { display:flex; gap:4px; padding:12px 14px; }',
    '.jut-typing span { width:7px; height:7px; border-radius:50%; background:rgba(255,255,255,0.3); animation:jut-bounce 1.4s ease infinite; }',
    '.jut-typing span:nth-child(2) { animation-delay:0.2s; }',
    '.jut-typing span:nth-child(3) { animation-delay:0.4s; }',
    '@keyframes jut-bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }',
    '#jut-widget-input { padding:12px 14px; border-top:1px solid rgba(255,255,255,0.07); display:flex; gap:8px; background:#0a0a12; }',
    '#jut-widget-input input { flex:1; background:#1a1a2a; border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:9px 13px; color:#e0e0f0; font-size:13px; outline:none; }',
    '#jut-widget-input input::placeholder { color:rgba(255,255,255,0.3); }',
    '#jut-widget-input button { width:36px; height:36px; border-radius:10px; background:' + PRIMARY_COLOR + '; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; }',
    '#jut-powered { text-align:center; padding:6px; font-size:10px; color:rgba(255,255,255,0.2); background:#0a0a12; }',
    '#jut-powered a { color:' + PRIMARY_COLOR + '; text-decoration:none; }',
  ].join('\n');

  var style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  var btn = document.createElement('button'); btn.id = 'jut-widget-btn'; btn.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'; document.body.appendChild(btn);

  var box = document.createElement('div'); box.id = 'jut-widget-box';
  var agentInitial = AGENT_NAME.slice(0,1).toUpperCase();
  box.innerHTML = '<div id="jut-widget-header"><div class="avatar">' + agentInitial + '</div><div class="info"><div class="name">' + AGENT_NAME + '</div><div class="status"><span class="status-dot"></span>Online now</div></div><button class="close" onclick="document.getElementById('jut-widget-box').classList.remove('open');window._jutOpen=false;">x</button></div><div id="jut-widget-msgs"></div><div id="jut-widget-input"><input type="text" placeholder="Type a message..." id="jut-widget-inp"/><button onclick="window._jutSend()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button></div><div id="jut-powered">Powered by <a href="https://getjut.io" target="_blank">JUT</a></div>';
  document.body.appendChild(box);

  function addMsg(role, text) {
    var msgs = document.getElementById('jut-widget-msgs');
    var div = document.createElement('div'); div.className = 'jut-msg ' + role;
    var avatar = role === 'agent' ? '<div class="jut-msg-avatar">' + agentInitial + '</div>' : '';
    div.innerHTML = avatar + '<div class="jut-msg-bubble">' + text.replace(/</g,'&lt;') + '</div>';
    msgs.appendChild(div); msgs.scrollTop = msgs.scrollHeight;
    history.push({ role, msg: text });
  }

  function showTyping() {
    var msgs = document.getElementById('jut-widget-msgs');
    var div = document.createElement('div'); div.className = 'jut-msg agent'; div.id = 'jut-typing';
    div.innerHTML = '<div class="jut-msg-avatar">' + agentInitial + '</div><div class="jut-msg-bubble"><div class="jut-typing"><span></span><span></span><span></span></div></div>';
    msgs.appendChild(div); msgs.scrollTop = msgs.scrollHeight;
  }
  function hideTyping() { var el = document.getElementById('jut-typing'); if(el) el.remove(); }

  window._jutSend = function() {
    var inp = document.getElementById('jut-widget-inp');
    var msg = inp.value.trim(); if (!msg) return;
    inp.value = ''; addMsg('user', msg); showTyping();
    fetch(JUT_API + '/api/chat/widget', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ message:msg, widget_key:WIDGET_KEY, history:history.slice(-8), visitor_id:visitorId })
    }).then(function(r){ return r.json(); }).then(function(data){
      hideTyping();
      if(data.reply) { addMsg('agent', data.reply); if(data.agent_name && data.agent_name !== AGENT_NAME) agentInitial = data.agent_name.slice(0,1).toUpperCase(); }
      else addMsg('agent', 'Sorry, I had trouble responding. Please try again.');
    }).catch(function(){ hideTyping(); addMsg('agent','Connection error. Please try again.'); });
  };

  document.getElementById('jut-widget-inp').addEventListener('keydown', function(e){ if(e.key==='Enter') window._jutSend(); });

  btn.addEventListener('click', function(){
    isOpen = !isOpen; box.classList.toggle('open', isOpen);
    btn.innerHTML = isOpen ? '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' : '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    if(isOpen && history.length === 0) { setTimeout(function(){ addMsg('agent', WELCOME); }, 400); }
  });
})();