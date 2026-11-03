/*
 * compendium.js — logique propre au fragment Compendium du Guidebook
 * (public/guidebook/pages/compendium.html).
 *
 * Nettoyé/adapté depuis les <script> embarqués dans l'ancien compendium.html,
 * qui était alors une page HTML complète chargée dans une iframe cross-
 * origine (https://pumpkinforumrpg-netizen.github.io/ppk/compendium-ppk.html).
 * Dans la nouvelle architecture, ce fragment est injecté directement dans le
 * document de public/guidebook/index.html (fetch + innerHTML, voir
 * public/js/guidebook.js) : il n'y a donc plus de frontière d'iframe, ce qui
 * a permis de simplifier trois choses par rapport à l'original :
 *
 *   1. Synchronisation de thème par postMessage (PPK_THEME_SYNC /
 *      PPK_THEME_REQUEST) : supprimée. Le fragment vit maintenant dans le
 *      même document que le reste du Guidebook ; il hérite directement de
 *      data-color-scheme posé sur <html> par guidebook.js, via les variables
 *      CSS. Rien à synchroniser.
 *
 *   2. Recherche interne (PPK_SEARCH_APPLY / PPK_SEARCH_MOVE /
 *      PPK_SEARCH_RESULTS) : supprimée. La recherche du Guidebook
 *      (public/js/guidebook.js) s'applique maintenant directement au DOM du
 *      fragment affiché, qui vit dans le même document — plus besoin que le
 *      Compendium fasse sa propre recherche en réponse à des messages.
 *
 *   3. openExternalFrame() : supprimée. Cette fonction gérait un lien
 *      data-open-frame qui n'était utilisé par aucun élément du HTML
 *      (vérifié : aucune occurrence de data-open-frame dans compendium.html).
 *      Code mort, non repris.
 *
 * Ce qui est préservé à l'identique : la navigation interne du Compendium
 * (accueil → section Amberwoods/Vesperune → article, fil d'Ariane,
 * annexe précédente/suivante) et les accordéons .rpg-dropdown.
 *
 * Le fragment a son propre système de sections/articles, séparé de celui du
 * Guidebook : un petit sous-plan de site à l'intérieur de la section
 * "Compendium" (contrairement à "resetSection" pour l'accueil vs. articles,
 * la navigation sidebar/onglets du Guidebook n'a pas besoin de connaître ce
 * sous-état).
 *
 * Usage : window.PPKCompendium.init() doit être appelé par guidebook.js
 * chaque fois que ce fragment est (ré)injecté dans le DOM — y compris quand
 * son HTML provient du cache mémoire, puisque l'injection recrée des noeuds
 * DOM neufs à chaque fois (voir note sur la perte d'état de navigation
 * inter-visites dans le cahier de migration / le rapport de migration).
 */
