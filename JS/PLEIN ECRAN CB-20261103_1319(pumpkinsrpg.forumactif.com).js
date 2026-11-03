jQuery(function ($) {
  const doc = document;

  const path = window.location.pathname.replace(/\/$/, '');
  const params = new URLSearchParams(window.location.search);

  const isTopWindow = window.self === window.top;
  const isFrontIframe = params.get('page') === 'front';

  const isChatboxUrl =
    path === '/chatbox' ||
    path === '/chatbox/index.forum';

  const hasChatboxStructure =
    !!doc.querySelector('#chatbox_header, #chatbox, #chatbox_footer, #chatbox_members');

  if (!isTopWindow || isFrontIframe || !isChatboxUrl || !hasChatboxStructure) return;

  const STORAGE_KEY = 'ppk-theme-preference';
  const LEGACY_KEY = 'color-scheme';
  const VALID_THEMES = new Set(['dark', 'light', 'autumn']);
  const CB_MUTE_KEY = 'ppk-cb-muted';

  const THEME_VARS = [
    '--blanc',
    '--sor',
    '--fam',
    '--hum',
    '--rel',
    '--eve',
    '--color1',
    '--color2',
    '--color3',
    '--color3bis',
    '--color4',
    '--color5',
    '--color6',
    '--color7',
    '--color8',
    '--color9',
    '--color10',
    '--color11',
    '--color11bis',
    '--color12',
    '--color13',
    '--color14',
    '--color15',
    '--frm1',
    '--frm2',
    '--thumb',
    '--dropshadow',
    '--glass',
    '--corapide',
    '--noteBG',
    '--bonusBG',
    '--event',
    '--mmblist',
    '--cacher',
    '--cb-fond',
    '--pumpkin',
    '--cool',
    '--body-bg-image'
  ];

  const SPECIAL_USERS = {
    Pumpkin: 'pumpkin-pseudo'
  };

  const COOL_MEMBERS = new Set([
    'Pseudo 1'
    // ici les autres membres
  ]);

  const ALL_PSEUDO_CLASSES = Array.from(new Set([
    ...Object.values(SPECIAL_USERS),
    'pseudo-cool'
  ]));

  const CHATBOX_PSEUDO_SELECTOR = [
    '.chatbox-username',
    '.chatbox-message-username',
    '.chatbox-user-username',
    '.user .chatbox-username',
    '.cb_connect_name'
  ].join(', ');

  function normalizeText(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function normalizePseudo(text) {
    return String(text || '')
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function getForumTheme() {
    const attrTheme = doc.documentElement.getAttribute('data-color-scheme');
    if (VALID_THEMES.has(attrTheme)) return attrTheme;

    const savedTheme = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY);
    if (VALID_THEMES.has(savedTheme)) return savedTheme;

    return 'dark';
  }

  function isCbMuted() {
    return localStorage.getItem(CB_MUTE_KEY) === '1';
  }

  function setCbMuted(value) {
    localStorage.setItem(CB_MUTE_KEY, value ? '1' : '0');
  }

  function injectFontAwesome() {
    if (doc.getElementById('fa6-chatbox')) return;

    const l = doc.createElement('link');
    l.id = 'fa6-chatbox';
    l.rel = 'stylesheet';
    l.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css';
    doc.head.appendChild(l);
  }

  function syncSubmitIcon() {
    const submit = doc.querySelector('#submit');
    if (!submit) return;

    const currentIcon = submit.querySelector('i');
    if (currentIcon && currentIcon.classList.contains('fa-paper-plane')) return;

    submit.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
  }

  function syncSmiliesIcon() {
    const smilies = doc.querySelector('#divsmilies');
    if (!smilies) return;

    const currentIcon = smilies.querySelector('i.fa-face-grin');
    if (currentIcon) return;

    smilies.innerHTML = '<i class="fa-regular fa-face-grin"></i>';
    smilies.setAttribute('title', 'Emoticons');
    smilies.setAttribute('aria-label', 'Emoticons');
  }

  function syncJoinButtons() {
    const joinMain = doc.querySelector('.cb_connect_button span');
    if (joinMain) {
      joinMain.innerHTML = '<i class="fa-solid fa-right-to-bracket" style="margin-right:6px;"></i>Rejoindre';
    }

    const joinOption = doc.querySelector('#chatbox_option_co');
    if (joinOption) {
      joinOption.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Rejoindre';
    }

    const leaveOption = doc.querySelector('#chatbox_option_disco');
    if (leaveOption) {
      leaveOption.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i> Déconnexion';
    }
  }

  function syncChatboxTheme() {
    const theme = getForumTheme();
    const root = doc.documentElement;
    const forumStyles = window.getComputedStyle(root);

    if (root.getAttribute('data-color-scheme') !== theme) {
      root.setAttribute('data-color-scheme', theme);
    }

    const nextColorScheme = theme === 'light' ? 'light' : 'dark';
    if (root.style.colorScheme !== nextColorScheme) {
      root.style.colorScheme = nextColorScheme;
    }

    THEME_VARS.forEach(function (varName) {
      const value = forumStyles.getPropertyValue(varName);
      if (!value || !value.trim()) return;

      const cleanValue = value.trim();
      if (root.style.getPropertyValue(varName).trim() !== cleanValue) {
        root.style.setProperty(varName, cleanValue);
      }
    });

    if (doc.body) {
      doc.body.classList.add('chatbox');

      if (doc.body.getAttribute('data-color-scheme') !== theme) {
        doc.body.setAttribute('data-color-scheme', theme);
      }
    }
  }

  function forceTitle() {
    const title = doc.querySelector('#chatbox_header .chatbox-title');
    if (title && !title.textContent.trim()) {
      title.textContent = 'Candy Break ✦ Chatbox';
    }
  }

  function syncTitleLink() {
    const titleLink = doc.querySelector('#chatbox_header .chatbox-title a');
    if (!titleLink) return;

    titleLink.removeAttribute('href');
    titleLink.removeAttribute('target');
    titleLink.style.cursor = 'default';

    if (titleLink.dataset.noLinkBound === '1') return;
    titleLink.dataset.noLinkBound = '1';

    titleLink.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
    });
  }

  function injectStyles() {
    const oldStyle = doc.getElementById('cb-pop-style');
    if (oldStyle) oldStyle.remove();

    const style = doc.createElement('style');
    style.id = 'cb-pop-style';
    style.textContent = `
@font-face {
  font-family: 'Glow Night';
  src: url('https://dl.dropboxusercontent.com/scl/fi/sclz8zc7gpxg3w46p3y0w/Glow-Night.otf?rlkey=x33h8no2mt3sdqwntc78fcfb2&st=7eyj8944') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

:root {
  --blanc: #ffffff;
  --color1: #382653;
  --color2: #110327;
  --color3: #110327;
  --color3bis: rgba(17, 3, 39, 0.75);
  --color4: #B8A2E9;
  --color5: #FAF9FA;
  --color6: rgba(184, 162, 233, 0.15);
  --color7: #FAF9FA;
  --color8: rgba(56, 38, 83, 0.25);
  --color9: #B8A2E9;
  --color10: #FAF9FA;
  --color11: #382653;
  --color11bis: rgba(56, 38, 83, 0.8);
  --color12: #110327;
  --color13: rgba(184, 162, 233, 0.15);
  --color14: #B8A2E9;
  --color15: rgba(250, 249, 250, 0.1);
  --frm1: rgba(56, 38, 83, 0.25);
  --frm2: #382653;
  --thumb: rgba(184, 162, 233, 0.55);
  --dropshadow: rgba(0, 0, 0, 0.25);
  --glass: inset -2px -2px 2px rgba(184, 162, 233, 0.4);
  --cb-fond: linear-gradient(262.85deg, #1B0E32 3.19%, #231536 98.93%);
  --pumpkin: linear-gradient(180deg, #ffb36b 0%, #ff7a59 100%);
  --cool: linear-gradient(180deg, #7ad7ff 0%, #8b9dff 100%);
}

html,
body,
body.chatbox {
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  height: 100% !important;
  min-height: 100% !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
}

body,
body.chatbox {
  position: relative !important;
  background: var(--cb-fond) !important;
  color: var(--color3) !important;
}

#chatbox_header,
#chatbox_header.main-head {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  height: 43px !important;
  min-height: 43px !important;
  padding: 8px 15px !important;
  box-sizing: border-box !important;
  display: flex !important;
  align-items: flex-start !important;
  justify-content: space-between !important;
  background: var(--color2);
  z-index: 9999 !important;
  border-bottom: 1px solid var(--color8) !important;
  width: 100% !important;
}

html[data-color-scheme="dark"] #chatbox_header,
html[data-color-scheme="dark"] #chatbox_header.main-head {
  background: var(--color1) !important;
}

html[data-color-scheme="light"] #chatbox_header,
html[data-color-scheme="light"] #chatbox_header.main-head {
  background: var(--color3) !important;
}

html[data-color-scheme="light"] #submit,
html[data-color-scheme="light"] .chatbox-options a {
  background: var(--color9) !important;
}

.chatbox-title {
  margin: 0;
  font: 20px 'Glow Night';
  text-transform: uppercase;
  padding-left: 40px;
}

.chatbox-title,
.chatbox-title a {
  color: var(--blanc) !important;
  text-decoration: none !important;
}

#chatbox_header .chatbox-options,
#chatbox_header #chatbox_main_options {
  margin: 2px 0 0 0 !important;
  text-decoration: none !important;
  padding-left: 18px !important;
}

#chatbox_header #chatbox_main_options li {
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
}

#chatbox_header #chatbox_main_options a {
  color: var(--color10) !important;
  text-decoration: none !important;
}

#tab_selector_cb {
  display: none !important;
}

#chatbox_members {
  position: absolute !important;
  top: 52px !important;
  left: 0 !important;
  bottom: 64px !important;
  padding: 0px 20px;
  scrollbar-width: none;
  width: 170px !important;
  overflow: auto;
  height: 100%;
  background: transparent !important;
  box-sizing: border-box !important;
  border-right: 1px solid var(--color13) !important;
}

.chatbox-username {
  font: bold 16px Calibri !important;
}

#chatbox {
  position: absolute !important;
  top: 43px !important;
  left: 167px !important;
  right: 0 !important;
  bottom: 53px !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  box-sizing: border-box !important;
  padding: 10px 14px !important;
  font: 16px Calibri !important;
}

#chatbox > p {
  border: none !important;
  margin: 15px 0 !important;
}

#chatbox_footer {
  position: absolute !important;
  right: 0 !important;
  bottom: 0 !important;
  display: flex;
  min-height: 53px !important;
  padding: 8px !important;
  width: 100%;
  border-radius: 0 0 10px 0;
  box-sizing: border-box !important;
  background: var(--color9) !important;
  border-top: none !important;
}

#chatbox_footer #divsmilies,
#chatbox_footer #submit_button,
#chatbox_footer .format-message + label {
  background: var(--color2) !important;
  color: var(--color5) !important;
  border: 1px solid var(--color2) !important;
}

.msg span[style="color:green"] strong {
  color: var(--rel) !important;
}

.msg span[style="color:red"] strong {
  color: var(--fam) !important;
}

.msg span[style="color:undefined"] {
  color: var(--color5) !important;
}

.member-title {
  display: block;
  margin: 0;
  color: var(--color5);
  margin-top: 20px;
  font: bold 16px Calibri;
  margin-bottom: 10px;
  text-align: center;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

#chatbox_messenger_form {
  display: flex !important;
  gap: 10px;
  justify-content: flex-start;
  margin-left: 287px;
  align-items: center;
  padding-top: 0px;
  margin-top: -2px;
  flex-direction: row-reverse;
}

.chatbox-options {
  display: flex;
  gap: 10px;
  align-items: center;
  height: 100%;
}

.chatbox-options a {
  text-decoration: none;
  width: fit-content;
  height: 28px;
  display: flex;
  background: var(--color3);
  padding: 0 15px;
  border-radius: 10px;
  align-items: center;
  justify-content: center;
  color: var(--blanc);
  font: bold 16px Calibri;
  text-transform: uppercase;
}

.chatbox-options li {
  display: flex;
  align-items: center;
  font-size: 0;
  justify-content: center;
}

.chatbox-options i {
  margin-right: 5px;
  margin-left: -3px;
}

#message {
  font-weight: normal !important;
  font-style: normal !important;
  background: var(--color1) !important;
  border: none !important;
  height: 35px !important;
  border-radius: 10px !important;
  margin-right: 5px !important;
  color: var(--color5) !important;
  padding: 0 10px !important;
}

#submit {
  height: 35px !important;
  background: var(--color3) !important;
  width: 45px !important;
  border: none !important;
  border-radius: 10px !important;
  transition: 300ms ease !important;
}

#submit i {
  color: var(--blanc) !important;
}

.user-msg {
  display: block !important;
}

.user-msg .cb-meta {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  width: 100% !important;
  padding: 0 !important;
  margin: 0 !important;
}

.cb-meta-left {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  min-width: 0 !important;
}

.date-and-time {
  position: static !important;
  margin: 0 !important;
  opacity: .5 !important;
  margin-top: 7px !important;
  font: 12px Calibri !important;
  color: var(--color5) !important;
}

.user-msg .date-and-time {
  margin-top: 7px !important;
}

#help-button {
  display: none !important;
}

.format-message + label {
  width: 25px !important;
  height: 25px !important;
  display: flex !important;
  background: var(--color5) !important;
  color: var(--color1) !important;
  align-items: center !important;
  border: none;
  border-radius: 5px;
  justify-content: center !important;
}

#divsmilies {
  width: 25px !important;
  height: 25px !important;
  display: flex !important;
  background: var(--color5);
  color: var(--color1) !important;
  align-items: center !important;
  border: none;
  border-radius: 5px;
  justify-content: center !important;
}

#divsmilies i {
  color: var(--color1) !important;
  font-size: 15px !important;
  line-height: 1 !important;
}

#divsmilies img {
  display: none !important;
}

#divcolor {
  display: none !important;
}

#chatbox_messenger_form > .right-box:not(.style-buttons) {
  position: absolute;
  display: flex;
  gap: 5px;
  margin-right: 330px;
}

#chatbox .msg {
  color: var(--color5) !important;
}

.cb_connect_name {
  font: 32px 'Glow Night';
  color: var(--color5);
}

.cb_connect_avatar {
  height: 115px;
  border: none !important;
  box-shadow: var(--glass) !important;
  width: 115px;
}

.cb_connect_button {
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: center;
}

.cb_connect_button span {
  border-radius: 10px;
  color: var(--blanc);
  border: none;
  font: bold 16px Calibri;
  width: 174px;
  display: flex;
  transition: 300ms ease;
  text-transform: uppercase;
  cursor: pointer;
  background: var(--color9);
  padding: 10px 16px;
  justify-content: center;
}

.cb_connect_button span:hover {
  background: var(--color3) !important;
  transition: 300ms ease;
}

#cb-mute-toggle {
  position: absolute;
  top: 50%;
  left: 8px;
  transform: translateY(-50%);
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color3) !important;
  border: none !important;
  border-radius: 10px !important;
  cursor: pointer;
  z-index: 30;
  transition: 300ms ease !important;
}

#cb-mute-toggle:hover {
  background: var(--color1) !important;
}

#cb-mute-toggle i {
  color: var(--blanc) !important;
  font-size: 15px !important;
  line-height: 1 !important;
}

#cb-mute-toggle.is-muted {
  opacity: .65;
}

.user.cb-user-label {
  display: inline-flex !important;
  align-items: center !important;
}

.user.cb-user-label::before {
  content: none !important;
}

.user.cb-user-label.is-modo::before {
  content: "✦ " !important;
  display: inline-block;
  color: inherit;
  margin-right: 4px;
}

.chatbox-username.pumpkin-pseudo,
.cb_connect_name.pumpkin-pseudo,
.user.pumpkin-pseudo::before {
  background: var(--pumpkin);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent !important;
  -webkit-text-fill-color: transparent;
}

.chatbox-username.pseudo-cool,
.cb_connect_name.pseudo-cool,
.user.pseudo-cool::before {
  background: var(--cool);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent !important;
  -webkit-text-fill-color: transparent;
}

.cb-group-start {
  margin: 15px 0 !important;
}

#chatbox > p.cb-first-followup {
  margin-top: -20px !important;
}

.cb-md p {
  margin: 0 !important;
}

#chatbox blockquote {
  background: var(--color13);
  padding: 2px 5px;
  border-radius: 5px;
  margin: 0;
}

.ppk-cb-me {
  font-weight: bold;
  padding-left: 0;
}

.ppk-cb-me-msg {
  font-weight: bold;
  padding-left: 0 !important;
}
    `;

    doc.head.appendChild(style);
  }

  function hardLayoutReset() {
    const root = doc.documentElement;

    if (root.style.margin !== '0px') root.style.margin = '0';
    if (root.style.padding !== '0px') root.style.padding = '0';
    if (root.style.width !== '100%') root.style.width = '100%';
    if (root.style.height !== '100%') root.style.height = '100%';
    if (root.style.overflow !== 'hidden') root.style.overflow = 'hidden';

    if (doc.body) {
      if (doc.body.style.margin !== '0px') doc.body.style.margin = '0';
      if (doc.body.style.padding !== '0px') doc.body.style.padding = '0';
      if (doc.body.style.width !== '100%') doc.body.style.width = '100%';
      if (doc.body.style.height !== '100%') doc.body.style.height = '100%';
      if (doc.body.style.minHeight !== '100%') doc.body.style.minHeight = '100%';
      if (doc.body.style.overflow !== 'hidden') doc.body.style.overflow = 'hidden';
      if (doc.body.style.position !== 'relative') doc.body.style.position = 'relative';
      if (doc.body.style.background !== 'var(--color6)') doc.body.style.background = 'var(--color6)';
      if (doc.body.style.color !== 'var(--color3)') doc.body.style.color = 'var(--color3)';
    }
  }

  function isDeletedMessageRow(row) {
    if (!row) return false;

    const em = row.querySelector('.msg em');
    const msg = row.querySelector('.msg');

    const emText = normalizeText(em ? em.textContent : '');
    const msgText = normalizeText(msg ? msg.textContent : row.textContent);

    return (
      emText.includes('supprime') ||
      emText.includes('deleted') ||
      /^\[supprime/.test(msgText) ||
      /^\[deleted/.test(msgText)
    );
  }

  function removeDeletedMessages() {
    doc.querySelectorAll('#chatbox > p').forEach(function (row) {
      if (isDeletedMessageRow(row)) {
        row.remove();
      }
    });
  }

  function syncSystemMessages() {
    const joinMessages = doc.querySelectorAll('#chatbox > p .msg span[style*="color:green"] strong');
    const leaveMessages = doc.querySelectorAll('#chatbox > p .msg span[style*="color:red"] strong');

    joinMessages.forEach(function (el) {
      const text = String(el.textContent || '')
        .replace(/\u00A0/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const username = text
        .replace(/\s+a rejoint le chat.*$/i, '')
        .trim();

      const nextValue = `${username}\u00A0est arrivé·e`;

      if (username && username !== text && el.textContent !== nextValue) {
        el.textContent = nextValue;
      }
    });

    leaveMessages.forEach(function (el) {
      const text = String(el.textContent || '')
        .replace(/\u00A0/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const username = text
        .replace(/\s+(?:s['’]est déconnecté(?:e)?|a été déconnecté(?:e)?|a ete deconnecte(?:e)?|s['’]est deconnecte(?:e)?).*$/i, '')
        .trim();

      const nextValue = `${username}\u00A0est parti·e`;

      if (username && username !== text && el.textContent !== nextValue) {
        el.textContent = nextValue;
      }
    });
  }

  function syncChatTimestamps() {
    doc.querySelectorAll('.date-and-time').forEach(function (el) {
      const raw = el.textContent.trim();
      const match = raw.match(/\[?(\d{2}):(\d{2})(?::\d{2})?\]?/);
      if (!match) return;

      const nextValue = `${match[1]}:${match[2]}`;
      if (el.textContent !== nextValue) {
        el.textContent = nextValue;
      }
    });
  }

  function getModoNamesFromMemberList() {
    const names = new Set();

    doc.querySelectorAll('#chatbox_members .chatbox-username').forEach(function (nameEl) {
      const prev = nameEl.previousSibling;
      const parent = nameEl.parentNode;

      const prevText = prev && prev.nodeType === 3 ? prev.nodeValue : '';
      const ownText = nameEl.textContent || '';
      const parentText = parent ? parent.textContent || '' : '';

      const isModo =
        /[@✦]/.test(prevText) ||
        /^\s*[@✦]/.test(ownText) ||
        /^\s*[@✦]/.test(parentText) ||
        nameEl.classList.contains('is-modo-member') ||
        nameEl.dataset.isModoMember === '1';

      const username = normalizePseudo(ownText)
        .replace(/^\s*[@✦]\s*/, '')
        .replace(/\s*:\s*$/, '');

      if (!username) return;

      if (isModo) {
        names.add(username);
        nameEl.classList.add('is-modo-member');
        nameEl.dataset.isModoMember = '1';
      }

      if (prev && prev.nodeType === 3 && /[@✦]/.test(prev.nodeValue)) {
        prev.nodeValue = prev.nodeValue.replace(/[@✦]\s*/g, '✦ ');
      }

      if (/^\s*[@✦]/.test(nameEl.textContent || '')) {
        nameEl.textContent = nameEl.textContent.replace(/^\s*[@✦]\s*/, '✦ ');
      }
    });

    return names;
  }

  function applyBaseMessageLayout(row) {
    const userMsg = row.querySelector('.user-msg');
    const avatar = row.querySelector('.cb-avatar');
    const avatarImg = row.querySelector('.cb-avatar img');
    const meta = row.querySelector('.cb-meta');
    const metaLeft = row.querySelector('.cb-meta-left');
    const msg = row.querySelector('.msg');

    row.style.setProperty('clear', 'both', 'important');
    row.style.setProperty('position', 'relative', 'important');
    row.style.setProperty('margin', '0', 'important');
    row.style.setProperty('padding', '0', 'important');
    row.style.setProperty('border', '0', 'important');

    if (userMsg) {
      userMsg.style.setProperty('position', 'relative', 'important');
      userMsg.style.setProperty('display', 'block', 'important');
      userMsg.style.setProperty('min-height', '46px', 'important');
      userMsg.style.setProperty('padding', '0 0 0 54px', 'important');
      userMsg.style.setProperty('margin', '8px 0', 'important');
      userMsg.style.setProperty('box-sizing', 'border-box', 'important');
    }

    if (avatar) {
      avatar.style.setProperty('display', 'block', 'important');
      avatar.style.setProperty('float', 'none', 'important');
      avatar.style.setProperty('position', 'absolute', 'important');
      avatar.style.setProperty('left', '0', 'important');
      avatar.style.setProperty('top', '0', 'important');
      avatar.style.setProperty('width', '46px', 'important');
      avatar.style.setProperty('height', '46px', 'important');
      avatar.style.setProperty('margin', '0', 'important');
      avatar.style.setProperty('padding', '0', 'important');
      avatar.style.setProperty('border', '0', 'important');
      avatar.style.setProperty('outline', '0', 'important');
      avatar.style.setProperty('box-shadow', 'none', 'important');
      avatar.style.setProperty('background', 'transparent', 'important');
      avatar.style.setProperty('border-radius', '50%', 'important');
    }

    if (avatarImg) {
      avatarImg.style.setProperty('width', '46px', 'important');
      avatarImg.style.setProperty('height', '46px', 'important');
      avatarImg.style.setProperty('max-width', '46px', 'important');
      avatarImg.style.setProperty('max-height', '46px', 'important');
      avatarImg.style.setProperty('object-fit', 'cover', 'important');
      avatarImg.style.setProperty('border-radius', '50%', 'important');
    }

    if (meta) {
      meta.style.setProperty('display', 'flex', 'important');
      meta.style.setProperty('align-items', 'center', 'important');
      meta.style.setProperty('gap', '8px', 'important');
      meta.style.setProperty('width', 'auto', 'important');
      meta.style.setProperty('padding', '0', 'important');
      meta.style.setProperty('margin', '0 0 2px 0', 'important');
    }

    if (metaLeft) {
      metaLeft.style.setProperty('display', 'flex', 'important');
      metaLeft.style.setProperty('align-items', 'center', 'important');
      metaLeft.style.setProperty('gap', '8px', 'important');
      metaLeft.style.setProperty('min-width', '0', 'important');
    }

    if (msg) {
      msg.style.setProperty('display', 'block', 'important');
      msg.style.setProperty('margin', '0', 'important');
      msg.style.setProperty('padding', '0 0 0 3px', 'important');
      msg.style.setProperty('line-height', '18px', 'important');
    }
  }

  function applyGroupStartLayout(row) {
    const userMsg = row.querySelector('.user-msg');
    const avatar = row.querySelector('.cb-avatar');
    const user = row.querySelector('.user');
    const username = row.querySelector('.chatbox-username');
    const time = row.querySelector('.date-and-time');
    const meta = row.querySelector('.cb-meta');
    const metaLeft = row.querySelector('.cb-meta-left');
    const deleteBtn = row.querySelector('.cb_delete_msg');
    const msg = row.querySelector('.msg');

    row.style.setProperty('margin', '10px 0', 'important');

    if (userMsg) {
      userMsg.style.setProperty('display', 'block', 'important');
      userMsg.style.setProperty('min-height', '46px', 'important');
      userMsg.style.setProperty('padding-left', '54px', 'important');
    }

    if (avatar) avatar.style.setProperty('display', 'block', 'important');
    if (user) user.style.setProperty('display', 'inline-flex', 'important');
    if (username) username.style.removeProperty('display');
    if (time) time.style.removeProperty('display');
    if (meta) meta.style.setProperty('display', 'flex', 'important');
    if (metaLeft) metaLeft.style.setProperty('display', 'flex', 'important');
    if (deleteBtn) deleteBtn.style.setProperty('display', 'inline-flex', 'important');

    if (msg) {
      msg.style.setProperty('display', 'block', 'important');
      msg.style.setProperty('margin', '0', 'important');
      msg.style.setProperty('padding', '0 0 0 3px', 'important');
    }
  }

  function applyFollowupLayout(row) {
    const userMsg = row.querySelector('.user-msg');
    const msg = row.querySelector('.msg');
    const marginTop = row.classList.contains('cb-first-followup') ? '-8px' : '-2px';

    row.style.setProperty('clear', 'both', 'important');
    row.style.setProperty('position', 'relative', 'important');
    row.style.setProperty('margin', marginTop + ' 0 0 0', 'important');
    row.style.setProperty('padding', '0', 'important');
    row.style.setProperty('border', '0', 'important');

    if (userMsg) {
      userMsg.style.setProperty('display', 'block', 'important');
      userMsg.style.setProperty('min-height', '0', 'important');
      userMsg.style.setProperty('padding-left', '54px', 'important');
      userMsg.style.setProperty('margin', '8px 0', 'important');
    }

    [
      '.cb-avatar',
      '.user',
      '.chatbox-username',
      '.date-and-time',
      '.cb-meta',
      '.cb-meta-left'
    ].forEach(function (selector) {
      row.querySelectorAll(selector).forEach(function (el) {
        el.style.setProperty('display', 'none', 'important');
      });
    });

    if (msg) {
      msg.style.setProperty('display', 'block', 'important');
      msg.style.setProperty('margin', '0', 'important');
      msg.style.setProperty('padding', '0 0 0 3px', 'important');
      msg.style.setProperty('line-height', '18px', 'important');
    }
  }

  function setupDeleteButton(deleteBtn, userMsg, msg) {
    if (!deleteBtn || !userMsg || !msg) return;

    const currentDeleteIcon = deleteBtn.querySelector('i');
    if (!(currentDeleteIcon && currentDeleteIcon.classList.contains('fa-xmark'))) {
      deleteBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    }

    if (deleteBtn.parentNode !== userMsg) {
      userMsg.insertBefore(deleteBtn, msg);
    }

    deleteBtn.style.setProperty('display', 'inline-flex', 'important');
    deleteBtn.style.setProperty('align-items', 'center', 'important');
    deleteBtn.style.setProperty('justify-content', 'center', 'important');
    deleteBtn.style.setProperty('float', 'none', 'important');
    deleteBtn.style.setProperty('height', '20px', 'important');
    deleteBtn.style.setProperty('width', '20px', 'important');
    deleteBtn.style.setProperty('border', '1px solid var(--color9)', 'important');
    deleteBtn.style.setProperty('position', 'absolute', 'important');
    deleteBtn.style.setProperty('border-radius', '100%', 'important');
    deleteBtn.style.setProperty('background', 'var(--blanc)', 'important');
    deleteBtn.style.setProperty('margin', '0 0 0 94%', 'important');
    deleteBtn.style.setProperty('opacity', '0', 'important');
    deleteBtn.style.setProperty('pointer-events', 'auto', 'important');
    deleteBtn.style.setProperty('transition', 'opacity 300ms ease', 'important');
    deleteBtn.style.setProperty('z-index', '5', 'important');

    if (deleteBtn.getAttribute('aria-label') !== 'Supprimer le message') {
      deleteBtn.setAttribute('aria-label', 'Supprimer le message');
    }

    if (deleteBtn.getAttribute('title') !== 'Supprimer le message') {
      deleteBtn.setAttribute('title', 'Supprimer le message');
    }

    if (userMsg.dataset.deleteHoverBound !== '1') {
      userMsg.dataset.deleteHoverBound = '1';

      userMsg.addEventListener('mouseenter', function () {
        const btn = userMsg.querySelector('.cb_delete_msg');
        if (btn) btn.style.setProperty('opacity', '1', 'important');
      });

      userMsg.addEventListener('mouseleave', function () {
        const btn = userMsg.querySelector('.cb_delete_msg');
        if (btn) btn.style.setProperty('opacity', '0', 'important');
      });
    }
  }

  function syncDeleteButtonPositions() {
    const view = doc.defaultView || window;

    doc.querySelectorAll('#chatbox > p').forEach(function (row) {
      const userMsg = row.querySelector('.user-msg');
      const deleteBtn = row.querySelector('.cb_delete_msg');
      const msg = row.querySelector('.msg');

      if (!userMsg || !deleteBtn || !msg) return;

      const userMsgStyles = view.getComputedStyle(userMsg);
      const paddingLeft = parseFloat(userMsgStyles.paddingLeft) || 54;
      const left = Math.max(0, paddingLeft - 26);

      deleteBtn.style.setProperty('left', left + 'px', 'important');
      deleteBtn.style.setProperty('top', '18px', 'important');
    });
  }

  function syncUserMessageLayout() {
    const rows = doc.querySelectorAll('#chatbox > p');
    const modoNames = getModoNamesFromMemberList();

    rows.forEach(function (row) {
      const userMsg = row.querySelector('.user-msg');
      if (!userMsg) return;

      const avatar = userMsg.querySelector('.cb-avatar');
      const user = userMsg.querySelector('.user');
      const msg = userMsg.querySelector('.msg');
      const time = row.querySelector('.date-and-time');
      const deleteBtn = row.querySelector('.cb_delete_msg');

      if (!user || !msg || !time) return;

      let meta = userMsg.querySelector('.cb-meta');
      if (!meta) {
        meta = doc.createElement('span');
        meta.className = 'cb-meta';
        userMsg.insertBefore(meta, msg);
      } else if (meta.parentNode !== userMsg) {
        userMsg.insertBefore(meta, msg);
      }

      let metaLeft = meta.querySelector('.cb-meta-left');
      if (!metaLeft) {
        metaLeft = doc.createElement('span');
        metaLeft.className = 'cb-meta-left';
        meta.appendChild(metaLeft);
      }

      const usernameEl = user.querySelector('.chatbox-username, strong') || user;
      const markerNodes = [
        user.previousSibling,
        usernameEl.previousSibling
      ].filter(Boolean);

      const username = normalizePseudo(usernameEl.textContent)
        .replace(/^\s*[@✦]\s*/, '')
        .replace(/\s*:\s*$/, '');

      let hasModoMarker =
        user.dataset.isModo === '1' ||
        modoNames.has(username);

      markerNodes.forEach(function (node) {
        if (node.nodeType === 3 && /[@✦]/.test(node.nodeValue)) {
          hasModoMarker = true;
        }
      });

      if (
        /^\s*[@✦]/.test(user.textContent || '') ||
        /^\s*[@✦]/.test(usernameEl.textContent || '')
      ) {
        hasModoMarker = true;
      }

      markerNodes.forEach(function (node) {
        if (node.nodeType === 3) {
          node.nodeValue = node.nodeValue.replace(/[@✦]\s*/g, '');
        }
      });

      let cleaned = usernameEl.innerHTML;
      cleaned = cleaned.replace(/^\s*[@✦]\s*/, '');
      cleaned = cleaned.replace(/\s*:\s*$/, '');

      if (usernameEl.innerHTML !== cleaned) {
        usernameEl.innerHTML = cleaned;
      }

      if (hasModoMarker) {
        user.dataset.isModo = '1';
      } else {
        delete user.dataset.isModo;
      }

      user.classList.add('cb-user-label');
      user.classList.toggle('is-modo', hasModoMarker);

      if (avatar && (avatar.parentNode !== userMsg || userMsg.firstElementChild !== avatar)) {
        userMsg.insertBefore(avatar, userMsg.firstChild);
      }

      if (user.parentNode !== metaLeft) {
        metaLeft.appendChild(user);
      }

      if (time.parentNode !== metaLeft) {
        metaLeft.appendChild(time);
      }

      if (deleteBtn) {
        setupDeleteButton(deleteBtn, userMsg, msg);
      }

      applyBaseMessageLayout(row);
    });
  }

  function clearPseudoClasses(target) {
    if (!target) return;

    ALL_PSEUDO_CLASSES.forEach(function (cls) {
      target.classList.remove(cls);
    });
  }

  function computePseudoClasses(username) {
    const classes = [];

    if (SPECIAL_USERS[username]) {
      classes.push(SPECIAL_USERS[username]);
    }

    if (COOL_MEMBERS.has(username)) {
      classes.push('pseudo-cool');
    }

    return classes;
  }

  function applyPseudoClasses(el) {
    if (!el) return;

    const username = normalizePseudo(el.textContent);
    if (!username) return;

    const classes = computePseudoClasses(username);
    const userWrap = el.closest('.user');
    const targets = [el];

    if (userWrap) {
      targets.push(userWrap);
    }

    targets.forEach(function (target) {
      clearPseudoClasses(target);
      classes.forEach(function (cls) {
        target.classList.add(cls);
      });
    });
  }

  function syncChatboxPseudoClasses(root) {
    const scope = root && root.querySelectorAll ? root : doc;
    const elements = scope.querySelectorAll
      ? scope.querySelectorAll(CHATBOX_PSEUDO_SELECTOR)
      : [];

    elements.forEach(applyPseudoClasses);

    if (scope.matches && scope.matches(CHATBOX_PSEUDO_SELECTOR)) {
      applyPseudoClasses(scope);
    }
  }

  function applyCbMuteState() {
    const muted = isCbMuted();

    doc.documentElement.dataset.cbMuted = muted ? '1' : '0';

    doc.querySelectorAll('audio, video').forEach(function (media) {
      if (muted) {
        media.dataset.ppkMutedByCb = '1';
        media.muted = true;

        try {
          media.pause();
          media.currentTime = 0;
        } catch (e) {}
      } else if (media.dataset.ppkMutedByCb === '1') {
        media.muted = false;
        delete media.dataset.ppkMutedByCb;
      }
    });

    if (window._ppkCbMutePatched) return;

    const proto = window.HTMLMediaElement && window.HTMLMediaElement.prototype;
    if (!proto || !proto.play) return;

    const nativePlay = proto.play;

    proto.play = function () {
      if (isCbMuted()) {
        this._ppkMutedByCb = true;
        this.muted = true;

        try {
          this.pause();
          this.currentTime = 0;
        } catch (e) {}

        return Promise.resolve();
      }

      if (this._ppkMutedByCb) {
        this.muted = false;
        this._ppkMutedByCb = false;
      }

      return nativePlay.apply(this, arguments);
    };

    window._ppkCbMutePatched = true;
  }

  function syncMuteToggle() {
    const footer = doc.querySelector('#chatbox_footer');
    if (!footer) return;

    let btn = doc.querySelector('#cb-mute-toggle');

    if (!btn) {
      btn = doc.createElement('button');
      btn.type = 'button';
      btn.id = 'cb-mute-toggle';
      footer.appendChild(btn);
    }

    function renderMuteButton() {
      const muted = isCbMuted();

      btn.classList.toggle('is-muted', muted);
      btn.innerHTML = muted
        ? '<i class="fa-solid fa-bell-slash"></i>'
        : '<i class="fa-solid fa-bell"></i>';

      btn.setAttribute(
        'aria-label',
        muted ? 'Réactiver les notifications de la chatbox' : 'Muter les notifications de la chatbox'
      );

      btn.setAttribute(
        'title',
        muted ? 'Réactiver les notifications' : 'Muter les notifications'
      );
    }

    if (btn.dataset.bound !== '1') {
      btn.dataset.bound = '1';

      btn.addEventListener('click', function () {
        setCbMuted(!isCbMuted());
        renderMuteButton();
        applyCbMuteState();
        setTimeout(applyCbMuteState, 50);
        setTimeout(applyCbMuteState, 150);
      });
    }

    renderMuteButton();
    applyCbMuteState();
  }

  function cleanMessageUsername(value) {
    return normalizePseudo(value)
      .replace(/\u00A0/g, ' ')
      .replace(/^\s*[@✦]\s*/, '')
      .replace(/\s*:\s*$/, '')
      .replace(/\s+\d{1,2}:\d{2}.*$/, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function getMessageUsername(row) {
    if (!row) return '';

    const usernameEl =
      row.querySelector('.user .chatbox-username') ||
      row.querySelector('.chatbox-username') ||
      row.querySelector('.user strong') ||
      row.querySelector('.user');

    if (!usernameEl) return '';

    return cleanMessageUsername(usernameEl.textContent);
  }

  function isVisibleUserMessage(row) {
    if (!row || isDeletedMessageRow(row)) return false;

    const msg = row.querySelector('.msg');
    const username = getMessageUsername(row);

    if (!msg || !username) return false;

    const msgText = normalizePseudo(msg.textContent);
    const hasMedia = !!msg.querySelector('img, iframe, video, audio');

    if (!msgText && !hasMedia) return false;

    const systemMessage =
      !!row.querySelector('.msg span[style*="color:green"], .msg span[style*="color:red"]') ||
      normalizeText(msg.textContent).includes('est arrive') ||
      normalizeText(msg.textContent).includes('est parti');

    return !systemMessage;
  }

  function syncConsecutiveMessages() {
    let previousUsername = '';
    let previousUserRow = null;

    Array.from(doc.querySelectorAll('#chatbox > p')).forEach(function (row) {
      row.classList.remove('cb-followup', 'cb-group-start', 'cb-first-followup');

      if (!isVisibleUserMessage(row)) {
        previousUsername = '';
        previousUserRow = null;
        return;
      }

      const username = getMessageUsername(row);

      if (!username) {
        previousUsername = '';
        previousUserRow = null;
        return;
      }

      if (previousUsername === username) {
        row.classList.add('cb-followup');

        if (previousUserRow && previousUserRow.classList.contains('cb-group-start')) {
          row.classList.add('cb-first-followup');
        }

        applyFollowupLayout(row);
      } else {
        row.classList.add('cb-group-start');
        applyGroupStartLayout(row);
      }

      previousUsername = username;
      previousUserRow = row;
    });
  }

  function refreshChatboxUI() {
    injectFontAwesome();
    syncChatboxTheme();
    forceTitle();
    syncTitleLink();
    hardLayoutReset();
    removeDeletedMessages();
    syncSystemMessages();
    syncChatTimestamps();
    syncUserMessageLayout();
    syncConsecutiveMessages();
    syncDeleteButtonPositions();
    syncSubmitIcon();
    syncSmiliesIcon();
    syncChatboxPseudoClasses();
    syncMuteToggle();
  }

  let refreshQueued = false;
  let refreshRunning = false;

  function getChatboxObserverRoot() {
    return doc.querySelector('#chatbox') || doc.body || doc.documentElement;
  }

  function disconnectChatboxObserver() {
    if (window._ppkCbStandaloneObserver) {
      window._ppkCbStandaloneObserver.disconnect();
    }
  }

  function reconnectChatboxObserver() {
    const observerRoot = getChatboxObserverRoot();
    if (!observerRoot || !window._ppkCbStandaloneObserver) return;

    window._ppkCbStandaloneObserver.observe(observerRoot, {
      childList: true,
      subtree: true
    });
  }

  function safeRefreshChatboxUI() {
    if (refreshRunning) return;

    refreshRunning = true;
    disconnectChatboxObserver();

    try {
      refreshChatboxUI();
    } finally {
      refreshRunning = false;
      reconnectChatboxObserver();
    }
  }

  function queueRefresh() {
    if (refreshQueued || refreshRunning) return;

    refreshQueued = true;

    setTimeout(function () {
      refreshQueued = false;
      safeRefreshChatboxUI();
    }, 120);
  }

  if (window._ppkCbStandaloneObserver) {
    window._ppkCbStandaloneObserver.disconnect();
  }

  window._ppkCbStandaloneObserver = new MutationObserver(queueRefresh);

  if (window._ppkCbStandaloneStorageHandler) {
    window.removeEventListener('storage', window._ppkCbStandaloneStorageHandler);
  }

  window._ppkCbStandaloneStorageHandler = function (e) {
    if (e.key === STORAGE_KEY || e.key === LEGACY_KEY || e.key === CB_MUTE_KEY) {
      queueRefresh();
    }
  };

  window.addEventListener('storage', window._ppkCbStandaloneStorageHandler, false);

  if (window._ppkCbStandaloneThemeClickHandler) {
    document.removeEventListener('click', window._ppkCbStandaloneThemeClickHandler, true);
  }

  window._ppkCbStandaloneThemeClickHandler = function (e) {
    const btn = e.target.closest('#themeSwitch .theme-btn');
    if (!btn) return;

    setTimeout(queueRefresh, 50);
    setTimeout(queueRefresh, 150);
    setTimeout(queueRefresh, 300);
  };

  document.addEventListener('click', window._ppkCbStandaloneThemeClickHandler, true);

  injectStyles();
  safeRefreshChatboxUI();

  setTimeout(safeRefreshChatboxUI, 100);
  setTimeout(syncJoinButtons, 300);
  setTimeout(syncJoinButtons, 800);
  setTimeout(safeRefreshChatboxUI, 1000);
});