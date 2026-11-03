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

  function injectFontAwesome() {
    if (doc.getElementById('fa6-chatbox')) return;

    const link = doc.createElement('link');
    link.id = 'fa6-chatbox';
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css';
    doc.head.appendChild(link);
  }

  function setMobileVh() {
    doc.documentElement.style.setProperty('--ppk-cb-vh', `${window.innerHeight * 0.01}px`);
  }

  function normalizeText(value) {
    return String(value || '')
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function isMobile() {
    return window.matchMedia('(max-width: 680px)').matches;
  }

  function iconizeHeaderLinks() {
    if (!isMobile()) return;

    doc.querySelectorAll('#chatbox_header a').forEach(function (link) {
      const text = normalizeText(link.textContent);
      const id = link.id || '';

      if (id === 'chatbox_option_co' || text.includes('rejoindre')) {
        if (link.dataset.ppkMobileIcon !== 'join') {
          link.dataset.ppkMobileIcon = 'join';
          link.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i><span class="ppk-cb-mobile-label">Rejoindre</span>';
        }
        return;
      }

      if (id === 'chatbox_option_disco' || text.includes('deconnexion') || text.includes('déconnexion')) {
        if (link.dataset.ppkMobileIcon !== 'leave') {
          link.dataset.ppkMobileIcon = 'leave';
          link.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i><span class="ppk-cb-mobile-label">Déconnexion</span>';
        }
        return;
      }

      if (text.includes('archive')) {
        if (link.dataset.ppkMobileIcon !== 'archives') {
          link.dataset.ppkMobileIcon = 'archives';
          link.innerHTML = '<i class="fa-solid fa-box-archive"></i><span class="ppk-cb-mobile-label">Archives</span>';
        }
      }
    });
  }

  function clearInlineMemberMobileStyles() {
    const root = doc.querySelector('#chatbox_members');
    if (!root) return;

    [
      root,
      ...root.querySelectorAll('h4.member-title, .member-title, .online-users, .away-users, .online-users li, .away-users li, .online-users li > *, .away-users li > *, .chatbox-username')
    ].forEach(function (el) {
      if (!(el instanceof HTMLElement)) return;

      [
        'display',
        'visibility',
        'width',
        'height',
        'margin',
        'padding',
        'overflow',
        'overflow-x',
        'overflow-y',
        'line-height',
        'font-size',
        'position',
        'top',
        'left',
        'right',
        'bottom',
        'align-items',
        'justify-content',
        'gap',
        'flex-wrap',
        'list-style',
        'flex',
        'white-space',
        'border-right',
        'border-bottom',
        'scrollbar-width',
        'vertical-align',
        'opacity'
      ].forEach(function (prop) {
        el.style.removeProperty(prop);
      });
    });
  }

  function forceMembersMobileLayout() {
    const root = doc.querySelector('#chatbox_members');
    if (!root) return;

    if (!isMobile()) {
      clearInlineMemberMobileStyles();
      return;
    }

    root.querySelectorAll('h4.member-title, .member-title').forEach(function (title) {
      title.style.setProperty('display', 'none', 'important');
      title.style.setProperty('visibility', 'hidden', 'important');
      title.style.setProperty('width', '0', 'important');
      title.style.setProperty('height', '0', 'important');
      title.style.setProperty('margin', '0', 'important');
      title.style.setProperty('padding', '0', 'important');
      title.style.setProperty('overflow', 'hidden', 'important');
      title.style.setProperty('line-height', '0', 'important');
      title.style.setProperty('font-size', '0', 'important');
    });

    root.querySelectorAll('.away-users').forEach(function (list) {
      list.style.setProperty('opacity', '.3', 'important');
    });

    root.querySelectorAll('.online-users, .away-users').forEach(function (list) {
      list.style.setProperty('display', 'flex', 'important');
      list.style.setProperty('align-items', 'center', 'important');
      list.style.setProperty('gap', '12px', 'important');
      list.style.setProperty('flex-wrap', 'nowrap', 'important');
      list.style.setProperty('width', 'max-content', 'important');
      list.style.setProperty('margin', '0', 'important');
      list.style.setProperty('padding', '0', 'important');
      list.style.setProperty('list-style', 'none', 'important');
      list.style.setProperty('flex', '0 0 auto', 'important');
    });

    root.querySelectorAll('.online-users li, .away-users li').forEach(function (li) {
      li.style.setProperty('display', 'inline-flex', 'important');
      li.style.setProperty('align-items', 'center', 'important');
      li.style.setProperty('justify-content', 'flex-start', 'important');
      li.style.setProperty('gap', '4px', 'important');
      li.style.setProperty('flex', '0 0 auto', 'important');
      li.style.setProperty('white-space', 'nowrap', 'important');
      li.style.setProperty('margin', '0', 'important');
      li.style.setProperty('padding', '0', 'important');
      li.style.setProperty('line-height', '1.1', 'important');
      li.style.setProperty('vertical-align', 'middle', 'important');
    });

    root.querySelectorAll('.online-users li > *, .away-users li > *').forEach(function (child) {
      if (!(child instanceof HTMLElement)) return;

      child.style.setProperty('display', 'inline-flex', 'important');
      child.style.setProperty('align-items', 'center', 'important');
      child.style.setProperty('vertical-align', 'middle', 'important');
      child.style.setProperty('line-height', '1.1', 'important');
    });

    root.querySelectorAll('.chatbox-username').forEach(function (name) {
      name.style.setProperty('display', 'inline-flex', 'important');
      name.style.setProperty('align-items', 'center', 'important');
      name.style.setProperty('white-space', 'nowrap', 'important');
      name.style.setProperty('line-height', '1.1', 'important');
      name.style.setProperty('vertical-align', 'middle', 'important');
    });

    root.style.setProperty('position', 'absolute', 'important');
    root.style.setProperty('top', '48px', 'important');
    root.style.setProperty('left', '0', 'important');
    root.style.setProperty('right', '0', 'important');
    root.style.setProperty('bottom', 'auto', 'important');
    root.style.setProperty('width', '100%', 'important');
    root.style.setProperty('height', '42px', 'important');
    root.style.setProperty('padding', '0 8px', 'important');
    root.style.setProperty('display', 'flex', 'important');
    root.style.setProperty('align-items', 'center', 'important');
    root.style.setProperty('gap', '12px', 'important');
    root.style.setProperty('overflow-x', 'auto', 'important');
    root.style.setProperty('overflow-y', 'hidden', 'important');
    root.style.setProperty('white-space', 'nowrap', 'important');
    root.style.setProperty('border-right', '0', 'important');
    root.style.setProperty('border-bottom', '1px solid var(--color13)', 'important');
    root.style.setProperty('scrollbar-width', 'none', 'important');
  }

  function injectMobileCss() {
    const old = doc.getElementById('ppk-cb-mobile-fix');
    if (old) old.remove();

    const style = doc.createElement('style');
    style.id = 'ppk-cb-mobile-fix';

    style.textContent = `
html,
body,
body.chatbox {
  height: calc(var(--ppk-cb-vh, 1vh) * 100) !important;
  min-height: calc(var(--ppk-cb-vh, 1vh) * 100) !important;
}

#chatbox_members::-webkit-scrollbar {
  display: none !important;
}

@media (max-width: 680px) {
  .ppk-cb-mobile-label {
    display: none !important;
  }

  #chatbox_header,
  #chatbox_header.main-head {
    height: 48px !important;
    min-height: 48px !important;
    padding: 8px 10px !important;
    align-items: center !important;
  }

  .chatbox-title {
    padding-left: 0 !important;
    font-size: 15px !important;
    max-width: calc(100vw - 120px) !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }

  #chatbox_header .chatbox-options,
  #chatbox_header #chatbox_main_options {
    margin: 0 !important;
    padding-left: 0 !important;
    display: flex !important;
    gap: 6px !important;
    align-items: center !important;
  }

  #chatbox_header .chatbox-options a,
  #chatbox_header #chatbox_main_options a {
    width: 34px !important;
    min-width: 34px !important;
    height: 34px !important;
    padding: 0 !important;
    border-radius: 10px !important;
    font-size: 0 !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  #chatbox_header .chatbox-options a i,
  #chatbox_header #chatbox_main_options a i {
    margin: 0 !important;
    font-size: 15px !important;
  }

  #chatbox {
    top: 90px !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 58px !important;
    padding: 10px !important;
  }

  #chatbox .msg {
    overflow-wrap: anywhere !important;
    word-break: break-word !important;
  }

  #chatbox .msg img,
  #chatbox .msg iframe,
  #chatbox .msg video {
    max-width: 100% !important;
    height: auto !important;
  }

  #chatbox_footer {
    height: 58px !important;
    min-height: 58px !important;
    padding: 8px 8px 8px 50px !important;
    border-radius: 0 !important;
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
  }

  #cb-mute-toggle {
    left: 8px !important;
    width: 34px !important;
    height: 34px !important;
  }

  #chatbox_messenger_form {
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    max-width: none !important;
    min-width: 0 !important;
    height: 100% !important;
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    align-items: center !important;
    gap: 6px !important;
  }

  #message {
    flex: 1 1 auto !important;
    width: auto !important;
    min-width: 0 !important;
    max-width: 100% !important;
    height: 38px !important;
    margin: 0 !important;
    font-size: 14px !important;
    box-sizing: border-box !important;
  }

  #submit,
  #submit_button {
    display: none !important;
  }

  #chatbox_messenger_form > .right-box:not(.style-buttons) {
    position: static !important;
    margin: 0 !important;
    display: flex !important;
    align-items: center !important;
    gap: 4px !important;
    flex: 0 0 auto !important;
  }

  #divsmilies,
  .format-message + label {
    width: 28px !important;
    min-width: 28px !important;
    height: 28px !important;
    flex: 0 0 28px !important;
  }
}

@media (max-width: 430px) {
  .chatbox-title {
    font-size: 14px !important;
    max-width: calc(100vw - 112px) !important;
  }

  #message {
    font-size: 13px !important;
    padding: 0 8px !important;
  }

  .cb-avatar,
  .cb-avatar img {
    width: 38px !important;
    height: 38px !important;
    max-width: 38px !important;
    max-height: 38px !important;
  }

  .user-msg {
    padding-left: 46px !important;
  }
}
    `;

    doc.head.appendChild(style);
  }

  function refreshMobilePatch() {
    setMobileVh();
    iconizeHeaderLinks();
    forceMembersMobileLayout();
  }

  injectFontAwesome();
  injectMobileCss();
  refreshMobilePatch();

  setTimeout(refreshMobilePatch, 300);
  setTimeout(refreshMobilePatch, 800);
  setTimeout(refreshMobilePatch, 1500);
  setTimeout(refreshMobilePatch, 2500);

  window.addEventListener('resize', refreshMobilePatch);

  window.addEventListener('orientationchange', function () {
    setTimeout(refreshMobilePatch, 150);
  });
});