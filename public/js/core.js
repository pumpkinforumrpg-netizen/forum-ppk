/*
 * core.js — PPK namespace, moteur de thèmes, helpers de chargement.
 *
 * Moteur de thèmes migré tel quel depuis le template overall_footer_end
 * ("Switch de Thème, Images & Polices"), qui restait la seule source du
 * comportement de switch de thème avant cette migration. Comportement
 * fonctionnel inchangé — seul le bootstrap anti-flash resté dans
 * overall_header a été corrigé (voir note plus bas, thème "winter" manquant
 * dans sa liste de validation, ce qui causait un flash du mauvais thème).
 */
window.PPK = window.PPK || {};

/* ---------------------------------------------------------------
 * Configuration des thèmes (§27 du cahier technique)
 * Ajouter un thème : une entrée ici + le bloc [data-color-scheme="x"]
 * correspondant dans core.css + une entrée dans THEME_IMAGE_MAP si le
 * thème a ses propres images (voir plus bas).
 * ------------------------------------------------------------- */
PPK.THEMES = [
  { id: "dark", label: "Sombre", icon: "fa-moon" },
  { id: "light", label: "Clair", icon: "fa-sun" },
  { id: "autumn", label: "Automne", icon: "fa-leaf" },
  { id: "winter", label: "Hiver", icon: "fa-snowflake" }
];

PPK.THEME_IDS = PPK.THEMES.map(function (t) { return t.id; });

/* ---------------------------------------------------------------
 * Helpers de chargement (§88) — empêchent le double chargement d'un
 * même script/style lorsque plusieurs modules le référencent.
 * ------------------------------------------------------------- */
PPK._loadedScripts = {};
PPK._loadedStyles = {};

PPK.loadScriptOnce = function (src, callback) {
  if (PPK._loadedScripts[src]) {
    if (callback) callback();
    return;
  }
  var script = document.createElement("script");
  script.src = src;
  script.onload = function () {
    PPK._loadedScripts[src] = true;
    if (callback) callback();
  };
  document.head.appendChild(script);
};

PPK.loadStyleOnce = function (href) {
  if (PPK._loadedStyles[href]) return;
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
  PPK._loadedStyles[href] = true;
};

/* ---------------------------------------------------------------
 * Moteur de thèmes (migré depuis overall_footer_end)
 * ------------------------------------------------------------- */
