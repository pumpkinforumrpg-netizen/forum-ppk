/*
 * guidebook.js — application légère du Guidebook (public/guidebook/index.html).
 *
 * Remplace l'ancien guidebook_navigation.html, qui hébergeait une <iframe
 * class="guide-frame"> par section (règlement, staff, contexte...) et
 * communiquait par postMessage avec celle du Compendium (seule section
 * externe, cross-origin). Dans cette nouvelle architecture :
 *
 *   - chaque section est un fragment HTML statique dans
 *     public/guidebook/pages/*.html (voir §32-33 du cahier technique),
 *     récupéré par fetch() et injecté dans #content-container (§36) ;
 *   - les fragments déjà récupérés sont gardés en mémoire (fragmentCache)
 *     pour éviter un nouveau fetch à chaque clic ;
 *   - la recherche (§37) construit son index directement à partir du DOM du
 *     fragment affiché (TreeWalker), au lieu de dupliquer son texte à la
 *     main quelque part : on ne cherche jamais un texte qu'on n'a pas
 *     réellement sous les yeux ;
 *   - le paramètre d'URL ?tab=... (§38) permet d'ouvrir une section
 *     précise, et est tenu à jour quand on navigue dans la sidebar ;
 *   - le Guidebook est désormais hébergé hors Forumactif (§29) ; quand il
 *     est intégré dans une page du forum (iframe), le thème est synchronisé
 *     avec cette page parente par postMessage, avec vérification explicite
 *     de l'origine (§39-40) ;
 *   - en accès direct (page ouverte seule, sans parent), le thème est
 *     résolu dans l'ordre : thème sauvegardé → paramètre d'URL → préférence
 *     système → thème par défaut (§41).
 *
 * Le Compendium (public/guidebook/pages/compendium.html) est un fragment
 * comme les autres ici : sa logique/CSS propres (public/js/compendium.js,
 * public/css/compendium.css) ne sont chargées qu'à la première ouverture de
 * cette section (voir ensureCompendiumAssets plus bas), jamais globalement.
 */

/* ==========================================================================
   ORIGINES AUTORISÉES POUR LA SYNCHRONISATION DE THÈME (postMessage)
   À COMPLÉTER avec l'URL Cloudflare définitive une fois le nom de domaine du
   Guidebook connu (et avec l'URL du forum si elle venait à changer).
   ========================================================================== */
var ORIGINES_AUTORISEES = [
  "https://pumpkinsrpg.forumactif.com"
  // "https://<à-compléter>.pages.dev"
];