(function () {
  "use strict";

  var dropdownsBound = false;

  function initNavigation(app) {
    var homeView = app.querySelector(".guide-home-view");
    var sectionViews = Array.prototype.slice.call(app.querySelectorAll(".guide-section-view"));

    function syncLayoutWithSidebar() {
      // Le Compendium vit maintenant dans le même document que la sidebar du
      // Guidebook (plus de window.parent : tout est dans le même DOM).
      var sidebar = document.getElementById("sidebar");
      app.classList.toggle("is-collapsed", !!(sidebar && sidebar.classList.contains("collapsed")));
    }

    function observeSidebar() {
      var sidebar = document.getElementById("sidebar");
      if (!sidebar || !window.MutationObserver) return;

      var observer = new MutationObserver(syncLayoutWithSidebar);
      observer.observe(sidebar, { attributes: true, attributeFilter: ["class"] });
    }

    function hideAllViews() {
      var shells = app.querySelectorAll(".guide-shell");
      for (var i = 0; i < shells.length; i++) {
        shells[i].classList.remove("is-active");
      }
    }

    function showHome() {
      hideAllViews();
      homeView.classList.add("is-active");
      sectionViews.forEach(function (section) { resetSection(section); });
    }

    function showSection(sectionId) {
      var section = app.querySelector('.guide-section-view[data-section="' + sectionId + '"]');
      if (!section) return;
      hideAllViews();
      section.classList.add("is-active");
      resetSection(section);
    }

    function resetSection(section) {
      var listPanel = section.querySelector(".guide-list-panel");
      var articlePanels = section.querySelectorAll(".guide-article-panel");
      var crumbArticle = section.querySelector(".guide-breadcrumb-article");
      var crumbTitle = section.querySelector(".guide-current-article-title");

      if (listPanel) listPanel.classList.add("is-active");
      articlePanels.forEach(function (panel) { panel.classList.remove("is-active"); });
      if (crumbArticle) crumbArticle.hidden = true;
      if (crumbTitle) crumbTitle.textContent = "";
    }

    function openArticle(section, articleId) {
      var listPanel = section.querySelector(".guide-list-panel");
      var articlePanels = Array.prototype.slice.call(section.querySelectorAll(".guide-article-panel"));
      var articleLinks = Array.prototype.slice.call(section.querySelectorAll(".guide-article-link"));
      var crumbArticle = section.querySelector(".guide-breadcrumb-article");
      var crumbTitle = section.querySelector(".guide-current-article-title");

      var link = articleLinks.find(function (btn) { return btn.dataset.openArticle === articleId; });
      var panel = articlePanels.find(function (item) { return item.dataset.article === articleId; });

      if (!link || !panel) return;

      if (listPanel) listPanel.classList.remove("is-active");
      articlePanels.forEach(function (item) { item.classList.remove("is-active"); });
      panel.classList.add("is-active");

      var titleNode = link.querySelector("strong");
      var articleTitle = titleNode ? titleNode.textContent.trim() : link.textContent.trim();

      if (crumbArticle) crumbArticle.hidden = false;
      if (crumbTitle) crumbTitle.textContent = articleTitle;

      var ids = articleLinks
        .filter(function (btn) { return btn.dataset.openArticle; })
        .map(function (btn) { return btn.dataset.openArticle; });

      var index = ids.indexOf(articleId);

      var prevBtn = panel.querySelector('[data-action="prev"]');
      var nextBtn = panel.querySelector('[data-action="next"]');
      var prevLink = index > 0 ? articleLinks[index - 1] : null;
      var nextLink = index >= 0 && index < articleLinks.length - 1 ? articleLinks[index + 1] : null;
      var prevTitle = prevLink ? (prevLink.querySelector("strong") || prevLink).textContent.trim() : "Annexe précédente";
      var nextTitle = nextLink ? (nextLink.querySelector("strong") || nextLink).textContent.trim() : "Annexe suivante";

      if (prevBtn) {
        prevBtn.disabled = index <= 0;
        prevBtn.textContent = index > 0 ? ("← " + prevTitle) : "← Annexe précédente";
      }
      if (nextBtn) {
        nextBtn.disabled = index >= ids.length - 1;
        nextBtn.textContent = (index >= 0 && index < ids.length - 1) ? (nextTitle + " →") : "Annexe suivante →";
      }
    }

    function getActiveSection() {
      return app.querySelector(".guide-section-view.is-active");
    }

    function getActiveArticlePanel(section) {
      if (!section) return null;
      return section.querySelector(".guide-article-panel.is-active");
    }

    function goRelative(direction) {
      var section = getActiveSection();
      var activePanel = getActiveArticlePanel(section);
      if (!section || !activePanel) return;

      var links = Array.prototype.slice.call(section.querySelectorAll(".guide-article-link"))
        .filter(function (btn) { return btn.dataset.openArticle; });

      var ids = links.map(function (btn) { return btn.dataset.openArticle; });
      var currentId = activePanel.dataset.article;
      var currentIndex = ids.indexOf(currentId);
      var nextIndex = currentIndex + direction;

      if (nextIndex < 0 || nextIndex >= ids.length) return;
      openArticle(section, ids[nextIndex]);
    }

    app.addEventListener("click", function (event) {
      var openSectionBtn = event.target.closest("[data-open-section]");
      if (openSectionBtn) {
        showSection(openSectionBtn.dataset.openSection);
        return;
      }

      var openArticleBtn = event.target.closest("[data-open-article]");
      if (openArticleBtn) {
        var section = openArticleBtn.closest(".guide-section-view");
        if (!section) return;
        openArticle(section, openArticleBtn.dataset.openArticle);
        return;
      }

      var actionBtn = event.target.closest("[data-action]");
      if (!actionBtn) return;

      var action = actionBtn.dataset.action;
      var actionSection = actionBtn.closest(".guide-section-view");

      if (action === "home") {
        showHome();
        return;
      }
      if (action === "list" && actionSection) {
        resetSection(actionSection);
        return;
      }
      if (action === "prev") {
        goRelative(-1);
        return;
      }
      if (action === "next") {
        goRelative(1);
      }
    });

    observeSidebar();
    syncLayoutWithSidebar();
    showHome();
  }

  function initDropdowns(app) {
    var dropdowns = app.querySelectorAll(".rpg-dropdown");

    dropdowns.forEach(function (dropdown) {
      var head = dropdown.querySelector(".rpg-dropdown__head");
      var content = dropdown.querySelector(".rpg-dropdown__content");
      if (!head || !content) return;

      head.addEventListener("click", function () {
        var isOpen = dropdown.classList.contains("active");

        if (isOpen) {
          content.style.maxHeight = "0px";
          dropdown.classList.remove("active");
        } else {
          content.style.maxHeight = content.scrollHeight + "px";
          dropdown.classList.add("active");
        }
      });
    });

    if (!dropdownsBound) {
      // Un seul écouteur global suffit pour toute la durée de vie de la page :
      // il recalcule la hauteur de n'importe quel accordéon ouvert, qu'il
      // appartienne à l'instance actuelle du fragment ou à une future.
      window.addEventListener("resize", function () {
        document.querySelectorAll("#guide-app .rpg-dropdown.active").forEach(function (dropdown) {
          var content = dropdown.querySelector(".rpg-dropdown__content");
          if (content) content.style.maxHeight = content.scrollHeight + "px";
        });
      });
      dropdownsBound = true;
    }
  }

  function init() {
    var app = document.getElementById("guide-app");
    if (!app) return;

    initNavigation(app);
    initDropdowns(app);
  }

  window.PPKCompendium = { init: init };
})();