(function () {
  var STORAGE_KEY = "ppk-theme-preference";
  var LEGACY_KEY = "color-scheme";

  function isValidTheme(theme) {
    return PPK.THEME_IDS.indexOf(theme) !== -1;
  }

  var THEME_IMAGE_MAP = {
    dark: {
      ppkMadame: "https://2img.net/i.imgur.com/YuDB2sy.png",
      ppkOuterCircle: "https://2img.net/i.imgur.com/knWsiIa.png",
      ppkInnerCircle: "https://2img.net/i.imgur.com/BbdONP0.png",
      ppkRadial: "https://2img.net/i.imgur.com/pgOuYvR.png",
      ppkP: "https://2img.net/i.imgur.com/LjtixDs.png",
      ppkP2: "https://2img.net/i.imgur.com/avlD2pq.png",
      ppkS: "https://2img.net/i.imgur.com/40pnzEa.png",
      coMtn: "https://2img.net/i.imgur.com/0Kilnpz.png",
      hihi: "https://2img.net/i.imgur.com/yvf39Bn.png",
      raven: "https://2img.net/i.imgur.com/YKbXkk1.png",
      contexte: "https://2img.net/i.imgur.com/9brogu4.png",
      chatCurieux: "https://2img.net/i.imgur.com/nKfZpku.png",
      chatQeel: "https://2img.net/i.imgur.com/OV0q0SI.png",
      newPpkImg: "https://2img.net/i.imgur.com/aApsUPX.png",
      lastPostIcon: "https://2img.net/i.imgur.com/fFTy3hz.png",
      parto: "https://2img.net/i.imgur.com/8McVOIi.png",
      firstIMGhistoire: "https://2img.net/i.imgur.com/FlZxF1K.png",
      fcSparkHeader: "https://2img.net/i.imgur.com/IGJ5ddz.png",
      fcAvaSpark: "https://2img.net/i.imgur.com/fuXAwpZ.png",
      newMsgIcon: "https://2img.net/i.imgur.com/4juhIjr.png"
    },
    light: {
      ppkMadame: "https://2img.net/i.imgur.com/7HmxZFF.png",
      ppkOuterCircle: "https://2img.net/i.imgur.com/FX3CLwk.png",
      ppkInnerCircle: "https://2img.net/i.imgur.com/ghKlVwm.png",
      ppkRadial: "https://2img.net/i.imgur.com/mya0s6J.png",
      ppkP: "https://2img.net/i.imgur.com/WjjHX9E.png",
      ppkP2: "https://2img.net/i.imgur.com/wgbNEKt.png",
      ppkS: "https://2img.net/i.imgur.com/N5ipMZI.png",
      coMtn: "https://2img.net/i.imgur.com/EbalfSi.png",
      hihi: "https://2img.net/i.imgur.com/yvf39Bn.png",
      raven: "https://2img.net/i.imgur.com/bx1ijpY.png",
      contexte: "https://2img.net/i.imgur.com/7zkiBVE.png",
      chatCurieux: "https://2img.net/i.imgur.com/AAsxj7q.png",
      chatQeel: "https://2img.net/i.imgur.com/EdW9od1.png",
      newPpkImg: "https://2img.net/i.imgur.com/PjqNGQl.png",
      lastPostIcon: "https://2img.net/i.imgur.com/gbMAR3H.png",
      parto: "https://2img.net/i.imgur.com/lWLf0QP.png",
      firstIMGhistoire: "https://2img.net/i.imgur.com/FwmwJqb.png",
      fcSparkHeader: "https://2img.net/i.imgur.com/6QNBXgR.png",
      fcAvaSpark: "https://2img.net/i.imgur.com/hPqYrui.png",
      newMsgIcon: "https://2img.net/i.imgur.com/Xu7qKps.png"
    },
    autumn: {
      ppkMadame: "https://2img.net/i.imgur.com/OECzXm0.png",
      ppkOuterCircle: "https://2img.net/i.imgur.com/ElJVKgd.png",
      ppkInnerCircle: "https://2img.net/i.imgur.com/Dkaunho.png",
      ppkRadial: "https://2img.net/i.imgur.com/g1NSKY2.png",
      ppkP: "https://2img.net/i.imgur.com/lwjYr0G.png",
      ppkP2: "https://2img.net/i.imgur.com/7j5jDYv.png",
      ppkS: "https://2img.net/i.imgur.com/vIMNWo6.png",
      coMtn: "https://2img.net/i.imgur.com/8Yq7C7j.png",
      hihi: "https://2img.net/i.imgur.com/Mdhn1Be.png",
      raven: "https://2img.net/i.imgur.com/l1igidT.png",
      contexte: "https://2img.net/i.imgur.com/hmpoIGR.png",
      chatCurieux: "https://2img.net/i.imgur.com/FgOcsFl.png",
      chatQeel: "https://2img.net/i.imgur.com/w8Q8SwD.png",
      newPpkImg: "https://2img.net/i.imgur.com/sMRmfBo.png",
      lastPostIcon: "https://2img.net/i.imgur.com/NhussbA.png",
      parto: "https://2img.net/i.imgur.com/qubCSLf.png",
      firstIMGhistoire: "https://2img.net/i.imgur.com/LtQLxr9.png",
      fcSparkHeader: "https://2img.net/i.imgur.com/AP1aPQW.png",
      fcAvaSpark: "https://2img.net/i.imgur.com/2sc3fll.png",
      newMsgIcon: "https://2img.net/i.imgur.com/ERpYhqb.png"
    },
    winter: {
      ppkMadame: "https://2img.net/i.imgur.com/mNi23ND.png",
      ppkOuterCircle: "https://2img.net/i.imgur.com/ihJCqNb.png",
      ppkInnerCircle: "https://2img.net/i.imgur.com/5STEOcQ.png",
      ppkRadial: "https://2img.net/i.imgur.com/s9wQ80y.png",
      ppkP: "https://2img.net/i.imgur.com/uRNvkLW.png",
      ppkP2: "https://2img.net/i.imgur.com/f74WWFj.png",
      ppkS: "https://2img.net/i.imgur.com/s8GtwAe.png",
      coMtn: "",
      hihi: "https://2img.net/i.imgur.com/vg4TQCn.png",
      raven: "https://2img.net/i.imgur.com/nB6256q.png",
      contexte: "https://2img.net/i.imgur.com/PVt1yxV.png",
      chatCurieux: "https://2img.net/i.imgur.com/4pP5XUP.png",
      chatQeel: "https://2img.net/i.imgur.com/8N9pUCU.png",
      newPpkImg: "",
      lastPostIcon: "https://2img.net/i.imgur.com/5d4qZ90.png",
      parto: "https://2img.net/i.imgur.com/4IK5Kwh.png",
      firstIMGhistoire: "",
      fcSparkHeader: "https://2img.net/i.imgur.com/OVtZPZC.png",
      fcAvaSpark: "https://2img.net/i.imgur.com/7X0NDyo.png",
      newMsgIcon: "https://2img.net/i.imgur.com/vxrlXVv.png"
    }
  };

  function getSystemTheme() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function getSavedTheme() {
    var saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      var legacy = localStorage.getItem(LEGACY_KEY);
      if (isValidTheme(legacy)) {
        saved = legacy;
        localStorage.setItem(STORAGE_KEY, legacy);
      }
    }

    return isValidTheme(saved) ? saved : null;
  }

  function getEffectiveTheme() {
    return getSavedTheme() || getSystemTheme();
  }

  function saveTheme(theme) {
    localStorage.setItem(STORAGE_KEY, theme);
    localStorage.setItem(LEGACY_KEY, theme);
  }

  function closestThemeButton(node, limit) {
    while (node && node !== limit) {
      if (
        node.classList &&
        node.classList.contains("theme-btn") &&
        node.getAttribute("data-theme")
      ) {
        return node;
      }
      node = node.parentNode;
    }
    return null;
  }

  function hasNewMessageState(img) {
    var container = img.closest ? img.closest(".ppk-forum, .ppk-cate") : null;
    if (!container) return false;
    return (
      container.classList.contains("cat_new") ||
      container.classList.contains("forum_new")
    );
  }

  var THEME_IMAGE_SELECTOR = [
    "img[data-theme-image]",
    ".new-msg",
    ".last-post-icon img",
    "#pot-img a img",
    ".ppk-search-topic-lasticon img"
  ].join(", ");

  function updateThemeImages(theme, scope) {
    var map = THEME_IMAGE_MAP[theme] || THEME_IMAGE_MAP.dark;
    var root = scope || document;
    var images = root.querySelectorAll ? root.querySelectorAll(THEME_IMAGE_SELECTOR) : [];

    for (var i = 0; i < images.length; i++) {
      var img = images[i];
      var key = img.getAttribute("data-theme-image");

      if (!key) {
        if (img.classList && img.classList.contains("new-msg")) {
          if (!hasNewMessageState(img)) {
            img.style.display = "none";
            continue;
          }
          img.style.display = "";
          key = "newMsgIcon";
        } else if (
          (img.closest && img.closest(".last-post-icon")) ||
          (img.closest && img.closest("#pot-img")) ||
          (img.closest && img.closest(".ppk-search-topic-lasticon"))
        ) {
          key = "lastPostIcon";
        }
      }

      var nextSrc = map[key];
      if (nextSrc && img.getAttribute("src") !== nextSrc) {
        img.setAttribute("src", nextSrc);
      }
    }
  }

  function syncSwitchUI(theme) {
    var switchEl = document.getElementById("themeSwitch");
    if (!switchEl) return;

    var buttons = switchEl.querySelectorAll(".theme-btn");
    var thumb = switchEl.querySelector(".theme-thumb");
    var activeIndex = 0;

    for (var i = 0; i < buttons.length; i++) {
      var isActive = buttons[i].getAttribute("data-theme") === theme;
      buttons[i].classList.toggle("active", isActive);
      buttons[i].setAttribute("aria-pressed", isActive ? "true" : "false");
      if (isActive) activeIndex = i;
    }

    if (thumb && buttons.length) {
      var btnWidth = buttons[0].offsetWidth || 0;
      thumb.style.transform = "translateX(" + (activeIndex * btnWidth) + "px)";
    }
  }

  function applyTheme(theme, persist) {
    if (!isValidTheme(theme)) theme = "dark";

    document.documentElement.setAttribute("data-color-scheme", theme);
    updateThemeImages(theme, document);
    syncSwitchUI(theme);

    if (persist) saveTheme(theme);
  }

  function bindSwitch() {
    var switchEl = document.getElementById("themeSwitch");
    if (!switchEl) return;
    if (switchEl.getAttribute("data-theme-bound") === "1") return;

    switchEl.setAttribute("data-theme-bound", "1");

    switchEl.addEventListener("click", function (e) {
      var button = closestThemeButton(e.target, switchEl);
      if (!button) return;

      var theme = button.getAttribute("data-theme");
      if (!isValidTheme(theme)) return;

      applyTheme(theme, true);
    });
  }

  function watchSystemTheme() {
    if (!window.matchMedia) return;

    var mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function handleSystemChange() {
      if (!getSavedTheme()) applyTheme(getSystemTheme(), false);
    }

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleSystemChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleSystemChange);
    }
  }

  function observeDynamicNodes() {
    if (!window.MutationObserver || !document.body) return;

    var observer = new MutationObserver(function (mutations) {
      var theme = getEffectiveTheme();
      var needsFullSync = false;

      for (var i = 0; i < mutations.length; i++) {
        var addedNodes = mutations[i].addedNodes;

        for (var j = 0; j < addedNodes.length; j++) {
          var node = addedNodes[j];
          if (!node || node.nodeType !== 1) continue;

          if (node.id === "themeSwitch" || (node.querySelector && node.querySelector("#themeSwitch"))) {
            needsFullSync = true;
          }

          if (
            (node.matches && node.matches(THEME_IMAGE_SELECTOR)) ||
            (node.querySelector && node.querySelector(THEME_IMAGE_SELECTOR))
          ) {
            updateThemeImages(theme, document);
          }
        }
      }

      if (needsFullSync) {
        bindSwitch();
        syncSwitchUI(theme);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  function initThemeManager() {
    bindSwitch();
    applyTheme(getEffectiveTheme(), false);
    watchSystemTheme();
    observeDynamicNodes();
  }

  PPK.theme = {
    get: getEffectiveTheme,
    apply: applyTheme,
    isValid: isValidTheme
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initThemeManager);
  } else {
    initThemeManager();
  }

  window.addEventListener("load", function () {
    applyTheme(getEffectiveTheme(), false);
  });
})();
