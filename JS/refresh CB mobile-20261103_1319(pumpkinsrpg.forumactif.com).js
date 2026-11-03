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

  let lastVisibleAt = Date.now();

  function softRefreshChatbox() {
    const chatbox = doc.querySelector('#chatbox');
    if (!chatbox) return;

    /**
     * Forumactif utilise souvent des fonctions globales pour refresh la CB.
     * Selon les versions/templates, le nom peut varier.
     */
    try {
      if (typeof window.CB_refresh === 'function') {
        window.CB_refresh();
        return;
      }

      if (typeof window.chatbox_refresh === 'function') {
        window.chatbox_refresh();
        return;
      }

      if (typeof window.refresh_chatbox === 'function') {
        window.refresh_chatbox();
        return;
      }

      if (window.chatbox && typeof window.chatbox.refresh === 'function') {
        window.chatbox.refresh();
        return;
      }
    } catch (e) {}

    const messageInput = doc.querySelector('#message');
    const isTyping = messageInput && doc.activeElement === messageInput && messageInput.value.trim();

    if (!isTyping) {
      setTimeout(function () {
        window.location.reload();
      }, 800);
    }
  }

  function handleResume() {
    const now = Date.now();
    const sleptLongEnough = now - lastVisibleAt > 30000;

    lastVisibleAt = now;

    if (!sleptLongEnough) return;

    setTimeout(softRefreshChatbox, 500);
    setTimeout(softRefreshChatbox, 2000);
  }

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
      handleResume();
    } else {
      lastVisibleAt = Date.now();
    }
  });

  window.addEventListener('pageshow', function () {
    handleResume();
  });

  window.addEventListener('focus', function () {
    handleResume();
  });
});