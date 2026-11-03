/*
 * chatbox.js — Chatbox Pumpkins, module unique (§46-§51 du cahier technique).
 *
 * Fusionné depuis 10 scripts historiques (dossier JS/, voir en-tête de
 * chaque section ci-dessous pour la provenance exacte) :
 *   - CB latérale                  → contrôleur popup (bouton + iframe)
 *   - PLEIN ECRAN CB               → rendu interne quand la CB est visitée
 *                                     en page complète (/chatbox)
 *   - RESPONSIVE CB + PATCH RESPONSIVE CB → un seul module responsive
 *   - refresh CB mobile            → refresh à la reprise d'activité
 *   - Fix SCROLL CB                → auto-scroll en bas de la CB
 *   - autoriser markdown sur la CB → rendu Markdown des messages
 *   - notif visuelle CB            → titre/favicon clignotants
 *   - notifs sonores CB            → sons + commande /sound
 *   - nom CB                       → libellé du widget chatbox
 *
 * Organisation (§46) : deux familles de code cohabitent ici volontairement
 * (fusion demandée par §48, lazy-load au clic traité séparément par
 * l'humain — §47, non implémenté ici) :
 *   (a) CONTRÔLEUR CÔTÉ FORUM : bouton, ouverture/fermeture, iframe,
 *       plein écran — s'exécute sur les pages normales du forum.
 *   (b) CODE INTERNE CHATBOX : thème, messages, markdown, scroll,
 *       notifications, titre, responsive — s'exécute sur le document de
 *       la chatbox elle-même (page complète /chatbox OU contenu de
 *       l'iframe popup, qui pointe vers la même URL).
 *
 * §50 : il n'existe plus qu'UNE SEULE redéfinition de
 * Chatbox.prototype.refresh (voir section IX), qui regroupe ce que
 * faisaient autrefois 3 wrappers empilés (markdown / notif visuelle /
 * notifs sonores).
 *
 * §51 : un seul MutationObserver "contenu" par document observe #chatbox
 * (au lieu de 3 observers distincts qui existaient avant pour le même
 * target), plus un observer "racine" léger pour détecter le remplacement
 * complet de #chatbox par Forumactif. Voir Section VI.
 */
window.PPK = window.PPK || {};

