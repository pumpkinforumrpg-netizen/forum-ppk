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

  function setChatboxVh() {
    doc.documentElement.style.setProperty('--ppk-cb-vh', `${window.innerHeight * 0.01}px`);
  }

  setChatboxVh();
  window.addEventListener('resize', setChatboxVh);
  window.addEventListener('orientationchange', function () {
    setTimeout(setChatboxVh, 150);
  });

  const oldStyle = doc.getElementById('ppk-cb-responsive-style');
  if (oldStyle) oldStyle.remove();

  const style = doc.createElement('style');
  style.id = 'ppk-cb-responsive-style';

  style.textContent = `
html,
body,
body.chatbox {
  height: calc(var(--ppk-cb-vh, 1vh) * 100) !important;
  min-height: calc(var(--ppk-cb-vh, 1vh) * 100) !important;
}

/* TABLETTE */
@media (max-width: 900px) {
  #chatbox_members {
    width: 135px !important;
    padding: 0 10px !important;
  }

  #chatbox {
    left: 135px !important;
    padding: 10px 12px !important;
  }

  #chatbox_messenger_form {
    margin-left: 52px !important;
    width: calc(100% - 60px) !important;
    max-width: none !important;
    gap: 6px !important;
  }

  #message {
    flex: 1 1 auto !important;
    width: 100% !important;
    min-width: 0 !important;
  }

  #submit {
    flex: 0 0 45px !important;
  }

  #chatbox_messenger_form > .right-box:not(.style-buttons) {
    margin-right: 260px !important;
  }
}

/* MOBILE */
@media (max-width: 680px) {
  #chatbox_header,
  #chatbox_header.main-head {
    height: 48px !important;
    min-height: 48px !important;
    padding: 8px 10px !important;
    align-items: center !important;
  }

  .chatbox-title {
    padding-left: 0 !important;
    font-size: 16px !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    max-width: 55vw !important;
  }

  #chatbox_header .chatbox-options,
  #chatbox_header #chatbox_main_options {
    padding-left: 0 !important;
    margin: 0 !important;
    gap: 5px !important;
  }

  .chatbox-options {
    gap: 5px !important;
  }

  .chatbox-options a {
    height: 26px !important;
    padding: 0 8px !important;
    font-size: 11px !important;
    border-radius: 8px !important;
  }

  .chatbox-options i {
    margin-right: 3px !important;
    margin-left: 0 !important;
  }

  #chatbox_members {
    position: absolute !important;
    top: 48px !important;
    left: 0 !important;
    right: 0 !important;
    bottom: auto !important;
    width: 100% !important;
    height: 42px !important;
    padding: 0 8px !important;
    display: flex !important;
    align-items: center !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    white-space: nowrap !important;
    border-right: 0 !important;
    border-bottom: 1px solid var(--color13) !important;
    scrollbar-width: none !important;
  }

  #chatbox_members::-webkit-scrollbar {
    display: none !important;
  }

  #chatbox_members ul {
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
    flex-wrap: nowrap !important;
    width: max-content !important;
  }

  #chatbox_members li {
    display: inline-flex !important;
    align-items: center !important;
    flex: 0 0 auto !important;
  }

  #chatbox_members .member-title {
    display: none !important;
  }

  #chatbox_members .chatbox-username {
    font-size: 13px !important;
    white-space: nowrap !important;
  }

  #chatbox {
    top: 90px !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 64px !important;
    padding: 10px !important;
    font-size: 15px !important;
  }

  #chatbox > p {
    margin: 10px 0 !important;
  }

  .user-msg {
    max-width: 100% !important;
  }

  .user-msg .cb-meta {
    gap: 6px !important;
    max-width: 100% !important;
  }

  .cb-meta-left {
    gap: 6px !important;
    max-width: 100% !important;
  }

  .chatbox-username {
    font-size: 14px !important;
  }

  .date-and-time {
    font-size: 11px !important;
  }

  #chatbox .msg {
    font-size: 15px !important;
    line-height: 18px !important;
    overflow-wrap: anywhere !important;
    word-break: break-word !important;
  }

  #chatbox .msg img {
    max-width: 100% !important;
    height: auto !important;
  }

  #chatbox .msg iframe,
  #chatbox .msg video {
    max-width: 100% !important;
  }

  #chatbox_footer {
    height: 64px !important;
    min-height: 64px !important;
    padding: 8px 8px 8px 50px !important;
    border-radius: 0 !important;
  }

  #cb-mute-toggle {
    left: 8px !important;
    width: 34px !important;
    height: 34px !important;
  }

  #chatbox_messenger_form {
    margin-left: 0 !important;
    margin-top: 0 !important;
    padding-top: 0 !important;
    width: 100% !important;
    max-width: none !important;
    height: 100% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 6px !important;
    flex-direction: row-reverse !important;
  }

  #message {
    flex: 1 1 auto !important;
    width: 100% !important;
    min-width: 0 !important;
    max-width: none !important;
    height: 38px !important;
    margin-right: 0 !important;
    font-size: 14px !important;
  }

  #submit {
    flex: 0 0 40px !important;
    width: 40px !important;
    height: 38px !important;
  }

  #chatbox_footer #divsmilies,
  #chatbox_footer #submit_button,
  #chatbox_footer .format-message + label,
  #divsmilies,
  .format-message + label {
    width: 28px !important;
    height: 28px !important;
    min-width: 28px !important;
    flex: 0 0 28px !important;
  }

  #chatbox_messenger_form > .right-box:not(.style-buttons) {
    position: static !important;
    margin-right: 0 !important;
    display: flex !important;
    gap: 4px !important;
    flex: 0 0 auto !important;
  }

  .cb_connect_name {
    font-size: 26px !important;
    text-align: center !important;
  }

  .cb_connect_avatar {
    width: 95px !important;
    height: 95px !important;
  }

  .cb_connect_button span {
    width: auto !important;
    min-width: 150px !important;
  }
}

/* PETITS TÉLÉPHONES */
@media (max-width: 430px) {
  .chatbox-title {
    font-size: 14px !important;
    max-width: 48vw !important;
  }

  .chatbox-options a {
    padding: 0 6px !important;
    font-size: 0 !important;
    width: 28px !important;
  }

  .chatbox-options a i {
    margin: 0 !important;
    font-size: 13px !important;
  }

  #chatbox {
    bottom: 92px !important;
  }

  #chatbox_footer {
    height: 92px !important;
    min-height: 92px !important;
    padding: 8px 8px 8px 50px !important;
  }

  #chatbox_messenger_form {
    flex-wrap: wrap !important;
    align-content: center !important;
  }

  #message {
    order: 1 !important;
    flex: 1 1 100% !important;
    width: 100% !important;
  }

  #submit {
    order: 2 !important;
  }

  #chatbox_messenger_form > .right-box:not(.style-buttons) {
    order: 3 !important;
  }

  #divsmilies,
  .format-message + label {
    order: 4 !important;
  }

  .user-msg {
    padding-left: 46px !important;
  }

  .cb-avatar,
  .cb-avatar img {
    width: 38px !important;
    height: 38px !important;
    max-width: 38px !important;
    max-height: 38px !important;
  }

  #chatbox .msg {
    font-size: 14px !important;
  }
}
  `;

  doc.head.appendChild(style);
});