(function () {
  "use strict";

  /* ------------------------------------------------------------------
     CONFIGURATION DES PAGES (§35)
  ------------------------------------------------------------------ */
  var PAGES = [
    { id: "reglement", label: "Règlement", icon: "fa-solid fa-scroll", file: "pages/reglement.html" },
    { id: "staff", label: "Staff", icon: "fa-solid fa-users", file: "pages/staff.html" },
    { id: "contexte", label: "Contexte", icon: "fa-solid fa-feather-pointed", file: "pages/contexte.html" },
    { id: "magie", label: "Magie & Pouvoirs", icon: "fa-solid fa-wand-sparkles", file: "pages/magie.html" },
    { id: "origines", label: "Origines", icon: "fa-solid fa-ghost", file: "pages/origines.html" },
    { id: "compendium", label: "Compendium", icon: "fa-solid fa-book", file: "pages/compendium.html" },
    { id: "pnj", label: "PNJ", icon: "fa-solid fa-hat-wizard", file: "pages/pnj.html" },
    { id: "evenements", label: "Évènements", icon: "fa-solid fa-moon", file: "pages/evenements.html" },
    { id: "divers", label: "Divers", icon: "fa-solid fa-ellipsis", file: "pages/divers.html" },
    { id: "faq", label: "Foire aux questions", icon: "fa-solid fa-circle-question", file: "pages/faq.html" },
    { id: "codes", label: "Codes RP", icon: "fa-solid fa-code", file: "pages/codes.html" }
  ];

  var DEFAULT_PAGE_ID = "reglement";

  function getPageById(id) {
    for (var i = 0; i < PAGES.length; i++) {
      if (PAGES[i].id === id) return PAGES[i];
    }
    return null;
  }

  /* ------------------------------------------------------------------
     RÉFÉRENCES DOM
  ------------------------------------------------------------------ */
  var sidebar = document.getElementById("sidebar");
  var toggleBtn = document.getElementById("toggle-btn");
  var toggleIcon = document.getElementById("toggle-icon");
  var toggleLabel = document.getElementById("toggle-label");
  var navTooltip = document.getElementById("nav-tooltip");
  var navLinks = document.querySelectorAll(".nav-link[data-page]");
  var placeholder = document.getElementById("placeholder");
  var contentContainer = document.getElementById("content-container");
  var searchInput = document.getElementById("search-input");
  var searchCount = document.getElementById("search-count");
  var searchPrev = document.getElementById("search-prev");
  var searchNext = document.getElementById("search-next");

  /* ==================================================================
     1. TOGGLE SIDEBAR
  ================================================================== */
  toggleBtn.addEventListener("click", function () {
    sidebar.classList.toggle("collapsed");

    if (sidebar.classList.contains("collapsed")) {
      toggleIcon.className = "fa-solid fa-angles-right";
      toggleBtn.title = "Ouvrir le menu";
      toggleBtn.setAttribute("aria-label", "Ouvrir le menu");
      toggleLabel.textContent = "Ouvrir le menu";
    } else {
      toggleIcon.className = "fa-solid fa-angles-left";
      toggleBtn.title = "Fermer le menu";
      toggleBtn.setAttribute("aria-label", "Fermer le menu");
      toggleLabel.textContent = "Fermer le menu";
    }

    hideNavTooltip();
  });

  /* ==================================================================
     1B. TOOLTIP CUSTOM NAV (sidebar repliée)
  ================================================================== */
  var navTooltipTargets = document.querySelectorAll("#sidebar .nav-link[data-nav-tip]");
  var currentTooltipTarget = null;

  function isSidebarCollapsed() {
    return sidebar.classList.contains("collapsed");
  }

  function showNavTooltip(target) {
    if (!isSidebarCollapsed()) return;

    var text = target.getAttribute("data-nav-tip");
    if (!text) return;

    currentTooltipTarget = target;
    navTooltip.textContent = text;
    navTooltip.classList.add("is-visible");
    navTooltip.setAttribute("aria-hidden", "false");
    positionNavTooltip(target);
  }

  function hideNavTooltip() {
    currentTooltipTarget = null;
    navTooltip.classList.remove("is-visible");
    navTooltip.setAttribute("aria-hidden", "true");
  }

  function positionNavTooltip(target) {
    if (!target || !isSidebarCollapsed()) return;

    var rect = target.getBoundingClientRect();
    var tooltipRect = navTooltip.getBoundingClientRect();

    var gap = 12;
    var left = rect.right + gap;
    var top = rect.top + rect.height / 2 - tooltipRect.height / 2;

    var maxLeft = window.innerWidth - tooltipRect.width - 10;
    var maxTop = window.innerHeight - tooltipRect.height - 10;

    left = Math.min(left, maxLeft);
    top = Math.max(10, Math.min(top, maxTop));

    navTooltip.style.left = left + "px";
    navTooltip.style.top = top + "px";
  }

  navTooltipTargets.forEach(function (link) {
    link.addEventListener("mouseenter", function () { showNavTooltip(link); });
    link.addEventListener("mouseleave", hideNavTooltip);
    link.addEventListener("focus", function () { showNavTooltip(link); });
    link.addEventListener("blur", hideNavTooltip);

    link.addEventListener("mousemove", function () {
      if (currentTooltipTarget === link) positionNavTooltip(link);
    });
  });

  window.addEventListener("scroll", function () {
    if (currentTooltipTarget) positionNavTooltip(currentTooltipTarget);
  }, true);

  window.addEventListener("resize", function () {
    if (currentTooltipTarget) positionNavTooltip(currentTooltipTarget);
  });

  /* ==================================================================
     2. CHARGEMENT DES FRAGMENTS (§36) : fetch + injection + cache mémoire
  ================================================================== */
  var fragmentCache = {};
  var currentPageId = null;

  function fetchFragment(page) {
    if (Object.prototype.hasOwnProperty.call(fragmentCache, page.id)) {
      return Promise.resolve(fragmentCache[page.id]);
    }

    return fetch(page.file)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("HTTP " + response.status + " pour " + page.file);
        }
        return response.text();
      })
      .then(function (html) {
        fragmentCache[page.id] = html;
        return html;
      });
  }

  /* ------------------------------------------------------------------
     Chargement paresseux des assets du Compendium (§42) : jamais chargés
     globalement, seulement à la première ouverture de cette section.
  ------------------------------------------------------------------ */
  var compendiumAssetsPromise = null;

  function ensureCompendiumAssets() {
    if (compendiumAssetsPromise) return compendiumAssetsPromise;

    if (!document.getElementById("compendium-css")) {
      var link = document.createElement("link");
      link.id = "compendium-css";
      link.rel = "stylesheet";
      link.href = "../css/compendium.css";
      document.head.appendChild(link);
    }

    compendiumAssetsPromise = new Promise(function (resolve) {
      if (window.PPKCompendium && typeof window.PPKCompendium.init === "function") {
        resolve();
        return;
      }

      var script = document.createElement("script");
      script.id = "compendium-js";
      script.src = "../js/compendium.js";
      script.onload = function () { resolve(); };
      document.head.appendChild(script);
    });

    return compendiumAssetsPromise;
  }

  function setActiveNav(pageId) {
    navLinks.forEach(function (link) {
      link.classList.toggle("active", link.dataset.page === pageId);
    });
  }

  function updateUrlTab(pageId) {
    try {
      var url = new URL(window.location.href);
      url.searchParams.set("tab", pageId);
      window.history.replaceState(null, "", url.toString());
    } catch (e) {
      /* Navigateur très ancien ou contexte restreint : pas bloquant. */
    }
  }

  function showPage(pageId, options) {
    var page = getPageById(pageId);
    if (!page) return;

    var skipUrlUpdate = options && options.skipUrlUpdate;

    setActiveNav(page.id);
    placeholder.style.display = "none";

    fetchFragment(page)
      .then(function (html) {
        contentContainer.innerHTML = html;
        currentPageId = page.id;

        if (!skipUrlUpdate) updateUrlTab(page.id);

        if (page.id === "compendium") {
          ensureCompendiumAssets().then(function () {
            if (window.PPKCompendium) window.PPKCompendium.init();
            applySearch(searchInput.value.trim());
          });
        } else {
          applySearch(searchInput.value.trim());
        }
      })
      .catch(function (error) {
        contentContainer.innerHTML =
          '<section class="guide-content"><div class="note" style="margin-bottom:0;">' +
          "<h2>Page indisponible</h2><p>Impossible de charger cette section pour le moment. " +
          "Réessaie dans quelques instants.</p></div></section>";
        currentPageId = page.id;
        if (window.console) console.error("[guidebook] ", error);
      });
  }

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      showPage(link.dataset.page);
    });
  });

  /* ------------------------------------------------------------------
     §38 — paramètre ?tab= pour ouvrir une section précise à l'arrivée.
  ------------------------------------------------------------------ */
  function getInitialPageId() {
    try {
      var params = new URLSearchParams(window.location.search);
      var tab = params.get("tab");
      if (tab && getPageById(tab)) return tab;
    } catch (e) {}
    return null;
  }

  /* ==================================================================
     3. RECHERCHE DANS LE FRAGMENT AFFICHÉ (§37)
     L'index de recherche est construit à la volée à partir du contenu DOM
     du fragment actuellement affiché — jamais d'une copie de texte tenue à
     la main séparément.
  ================================================================== */
  var currentSearchResults = [];
  var currentSearchIndex = -1;

  searchInput.addEventListener("input", function () {
    applySearch(searchInput.value.trim());
  });

  searchPrev.addEventListener("click", function () { goToSearchResult(-1); });
  searchNext.addEventListener("click", function () { goToSearchResult(1); });

  searchInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      goToSearchResult(e.shiftKey ? -1 : 1);
    }
  });

  function updateSearchArrowVisibility() {
    var query = searchInput.value.trim();
    var shouldShowArrows = query.length >= 2;
    searchPrev.classList.toggle("hidden", !shouldShowArrows);
    searchNext.classList.toggle("hidden", !shouldShowArrows);
  }

  function updateSearchNavButtons() {
    var hasResults = currentSearchResults.length > 0;
    searchPrev.disabled = !hasResults;
    searchNext.disabled = !hasResults;
  }

  function updateSearchCount() {
    var query = searchInput.value.trim();

    if (!query || query.length < 2) {
      searchCount.textContent = "";
      return;
    }

    if (!currentSearchResults.length) {
      searchCount.textContent = "0 résultat";
      return;
    }

    searchCount.textContent = (currentSearchIndex + 1) + " / " + currentSearchResults.length;
  }

  function getHighlightPalette() {
    var theme = document.documentElement.getAttribute("data-color-scheme") || getEffectiveTheme();
    var rootStyles = getComputedStyle(document.documentElement);

    var color9 = rootStyles.getPropertyValue("--color9").trim() || "#ffe066";
    var color3 = rootStyles.getPropertyValue("--color3").trim() || "#1a1a1a";
    var blanc = rootStyles.getPropertyValue("--blanc").trim() || "#ffffff";

    if (theme === "dark") {
      return { baseBg: color9, baseColor: color3, currentBg: "rgb(27 12 50)", currentColor: blanc };
    }
    if (theme === "autumn") {
      return { baseBg: color9, baseColor: blanc, currentBg: "rgb(85 54 49)", currentColor: blanc };
    }
    return { baseBg: color9, baseColor: blanc, currentBg: "rgb(197 150 126)", currentColor: blanc };
  }

  function applySearch(query) {
    updateSearchArrowVisibility();
    removeHighlights();

    currentSearchResults = [];
    currentSearchIndex = -1;

    if (!query || query.length < 2) {
      updateSearchCount();
      updateSearchNavButtons();
      return;
    }

    if (!contentContainer.firstChild) {
      updateSearchCount();
      updateSearchNavButtons();
      return;
    }

    highlightText(contentContainer, query);
    currentSearchResults = Array.prototype.slice.call(contentContainer.querySelectorAll(".search-highlight"));
    currentSearchIndex = currentSearchResults.length > 0 ? 0 : -1;

    if (currentSearchIndex >= 0) {
      setCurrentSearchResult(currentSearchIndex, true);
    } else {
      updateSearchCount();
      updateSearchNavButtons();
    }
  }

  function goToSearchResult(direction) {
    if (!currentSearchResults.length) return;

    clearCurrentSearchResult();

    if (direction > 0) {
      currentSearchIndex = (currentSearchIndex + 1) % currentSearchResults.length;
    } else {
      currentSearchIndex = (currentSearchIndex - 1 + currentSearchResults.length) % currentSearchResults.length;
    }

    setCurrentSearchResult(currentSearchIndex, true);
  }

  function clearCurrentSearchResult() {
    var palette = getHighlightPalette();

    var current = contentContainer.querySelectorAll(".search-highlight-current");
    for (var i = 0; i < current.length; i++) {
      current[i].classList.remove("search-highlight-current");
      current[i].style.backgroundColor = palette.baseBg;
      current[i].style.color = palette.baseColor;
    }
  }

  function setCurrentSearchResult(index, shouldScroll) {
    if (!currentSearchResults.length || index < 0 || index >= currentSearchResults.length) {
      updateSearchCount();
      updateSearchNavButtons();
      return;
    }

    clearCurrentSearchResult();

    var target = currentSearchResults[index];
    if (!target) return;

    var palette = getHighlightPalette();

    target.classList.add("search-highlight-current");
    target.style.backgroundColor = palette.currentBg;
    target.style.color = palette.currentColor;

    if (shouldScroll) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    updateSearchCount();
    updateSearchNavButtons();
  }

  function removeHighlights() {
    var marks = contentContainer.querySelectorAll(".search-highlight, .search-highlight-current");
    for (var i = 0; i < marks.length; i++) {
      var mark = marks[i];
      var parent = mark.parentNode;
      if (!parent) continue;
      parent.replaceChild(document.createTextNode(mark.textContent), mark);
      parent.normalize();
    }
  }

  function highlightText(root, query) {
    var regex = new RegExp("(" + escapeRegex(query) + ")", "gi");
    var palette = getHighlightPalette();

    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var tag = node.parentElement && node.parentElement.tagName
          ? node.parentElement.tagName.toLowerCase()
          : "";
        if (tag === "script" || tag === "style" || tag === "mark" || tag === "textarea") {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(function (node) {
      var text = node.textContent;
      if (!text) return;

      regex.lastIndex = 0;
      if (!regex.test(text)) return;
      regex.lastIndex = 0;

      var frag = document.createDocumentFragment();
      var lastIndex = 0;
      var match;

      while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          frag.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
        }

        var mark = document.createElement("mark");
        mark.className = "search-highlight";
        mark.style.backgroundColor = palette.baseBg;
        mark.style.borderRadius = "2px";
        mark.style.color = palette.baseColor;
        mark.textContent = match[0];
        frag.appendChild(mark);

        lastIndex = regex.lastIndex;
      }

      if (lastIndex < text.length) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex)));
      }

      node.parentNode.replaceChild(frag, node);
    });
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /* ==================================================================
     4. THÈME : résolution en accès direct (§41) + synchro postMessage (§39-40)
  ================================================================== */
  var STORAGE_KEY = "ppk-theme-preference";
  var LEGACY_KEY = "color-scheme";
  var VALID_THEMES = { dark: true, light: true, autumn: true, winter: true };
  var DEFAULT_THEME = "dark";

  var THEME_IMAGE_MAP = {
    dark: { chatCurieux: "https://2img.net/i.imgur.com/nKfZpku.png" },
    light: { chatCurieux: "https://2img.net/i.imgur.com/AAsxj7q.png" },
    autumn: { chatCurieux: "https://2img.net/i.imgur.com/FgOcsFl.png" }
  };

  function isValidTheme(theme) {
    return !!VALID_THEMES[theme];
  }

  function isTrustedOrigin(origin) {
    return ORIGINES_AUTORISEES.indexOf(origin) !== -1;
  }

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

  function getUrlTheme() {
    try {
      var params = new URLSearchParams(window.location.search);
      var theme = params.get("theme");
      return isValidTheme(theme) ? theme : null;
    } catch (e) {
      return null;
    }
  }

  /* §41 : thème sauvegardé → paramètre d'URL → préférence système → défaut. */
  function getEffectiveTheme() {
    return getSavedTheme() || getUrlTheme() || getSystemTheme() || DEFAULT_THEME;
  }

  function saveTheme(theme) {
    localStorage.setItem(STORAGE_KEY, theme);
    localStorage.setItem(LEGACY_KEY, theme);
  }

  function closestThemeButton(node, limit) {
    while (node && node !== limit) {
      if (node.classList && node.classList.contains("theme-btn") && node.getAttribute("data-theme")) {
        return node;
      }
      node = node.parentNode;
    }
    return null;
  }

  function updateThemeImages(theme) {
    var map = THEME_IMAGE_MAP[theme] || THEME_IMAGE_MAP.dark;
    var images = document.querySelectorAll('img[data-theme-image="chatCurieux"]');

    images.forEach(function (img) {
      var nextSrc = map.chatCurieux;
      if (nextSrc && img.getAttribute("src") !== nextSrc) {
        img.setAttribute("src", nextSrc);
      }
    });
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

  function notifyParentTheme(theme) {
    if (window.parent === window) return;

    ORIGINES_AUTORISEES.forEach(function (origin) {
      try {
        window.parent.postMessage({ type: "PPK_THEME_SYNC", theme: theme }, origin);
      } catch (e) {}
    });
  }

  function applyTheme(theme, persist) {
    if (!isValidTheme(theme)) theme = DEFAULT_THEME;

    document.documentElement.setAttribute("data-color-scheme", theme);
    syncSwitchUI(theme);
    updateThemeImages(theme);

    if (persist) {
      saveTheme(theme);
      notifyParentTheme(theme);
    }

    if (searchInput.value.trim().length >= 2) {
      applySearch(searchInput.value.trim());
    }
  }

  function bindThemeSwitch() {
    var switchEl = document.getElementById("themeSwitch");
    if (!switchEl) return;

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

  /* ------------------------------------------------------------------
     Synchronisation avec la page parente (forum) quand le Guidebook est
     intégré en iframe — avec vérification explicite de event.origin
     (§39-40). Les messages d'origine non reconnue sont ignorés.
  ------------------------------------------------------------------ */
  function requestThemeFromParent() {
    if (window.parent === window) return;

    ORIGINES_AUTORISEES.forEach(function (origin) {
      try {
        window.parent.postMessage({ type: "PPK_THEME_REQUEST" }, origin);
      } catch (e) {}
    });
  }

  window.addEventListener("message", function (event) {
    if (!isTrustedOrigin(event.origin)) return;
    if (!event.data || event.data.type !== "PPK_THEME_SYNC") return;
    if (!isValidTheme(event.data.theme)) return;

    applyTheme(event.data.theme, false);
    saveTheme(event.data.theme);
  });

  function initThemeManager() {
    bindThemeSwitch();
    applyTheme(getEffectiveTheme(), false);
    watchSystemTheme();

    requestThemeFromParent();
    setTimeout(requestThemeFromParent, 100);
    setTimeout(requestThemeFromParent, 300);
    setTimeout(requestThemeFromParent, 700);
  }

  /* ==================================================================
     INITIALISATION
  ================================================================== */
  function init() {
    initThemeManager();
    hideNavTooltip();
    updateSearchNavButtons();
    updateSearchArrowVisibility();

    var initialPageId = getInitialPageId() || DEFAULT_PAGE_ID;
    showPage(initialPageId, { skipUrlUpdate: !getInitialPageId() });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