(function ($) {
  "use strict";

  if (window.PPK.chatbox && window.PPK.chatbox.__booted__) return;

  var NS = (window.PPK.chatbox = window.PPK.chatbox || {});
  NS.__booted__ = true;

  /* =================================================================
   * 0. CONSTANTES PARTAGÉES
   * ================================================================= */

  var STORAGE_KEY = "ppk-theme-preference";
  var LEGACY_KEY = "color-scheme";
  var VALID_THEMES = { dark: 1, light: 1, autumn: 1 };
  var CB_MUTE_KEY = "ppk-cb-muted";
  var FA6_URL = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css";

  var THEME_VARS = [
    "--blanc", "--sor", "--fam", "--hum", "--rel", "--eve",
    "--color1", "--color2", "--color3", "--color3bis", "--color4",
    "--color5", "--color6", "--color7", "--color8", "--color9",
    "--color10", "--color11", "--color11bis", "--color12", "--color13",
    "--color14", "--color15", "--frm1", "--frm2", "--thumb",
    "--dropshadow", "--glass", "--corapide", "--noteBG", "--bonusBG",
    "--event", "--mmblist", "--cacher", "--cb-fond", "--pumpkin",
    "--cool", "--body-bg-image"
  ];

  // À VÉRIFIER : liste à tenir à jour en même temps que la liste "officielle"
  // des pseudos spéciaux/"cool" si elle existe ailleurs dans le projet
  // (ex. un futur panneau d'admin) — dupliquée ici telle quelle depuis
  // "CB latérale" / "PLEIN ECRAN CB" (les deux fichiers avaient une copie
  // identique de ces constantes).
  var SPECIAL_USERS = { Pumpkin: "pumpkin-pseudo" };
  var COOL_MEMBERS = { "Pseudo 1": 1 /* ici les autres membres */ };
  var ALL_PSEUDO_CLASSES = ["pumpkin-pseudo", "pseudo-cool"];

  var CHATBOX_PSEUDO_SELECTOR = [
    ".chatbox-username",
    ".chatbox-message-username",
    ".chatbox-user-username",
    ".user .chatbox-username",
    ".cb_connect_name"
  ].join(", ");

  /* =================================================================
   * 1. DÉTECTION DE CONTEXTE (remplace les gardes dupliquées dans
   *    RESPONSIVE CB / PATCH RESPONSIVE CB / refresh CB mobile /
   *    PLEIN ECRAN CB, qui testaient toutes exactement la même chose)
   * ================================================================= */

  var ctxPath = window.location.pathname.replace(/\/$/, "");
  var ctxParams = new URLSearchParams(window.location.search);
  var ctxIsTopWindow = window.self === window.top;
  var ctxIsFrontIframe = ctxParams.get("page") === "front";
  var ctxIsChatboxUrl = ctxPath === "/chatbox" || ctxPath === "/chatbox/index.forum";

  function hasChatboxStructure(doc) {
    return !!doc.querySelector("#chatbox_header, #chatbox, #chatbox_footer, #chatbox_members");
  }

  // Vrai uniquement quand CE document est la page complète /chatbox
  // (visite directe), par opposition à l'iframe popup chargée avec
  // ?page=front — cas géré séparément par le contrôleur (Section II).
  var ctxIsStandaloneChatboxPage =
    ctxIsTopWindow && ctxIsChatboxUrl && !ctxIsFrontIframe && hasChatboxStructure(document);

  /* =================================================================
   * 2. UTILITAIRES GÉNÉRAUX
   * ================================================================= */

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizePseudo(text) {
    return String(text || "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isCbMuted() {
    return localStorage.getItem(CB_MUTE_KEY) === "1";
  }

  function setCbMuted(value) {
    localStorage.setItem(CB_MUTE_KEY, value ? "1" : "0");
  }

  // sourceDoc = document depuis lequel on lit le thème actif du forum
  // (le document parent quand on est appelé depuis le popup, le document
  // lui-même quand on est en page standalone).
  function getForumTheme(sourceDoc) {
    var attrTheme = sourceDoc.documentElement.getAttribute("data-color-scheme");
    if (VALID_THEMES[attrTheme]) return attrTheme;

    var savedTheme = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY);
    if (VALID_THEMES[savedTheme]) return savedTheme;

    return "dark";
  }

  function injectFontAwesome(doc) {
    if (doc.getElementById("fa6-chatbox")) return;
    var l = doc.createElement("link");
    l.id = "fa6-chatbox";
    l.rel = "stylesheet";
    l.href = FA6_URL;
    doc.head.appendChild(l);
  }

  /* =================================================================
   * 3. REGISTRE D'OBSERVERS "CONTENU" MUTUALISÉ (§51)
   *
   * Un seul MutationObserver par document écoute les changements de
   * #chatbox et prévient tous les abonnés (refresh UI, markdown,
   * auto-scroll) au lieu que chacun pose son propre observer sur la
   * même cible. Un second observer, plus léger, détecte le remplacement
   * complet du noeud #chatbox par Forumactif et re-attache le premier.
   *
   * À VÉRIFIER : l'observer "racine" ci-dessous observe doc.body (ou
   * doc.documentElement) en subtree — c'est large, mais il s'agit ici du
   * document de la CB elle-même (page /chatbox ou contenu de l'iframe),
   * pas du body de la page forum globale, donc le volume de mutations
   * réel reste faible. Si un conteneur plus précis que #chatbox existe
   * entre lui et <body> dans le gabarit réel, le cibler ici réduirait
   * encore le périmètre (§51).
   * ================================================================= */

  var contentRegistry = new WeakMap(); // doc -> { listeners, observer, rootObserver, target, queued, running }

  function getRegistryEntry(doc) {
    var entry = contentRegistry.get(doc);
    if (!entry) {
      entry = {
        listeners: [],
        observer: null,
        rootObserver: null,
        target: null,
        queued: false,
        running: false
      };
      contentRegistry.set(doc, entry);
    }
    return entry;
  }

  function runContentListeners(doc) {
    var entry = getRegistryEntry(doc);

    entry.running = true;
    if (entry.observer) entry.observer.disconnect();

    try {
      entry.listeners.forEach(function (fn) {
        try {
          fn(doc);
        } catch (e) {
          /* un listener qui échoue ne doit pas bloquer les autres */
        }
      });
    } finally {
      entry.running = false;
      bindContentObserver(doc);
    }
  }

  function queueContentRefresh(doc) {
    var entry = getRegistryEntry(doc);
    if (entry.queued || entry.running) return;

    entry.queued = true;

    setTimeout(function () {
      entry.queued = false;
      runContentListeners(doc);
    }, 100);
  }

  function bindContentObserver(doc) {
    var entry = getRegistryEntry(doc);
    var target = doc.querySelector("#chatbox");
    if (!target) return;

    if (entry.target === target && entry.observer) return;

    if (entry.observer) entry.observer.disconnect();

    entry.observer = new MutationObserver(function () {
      queueContentRefresh(doc);
    });

    entry.observer.observe(target, {
      childList: true,
      subtree: true,
      characterData: true
    });

    entry.target = target;
  }

  function bindRootObserver(doc) {
    var entry = getRegistryEntry(doc);
    if (entry.rootObserver) return;

    var root = doc.body || doc.documentElement;
    if (!root) return;

    entry.rootObserver = new MutationObserver(function () {
      var current = doc.querySelector("#chatbox");
      if (current && current !== entry.target) {
        bindContentObserver(doc);
      }
    });

    entry.rootObserver.observe(root, { childList: true, subtree: true });
  }

  // API publique du registre : on s'abonne, et le registre se charge de
  // n'avoir qu'un seul couple d'observers par document.
  function onChatboxContentChange(doc, fn) {
    var entry = getRegistryEntry(doc);
    entry.listeners.push(fn);
    bindContentObserver(doc);
    bindRootObserver(doc);
  }

  // Déclenche manuellement un passage des listeners (ex. juste après le
  // premier rendu, avant même qu'une mutation n'ait eu lieu).
  function triggerContentRefresh(doc) {
    queueContentRefresh(doc);
  }

  /* =================================================================
   * 4. MOTEUR INTERNE — mise en forme de la chatbox (§46b)
   *
   * Issu de la fusion de "CB latérale" (appliqué depuis la page parent
   * via iframe.contentDocument) et "PLEIN ECRAN CB" (appliqué
   * directement quand /chatbox est visité en page complète) : les deux
   * fichiers contenaient la même logique à ~95%, dupliquée uniquement
   * parce qu'ils s'exécutaient dans deux contextes différents. Toutes
   * les fonctions ci-dessous prennent `doc`/`win` en paramètre afin
   * d'être utilisables dans les deux cas.
   * ================================================================= */

  var CB_BASE_CSS = "\
@font-face {\
  font-family: 'Glow Night';\
  src: url('https://dl.dropboxusercontent.com/scl/fi/sclz8zc7gpxg3w46p3y0w/Glow-Night.otf?rlkey=x33h8no2mt3sdqwntc78fcfb2&st=7eyj8944') format('truetype');\
  font-weight: 400; font-style: normal; font-display: swap;\
}\
:root {\
  --blanc:#ffffff; --color1:#382653; --color2:#110327; --color3:#110327;\
  --color3bis:rgba(17,3,39,.75); --color4:#B8A2E9; --color5:#FAF9FA;\
  --color6:rgba(184,162,233,.15); --color7:#FAF9FA; --color8:rgba(56,38,83,.25);\
  --color9:#B8A2E9; --color10:#FAF9FA; --color11:#382653;\
  --color11bis:rgba(56,38,83,.8); --color12:#110327; --color13:rgba(184,162,233,.15);\
  --color14:#B8A2E9; --color15:rgba(250,249,250,.1); --frm1:rgba(56,38,83,.25);\
  --frm2:#382653; --thumb:rgba(184,162,233,.55); --dropshadow:rgba(0,0,0,.25);\
  --glass: inset -2px -2px 2px rgba(184,162,233,.4);\
  --cb-fond: linear-gradient(262.85deg, #1B0E32 3.19%, #231536 98.93%);\
  --pumpkin: linear-gradient(180deg, #ffb36b 0%, #ff7a59 100%);\
  --cool: linear-gradient(180deg, #7ad7ff 0%, #8b9dff 100%);\
}\
html, body, body.chatbox {\
  margin:0!important; padding:0!important; width:100%!important; height:100%!important;\
  min-height:100%!important; box-sizing:border-box!important; overflow:hidden!important;\
}\
body, body.chatbox { position:relative!important; background:var(--cb-fond)!important; color:var(--color3)!important; }\
#chatbox_header, #chatbox_header.main-head {\
  position:absolute!important; top:0!important; left:0!important; right:0!important;\
  height:43px!important; min-height:43px!important; padding:8px 15px!important; box-sizing:border-box!important;\
  display:flex!important; align-items:flex-start!important; justify-content:space-between!important;\
  background:var(--color2); z-index:9999!important; border-bottom:1px solid var(--color8)!important; width:100%!important;\
}\
html[data-color-scheme='dark'] #chatbox_header, html[data-color-scheme='dark'] #chatbox_header.main-head { background:var(--color1)!important; }\
html[data-color-scheme='light'] #chatbox_header, html[data-color-scheme='light'] #chatbox_header.main-head { background:var(--color3)!important; }\
html[data-color-scheme='light'] #submit, html[data-color-scheme='light'] .chatbox-options a { background:var(--color9)!important; }\
.chatbox-title { margin:0; font:20px 'Glow Night'; text-transform:uppercase; padding-left:40px; }\
.chatbox-title, .chatbox-title a { color:var(--blanc)!important; text-decoration:none!important; }\
#chatbox_header .chatbox-options, #chatbox_header #chatbox_main_options { margin:2px 0 0 0!important; text-decoration:none!important; padding-left:18px!important; }\
#chatbox_header #chatbox_main_options li { display:inline-flex!important; align-items:center!important; gap:8px!important; }\
#chatbox_header #chatbox_main_options a { color:var(--color10)!important; text-decoration:none!important; }\
#tab_selector_cb { display:none!important; }\
#chatbox_members {\
  position:absolute!important; top:52px!important; left:0!important; bottom:64px!important; padding:0px 20px;\
  scrollbar-width:none; width:170px!important; overflow:auto; height:100%; background:transparent!important;\
  box-sizing:border-box!important; border-right:1px solid var(--color13)!important;\
}\
.chatbox-username { font:bold 16px Calibri!important; }\
#chatbox {\
  position:absolute!important; top:43px!important; left:167px!important; right:0!important; bottom:53px!important;\
  overflow-y:auto!important; overflow-x:hidden!important; box-sizing:border-box!important; padding:10px 14px!important; font:16px Calibri!important;\
}\
#chatbox > p { border:none!important; margin:15px 0!important; }\
#chatbox_footer {\
  position:absolute!important; right:0!important; bottom:0!important; display:flex; min-height:53px!important;\
  padding:8px!important; width:100%; border-radius:0 0 10px 0; box-sizing:border-box!important; background:var(--color9)!important; border-top:none!important;\
}\
#chatbox_footer #divsmilies, #chatbox_footer #submit_button, #chatbox_footer .format-message + label {\
  background:var(--color2)!important; color:var(--color5)!important; border:1px solid var(--color2)!important;\
}\
.msg span[style='color:green'] strong { color:var(--rel)!important; }\
.msg span[style='color:red'] strong { color:var(--fam)!important; }\
.msg span[style='color:undefined'] { color:var(--color5)!important; }\
.member-title { display:block; margin:0; color:var(--color5); margin-top:20px; font:bold 16px Calibri; margin-bottom:10px; text-align:center; }\
ul { list-style:none; margin:0; padding:0; }\
#chatbox_messenger_form { display:flex!important; gap:10px; justify-content:flex-start; margin-left:287px; align-items:center; padding-top:0px; margin-top:-2px; flex-direction:row-reverse; }\
.chatbox-options { display:flex; gap:10px; align-items:center; height:100%; }\
.chatbox-options a { text-decoration:none; width:fit-content; height:28px; display:flex; background:var(--color3); padding:0 15px; border-radius:10px; align-items:center; justify-content:center; color:var(--blanc); font:bold 16px Calibri; text-transform:uppercase; }\
.chatbox-options li { display:flex; align-items:center; font-size:0; justify-content:center; }\
.chatbox-options i { margin-right:5px; margin-left:-3px; }\
#message { font-weight:normal!important; font-style:normal!important; background:var(--color1)!important; border:none!important; height:35px!important; border-radius:10px!important; margin-right:5px!important; color:var(--color5)!important; padding:0 10px!important; }\
#submit { height:35px!important; background:var(--color3)!important; width:45px!important; border:none!important; border-radius:10px!important; transition:300ms ease!important; }\
#submit i { color:var(--blanc)!important; }\
.user-msg { display:block!important; }\
.user-msg .cb-meta { display:flex!important; align-items:center!important; gap:8px!important; width:100%!important; padding:0!important; margin:0!important; }\
.cb-meta-left { display:flex!important; align-items:center!important; gap:8px!important; min-width:0!important; }\
.date-and-time { position:static!important; margin:0!important; opacity:.5!important; margin-top:7px!important; font:12px Calibri!important; color:var(--color5)!important; }\
.user-msg .date-and-time { margin-top:7px!important; }\
#help-button { display:none!important; }\
.format-message + label { width:25px!important; height:25px!important; display:flex!important; background:var(--color5)!important; color:var(--color1)!important; align-items:center!important; border:none; border-radius:5px; justify-content:center!important; }\
#divsmilies { width:25px!important; height:25px!important; display:flex!important; background:var(--color5); color:var(--color1)!important; align-items:center!important; border:none; border-radius:5px; justify-content:center!important; }\
#divsmilies i { color:var(--color1)!important; font-size:15px!important; line-height:1!important; }\
#divsmilies img { display:none!important; }\
#divcolor { display:none!important; }\
#chatbox_messenger_form > .right-box:not(.style-buttons) { position:absolute; display:flex; gap:5px; margin-right:330px; }\
#chatbox .msg { color:var(--color5)!important; }\
.cb_connect_name { font:32px 'Glow Night'; color:var(--color5); }\
.cb_connect_avatar { height:115px; border:none!important; box-shadow:var(--glass)!important; width:115px; }\
.cb_connect_button { display:flex; text-align:center; align-items:center; justify-content:center; }\
.cb_connect_button span { border-radius:10px; color:var(--blanc); border:none; font:bold 16px Calibri; width:174px; display:flex; transition:300ms ease; text-transform:uppercase; cursor:pointer; background:var(--color9); padding:10px 16px; justify-content:center; }\
.cb_connect_button span:hover { background:var(--color3)!important; transition:300ms ease; }\
#cb-fullscreen-toggle, #cb-mute-toggle {\
  position:absolute; top:50%; transform:translateY(-50%); width:35px; height:35px; display:flex; align-items:center;\
  justify-content:center; background:var(--color3)!important; border:none!important; border-radius:10px!important; cursor:pointer; z-index:30; transition:300ms ease!important;\
}\
#cb-fullscreen-toggle { left:8px; }\
#cb-mute-toggle { left:8px; }\
html[data-cb-has-fullscreen-btn='1'] #cb-mute-toggle { left:50px; }\
#cb-fullscreen-toggle:hover, #cb-mute-toggle:hover { background:var(--color1)!important; }\
#cb-fullscreen-toggle i, #cb-mute-toggle i { color:var(--blanc)!important; font-size:15px!important; line-height:1!important; }\
#cb-mute-toggle.is-muted { opacity:.65; }\
.user.cb-user-label { display:inline-flex!important; align-items:center!important; }\
.user.cb-user-label::before { content:none!important; }\
.user.cb-user-label.is-modo::before { content:'✦ '!important; display:inline-block; color:inherit; margin-right:4px; }\
.chatbox-username.pumpkin-pseudo, .cb_connect_name.pumpkin-pseudo, .user.pumpkin-pseudo::before { background:var(--pumpkin); -webkit-background-clip:text; background-clip:text; color:transparent!important; -webkit-text-fill-color:transparent; }\
.chatbox-username.pseudo-cool, .cb_connect_name.pseudo-cool, .user.pseudo-cool::before { background:var(--cool); -webkit-background-clip:text; background-clip:text; color:transparent!important; -webkit-text-fill-color:transparent; }\
.cb-group-start { margin:15px 0!important; }\
#chatbox > p.cb-first-followup { margin-top:-20px!important; }\
.cb-md p { margin:0!important; }\
#chatbox blockquote { background:var(--color13); padding:2px 5px; border-radius:5px; margin:0; }\
.ppk-cb-me { font-weight:bold; padding-left:0; }\
.ppk-cb-me-msg { font-weight:bold; padding-left:0!important; }\
";

  function injectBaseStyles(doc) {
    var old = doc.getElementById("cb-pop-style");
    if (old) old.remove();

    var style = doc.createElement("style");
    style.id = "cb-pop-style";
    style.textContent = CB_BASE_CSS;
    doc.head.appendChild(style);
  }

  function applyIframeTheme(doc, themeSourceDoc, win) {
    var theme = getForumTheme(themeSourceDoc);
    var forumStyles = (themeSourceDoc.defaultView || window).getComputedStyle(themeSourceDoc.documentElement);

    doc.documentElement.setAttribute("data-color-scheme", theme);
    doc.documentElement.style.colorScheme = theme === "light" ? "light" : "dark";

    THEME_VARS.forEach(function (varName) {
      var value = forumStyles.getPropertyValue(varName);
      if (value && value.trim()) {
        doc.documentElement.style.setProperty(varName, value.trim());
      }
    });

    if (doc.body) {
      doc.body.classList.add("chatbox");
      doc.body.setAttribute("data-color-scheme", theme);
    }
  }

  function forceTitle(doc) {
    var title = doc.querySelector("#chatbox_header .chatbox-title");
    if (title && !title.textContent.trim()) {
      title.textContent = "Candy Break ✦ Chatbox";
    }
  }

  function syncTitleLink(doc) {
    var titleLink = doc.querySelector("#chatbox_header .chatbox-title a");
    if (!titleLink) return;

    titleLink.removeAttribute("href");
    titleLink.removeAttribute("target");
    titleLink.style.cursor = "default";

    if (titleLink.dataset.noLinkBound === "1") return;
    titleLink.dataset.noLinkBound = "1";

    titleLink.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
    });
  }

  function hardLayoutReset(doc) {
    doc.documentElement.style.margin = "0";
    doc.documentElement.style.padding = "0";
    doc.documentElement.style.width = "100%";
    doc.documentElement.style.height = "100%";
    doc.documentElement.style.overflow = "hidden";

    if (doc.body) {
      doc.body.style.margin = "0";
      doc.body.style.padding = "0";
      doc.body.style.width = "100%";
      doc.body.style.height = "100%";
      doc.body.style.minHeight = "100%";
      doc.body.style.overflow = "hidden";
      doc.body.style.position = "relative";
      doc.body.style.background = "var(--color6)";
      doc.body.style.color = "var(--color3)";
    }
  }

  function isDeletedMessageRow(row) {
    if (!row) return false;

    var em = row.querySelector(".msg em");
    var msg = row.querySelector(".msg");

    var emText = normalizeText(em ? em.textContent : "");
    var msgText = normalizeText(msg ? msg.textContent : row.textContent);

    return (
      emText.indexOf("supprime") !== -1 ||
      emText.indexOf("deleted") !== -1 ||
      /^\[supprime/.test(msgText) ||
      /^\[deleted/.test(msgText)
    );
  }

  function removeDeletedMessages(doc) {
    doc.querySelectorAll("#chatbox > p").forEach(function (row) {
      if (isDeletedMessageRow(row)) row.remove();
    });
  }

  function syncSystemMessages(doc) {
    var joinMessages = doc.querySelectorAll('#chatbox > p .msg span[style*="color:green"] strong');
    var leaveMessages = doc.querySelectorAll('#chatbox > p .msg span[style*="color:red"] strong');

    joinMessages.forEach(function (el) {
      var text = String(el.textContent || "").replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();
      var username = text.replace(/\s+a rejoint le chat.*$/i, "").trim();
      var nextValue = username + "\u00A0est arrivé·e";

      if (username && username !== text && el.textContent !== nextValue) {
        el.textContent = nextValue;
      }
    });

    leaveMessages.forEach(function (el) {
      var text = String(el.textContent || "").replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();
      var username = text
        .replace(/\s+(?:s['’]est déconnecté(?:e)?|a été déconnecté(?:e)?|a ete deconnecte(?:e)?|s['’]est deconnecte(?:e)?).*$/i, "")
        .trim();
      var nextValue = username + "\u00A0est parti·e";

      if (username && username !== text && el.textContent !== nextValue) {
        el.textContent = nextValue;
      }
    });
  }

  function syncChatTimestamps(doc) {
    doc.querySelectorAll(".date-and-time").forEach(function (el) {
      var raw = el.textContent.trim();
      var match = raw.match(/\[?(\d{2}):(\d{2})(?::\d{2})?\]?/);
      if (!match) return;

      var nextValue = match[1] + ":" + match[2];
      if (el.textContent !== nextValue) el.textContent = nextValue;
    });
  }

  function getModoNamesFromMemberList(doc) {
    var names = {};

    doc.querySelectorAll("#chatbox_members .chatbox-username").forEach(function (nameEl) {
      var prev = nameEl.previousSibling;
      var parent = nameEl.parentNode;

      var prevText = prev && prev.nodeType === 3 ? prev.nodeValue : "";
      var ownText = nameEl.textContent || "";
      var parentText = parent ? parent.textContent || "" : "";

      var isModo =
        /[@✦]/.test(prevText) ||
        /^\s*[@✦]/.test(ownText) ||
        /^\s*[@✦]/.test(parentText) ||
        nameEl.classList.contains("is-modo-member") ||
        nameEl.dataset.isModoMember === "1";

      var username = normalizePseudo(ownText).replace(/^\s*[@✦]\s*/, "").replace(/\s*:\s*$/, "");

      if (!username) return;

      if (isModo) {
        names[username] = true;
        nameEl.classList.add("is-modo-member");
        nameEl.dataset.isModoMember = "1";
      }

      if (prev && prev.nodeType === 3 && /[@✦]/.test(prev.nodeValue)) {
        prev.nodeValue = prev.nodeValue.replace(/[@✦]\s*/g, "✦ ");
      }

      if (/^\s*[@✦]/.test(nameEl.textContent || "")) {
        nameEl.textContent = nameEl.textContent.replace(/^\s*[@✦]\s*/, "✦ ");
      }
    });

    return names;
  }

  function applyBaseMessageLayout(row) {
    var userMsg = row.querySelector(".user-msg");
    var avatar = row.querySelector(".cb-avatar");
    var avatarImg = row.querySelector(".cb-avatar img");
    var meta = row.querySelector(".cb-meta");
    var metaLeft = row.querySelector(".cb-meta-left");
    var msg = row.querySelector(".msg");

    row.style.setProperty("clear", "both", "important");
    row.style.setProperty("position", "relative", "important");
    row.style.setProperty("margin", "0", "important");
    row.style.setProperty("padding", "0", "important");
    row.style.setProperty("border", "0", "important");

    if (userMsg) {
      userMsg.style.setProperty("position", "relative", "important");
      userMsg.style.setProperty("display", "block", "important");
      userMsg.style.setProperty("min-height", "46px", "important");
      userMsg.style.setProperty("padding", "0 0 0 54px", "important");
      userMsg.style.setProperty("margin", "8px 0", "important");
      userMsg.style.setProperty("box-sizing", "border-box", "important");
    }

    if (avatar) {
      avatar.style.setProperty("display", "block", "important");
      avatar.style.setProperty("float", "none", "important");
      avatar.style.setProperty("position", "absolute", "important");
      avatar.style.setProperty("left", "0", "important");
      avatar.style.setProperty("top", "0", "important");
      avatar.style.setProperty("width", "46px", "important");
      avatar.style.setProperty("height", "46px", "important");
      avatar.style.setProperty("margin", "0", "important");
      avatar.style.setProperty("padding", "0", "important");
      avatar.style.setProperty("border", "0", "important");
      avatar.style.setProperty("outline", "0", "important");
      avatar.style.setProperty("box-shadow", "none", "important");
      avatar.style.setProperty("background", "transparent", "important");
      avatar.style.setProperty("border-radius", "50%", "important");
    }

    if (avatarImg) {
      avatarImg.style.setProperty("width", "46px", "important");
      avatarImg.style.setProperty("height", "46px", "important");
      avatarImg.style.setProperty("max-width", "46px", "important");
      avatarImg.style.setProperty("max-height", "46px", "important");
      avatarImg.style.setProperty("object-fit", "cover", "important");
      avatarImg.style.setProperty("border-radius", "50%", "important");
    }

    if (meta) {
      meta.style.setProperty("display", "flex", "important");
      meta.style.setProperty("align-items", "center", "important");
      meta.style.setProperty("gap", "8px", "important");
      meta.style.setProperty("width", "auto", "important");
      meta.style.setProperty("padding", "0", "important");
      meta.style.setProperty("margin", "0 0 2px 0", "important");
    }

    if (metaLeft) {
      metaLeft.style.setProperty("display", "flex", "important");
      metaLeft.style.setProperty("align-items", "center", "important");
      metaLeft.style.setProperty("gap", "8px", "important");
      metaLeft.style.setProperty("min-width", "0", "important");
    }

    if (msg) {
      msg.style.setProperty("display", "block", "important");
      msg.style.setProperty("margin", "0", "important");
      msg.style.setProperty("padding", "0 0 0 3px", "important");
      msg.style.setProperty("line-height", "18px", "important");
    }
  }

  function applyGroupStartLayout(row) {
    var userMsg = row.querySelector(".user-msg");
    var avatar = row.querySelector(".cb-avatar");
    var user = row.querySelector(".user");
    var username = row.querySelector(".chatbox-username");
    var time = row.querySelector(".date-and-time");
    var meta = row.querySelector(".cb-meta");
    var metaLeft = row.querySelector(".cb-meta-left");
    var deleteBtn = row.querySelector(".cb_delete_msg");
    var msg = row.querySelector(".msg");

    row.style.setProperty("margin", "10px 0", "important");

    if (userMsg) {
      userMsg.style.setProperty("display", "block", "important");
      userMsg.style.setProperty("min-height", "46px", "important");
      userMsg.style.setProperty("padding-left", "54px", "important");
    }

    if (avatar) avatar.style.setProperty("display", "block", "important");
    if (user) user.style.setProperty("display", "inline-flex", "important");
    if (username) username.style.removeProperty("display");
    if (time) time.style.removeProperty("display");
    if (meta) meta.style.setProperty("display", "flex", "important");
    if (metaLeft) metaLeft.style.setProperty("display", "flex", "important");
    if (deleteBtn) deleteBtn.style.setProperty("display", "inline-flex", "important");

    if (msg) {
      msg.style.setProperty("display", "block", "important");
      msg.style.setProperty("margin", "0", "important");
      msg.style.setProperty("padding", "0 0 0 3px", "important");
    }
  }

  function applyFollowupLayout(row) {
    var userMsg = row.querySelector(".user-msg");
    var msg = row.querySelector(".msg");
    var marginTop = row.classList.contains("cb-first-followup") ? "-8px" : "-2px";

    row.style.setProperty("clear", "both", "important");
    row.style.setProperty("position", "relative", "important");
    row.style.setProperty("margin", marginTop + " 0 0 0", "important");
    row.style.setProperty("padding", "0", "important");
    row.style.setProperty("border", "0", "important");

    if (userMsg) {
      userMsg.style.setProperty("display", "block", "important");
      userMsg.style.setProperty("min-height", "0", "important");
      userMsg.style.setProperty("padding-left", "54px", "important");
      userMsg.style.setProperty("margin", "8px 0", "important");
    }

    [".cb-avatar", ".user", ".chatbox-username", ".date-and-time", ".cb-meta", ".cb-meta-left"].forEach(function (selector) {
      row.querySelectorAll(selector).forEach(function (el) {
        el.style.setProperty("display", "none", "important");
      });
    });

    if (msg) {
      msg.style.setProperty("display", "block", "important");
      msg.style.setProperty("margin", "0", "important");
      msg.style.setProperty("padding", "0 0 0 3px", "important");
      msg.style.setProperty("line-height", "18px", "important");
    }
  }

  function setupDeleteButton(doc, deleteBtn, userMsg, msg) {
    if (!deleteBtn || !userMsg || !msg) return;

    var currentDeleteIcon = deleteBtn.querySelector("i");
    if (!(currentDeleteIcon && currentDeleteIcon.classList.contains("fa-xmark"))) {
      deleteBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    }

    if (deleteBtn.parentNode !== userMsg) {
      userMsg.insertBefore(deleteBtn, msg);
    }

    deleteBtn.style.setProperty("display", "inline-flex", "important");
    deleteBtn.style.setProperty("align-items", "center", "important");
    deleteBtn.style.setProperty("justify-content", "center", "important");
    deleteBtn.style.setProperty("float", "none", "important");
    deleteBtn.style.setProperty("height", "20px", "important");
    deleteBtn.style.setProperty("width", "20px", "important");
    deleteBtn.style.setProperty("border", "1px solid var(--color9)", "important");
    deleteBtn.style.setProperty("position", "absolute", "important");
    deleteBtn.style.setProperty("border-radius", "100%", "important");
    deleteBtn.style.setProperty("background", "var(--blanc)", "important");
    deleteBtn.style.setProperty("margin", "0 0 0 94%", "important");
    deleteBtn.style.setProperty("opacity", "0", "important");
    deleteBtn.style.setProperty("pointer-events", "auto", "important");
    deleteBtn.style.setProperty("transition", "opacity 300ms ease", "important");
    deleteBtn.style.setProperty("z-index", "5", "important");

    if (deleteBtn.getAttribute("aria-label") !== "Supprimer le message") {
      deleteBtn.setAttribute("aria-label", "Supprimer le message");
    }

    if (deleteBtn.getAttribute("title") !== "Supprimer le message") {
      deleteBtn.setAttribute("title", "Supprimer le message");
    }

    if (userMsg.dataset.deleteHoverBound !== "1") {
      userMsg.dataset.deleteHoverBound = "1";

      userMsg.addEventListener("mouseenter", function () {
        var btn = userMsg.querySelector(".cb_delete_msg");
        if (btn) btn.style.setProperty("opacity", "1", "important");
      });

      userMsg.addEventListener("mouseleave", function () {
        var btn = userMsg.querySelector(".cb_delete_msg");
        if (btn) btn.style.setProperty("opacity", "0", "important");
      });
    }
  }

  // Note : le calcul de `top` à partir de offsetTop existait dans "CB
  // latérale" mais n'était jamais utilisé (valeur toujours écrasée par
  // '18px' juste après) — code mort supprimé ici, comme c'était déjà le
  // cas dans "PLEIN ECRAN CB". Comportement final inchangé.
  function syncDeleteButtonPositions(doc) {
    var view = doc.defaultView || window;

    doc.querySelectorAll("#chatbox > p").forEach(function (row) {
      var userMsg = row.querySelector(".user-msg");
      var deleteBtn = row.querySelector(".cb_delete_msg");
      var msg = row.querySelector(".msg");

      if (!userMsg || !deleteBtn || !msg) return;

      var userMsgStyles = view.getComputedStyle(userMsg);
      var paddingLeft = parseFloat(userMsgStyles.paddingLeft) || 54;
      var left = Math.max(0, paddingLeft - 26);

      deleteBtn.style.setProperty("left", left + "px", "important");
      deleteBtn.style.setProperty("top", "18px", "important");
    });
  }

  function syncUserMessageLayout(doc) {
    var rows = doc.querySelectorAll("#chatbox > p");
    var modoNames = getModoNamesFromMemberList(doc);

    rows.forEach(function (row) {
      var userMsg = row.querySelector(".user-msg");
      if (!userMsg) return;

      var avatar = userMsg.querySelector(".cb-avatar");
      var user = userMsg.querySelector(".user");
      var msg = userMsg.querySelector(".msg");
      var time = row.querySelector(".date-and-time");
      var deleteBtn = row.querySelector(".cb_delete_msg");

      if (!user || !msg || !time) return;

      var meta = userMsg.querySelector(".cb-meta");
      if (!meta) {
        meta = doc.createElement("span");
        meta.className = "cb-meta";
        userMsg.insertBefore(meta, msg);
      } else if (meta.parentNode !== userMsg) {
        userMsg.insertBefore(meta, msg);
      }

      var metaLeft = meta.querySelector(".cb-meta-left");
      if (!metaLeft) {
        metaLeft = doc.createElement("span");
        metaLeft.className = "cb-meta-left";
        meta.appendChild(metaLeft);
      }

      var usernameEl = user.querySelector(".chatbox-username, strong") || user;
      var markerNodes = [user.previousSibling, usernameEl.previousSibling].filter(Boolean);

      var username = normalizePseudo(usernameEl.textContent).replace(/^\s*[@✦]\s*/, "").replace(/\s*:\s*$/, "");

      var hasModoMarker = user.dataset.isModo === "1" || !!modoNames[username];

      markerNodes.forEach(function (node) {
        if (node.nodeType === 3 && /[@✦]/.test(node.nodeValue)) hasModoMarker = true;
      });

      if (/^\s*[@✦]/.test(user.textContent || "") || /^\s*[@✦]/.test(usernameEl.textContent || "")) {
        hasModoMarker = true;
      }

      markerNodes.forEach(function (node) {
        if (node.nodeType === 3) node.nodeValue = node.nodeValue.replace(/[@✦]\s*/g, "");
      });

      var cleaned = usernameEl.innerHTML.replace(/^\s*[@✦]\s*/, "").replace(/\s*:\s*$/, "");
      if (usernameEl.innerHTML !== cleaned) usernameEl.innerHTML = cleaned;

      if (hasModoMarker) {
        user.dataset.isModo = "1";
      } else {
        delete user.dataset.isModo;
      }

      user.classList.add("cb-user-label");
      user.classList.toggle("is-modo", hasModoMarker);

      if (avatar && (avatar.parentNode !== userMsg || userMsg.firstElementChild !== avatar)) {
        userMsg.insertBefore(avatar, userMsg.firstChild);
      }

      if (user.parentNode !== metaLeft) metaLeft.appendChild(user);
      if (time.parentNode !== metaLeft) metaLeft.appendChild(time);

      if (deleteBtn) setupDeleteButton(doc, deleteBtn, userMsg, msg);

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
    var classes = [];
    if (SPECIAL_USERS[username]) classes.push(SPECIAL_USERS[username]);
    if (COOL_MEMBERS[username]) classes.push("pseudo-cool");
    return classes;
  }

  function applyPseudoClasses(el) {
    if (!el) return;

    var username = normalizePseudo(el.textContent);
    if (!username) return;

    var classes = computePseudoClasses(username);
    var userWrap = el.closest(".user");
    var targets = [el];
    if (userWrap) targets.push(userWrap);

    targets.forEach(function (target) {
      clearPseudoClasses(target);
      classes.forEach(function (cls) {
        target.classList.add(cls);
      });
    });
  }

  function syncChatboxPseudoClasses(doc) {
    doc.querySelectorAll(CHATBOX_PSEUDO_SELECTOR).forEach(applyPseudoClasses);
  }

  function applyCbMuteState(doc, win) {
    var muted = isCbMuted();

    doc.documentElement.dataset.cbMuted = muted ? "1" : "0";

    doc.querySelectorAll("audio, video").forEach(function (media) {
      if (muted) {
        media.dataset.ppkMutedByCb = "1";
        media.muted = true;
        try {
          media.pause();
          media.currentTime = 0;
        } catch (e) {}
      } else if (media.dataset.ppkMutedByCb === "1") {
        media.muted = false;
        delete media.dataset.ppkMutedByCb;
      }
    });

    if (!win || win._ppkCbMutePatched) return;

    var proto = win.HTMLMediaElement && win.HTMLMediaElement.prototype;
    if (!proto || !proto.play) return;

    var nativePlay = proto.play;

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

    win._ppkCbMutePatched = true;
  }

  function syncMuteToggle(doc, win) {
    var footer = doc.querySelector("#chatbox_footer");
    if (!footer) return;

    var btn = doc.querySelector("#cb-mute-toggle");

    if (!btn) {
      btn = doc.createElement("button");
      btn.type = "button";
      btn.id = "cb-mute-toggle";
      footer.appendChild(btn);
    }

    function renderMuteButton() {
      var muted = isCbMuted();

      btn.classList.toggle("is-muted", muted);
      btn.innerHTML = muted ? '<i class="fa-solid fa-bell-slash"></i>' : '<i class="fa-solid fa-bell"></i>';

      btn.setAttribute("aria-label", muted ? "Réactiver les notifications de la chatbox" : "Muter les notifications de la chatbox");
      btn.setAttribute("title", muted ? "Réactiver les notifications" : "Muter les notifications");
    }

    if (btn.dataset.bound !== "1") {
      btn.dataset.bound = "1";

      btn.addEventListener("click", function () {
        setCbMuted(!isCbMuted());
        renderMuteButton();
        applyCbMuteState(doc, win);
        setTimeout(function () { applyCbMuteState(doc, win); }, 50);
        setTimeout(function () { applyCbMuteState(doc, win); }, 150);
      });
    }

    renderMuteButton();
    applyCbMuteState(doc, win);
  }

  function cleanMessageUsername(value) {
    return normalizePseudo(value)
      .replace(/\u00A0/g, " ")
      .replace(/^\s*[@✦]\s*/, "")
      .replace(/\s*:\s*$/, "")
      .replace(/\s+\d{1,2}:\d{2}.*$/, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function getMessageUsername(row) {
    if (!row) return "";

    var usernameEl =
      row.querySelector(".user .chatbox-username") ||
      row.querySelector(".chatbox-username") ||
      row.querySelector(".user strong") ||
      row.querySelector(".user");

    if (!usernameEl) return "";

    return cleanMessageUsername(usernameEl.textContent);
  }

  function isVisibleUserMessage(row) {
    if (!row || isDeletedMessageRow(row)) return false;

    var msg = row.querySelector(".msg");
    var username = getMessageUsername(row);

    if (!msg || !username) return false;

    var msgText = normalizePseudo(msg.textContent);
    var hasMedia = !!msg.querySelector("img, iframe, video, audio");

    if (!msgText && !hasMedia) return false;

    var systemMessage =
      !!row.querySelector('.msg span[style*="color:green"], .msg span[style*="color:red"]') ||
      normalizeText(msg.textContent).indexOf("est arrive") !== -1 ||
      normalizeText(msg.textContent).indexOf("est parti") !== -1;

    return !systemMessage;
  }

  function syncConsecutiveMessages(doc) {
    var previousUsername = "";
    var previousUserRow = null;

    Array.prototype.forEach.call(doc.querySelectorAll("#chatbox > p"), function (row) {
      row.classList.remove("cb-followup", "cb-group-start", "cb-first-followup");

      if (!isVisibleUserMessage(row)) {
        previousUsername = "";
        previousUserRow = null;
        return;
      }

      var username = getMessageUsername(row);

      if (!username) {
        previousUsername = "";
        previousUserRow = null;
        return;
      }

      if (previousUsername === username) {
        row.classList.add("cb-followup");

        if (previousUserRow && previousUserRow.classList.contains("cb-group-start")) {
          row.classList.add("cb-first-followup");
        }

        applyFollowupLayout(row);
      } else {
        row.classList.add("cb-group-start");
        applyGroupStartLayout(row);
      }

      previousUsername = username;
      previousUserRow = row;
    });
  }

  function syncSubmitIcon(doc) {
    var submit = doc.querySelector("#submit");
    if (!submit) return;

    var currentIcon = submit.querySelector("i");
    if (currentIcon && currentIcon.classList.contains("fa-paper-plane")) return;

    submit.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
  }

  function syncSmiliesIcon(doc) {
    var smilies = doc.querySelector("#divsmilies");
    if (!smilies) return;

    var currentIcon = smilies.querySelector("i.fa-face-grin");
    if (currentIcon) return;

    smilies.innerHTML = '<i class="fa-regular fa-face-grin"></i>';
    smilies.setAttribute("title", "Emoticons");
    smilies.setAttribute("aria-label", "Emoticons");
  }

  function syncJoinButtons(doc) {
    var joinMain = doc.querySelector(".cb_connect_button span");
    if (joinMain) {
      joinMain.innerHTML = '<i class="fa-solid fa-right-to-bracket" style="margin-right:6px;"></i>Rejoindre';
    }

    var joinOption = doc.querySelector("#chatbox_option_co");
    if (joinOption) {
      joinOption.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Rejoindre';
    }

    var leaveOption = doc.querySelector("#chatbox_option_disco");
    if (leaveOption) {
      leaveOption.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i> Déconnexion';
    }
  }

  // Bouton plein écran — uniquement pertinent pour le popup latéral
  // (sur la page standalone /chatbox, la CB occupe déjà tout l'écran).
  function syncFullscreenToggle(doc, iframe, wrap, panel) {
    var footer = doc.querySelector("#chatbox_footer");
    if (!footer || !wrap || !panel) return;

    var btn = doc.querySelector("#cb-fullscreen-toggle");

    if (!btn) {
      btn = doc.createElement("button");
      btn.type = "button";
      btn.id = "cb-fullscreen-toggle";
      btn.innerHTML = '<i class="fa-solid fa-expand"></i>';
      btn.setAttribute("aria-label", "Agrandir la chatbox");
      btn.setAttribute("title", "Agrandir la chatbox");
      footer.appendChild(btn);
    }

    // Permet au CSS partagé de placer le bouton muet à côté (left:50px)
    // uniquement quand ce bouton plein écran existe (voir CB_BASE_CSS).
    doc.documentElement.setAttribute("data-cb-has-fullscreen-btn", "1");

    if (btn.dataset.bound === "1") return;
    btn.dataset.bound = "1";

    if (!wrap.dataset.fullscreenDefaultsSaved) {
      wrap.dataset.fullscreenDefaultsSaved = "1";
      wrap.dataset.defaultTop = wrap.style.top || "";
      wrap.dataset.defaultRight = wrap.style.right || "";
      wrap.dataset.defaultBottom = wrap.style.bottom || "210px";
      wrap.dataset.defaultLeft = wrap.style.left || "0px";
      wrap.dataset.defaultWrapHeight = wrap.style.height || "400px";
      wrap.dataset.defaultWrapWidth = wrap.style.width || "";
      wrap.dataset.defaultWrapZIndex = wrap.style.zIndex || "1000";
      panel.dataset.defaultWidth = panel.style.width || "950px";
      panel.dataset.defaultHeight = panel.style.height || "500px";
      iframe.dataset.defaultRadius = iframe.style.borderRadius || "10px";
    }

    wrap.style.transition = "top .35s ease, right .35s ease, bottom .35s ease, left .35s ease, width .35s ease, height .35s ease, z-index .35s ease";

    function enableResizeTransition() {
      panel.style.transition = "width .35s ease, height .35s ease";
      iframe.style.transition = "border-radius .35s ease";

      clearTimeout(panel._resizeTransitionTimer);
      panel._resizeTransitionTimer = setTimeout(function () {
        panel.style.transition = "";
        iframe.style.transition = "";
      }, 400);
    }

    btn.addEventListener("click", function () {
      enableResizeTransition();

      var expanded = wrap.dataset.fullscreen === "1";

      if (!expanded) {
        wrap.dataset.pageHtmlOverflow = document.documentElement.style.overflow || "";
        wrap.dataset.pageBodyOverflow = document.body.style.overflow || "";

        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";

        wrap.dataset.fullscreen = "1";
        wrap.style.top = "0";
        wrap.style.right = "0";
        wrap.style.bottom = "0";
        wrap.style.left = "0";
        wrap.style.width = "100vw";
        wrap.style.height = "100vh";
        wrap.style.zIndex = "2147483646";

        panel.style.width = "100vw";
        panel.style.height = "100vh";

        iframe.style.borderRadius = "0";

        btn.innerHTML = '<i class="fa-solid fa-compress"></i>';
        btn.setAttribute("aria-label", "Réduire la chatbox");
        btn.setAttribute("title", "Réduire la chatbox");
        return;
      }

      document.documentElement.style.overflow = wrap.dataset.pageHtmlOverflow || "";
      document.body.style.overflow = wrap.dataset.pageBodyOverflow || "";

      wrap.dataset.fullscreen = "0";
      wrap.style.top = wrap.dataset.defaultTop;
      wrap.style.right = wrap.dataset.defaultRight;
      wrap.style.bottom = wrap.dataset.defaultBottom;
      wrap.style.left = wrap.dataset.defaultLeft;
      wrap.style.width = wrap.dataset.defaultWrapWidth;
      wrap.style.height = wrap.dataset.defaultWrapHeight;
      wrap.style.zIndex = wrap.dataset.defaultWrapZIndex;

      panel.style.width = panel.dataset.defaultWidth;
      panel.style.height = panel.dataset.defaultHeight;

      iframe.style.borderRadius = iframe.dataset.defaultRadius;

      btn.innerHTML = '<i class="fa-solid fa-expand"></i>';
      btn.setAttribute("aria-label", "Agrandir la chatbox");
      btn.setAttribute("title", "Agrandir la chatbox");
    });
  }

  // Point d'entrée unique du moteur de rendu (remplace
  // refreshChatboxUI()/queueRefresh() dupliqués dans CB latérale et
  // PLEIN ECRAN CB). `fullscreenCtx` est fourni uniquement par le
  // contrôleur popup (Section 5).
  function refreshChatboxUI(doc, win, themeSourceDoc, fullscreenCtx) {
    applyIframeTheme(doc, themeSourceDoc || doc, win);
    forceTitle(doc);
    syncTitleLink(doc);
    hardLayoutReset(doc);
    removeDeletedMessages(doc);
    syncSystemMessages(doc);
    syncChatTimestamps(doc);
    syncUserMessageLayout(doc);
    syncConsecutiveMessages(doc);
    syncDeleteButtonPositions(doc);
    syncSubmitIcon(doc);
    syncSmiliesIcon(doc);
    syncChatboxPseudoClasses(doc);
    syncMuteToggle(doc, win);

    if (fullscreenCtx) {
      syncFullscreenToggle(doc, fullscreenCtx.iframe, fullscreenCtx.wrap, fullscreenCtx.panel);
    }
  }

  /* =================================================================
   * 5. CONTRÔLEUR CÔTÉ FORUM (§46a) — ex "CB latérale" + "nom CB"
   *
   * S'exécute sur les pages normales du forum : injecte le bouton +
   * l'iframe popup, et applique le moteur interne (Section 4) au
   * contenu de cette iframe une fois chargée.
   *
   * À VÉRIFIER : le fichier source "CB latérale" n'avait aucune garde
   * et s'exécutait sans condition sur toutes les pages, y compris
   * potentiellement la page /chatbox elle-même (qui aurait alors
   * contenu un popup de chatbox... à l'intérieur de la chatbox). On a
   * ajouté ci-dessous `if (ctxIsChatboxUrl) return;` pour éviter cette
   * imbrication, en supposant qu'en production Forumactif limitait déjà
   * ce script aux pages hors chatbox via le panneau d'administration
   * (ciblage de page, invisible dans le code exporté). À confirmer avec
   * l'administratrice avant mise en prod.
   * ================================================================= */

  function initForumController() {
    if (ctxIsChatboxUrl) return; // voir "À VÉRIFIER" ci-dessus

    $("body").append(
      '<div id="chatboxpop-wrap" style="overflow: visible; position: fixed; bottom: 210px; height: 400px; left: 0; z-index:1000;">' +
        '<div id="chatboxpop-panel" style="overflow: hidden; width: 950px; height: 500px; display: none; float: left;">' +
          '<iframe src="https://pumpkinsrpg.forumactif.com/chatbox/index.forum?page=front&" id="chatboxpop" scrolling="yes" ' +
            'style="border-radius: 10px; overflow: hidden; width: 100%; height: 100%; display: block;" ' +
            'marginwidth="0" marginheight="0" frameborder="0"></iframe>' +
        "</div>" +
        '<div onclick="jQuery(\'#chatboxpop-panel\').animate({width:\'toggle\'},300); jQuery(\'#chatboxopen,#chatboxclose\').toggle();" ' +
          'style="left: 0; top: 0; position: absolute; cursor: pointer; float: right;">' +
          '<div data-tip="Ouvrir la Chatbox" class="ascenseur-ppk fa-tip btn-cb btn-cb-open" id="chatboxopen"><i class="fa-solid fa-message"></i></div>' +
          '<div data-tip="Fermer la Chatbox" class="ascenseur-ppk fa-tip btn-cb btn-cb-close" id="chatboxclose" style="cursor:pointer; display:none;"><i class="fa-solid fa-xmark"></i></div>' +
        "</div>" +
      "</div>"
    );

    // ex "nom CB" : libellé du widget natif de chatbox (sidebar/portail).
    // À VÉRIFIER : sélecteur conservé tel quel ("a.chat-title") — à
    // confirmer qu'il correspond toujours à un élément du nouveau
    // gabarit HTML une fois celui-ci reconstruit.
    $("a.chat-title").text("an ea ✦ HATX");

    $("#chatboxpop").on("load", function () {
      var iframe = this;
      var doc = iframe.contentDocument || iframe.contentWindow.document;
      if (!doc) return;

      var win = iframe.contentWindow;
      var wrap = document.querySelector("#chatboxpop-wrap");
      var panel = document.querySelector("#chatboxpop-panel");
      var fullscreenCtx = { iframe: iframe, wrap: wrap, panel: panel };

      injectFontAwesome(doc);
      injectBaseStyles(doc);
      refreshChatboxUI(doc, win, document, fullscreenCtx);

      setTimeout(function () { syncJoinButtons(doc); }, 300);
      setTimeout(function () { syncJoinButtons(doc); }, 800);

      // §51 : un seul abonné "refresh UI" + un seul abonné "scroll" sur
      // le même MutationObserver mutualisé (voir Section 3), au lieu de
      // deux observers distincts qui existaient avant sur #chatbox.
      onChatboxContentChange(doc, function () {
        refreshChatboxUI(doc, win, document, fullscreenCtx);
      });
      initChatboxAutoScroll(doc); // Section 6, s'abonne aussi au registre

      // --- Propagation du thème parent → iframe (ex "CB latérale") ---
      if (iframe._cbParentThemeObserver) iframe._cbParentThemeObserver.disconnect();

      iframe._cbParentThemeObserver = new MutationObserver(function () {
        triggerContentRefresh(doc);
        refreshChatboxUI(doc, win, document, fullscreenCtx);
      });
      iframe._cbParentThemeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-color-scheme", "style", "class"]
      });

      // Ces deux gardes supplémentaires (clic sur le sélecteur de thème,
      // storage cross-onglet) existaient déjà dans "CB latérale" en plus
      // de l'observer d'attributs ci-dessus. Conservées telles quelles :
      // le recoupement avec l'observer d'attributs n'a pas été jugé
      // sûr à supprimer sans pouvoir tester en conditions réelles
      // (délai éventuel entre le clic et la mise à jour de l'attribut).
      if (iframe._cbThemeClickHandler) {
        document.removeEventListener("click", iframe._cbThemeClickHandler, true);
      }

      iframe._cbThemeClickHandler = function (e) {
        var btn = e.target.closest && e.target.closest("#themeSwitch .theme-btn");
        if (!btn) return;

        var run = function () { refreshChatboxUI(doc, win, document, fullscreenCtx); };
        requestAnimationFrame(run);
        setTimeout(run, 50);
        setTimeout(run, 150);
        setTimeout(run, 300);
      };
      document.addEventListener("click", iframe._cbThemeClickHandler, true);

      if (iframe._cbStorageHandler) {
        window.removeEventListener("storage", iframe._cbStorageHandler);
      }

      iframe._cbStorageHandler = function (e) {
        if (e.key === STORAGE_KEY || e.key === LEGACY_KEY) {
          refreshChatboxUI(doc, win, document, fullscreenCtx);
        }
      };
      window.addEventListener("storage", iframe._cbStorageHandler, false);
    });
  }

  /* =================================================================
   * 6. AUTO-SCROLL (ex "Fix SCROLL CB")
   *
   * Généralisé pour s'abonner au registre mutualisé (Section 3) plutôt
   * que de poser son propre MutationObserver sur #chatbox (§51). La
   * détection du remplacement de #chatbox est elle aussi déléguée au
   * registre (bindRootObserver), ce qui remplace l'ancien rootObserver
   * dédié de "Fix SCROLL CB".
   * ================================================================= */

  var BOTTOM_THRESHOLD = 60;
  var scrollStates = new WeakMap();

  function initChatboxAutoScroll(doc) {
    if (!doc) return;

    var win = doc.defaultView;
    if (!win) return;

    var state = scrollStates.get(doc);
    if (!state) {
      state = { chatbox: null, stickToBottom: true, autoScrolling: false, scrollHandler: null };
      scrollStates.set(doc, state);
    }

    function getChatbox() {
      return doc.querySelector("#chatbox");
    }

    function distanceFromBottom(chatbox) {
      if (!chatbox) return Infinity;
      return chatbox.scrollHeight - chatbox.scrollTop - chatbox.clientHeight;
    }

    function isNearBottom(chatbox) {
      return distanceFromBottom(chatbox) <= BOTTOM_THRESHOLD;
    }

    function scrollToBottom(force) {
      var chatbox = getChatbox();
      if (!chatbox) return;
      if (!force && !state.stickToBottom) return;

      state.autoScrolling = true;

      requestAnimationFrame(function () {
        chatbox.scrollTop = chatbox.scrollHeight;
        requestAnimationFrame(function () {
          state.autoScrolling = false;
        });
      });
    }

    function scheduleBottomRefresh() {
      if (!state.stickToBottom) return;

      // Plusieurs passages volontairement : Forumactif peut injecter les
      // messages, puis les avatars, puis modifier les dimensions quelques
      // ms plus tard.
      scrollToBottom();
      setTimeout(function () { scrollToBottom(); }, 50);
      setTimeout(function () { scrollToBottom(); }, 150);
      setTimeout(function () { scrollToBottom(); }, 350);
    }

    function bindScrollHandler(chatbox) {
      if (state.chatbox === chatbox) return;

      if (state.chatbox && state.scrollHandler) {
        state.chatbox.removeEventListener("scroll", state.scrollHandler);
      }

      state.chatbox = chatbox;
      state.stickToBottom = true;

      state.scrollHandler = function () {
        if (state.autoScrolling) return;
        state.stickToBottom = isNearBottom(chatbox);
      };

      chatbox.addEventListener("scroll", state.scrollHandler, { passive: true });

      scrollToBottom(true);
      setTimeout(function () { scrollToBottom(true); }, 100);
      setTimeout(function () { scrollToBottom(true); }, 300);
      setTimeout(function () { scrollToBottom(true); }, 800);
      setTimeout(function () { scrollToBottom(true); }, 1500);
    }

    var chatbox = getChatbox();
    if (chatbox) bindScrollHandler(chatbox);

    // S'abonne au registre mutualisé : à chaque mutation de #chatbox,
    // on re-sélectionne le noeud courant (il a pu être remplacé) puis on
    // (re)scroll si l'utilisateur était en bas.
    onChatboxContentChange(doc, function () {
      var current = getChatbox();
      if (current && current !== state.chatbox) bindScrollHandler(current);
      scheduleBottomRefresh();
    });

    if (!state.resizeBound) {
      state.resizeBound = true;

      var onResize = function () {
        if (!state.stickToBottom) return;
        setTimeout(function () { scrollToBottom(); }, 100);
      };

      win.addEventListener("resize", onResize, { passive: true });
      win.addEventListener("orientationchange", onResize, { passive: true });

      doc.addEventListener("visibilitychange", function () {
        if (doc.visibilityState === "visible" && state.stickToBottom) {
          setTimeout(function () { scrollToBottom(); }, 100);
          setTimeout(function () { scrollToBottom(); }, 400);
        }
      });

      win.addEventListener("pageshow", function () {
        if (!state.stickToBottom) return;
        setTimeout(function () { scrollToBottom(); }, 100);
      });
    }
  }

  /* =================================================================
   * 7. RESPONSIVE — fusion de "RESPONSIVE CB" + "PATCH RESPONSIVE CB"
   *    (§49)
   *
   * Ce que corrigeait le patch (identifié en comparant les deux
   * fichiers) :
   *   1. Les liens du header ("Rejoindre", "Déconnexion", "Archives")
   *      sont du texte brut généré par Forumactif. Le CSS mobile de
   *      RESPONSIVE les transforme en boutons icône (font-size:0 +
   *      largeur fixe) mais SANS JS pour injecter une icône, ces
   *      boutons restaient vides sur mobile. Le patch ajoute
   *      iconizeHeaderLinks() pour remplacer leur contenu par une
   *      icône + un libellé caché en CSS.
   *   2. La liste des membres (#chatbox_members) peut recevoir des
   *      styles injectés par Forumactif à chaque rafraîchissement, qui
   *      entraient en conflit avec le CSS mobile seul. Le patch force
   *      la mise en page via des styles inline !important
   *      (forceMembersMobileLayout) — avec un nettoyage explicite au
   *      retour au format desktop (clearInlineMemberMobileStyles), ce
   *      que le CSS seul ne peut pas faire puisqu'un style inline
   *      !important prime sur n'importe quelle media query externe.
   *   3. Le patch resserre le footer mobile (58px au lieu de 64px) et
   *      masque le bouton d'envoi sur mobile (l'envoi se fait au
   *      clavier) — comportement conservé car présent dans le patch,
   *      qui s'appliquait après RESPONSIVE dans l'ordre de chargement
   *      d'origine (le nom du fichier l'indique) et en constituait donc
   *      la version finale réellement vue par les utilisateurs.
   *
   * Fusion : une seule feuille de style, où les règles du patch sont
   * injectées APRÈS celles de RESPONSIVE (même ordre de cascade qu'avec
   * deux <style> historiquement empilés), pour ne pas avoir à
   * retrancher manuellement propriété par propriété et risquer d'en
   * oublier une.
   *
   * À VÉRIFIER : l'hypothèse d'ordre de chargement (RESPONSIVE avant
   * PATCH) n'a pas pu être confirmée en dehors du nom des fichiers —
   * si c'était l'inverse en production, les valeurs effectivement
   * vues par les utilisateurs seraient celles de RESPONSIVE et non du
   * patch pour les propriétés qui diffèrent (footer 64px vs 58px,
   * largeur max du titre, bouton d'envoi visible ou non).
   * ================================================================= */

  var RESPONSIVE_CSS_BASE = "\
html, body, body.chatbox { height: calc(var(--ppk-cb-vh, 1vh) * 100) !important; min-height: calc(var(--ppk-cb-vh, 1vh) * 100) !important; }\
#chatbox_members::-webkit-scrollbar { display: none !important; }\
@media (max-width: 900px) {\
  #chatbox_members { width: 135px !important; padding: 0 10px !important; }\
  #chatbox { left: 135px !important; padding: 10px 12px !important; }\
  #chatbox_messenger_form { margin-left: 52px !important; width: calc(100% - 60px) !important; max-width: none !important; gap: 6px !important; }\
  #message { flex: 1 1 auto !important; width: 100% !important; min-width: 0 !important; }\
  #submit { flex: 0 0 45px !important; }\
  #chatbox_messenger_form > .right-box:not(.style-buttons) { margin-right: 260px !important; }\
}\
@media (max-width: 680px) {\
  .ppk-cb-mobile-label { display: none !important; }\
  #chatbox_header, #chatbox_header.main-head { height: 48px !important; min-height: 48px !important; padding: 8px 10px !important; align-items: center !important; }\
  .chatbox-title { padding-left: 0 !important; font-size: 15px !important; max-width: calc(100vw - 120px) !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; }\
  #chatbox_header .chatbox-options, #chatbox_header #chatbox_main_options { margin: 0 !important; padding-left: 0 !important; display: flex !important; gap: 6px !important; align-items: center !important; }\
  #chatbox_header .chatbox-options a, #chatbox_header #chatbox_main_options a { width: 34px !important; min-width: 34px !important; height: 34px !important; padding: 0 !important; border-radius: 10px !important; font-size: 0 !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; }\
  #chatbox_header .chatbox-options a i, #chatbox_header #chatbox_main_options a i { margin: 0 !important; font-size: 15px !important; }\
  #chatbox_members { position: absolute !important; top: 48px !important; left: 0 !important; right: 0 !important; bottom: auto !important; width: 100% !important; height: 42px !important; padding: 0 8px !important; display: flex !important; align-items: center !important; overflow-x: auto !important; overflow-y: hidden !important; white-space: nowrap !important; border-right: 0 !important; border-bottom: 1px solid var(--color13) !important; scrollbar-width: none !important; }\
  #chatbox_members ul { display: flex !important; align-items: center !important; gap: 10px !important; flex-wrap: nowrap !important; width: max-content !important; }\
  #chatbox_members li { display: inline-flex !important; align-items: center !important; flex: 0 0 auto !important; }\
  #chatbox_members .member-title { display: none !important; }\
  #chatbox_members .chatbox-username { font-size: 13px !important; white-space: nowrap !important; }\
  #chatbox { top: 90px !important; left: 0 !important; right: 0 !important; bottom: 58px !important; padding: 10px !important; font-size: 15px !important; }\
  #chatbox > p { margin: 10px 0 !important; }\
  .user-msg { max-width: 100% !important; }\
  .user-msg .cb-meta { gap: 6px !important; max-width: 100% !important; }\
  .cb-meta-left { gap: 6px !important; max-width: 100% !important; }\
  .chatbox-username { font-size: 14px !important; }\
  .date-and-time { font-size: 11px !important; }\
  #chatbox .msg { font-size: 15px !important; line-height: 18px !important; overflow-wrap: anywhere !important; word-break: break-word !important; }\
  #chatbox .msg img, #chatbox .msg iframe, #chatbox .msg video { max-width: 100% !important; height: auto !important; }\
  #chatbox_footer { height: 58px !important; min-height: 58px !important; padding: 8px 8px 8px 50px !important; border-radius: 0 !important; display: flex !important; align-items: center !important; gap: 6px !important; }\
  #cb-mute-toggle { left: 8px !important; width: 34px !important; height: 34px !important; }\
  #chatbox_messenger_form { margin: 0 !important; padding: 0 !important; width: 100% !important; max-width: none !important; min-width: 0 !important; height: 100% !important; display: flex !important; flex-direction: row !important; flex-wrap: nowrap !important; align-items: center !important; gap: 6px !important; }\
  #message { flex: 1 1 auto !important; width: auto !important; min-width: 0 !important; max-width: 100% !important; height: 38px !important; margin: 0 !important; font-size: 14px !important; box-sizing: border-box !important; }\
  #submit, #submit_button { display: none !important; }\
  #chatbox_messenger_form > .right-box:not(.style-buttons) { position: static !important; margin: 0 !important; display: flex !important; align-items: center !important; gap: 4px !important; flex: 0 0 auto !important; }\
  #divsmilies, .format-message + label { width: 28px !important; min-width: 28px !important; height: 28px !important; flex: 0 0 28px !important; }\
  .cb_connect_name { font-size: 26px !important; text-align: center !important; }\
  .cb_connect_avatar { width: 95px !important; height: 95px !important; }\
  .cb_connect_button span { width: auto !important; min-width: 150px !important; }\
}\
@media (max-width: 430px) {\
  .chatbox-title { font-size: 14px !important; max-width: calc(100vw - 112px) !important; }\
  #message { font-size: 13px !important; padding: 0 8px !important; }\
  .cb-avatar, .cb-avatar img { width: 38px !important; height: 38px !important; max-width: 38px !important; max-height: 38px !important; }\
  .user-msg { padding-left: 46px !important; }\
  #chatbox { bottom: 92px !important; }\
  #chatbox_footer { height: 92px !important; min-height: 92px !important; padding: 8px 8px 8px 50px !important; }\
  #chatbox_messenger_form { flex-wrap: wrap !important; align-content: center !important; }\
  #submit { order: 2 !important; }\
  #chatbox_messenger_form > .right-box:not(.style-buttons) { order: 3 !important; }\
  #divsmilies, .format-message + label { order: 4 !important; }\
  #chatbox .msg { font-size: 14px !important; }\
}\
";
  // Note : les règles ci-dessus mélangent déjà, dans chaque bloc media,
  // les valeurs de RESPONSIVE CB et les overrides de PATCH RESPONSIVE CB
  // dans l'ordre d'origine (RESPONSIVE puis PATCH) — voir le commentaire
  // de section pour le détail de ce que chaque valeur corrige.
  // `.chatbox-title` à 430px garde la valeur du patch (calc(100vw-112px))
  // qui est la plus récente/précise ; `#message { order:1; flex:1 1 100%; width:100% }`
  // de RESPONSIVE à 430px n'a plus d'effet utile depuis que le patch
  // masque #submit sur mobile (l'ordre flex d'un seul élément visible ne
  // change rien) — conservé quand même pour fidélité totale au comportement
  // d'origine plutôt que de trancher qu'il est inutile.

  function setChatboxVh(doc) {
    doc.documentElement.style.setProperty("--ppk-cb-vh", (window.innerHeight * 0.01) + "px");
  }

  function injectResponsiveStyles(doc) {
    var old = doc.getElementById("ppk-cb-responsive-style");
    if (old) old.remove();

    var style = doc.createElement("style");
    style.id = "ppk-cb-responsive-style";
    style.textContent = RESPONSIVE_CSS_BASE;
    doc.head.appendChild(style);
  }

  function isMobileViewport(doc) {
    return (doc.defaultView || window).matchMedia("(max-width: 680px)").matches;
  }

  function iconizeHeaderLinks(doc) {
    if (!isMobileViewport(doc)) return;

    doc.querySelectorAll("#chatbox_header a").forEach(function (link) {
      var text = normalizeText(link.textContent);
      var id = link.id || "";

      if (id === "chatbox_option_co" || text.indexOf("rejoindre") !== -1) {
        if (link.dataset.ppkMobileIcon !== "join") {
          link.dataset.ppkMobileIcon = "join";
          link.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i><span class="ppk-cb-mobile-label">Rejoindre</span>';
        }
        return;
      }

      if (id === "chatbox_option_disco" || text.indexOf("deconnexion") !== -1 || text.indexOf("déconnexion") !== -1) {
        if (link.dataset.ppkMobileIcon !== "leave") {
          link.dataset.ppkMobileIcon = "leave";
          link.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i><span class="ppk-cb-mobile-label">Déconnexion</span>';
        }
        return;
      }

      if (text.indexOf("archive") !== -1) {
        if (link.dataset.ppkMobileIcon !== "archives") {
          link.dataset.ppkMobileIcon = "archives";
          link.innerHTML = '<i class="fa-solid fa-box-archive"></i><span class="ppk-cb-mobile-label">Archives</span>';
        }
      }
    });
  }

  var MEMBER_MOBILE_INLINE_PROPS = [
    "display", "visibility", "width", "height", "margin", "padding", "overflow",
    "overflow-x", "overflow-y", "line-height", "font-size", "position", "top",
    "left", "right", "bottom", "align-items", "justify-content", "gap",
    "flex-wrap", "list-style", "flex", "white-space", "border-right",
    "border-bottom", "scrollbar-width", "vertical-align", "opacity"
  ];

  function clearInlineMemberMobileStyles(doc) {
    var root = doc.querySelector("#chatbox_members");
    if (!root) return;

    var all = [root].concat(Array.prototype.slice.call(
      root.querySelectorAll("h4.member-title, .member-title, .online-users, .away-users, .online-users li, .away-users li, .online-users li > *, .away-users li > *, .chatbox-username")
    ));

    all.forEach(function (el) {
      if (!(el instanceof HTMLElement)) return;
      MEMBER_MOBILE_INLINE_PROPS.forEach(function (prop) {
        el.style.removeProperty(prop);
      });
    });
  }

  // Force la mise en page horizontale de la liste des membres sur
  // mobile via des styles inline !important : nécessaire car Forumactif
  // réinjecte parfois des styles qui entrent en conflit avec le CSS
  // mobile seul (voir le commentaire de section plus haut).
  function forceMembersMobileLayout(doc) {
    var root = doc.querySelector("#chatbox_members");
    if (!root) return;

    if (!isMobileViewport(doc)) {
      clearInlineMemberMobileStyles(doc);
      return;
    }

    root.querySelectorAll("h4.member-title, .member-title").forEach(function (title) {
      title.style.setProperty("display", "none", "important");
      title.style.setProperty("visibility", "hidden", "important");
      title.style.setProperty("width", "0", "important");
      title.style.setProperty("height", "0", "important");
      title.style.setProperty("margin", "0", "important");
      title.style.setProperty("padding", "0", "important");
      title.style.setProperty("overflow", "hidden", "important");
      title.style.setProperty("line-height", "0", "important");
      title.style.setProperty("font-size", "0", "important");
    });

    root.querySelectorAll(".away-users").forEach(function (list) {
      list.style.setProperty("opacity", ".3", "important");
    });

    root.querySelectorAll(".online-users, .away-users").forEach(function (list) {
      list.style.setProperty("display", "flex", "important");
      list.style.setProperty("align-items", "center", "important");
      list.style.setProperty("gap", "12px", "important");
      list.style.setProperty("flex-wrap", "nowrap", "important");
      list.style.setProperty("width", "max-content", "important");
      list.style.setProperty("margin", "0", "important");
      list.style.setProperty("padding", "0", "important");
      list.style.setProperty("list-style", "none", "important");
      list.style.setProperty("flex", "0 0 auto", "important");
    });

    root.querySelectorAll(".online-users li, .away-users li").forEach(function (li) {
      li.style.setProperty("display", "inline-flex", "important");
      li.style.setProperty("align-items", "center", "important");
      li.style.setProperty("justify-content", "flex-start", "important");
      li.style.setProperty("gap", "4px", "important");
      li.style.setProperty("flex", "0 0 auto", "important");
      li.style.setProperty("white-space", "nowrap", "important");
      li.style.setProperty("margin", "0", "important");
      li.style.setProperty("padding", "0", "important");
      li.style.setProperty("line-height", "1.1", "important");
      li.style.setProperty("vertical-align", "middle", "important");
    });

    root.querySelectorAll(".online-users li > *, .away-users li > *").forEach(function (child) {
      if (!(child instanceof HTMLElement)) return;
      child.style.setProperty("display", "inline-flex", "important");
      child.style.setProperty("align-items", "center", "important");
      child.style.setProperty("vertical-align", "middle", "important");
      child.style.setProperty("line-height", "1.1", "important");
    });

    root.querySelectorAll(".chatbox-username").forEach(function (name) {
      name.style.setProperty("display", "inline-flex", "important");
      name.style.setProperty("align-items", "center", "important");
      name.style.setProperty("white-space", "nowrap", "important");
      name.style.setProperty("line-height", "1.1", "important");
      name.style.setProperty("vertical-align", "middle", "important");
    });

    root.style.setProperty("position", "absolute", "important");
    root.style.setProperty("top", "48px", "important");
    root.style.setProperty("left", "0", "important");
    root.style.setProperty("right", "0", "important");
    root.style.setProperty("bottom", "auto", "important");
    root.style.setProperty("width", "100%", "important");
    root.style.setProperty("height", "42px", "important");
    root.style.setProperty("padding", "0 8px", "important");
    root.style.setProperty("display", "flex", "important");
    root.style.setProperty("align-items", "center", "important");
    root.style.setProperty("gap", "12px", "important");
    root.style.setProperty("overflow-x", "auto", "important");
    root.style.setProperty("overflow-y", "hidden", "important");
    root.style.setProperty("white-space", "nowrap", "important");
    root.style.setProperty("border-right", "0", "important");
    root.style.setProperty("border-bottom", "1px solid var(--color13)", "important");
    root.style.setProperty("scrollbar-width", "none", "important");
  }

  function refreshResponsive(doc) {
    setChatboxVh(doc);
    iconizeHeaderLinks(doc);
    forceMembersMobileLayout(doc);
  }

  function initResponsive(doc) {
    injectFontAwesome(doc);
    injectResponsiveStyles(doc);
    refreshResponsive(doc);

    setTimeout(function () { refreshResponsive(doc); }, 300);
    setTimeout(function () { refreshResponsive(doc); }, 800);
    setTimeout(function () { refreshResponsive(doc); }, 1500);
    setTimeout(function () { refreshResponsive(doc); }, 2500);

    var win = doc.defaultView || window;
    win.addEventListener("resize", function () { refreshResponsive(doc); });
    win.addEventListener("orientationchange", function () {
      setTimeout(function () { refreshResponsive(doc); }, 150);
    });
  }

  /* =================================================================
   * 8. REFRESH À LA REPRISE D'ACTIVITÉ (ex "refresh CB mobile")
   * ================================================================= */

  function initResumeRefresh(doc) {
    var win = doc.defaultView || window;
    var lastVisibleAt = Date.now();

    function softRefreshChatbox() {
      var chatbox = doc.querySelector("#chatbox");
      if (!chatbox) return;

      try {
        if (typeof win.CB_refresh === "function") { win.CB_refresh(); return; }
        if (typeof win.chatbox_refresh === "function") { win.chatbox_refresh(); return; }
        if (typeof win.refresh_chatbox === "function") { win.refresh_chatbox(); return; }
        if (win.chatbox && typeof win.chatbox.refresh === "function") { win.chatbox.refresh(); return; }
      } catch (e) {}

      var messageInput = doc.querySelector("#message");
      var isTyping = messageInput && doc.activeElement === messageInput && messageInput.value.trim();

      if (!isTyping) {
        setTimeout(function () { win.location.reload(); }, 800);
      }
    }

    function handleResume() {
      var now = Date.now();
      var sleptLongEnough = now - lastVisibleAt > 30000;

      lastVisibleAt = now;

      if (!sleptLongEnough) return;

      setTimeout(softRefreshChatbox, 500);
      setTimeout(softRefreshChatbox, 2000);
    }

    doc.addEventListener("visibilitychange", function () {
      if (doc.visibilityState === "visible") {
        handleResume();
      } else {
        lastVisibleAt = Date.now();
      }
    });

    win.addEventListener("pageshow", handleResume);
    win.addEventListener("focus", handleResume);
  }

  /* =================================================================
   * 9. MARKDOWN (ex "autoriser markdown sur la CB")
   *
   * §1/§51 : l'ancien script combinait un MutationObserver ET un
   * setInterval(1200ms) qui, à chaque tick, re-rendait tous les
   * messages, re-tentait de patcher Chatbox.prototype.refresh et
   * re-vérifiait si #chatbox avait été remplacé. Verdict de l'audit :
   * - le re-rendu périodique est redondant avec le MutationObserver
   *   mutualisé (Section 3), qui se déclenche déjà à chaque changement
   *   réel du contenu ;
   * - la re-vérification du remplacement de #chatbox est maintenant
   *   gérée par le rootObserver du registre (Section 3) ;
   * - seul le besoin de "re-tenter de patcher Chatbox.prototype.refresh
   *   tant qu'il n'est pas prêt" est légitime (Chatbox peut ne pas être
   *   encore défini au moment où ce script tourne) : conservé, mais
   *   sous forme d'un nombre borné de tentatives (voir Section 11)
   *   plutôt qu'un setInterval perpétuel.
   * Le setInterval original est donc supprimé ici, pas seulement
   * "allégé" : l'observer + le registre couvrent déjà entièrement son
   * rôle de déclenchement de rendu.
   * ================================================================= */

  var MARKED_URL = "https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js";
  var DOMPURIFY_URL = "https://cdn.jsdelivr.net/npm/dompurify@3.0.9/dist/purify.min.js";

  var MARKDOWN_CSS = "\
#chatbox .msg .cb-md { display: block; overflow-wrap: anywhere; word-break: normal; }\
#chatbox .msg .cb-md p { margin: 0 0 4px 0 !important; padding: 0 !important; }\
#chatbox .msg .cb-md p:last-child { margin-bottom: 0 !important; }\
#chatbox .msg .cb-md strong { font-weight: 700 !important; }\
#chatbox .msg .cb-md em { font-style: italic !important; }\
#chatbox .msg .cb-md s, #chatbox .msg .cb-md del { text-decoration: line-through !important; }\
#chatbox .msg .cb-md a { color: var(--color9) !important; text-decoration: underline !important; }\
#chatbox .msg .cb-md code { display: inline-block; max-width: 100%; background: var(--color8) !important; color: var(--color5) !important; border-radius: 4px; padding: 1px 5px; font-family: Consolas, Monaco, monospace; font-size: 0.9em; line-height: 1.35; vertical-align: baseline; }\
#chatbox .msg .cb-md pre { margin: 5px 0 !important; padding: 7px 9px !important; background: var(--color8) !important; border-radius: 8px; overflow-x: auto; white-space: pre-wrap; }\
#chatbox .msg .cb-md pre code { display: block; padding: 0; background: transparent !important; border-radius: 0; }\
#chatbox .msg .cb-md blockquote { margin: 5px 0 !important; padding: 2px 0 2px 10px !important; border-left: 2px solid var(--color9); opacity: 0.9; }\
#chatbox .msg .cb-md ul { list-style: disc !important; margin: 4px 0 4px 20px !important; padding: 0 !important; }\
#chatbox .msg .cb-md ol { list-style: decimal !important; margin: 4px 0 4px 20px !important; padding: 0 !important; }\
#chatbox .msg .cb-md li { margin: 2px 0 !important; padding: 0 !important; }\
#chatbox .msg .cb-md h1, #chatbox .msg .cb-md h2, #chatbox .msg .cb-md h3, #chatbox .msg .cb-md h4, #chatbox .msg .cb-md h5, #chatbox .msg .cb-md h6 { margin: 3px 0 !important; padding: 0 !important; font-size: 1em !important; line-height: 1.2 !important; font-weight: 700 !important; }\
#chatbox .msg .cb-md img { max-height: 22px; vertical-align: middle; }\
#chatbox > p.ppk-cb-me-row { margin: 0 !important; padding: 0 !important; text-align: left !important; clear: both !important; }\
#chatbox > p.ppk-cb-me-row .date-and-time, #chatbox > p.ppk-cb-me-row .user-msg, #chatbox > p.ppk-cb-me-row .username, #chatbox > p.ppk-cb-me-row .chatbox-username, #chatbox > p.ppk-cb-me-row .avatar, #chatbox > p.ppk-cb-me-row > img { display: none !important; }\
#chatbox > p.ppk-cb-me-row .msg, #chatbox > p.ppk-cb-me-row .ppk-cb-me-msg { display: block !important; margin: 0 !important; padding: 0 !important; margin-left: 0 !important; padding-left: 0 !important; text-indent: 0 !important; float: none !important; text-align: left !important; font-weight: 700 !important; }\
#chatbox > p.ppk-cb-me-row .ppk-cb-me { display: inline !important; margin: 0 !important; padding: 0 !important; font-weight: 700 !important; }\
";

  function loadLibScript(win, id, src, globalName) {
    if (win[globalName]) return Promise.resolve();

    return new Promise(function (resolve, reject) {
      var doc = win.document;
      var existing = doc.getElementById(id);

      if (existing) {
        var tries = 0;
        var timer = win.setInterval(function () {
          tries += 1;
          if (win[globalName]) {
            win.clearInterval(timer);
            resolve();
            return;
          }
          if (tries > 80) {
            win.clearInterval(timer);
            reject(new Error(globalName + " non disponible."));
          }
        }, 100);
        return;
      }

      var script = doc.createElement("script");
      script.id = id;
      script.src = src;
      script.async = true;

      script.onload = function () {
        if (win[globalName]) resolve();
        else reject(new Error(globalName + " chargé mais non disponible."));
      };
      script.onerror = function () {
        reject(new Error("Échec du chargement : " + src));
      };

      (doc.head || doc.documentElement).appendChild(script);
    });
  }

  function injectMarkdownStyles(doc) {
    if (doc.getElementById("ppk-cb-markdown-style")) return;

    var style = doc.createElement("style");
    style.id = "ppk-cb-markdown-style";
    style.textContent = MARKDOWN_CSS;
    doc.head.appendChild(style);
  }

  function startsWithAuthorName(text, author) {
    if (!text || !author) return false;
    if (text.indexOf(author) !== 0) return false;

    var nextChar = text.charAt(author.length);
    return !nextChar || /\s|[.,;:!?~\-–—]/.test(nextChar);
  }

  function rowHasNormalUserPrefix(msg) {
    var row = msg && msg.closest ? msg.closest("#chatbox > p") : null;
    if (!row) return false;

    var selectors = [".user-msg", ".username", ".chatbox-username", ".user", 'a[href*="/u"]', 'a[href*="profile"]', "strong", "b"];

    for (var i = 0; i < selectors.length; i += 1) {
      var el = row.querySelector(selectors[i]);
      if (el && !msg.contains(el)) return true;
    }

    return /\s:\s/.test(String(row.textContent || ""));
  }

  function getChatboxAuthor(msg) {
    var row = msg && msg.closest ? msg.closest("#chatbox > p") : null;
    if (!row) return "";

    var selectors = [".user-msg a", ".user-msg strong", ".user-msg span", ".username", ".chatbox-username", ".user", 'a[href*="/u"]', 'a[href*="profile"]', "strong", "b"];

    for (var i = 0; i < selectors.length; i += 1) {
      var el = row.querySelector(selectors[i]);
      if (!el || msg.contains(el)) continue;

      var text = String(el.textContent || "")
        .replace(/^\s*\*/, "")
        .replace(/^[^\wÀ-ÿ]+/, "")
        .replace(/\s+\d{1,2}:\d{2}(?::\d{2})?.*$/, "")
        .replace(/\s*:\s*$/, "")
        .trim();

      if (!text) continue;
      if (/^\d{1,2}:\d{2}(?::\d{2})?$/.test(text)) continue;

      return normalizeText(text);
    }

    return "";
  }

  function looksLikeUnstarredMeAction(source) {
    var text = String(source || "").trim();
    if (!text) return false;
    if (hasMarkdownSyntax(text)) return false;

    var words = text.split(/\s+/);
    if (words.length < 2) return false;
    if (/[:：]$/.test(words[0])) return false;

    return true;
  }

  function getForumactifMeActionInfo(msg, source) {
    var row = msg && msg.closest ? msg.closest("#chatbox > p") : null;
    if (!row) return { isMe: false, text: "" };

    var raw = String(source || "").trim();
    if (!raw) return { isMe: false, text: "" };

    var hasNormalPrefix = rowHasNormalUserPrefix(msg);
    var author = getChatboxAuthor(msg);
    var msgText = normalizeText(raw);

    if (msgText.charAt(0) === "*") {
      var msgWithoutStar = msgText.replace(/^\*\s*/, "").replace(/\s*\*$/, "");

      if (author && startsWithAuthorName(msgWithoutStar, author)) {
        return { isMe: true, text: raw };
      }

      if (!hasNormalPrefix && !/^\s*\*\*/.test(raw)) {
        return { isMe: true, text: raw };
      }
    }

    if (!hasNormalPrefix && looksLikeUnstarredMeAction(raw)) {
      return { isMe: true, text: raw };
    }

    return { isMe: false, text: raw };
  }

  function formatMeActionMessage(doc, msg, source) {
    var row = msg && msg.closest ? msg.closest("#chatbox > p") : null;
    if (!row) return;

    var text = String(source || msg.textContent || "")
      .replace(/\u00a0/g, " ")
      .replace(/^\s*\*\s*/, "")
      .replace(/\s*\*\s*$/, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!text) return;

    row.classList.add("ppk-cb-me-row");
    msg.classList.add("ppk-cb-me-msg");

    msg.dataset.ppkMarkdownRendered = "1";
    msg.dataset.ppkMeFormatted = "1";

    msg.innerHTML = "";

    var span = doc.createElement("span");
    span.className = "ppk-cb-me";
    span.textContent = "* " + text;

    msg.appendChild(span);
  }

  function isSystemOrDeletedMessage(msg) {
    if (!msg) return true;

    var row = msg.closest ? msg.closest("#chatbox > p") : null;
    if (!row) return true;

    var text = normalizeText(msg.textContent);

    if (
      msg.querySelector('span[style*="color:green"], span[style*="color:red"]') ||
      text.indexOf("a rejoint le chat") !== -1 ||
      text.indexOf("est arrive") !== -1 ||
      text.indexOf("s est deconnecte") !== -1 ||
      text.indexOf("s’est deconnecte") !== -1 ||
      text.indexOf("est parti") !== -1 ||
      text.indexOf("supprime") !== -1 ||
      text.indexOf("deleted") !== -1
    ) {
      return true;
    }

    return false;
  }

  function hasMarkdownSyntax(source) {
    return (
      /(^|\n)\s{0,3}#{1,6}\s+\S/.test(source) ||
      /(^|\n)\s{0,3}>\s+\S/.test(source) ||
      /(^|\n)\s*([-*+]\s+\S|\d+\.\s+\S)/.test(source) ||
      /```[\s\S]*?```/.test(source) ||
      /`[^`\n]+`/.test(source) ||
      /\*\*[^*\n]+?\*\*/.test(source) ||
      /__[^_\n]+?__/.test(source) ||
      /\*[^*\s](?:[^*\n]*?[^*\s])?\*/.test(source) ||
      /_[^_\s](?:[^_\n]*?[^_\s])?_/.test(source) ||
      /~~[^~\n]+?~~/.test(source) ||
      /\[[^\]\n]+?\]\((https?:\/\/|\/)[^)]+?\)/i.test(source)
    );
  }

  function extractMarkdownSource(doc, msg) {
    var clone = msg.cloneNode(true);
    var placeholders = [];

    clone.querySelectorAll("script, style").forEach(function (el) { el.remove(); });

    clone.querySelectorAll("img").forEach(function (img) {
      var token = "PPKCBMDIMG" + placeholders.length + "X";
      placeholders.push({ token: token, html: img.outerHTML });
      img.replaceWith(doc.createTextNode(token));
    });

    clone.querySelectorAll("br").forEach(function (br) {
      br.replaceWith(doc.createTextNode("\n"));
    });

    clone.querySelectorAll("div, p, blockquote, li").forEach(function (el) {
      if (el !== clone) el.appendChild(doc.createTextNode("\n"));
    });

    var source = String(clone.textContent || "")
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n[ \t]+/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return { source: source, placeholders: placeholders };
  }

  function restoreImagePlaceholders(doc, root, placeholders) {
    if (!root || !placeholders.length) return;

    var walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var textNodes = [];
    var node;

    while ((node = walker.nextNode())) {
      var value = node.nodeValue || "";
      if (placeholders.some(function (item) { return value.indexOf(item.token) !== -1; })) {
        textNodes.push(node);
      }
    }

    textNodes.forEach(function (textNode) {
      var text = textNode.nodeValue || "";
      var fragment = doc.createDocumentFragment();

      while (text.length) {
        var nextPlaceholder = null;
        var nextIndex = -1;

        placeholders.forEach(function (item) {
          var index = text.indexOf(item.token);
          if (index !== -1 && (nextIndex === -1 || index < nextIndex)) {
            nextIndex = index;
            nextPlaceholder = item;
          }
        });

        if (!nextPlaceholder) {
          fragment.appendChild(doc.createTextNode(text));
          break;
        }

        if (nextIndex > 0) fragment.appendChild(doc.createTextNode(text.slice(0, nextIndex)));

        var tmp = doc.createElement("span");
        tmp.innerHTML = (doc.defaultView || window).DOMPurify.sanitize(nextPlaceholder.html, {
          ALLOWED_TAGS: ["img"],
          ALLOWED_ATTR: ["src", "alt", "title", "class", "width", "height"]
        });

        Array.prototype.forEach.call(tmp.childNodes, function (child) { fragment.appendChild(child); });

        text = text.slice(nextIndex + nextPlaceholder.token.length);
      }

      textNode.parentNode.replaceChild(fragment, textNode);
    });
  }

  function secureMarkdownLinks(root) {
    if (!root) return;

    root.querySelectorAll("a[href]").forEach(function (link) {
      var href = String(link.getAttribute("href") || "").trim();

      if (/^(javascript:|data:|vbscript:)/i.test(href)) {
        link.replaceWith(document.createTextNode(link.textContent || href));
        return;
      }

      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer nofollow");
    });
  }

  function renderMarkdownMessage(doc, win, msg) {
    if (!msg || msg.dataset.ppkMarkdownRendered === "1") return;
    if (isSystemOrDeletedMessage(msg)) return;

    if (msg.querySelector(".cb-md")) {
      msg.dataset.ppkMarkdownRendered = "1";
      return;
    }

    var extracted = extractMarkdownSource(doc, msg);
    var source = extracted.source;
    if (!source) return;

    var meActionInfo = getForumactifMeActionInfo(msg, source);

    if (meActionInfo.isMe) {
      formatMeActionMessage(doc, msg, meActionInfo.text);
      return;
    }

    if (!hasMarkdownSyntax(source)) return;

    var renderedHtml = "";

    try {
      renderedHtml = win.marked.parse(source);
    } catch (e) {
      console.error("[CB Markdown] Erreur de parsing Markdown.", e);
      return;
    }

    var cleanHtml = win.DOMPurify.sanitize(renderedHtml, {
      FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "input", "button", "textarea", "select", "video", "audio", "canvas", "svg", "math", "img"],
      FORBID_ATTR: ["style"]
    });

    msg.dataset.ppkMarkdownRendered = "1";
    msg.innerHTML = '<div class="cb-md">' + cleanHtml + "</div>";

    var wrapper = msg.querySelector(".cb-md");
    restoreImagePlaceholders(doc, wrapper, extracted.placeholders);
    secureMarkdownLinks(wrapper);
  }

  function renderAllMarkdownMessages(doc) {
    var win = doc.defaultView || window;
    if (!win.marked || !win.DOMPurify) return;

    doc.querySelectorAll("#chatbox > p .msg").forEach(function (msg) {
      renderMarkdownMessage(doc, win, msg);
    });
  }

  function bootMarkdownForDoc(doc) {
    var win = doc.defaultView || window;
    if (win.__PPK_CB_MARKDOWN_READY__) return;
    win.__PPK_CB_MARKDOWN_READY__ = true;

    injectMarkdownStyles(doc);

    Promise.all([
      loadLibScript(win, "ppk-marked-lib", MARKED_URL, "marked"),
      loadLibScript(win, "ppk-dompurify-lib", DOMPURIFY_URL, "DOMPurify")
    ])
      .then(function () {
        win.marked.setOptions({ gfm: true, breaks: true });

        renderAllMarkdownMessages(doc);
        onChatboxContentChange(doc, function () { renderAllMarkdownMessages(doc); });
      })
      .catch(function (error) {
        console.error("[CB Markdown] Impossible de charger le Markdown.", error);
      });
  }

  /* =================================================================
   * 10. NOTIFICATIONS VISUELLES (ex "notif visuelle CB")
   *     titre d'onglet + favicon clignotants quand un nouveau message
   *     arrive pendant que l'onglet est en arrière-plan.
   * ================================================================= */

  function initVisualNotifications(win) {
    var topWin = win.top;
    var tDoc = topWin.document;

    var tIconEl = topWin.document.querySelector('link[rel="shortcut icon"]');
    if (!tIconEl) return null;

    var title = tDoc.title;
    var icon = tIconEl.getAttribute("href");

    var repTitle = "MEOW ! " + title;
    var repIcon = "https://2img.net/i.imgur.com/UQPHKaR.png";

    function swapIcon(href) {
      var newIcon = tIconEl.cloneNode(true);
      newIcon.setAttribute("href", href);
      tIconEl.parentNode.replaceChild(newIcon, tIconEl);
      tIconEl = newIcon;
    }

    $(win)
      .on("focus", function () {
        localStorage.cb_blurred = "";
        localStorage.cb_notified = "";
        tDoc.title = title;
        swapIcon(icon);
      })
      .on("blur", function () {
        localStorage.cb_blurred = "1";
      });

    return function handleRefresh(chatboxInstance, data) {
      if (!data || !data.messages || !data.messages.length) return;

      var lm = data.messages.slice(-1)[0];
      var lastMessage = lm.time + "," + lm.action + "," + lm.msg;

      if (chatboxInstance.last_message === lastMessage) return;

      var userMatch = $.grep(data.users || [], function (v) { return v.id == win.chatbox.userId; });
      var user = userMatch.length ? userMatch[0] : {};

      if (chatboxInstance.last_message !== undefined) {
        if (lm.userId != win.chatbox.userId && user.username != lm.username) {
          if (localStorage.cb_blurred && !localStorage.cb_notified) {
            localStorage.cb_notified = "1";
            tDoc.title = repTitle;
            swapIcon(repIcon);
          }
        } else {
          localStorage.cb_blurred = "";
        }
      }

      chatboxInstance.last_message = lm;
    };
  }

  /* =================================================================
   * 11. NOTIFICATIONS SONORES + commande /sound (ex "notifs sonores CB")
   * ================================================================= */

  var CB_SOUNDS = {
    cat: "https://pumpkinforumrpg-netizen.github.io/ppk/u_6ekfl947a2-cat-meow-297927.mp3",
    catWOW: "https://pumpkinforumrpg-netizen.github.io/ppk/x_bass6668-funny-meow-110120.mp3",
    future: "https://illiweb.com/fa/fdf/future.mp3",
    hal: "https://illiweb.com/fa/fdf/hal.mp3",
    secret: "https://illiweb.com/fa/fdf/secret.mp3"
  };
  var CB_DEFAULT_SOUND = CB_SOUNDS.cat;
  var CB_DEFAULT_FREQ = "new";
  var CB_DEFAULT_WHEN = "once";
  var CB_DEFAULT_VOLUME = 100;

  function initSoundNotifications(win) {
    if (localStorage.cb_sound && !localStorage.cb_sound.indexOf("https://dl.dropboxusercontent.com/u/181621985/")) {
      localStorage.removeItem("cb_sound");
    }

    var a = win.document.createElement("audio");
    if (!a.canPlayType) return null;

    a.volume = Math.min(1, Math.max(0, localStorage.cb_volume || CB_DEFAULT_VOLUME / 100));

    function playSound() {
      if (a.paused || a.ended) {
        if (a.readyState > 0) a.currentTime = 0;
        if (!a.src) {
          a.src = localStorage.cb_sound || CB_DEFAULT_SOUND;
          a.load();
        }
        a.play();
      }
    }

    $(win)
      .on("focus", function () {
        localStorage.removeItem("cb_once");
        localStorage.removeItem("cb_blurred");
      })
      .on("blur", function () {
        localStorage.cb_blurred = 1;
      });

    function handleSend(chatboxInstance, originalSend, params) {
      var m = $.trim($("#message", win.document).val());

      if (m.indexOf("/sound") && m.indexOf("/soudn")) {
        return originalSend.call(chatboxInstance, params);
      }

      m = $.trim(m.substr(6)).split(/\s+/, 3);
      var badApple = false;

      switch (m[0].toLowerCase()) {
        case "":
          if (!a.src) {
            a.src = localStorage.cb_sound || CB_DEFAULT_SOUND;
            a.load();
          }
          a.play();
          break;
        case "all":
        case "new":
          localStorage.cb_freq = m[0];
          break;
        case "always":
        case "off":
        case "on":
        case "once":
        case "never":
          localStorage.cb_when = m[0];
          break;
        case "stop":
          if (!a.paused) a.pause();
          if (!a.ended && a.readyState > 0) a.currentTime = 0;
          break;
        case "pause":
          if (!a.paused) a.pause();
          break;
        case "volume":
          if (m.length > 1) {
            localStorage.cb_volume = Math.min(1, Math.max(0, parseFloat(m[1].replace(",", ".")) / 100));
            a.volume = localStorage.cb_volume;
            break;
          }
        /* falls through */
        default:
          badApple = true;
      }

      if (badApple) {
        if (m[0] in CB_SOUNDS) m[0] = CB_SOUNDS[m[0]];

        if (m[0] === "default") {
          m[0] = CB_DEFAULT_SOUND;
          localStorage.removeItem("cb_sound");
          localStorage.removeItem("cb_freq");
          localStorage.removeItem("cb_volume");
          localStorage.removeItem("cb_when");
          a.volume = Math.min(1, Math.max(0, CB_DEFAULT_VOLUME / 100));
        }

        if (/^https?:\/\/.+/.test(m[0])) {
          localStorage.cb_sound = m[0];
          a.pause();
          a.src = m[0];
          a.load();
          a.play();
        } else {
          var message = $("#message", win.document).val();
          alert(
            "/sound [all | new]\n/sound [always | off | on | once | never]\n/sound [stop | pause]\n/sound default\n/sound volume 0-100\n/sound [" +
              $.map(CB_SOUNDS, function (_, k) { return k; }).join(" | ") +
              "]\n/sound [http://* | https://*]"
          );
          setTimeout(function () {
            $("#message", win.document).val(message).select().focus();
          }, 100);
          return;
        }
      }

      return $("#message", win.document).val("").focus();
    }

    return {
      handleSend: handleSend,
      handleRefresh: function (chatboxInstance, data) {
        if (!data || !data.messages || !data.messages.length) return;

        var lm = data.messages.slice(-1)[0];
        var lastMessage = lm.time + "," + lm.action + "," + lm.msg;

        if (chatboxInstance.last_message_sound === lastMessage) return;

        var userMatch = $.grep(data.users || [], function (v) { return v.id == win.chatbox.userId; });
        var user = userMatch.length ? userMatch[0] : {};

        if (chatboxInstance.last_message_sound !== undefined) {
          var freq = localStorage.cb_freq || CB_DEFAULT_FREQ;
          var when = localStorage.cb_when || CB_DEFAULT_WHEN;

          var shouldConsiderPlaying =
            when !== "never" &&
            (when !== "off" || localStorage.cb_blurred) &&
            (when !== "on" || !localStorage.cb_blurred) &&
            (when !== "once" || (localStorage.cb_blurred && !localStorage.cb_once));

          if (shouldConsiderPlaying) {
            var isNewFromOther = freq === "all" || (lm.userId != win.chatbox.userId && user.username != lm.username);

            if (isNewFromOther && (when !== "once" || !localStorage.cb_once)) {
              playSound();
              localStorage.cb_once = 1;
            }
          }
        }

        chatboxInstance.last_message_sound = lm;
      }
    };
  }

  /* =================================================================
   * 12. REDÉFINITION UNIQUE DE Chatbox.prototype.refresh (§50)
   *
   * Avant la fusion, trois fichiers redéfinissaient chacun
   * Chatbox.prototype.refresh en s'enveloppant l'un l'autre (l'ordre
   * dépendant de l'ordre de chargement réel, non documenté) :
   *   - "notif visuelle CB"  : lit `data` BRUT (avant mutation du DOM
   *     par le refresh natif) pour détecter un message d'un autre
   *     utilisateur et déclencher le titre/favicon clignotants ;
   *   - "notifs sonores CB"  : lit également `data` BRUT, pour jouer un
   *     son selon les préférences (/sound) ;
   *   - "autoriser markdown" : a besoin que le DOM soit DÉJÀ mis à jour
   *     par le refresh natif pour pouvoir rendre le Markdown des
   *     nouveaux messages.
   *
   * La redéfinition unique ci-dessous respecte cet ordre de dépendances
   * (lecture de `data` brut d'abord, puis appel du refresh natif, puis
   * traitement du DOM mis à jour) au lieu de empiler trois wrappers
   * anonymes qui se rappellent les uns les autres dans un ordre
   * arbitraire.
   * ================================================================= */

  function patchChatboxRefresh(win, visualHandler, soundHandler) {
    var ChatboxClass = win.Chatbox;
    if (!ChatboxClass || !ChatboxClass.prototype || !ChatboxClass.prototype.refresh) return false;
    if (ChatboxClass.prototype.refresh.__PPK_CB_REFRESH_PATCHED__) return true;

    var originalRefresh = ChatboxClass.prototype.refresh;

    ChatboxClass.prototype.refresh = function (data) {
      try {
        if (visualHandler) visualHandler(this, data);
      } catch (e) {}

      try {
        if (soundHandler) soundHandler(this, data);
      } catch (e) {}

      var result = originalRefresh.apply(this, arguments);

      var doc = win.document;
      renderAllMarkdownMessages(doc);
      setTimeout(function () { renderAllMarkdownMessages(doc); }, 50);
      setTimeout(function () { renderAllMarkdownMessages(doc); }, 150);

      return result;
    };

    ChatboxClass.prototype.refresh.__PPK_CB_REFRESH_PATCHED__ = true;
    return true;
  }

  function patchChatboxSend(win, handleSend) {
    var ChatboxClass = win.Chatbox;
    if (!ChatboxClass || !ChatboxClass.prototype || !ChatboxClass.prototype.send) return false;
    if (ChatboxClass.prototype.send.__PPK_CB_SEND_PATCHED__) return true;

    var originalSend = ChatboxClass.prototype.send;

    ChatboxClass.prototype.send = function (params) {
      return handleSend(this, originalSend, params);
    };

    ChatboxClass.prototype.send.__PPK_CB_SEND_PATCHED__ = true;
    return true;
  }

  /* =================================================================
   * 13. BOOTSTRAP "CODE INTERNE CHATBOX" — orchestration des sections
   * 9/10/11/12 pour la fenêtre courante.
   *
   * À VÉRIFIER : les scripts d'origine (markdown, notif visuelle,
   * notifs sonores, nom CB) n'avaient AUCUNE garde de type
   * isTopWindow/isChatboxUrl — ils étaient presque certainement
   * restreints à la page chatbox via le panneau d'administration
   * Forumactif plutôt que par le code. Ici, chatbox.js étant chargé sur
   * TOUTES les pages (§46), la garde effective devient simplement "la
   * classe Chatbox existe dans cette fenêtre" (hasNativeChatbox),
   * ce qui reproduit le même résultat pratique sans dépendre d'un
   * réglage d'ACP qui n'existe plus dans la nouvelle architecture.
   * ================================================================= */

  function initChatboxInternals(win) {
    $(win).on("load", function () {
      function hasNativeChatbox() {
        return typeof win.Chatbox === "function" && win.Chatbox.prototype && win.Chatbox.prototype.refresh;
      }

      if (!hasNativeChatbox()) return; // page normale du forum : rien à patcher ici

      var visualHandler = null;
      var soundBundle = null;

      try {
        visualHandler = initVisualNotifications(win);
      } catch (e) {
        /* À VÉRIFIER : window.top peut être inaccessible dans certains
         * contextes cross-origin inattendus ; on dégrade sans bloquer
         * le reste (markdown, sons) plutôt que de tout interrompre. */
      }

      try {
        soundBundle = initSoundNotifications(win);
      } catch (e) {}

      function tryPatch(remainingAttempts) {
        var refreshPatched = patchChatboxRefresh(win, visualHandler, soundBundle && soundBundle.handleRefresh);

        if (soundBundle) {
          patchChatboxSend(win, soundBundle.handleSend);
        }

        if (refreshPatched) return;
        if (remainingAttempts <= 0) return;

        setTimeout(function () { tryPatch(remainingAttempts - 1); }, 300);
      }

      tryPatch(20);
      bootMarkdownForDoc(win.document);
    });
  }

  /* =================================================================
   * 14. BOOTSTRAP GÉNÉRAL
   * ================================================================= */

  // (a) Contrôleur côté forum — bouton + iframe popup, sur toutes les
  // pages sauf la chatbox elle-même (voir "À VÉRIFIER" Section 5).
  $(function () {
    initForumController();
  });

  // (b) Rendu interne quand CE document EST la chatbox en page complète.
  if (ctxIsStandaloneChatboxPage) {
    $(function () {
      injectFontAwesome(document);
      injectBaseStyles(document);
      refreshChatboxUI(document, window, document, null);

      setTimeout(function () { syncJoinButtons(document); }, 300);
      setTimeout(function () { syncJoinButtons(document); }, 800);

      onChatboxContentChange(document, function () {
        refreshChatboxUI(document, window, document, null);
      });
      initChatboxAutoScroll(document);

      initResponsive(document);
      initResumeRefresh(document);

      // Garde les mêmes signaux de changement de thème que l'ancienne
      // page standalone (clic sur le switch de thème + storage
      // cross-onglet), par symétrie avec le contrôleur popup.
      document.addEventListener("click", function (e) {
        var btn = e.target.closest && e.target.closest("#themeSwitch .theme-btn");
        if (!btn) return;

        setTimeout(function () { refreshChatboxUI(document, window, document, null); }, 50);
        setTimeout(function () { refreshChatboxUI(document, window, document, null); }, 150);
        setTimeout(function () { refreshChatboxUI(document, window, document, null); }, 300);
      }, true);

      window.addEventListener("storage", function (e) {
        if (e.key === STORAGE_KEY || e.key === LEGACY_KEY || e.key === CB_MUTE_KEY) {
          refreshChatboxUI(document, window, document, null);
        }
      }, false);
    });
  }

  // (c) Code dépendant de Chatbox.prototype (markdown, notifications,
  // refresh unique) : s'exécute dans CETTE fenêtre dès que la classe
  // Chatbox native existe, que ce soit la page standalone ou l'iframe
  // popup chargée nativement avec sa propre copie de chatbox.js.
  //
  // À VÉRIFIER (chevauchement d'observers entre fenêtres) : dans le cas
  // du popup, le contrôleur (Section 5) pose déjà, DEPUIS LA FENÊTRE
  // PARENTE, un observer de contenu sur le document de l'iframe pour le
  // rafraîchissement visuel + le scroll (via le registre mutualisé de
  // cette fenêtre parente). Le présent bloc (c), lui, s'exécute NATIVEMENT
  // DANS la fenêtre de l'iframe (chatbox.js y est rechargé puisque
  // l'iframe pointe vers une page du même site) et pose son propre
  // observer de contenu pour le markdown, dans le registre de SA PROPRE
  // fenêtre. Ce sont donc deux MutationObserver distincts (deux heaps JS
  // différents) qui observent le même noeud #chatbox de l'iframe — un
  // chevauchement impossible à fusionner depuis un seul fichier sans
  // faire communiquer les deux fenêtres entre elles. C'est un héritage
  // direct de l'architecture à double injection déjà présente dans les
  // 10 fichiers d'origine (le fichier markdown n'avait aucune garde
  // d'iframe, contrairement à CB latérale/PLEIN ECRAN CB) : non modifié
  // ici, à traiter avec la question du lazy-load (§47).
  initChatboxInternals(window);
})(jQuery);
