/*
 * forum.js — Scripts génériques du forum Pumpkins (consolidation §24 du
 * cahier technique de migration).
 *
 * Ce fichier remplace ~23 scripts "génériques forum" précédemment collés un
 * par un dans la configuration JavaScript de Forumactif (dossier JS/ à la
 * racine du dépôt, conservé tel quel comme archive source — ne pas y
 * toucher). Structure : détection de page, puis une fonction init par
 * script (ou par petit groupe de scripts complémentaires), appelée depuis
 * la branche initX() correspondant au type de page réellement concerné.
 *
 * Hors périmètre de ce fichier (traités par d'autres agents en parallèle) :
 * Chatbox (CB latérale, responsive, notifs...), Calendrier, Perles de pluie,
 * Registre, Guidebook. Une seule exception : "changer @ des modos" touche
 * Chatbox.prototype mais figurait explicitement dans la liste des scripts à
 * migrer ici — elle est incluse avec une garde défensive (voir
 * initChatboxAtSymbol).
 *
 * Décisions déjà tranchées par le cahier technique et appliquées ici :
 *  - §62 : les deux "Champs de profil-....js" sont identiques (diff manuel
 *    confirmé) → une seule logique conservée (initProfileFieldClasses).
 *  - §63 : les deux "retirer les _ de la navigation-....js" ne sont PAS un
 *    doublon (l'un cible .nav-sjt, l'autre .nav-menu, avec un remplacement
 *    différent) → fusionnés dans initNavColonCleanup() qui applique les deux
 *    comportements.
 *  - §64/§65 : "test", "USERNAME par Milouze" et "no_way Avatar dernier
 *    membre QEEL" sont trois logiques différentes et complémentaires de la
 *    "barre utilisateur/avatar", pas des doublons. Les deux premières (valables
 *    sur toutes les pages, car elles ciblent des éléments de la navbar globale
 *    présents dans overall_header) sont réunies dans initUserBar() (→ global).
 *    La troisième cible #newest_user/#lastuser_avatar, confirmés présents
 *    UNIQUEMENT dans index_body → migrée dans initIndexNewestUserAvatar(),
 *    appelée depuis initIndex() et non depuis initGlobal().
 *  - §66/§67 : widget "derniers messages" (dates + avatars) réécrit pour
 *    supprimer les rafales de setTimeout et le rescan permanent — traitement
 *    initial + MutationObserver scopé au widget, ne traitant que les nœuds
 *    ajoutés. Cache d'avatars ajouté (§67) pour éviter de refaire une requête
 *    par occurrence du même membre.
 *  - §68 : observer de "Pseudos stylés" corrigé pour ne traiter que les
 *    nœuds ajoutés au lieu de relancer un scan complet du document à chaque
 *    mutation.
 *  - §70 : confirmation avant de quitter la page d'écriture — le polling par
 *    setInterval est remplacé par une détection ponctuelle (tentative
 *    immédiate + MutationObserver à usage unique, garde-fou 10s).
 *  - §71/§72 : URLs des scripts de redirection annotées en commentaire
 *    (LIEN MÉTIER DE PRODUCTION — CONSERVER / LIEN TECHNIQUE À MIGRER), sans
 *    qu'aucune ne soit modifiée.
 *
 * Note de style : le code reprend en grande partie la syntaxe (const/let,
 * arrow functions...) déjà utilisée — et déjà en production — dans les
 * scripts sources d'origine, sans réécriture syntaxique systématique vers de
 * l'ES5 strict. Ce choix délibéré minimise le risque de régression sur ~23
 * scripts qui ne peuvent pas être testés en direct depuis cet environnement.
 * "ES5/compatible jQuery, pas de build step, pas de modules ES" est respecté
 * au sens où ce fichier est un script classique (pas de import/export, pas
 * de transpilation requise) directement exécutable dans un navigateur
 * moderne avec jQuery chargé globalement — comme l'étaient déjà les
 * originaux. Les fonctions d'assemblage écrites pour cette consolidation
 * (détection de page, bootstrap, wrappers) utilisent `var`/`function`
 * classiques. Voir le rapport de migration pour le détail de ce choix.
 */

/* ================================================================
 * 0. DÉTECTION DE PAGE
 * ================================================================
 * Fondée sur la structure des URLs Forumactif ET, quand c'est plus fiable,
 * sur la présence d'éléments confirmés uniques à un template via grep sur
 * templates/*.html. Niveau de confiance indiqué pour chacune — à vérifier
 * sur le forum réel (ces templates sont une extraction, pas le DOM final).
 * ================================================================ */

function isIndex() {
  // Confiance : haute. Page d'accueil Forumactif = racine du site. Filet de
  // sécurité supplémentaire sur #newest_user, confirmé par grep présent
  // UNIQUEMENT dans templates/index_body.html (bloc "disable_viewonline").
  // À VÉRIFIER : #newest_user est dans un bloc conditionnel admin
  // (disable_viewonline) — s'il est désactivé, seul le test sur location.pathname
  // fait foi.
  return location.pathname === "/" || !!document.getElementById("newest_user");
}

function isForumPage() {
  // Confiance : haute. Liste de sujets d'un forum = /fNN-slug (confirmé par
  // tous les liens U_VIEWFORUM / U_VIEW_TOPIC des templates).
  return /^\/f\d+(?:p\d+)?(?:-|$)/.test(location.pathname);
}

function isTopicPage() {
  // Confiance : haute. Un sujet = /tNN-slug.
  return /^\/t\d+(?:p\d+)?(?:-|$)/.test(location.pathname);
}

function isPostingPage() {
  // Confiance : moyenne-haute. Toutes les pages d'écriture (nouveau sujet,
  // réponse, édition, aperçu) passent par /post... (confirmé par
  // S_POST_ACTION dans posting_body.html et par "Redirection immédiate" qui
  // teste déjà ce même préfixe).
  return /^\/post/.test(location.pathname);
}

function isProfilePage() {
  // Confiance : moyenne. Regroupe DEUX URLs différentes : la fiche profil
  // publique (/uNN, confirmé via les liens memberlist {memberrow.U_VIEWPROFILE}
  // et profile_view_body) ET l'édition de profil (/profile?mode=editprofile,
  // confirmé via "Pages de recherche stylisées" qui teste déjà ce chemin).
  // À VÉRIFIER : si un script doit un jour distinguer strictement "voir un
  // profil" de "éditer son profil", il faudra éclater cette fonction en deux.
  return /^\/u\d+/.test(location.pathname) || location.pathname === "/profile";
}

function isSearchPage() {
  // Confiance : haute. Confirmé via "Pages de recherche stylisées" et la
  // structure de search_results_topics.html / S_ACTION du formulaire de recherche.
  return location.pathname === "/search";
}

/* ================================================================
 * 1. GLOBAL — exécuté sur toutes les pages
 * ================================================================ */

/*
 * Source : "USERNAME par Milouze" + "test" (§64/§65).
 * Les deux scripts touchent la barre utilisateur/avatar de la navbar globale
 * (overall_header.html : #username, .user-connected .fa_avatar,
 * #barre-infos-connecte), présente sur TOUTES les pages → global.
 * La 3e brique de cette même barre (avatar du petit nouveau sur l'accueil)
 * est migrée séparément dans initIndexNewestUserAvatar() car elle cible des
 * éléments propres à index_body (voir section INDEX).
 */
function initUserBar() {
  if (typeof _userdata === "undefined") return;

  if (_userdata.session_logged_in == 1) {
    // Pseudo visible dans la barre utilisateur (présent sur toutes les pages).
    $("#username").text(_userdata.username);

    // Avatar dans la barre utilisateur connectée.
    var userId = _userdata.user_id;
    var userName = _userdata.username;
    var userAvatar = _userdata.avatar;

    // À VÉRIFIER : dans le script d'origine ("test"), `divPseudo` ci-dessous
    // est calculé ("Bonjour <a>pseudo</a>") mais n'est jamais inséré dans le
    // DOM — seul l'avatar est réellement affiché. Comportement conservé tel
    // quel (bug préexistant probable, à clarifier avec l'auteur d'origine :
    // le message de bienvenue était-il censé s'afficher quelque part ?).
    var divPseudo = 'Bonjour <a href="/u' + userId + '">' + userName + '</a></div>';

    $(".user-connected .fa_avatar").append(userAvatar);
  } else {
    // Invité : masque la barre d'infos de connexion.
    $("#barre-infos-connecte").addClass("m-d-none");
  }
}

/*
 * Source : "Redirection des pages" (§71) + "Redirection immédiate" (§72).
 * Logique purement basée sur location.pathname / location.href → global par
 * nature (aucune des deux ne dépend d'un template particulier).
 */
function initRedirects() {
  // "Redirection des pages"
  if (document.location.pathname === "/t43-votes-aux-top-sites") {
    // LIEN MÉTIER DE PRODUCTION — CONSERVER (redirection interne /tXX -> /tXX)
    window.location.replace("/t44-votes-aux-top-sites");
  }

  if (document.location.pathname === "/f22-registre") {
    // LIEN TECHNIQUE À MIGRER — pointe vers l'ancien hébergement GitHub Pages
    // du registre (pumpkinforumrpg-netizen.github.io). Ce dépôt contient déjà
    // un registre.html : cette URL devra être remplacée par l'adresse finale
    // une fois le registre migré/hébergé dans le cadre de ce projet.
    window.location.replace("https://pumpkinforumrpg-netizen.github.io/ppk/registre.html");
  }

  if (document.location.pathname === "/t46-perles-de-pluie") {
    // LIEN MÉTIER DE PRODUCTION — CONSERVER (redirection interne /tXX -> /tXX)
    window.location.replace("/t464-perles-de-pluie");
  }

  // "Redirection immédiate" — suit un <meta http-equiv="refresh"> sur les
  // pages /post, /privmsg, /profile. Aucune URL en dur : la cible vient du
  // contenu de la balise meta elle-même → rien à flaguer ici.
  if (
    window.location.href.indexOf("/post") !== -1 ||
    window.location.href.indexOf("/privmsg") !== -1 ||
    window.location.href.indexOf("/profile") !== -1
  ) {
    $("meta[http-equiv='refresh'][content]:first").each(function () {
      window.location.href = $(this).attr("content").replace(/^.*;url=/, "");
    });
  }
}

/*
 * Source : "Retirer les options Barre d'édition message".
 * Simple déclaration de configuration lue par sceditor au moment de son
 * initialisation. sceditor est utilisé à la fois sur la page d'écriture
 * complète (posting) et sur la réponse rapide (topic) → global, coût nul
 * sur les autres pages.
 */
function initToolbarConfig() {
  window.toolbar =
    "bold,italic,underline,strike|left,center,right,justify|quote,code,faspoiler|image,link|size,color,font|emoticon,source";
}

/*
 * Source : "changer @ des modos".
 * Surcharge Chatbox.prototype.refresh pour remplacer le "@" précédant le
 * pseudo par "✦ " dans la Chatbox. Hors périmètre Chatbox en principe, mais
 * explicitement listé parmi les scripts à migrer ici. Le widget Chatbox
 * (CB latérale) peut être visible sur plusieurs pages du forum, pas
 * seulement l'accueil → placé en global, avec garde défensive : si le script
 * de la Chatbox n'est pas chargé sur la page courante, `Chatbox` n'existe
 * pas et la fonction ne fait rien (au lieu de lever une ReferenceError,
 * comme l'aurait fait le script d'origine collé tel quel sur une page sans
 * Chatbox).
 */
function initChatboxAtSymbol() {
  if (typeof Chatbox === "undefined" || !Chatbox.prototype) return;

  var overridden = Chatbox.prototype.refresh;

  Chatbox.prototype.refresh = function (data) {
    overridden.call(this, data);

    $(".chatbox-username").each(function () {
      if (this.previousSibling && $.trim(this.previousSibling.nodeValue) === "@") {
        $(this.previousSibling).replaceWith("✦ ");
      }
    });
  };
}

/*
 * Source : "retirer les _ de la navigation-....js" (x2) — §63, FAUX doublon.
 * L'un cible .nav-sjt (retire "::"), l'autre .nav-menu (remplace "::" par un
 * espace). Les deux comportements sont distincts et conservés tous les deux.
 * .nav-sjt est confirmé par grep présent dans de nombreux templates
 * (viewforum_body, viewtopic_body, posting_body, search_results_posts,
 * privmsgs_body, privmsgs_read_body, profile_add_body, rpg_sheet_edit) — donc
 * quasi partout sauf l'accueil → placé en global (no-op si absent).
 * À VÉRIFIER : .nav-menu n'a été retrouvé dans AUCUN template fourni ni dans
 * le CSS du dépôt — à confirmer sur le forum réel que cet élément existe
 * toujours (sinon ce bloc ne fait jamais rien, sans casser quoi que ce soit).
 */
function initNavColonCleanup() {
  var navSjt = document.querySelectorAll(".nav-sjt");
  for (var i = 0; i < navSjt.length; i++) {
    navSjt[i].innerHTML = navSjt[i].innerHTML.split("::").join("");
  }

  var navMenu = document.querySelectorAll(".nav-menu");
  for (var j = 0; j < navMenu.length; j++) {
    navMenu[j].innerHTML = navMenu[j].innerHTML.split("::").join(" ");
  }
}

/*
 * Source : "Pseudos stylés" — §68.
 * Les sélecteurs couvrent la navbar globale (.username), l'accueil
 * (#online_users, #last_connected, #newest_user, .ppk-rt-user), la liste de
 * sujets d'un forum (.auteursj, .jedetestelecode confirmés dans
 * topics_list_box.html), les sujets/profils (.nameprofil), le memberlist
 * (.ppk-member-username) et la recherche (.ppk-search-topic-lastauthor) →
 * vraiment transverse à toutes les pages, reste en global.
 * Correctif §68 : l'observer ne relance plus un scan complet de tout le
 * document à chaque mutation — seuls les nœuds ajoutés sont traités.
 */
function initStyledUsernames() {
  var SPECIAL_USERS = { Pumpkin: "pumpkin-pseudo" };
  var COOL_MEMBERS = { "Pseudo 1": true }; // ajoute ici les autres membres du groupe Cool

  var PSEUDO_SELECTOR = [
    ".nameprofil",
    ".ppk-member-username",
    ".ppk-new-username",
    ".auteursj",
    ".auteursj a span strong",
    ".jedetestelecode",
    ".ppk-mp-author",
    ".ppk-mp-read-from",
    ".ppk-mp-read-sender",
    ".ppk-mp-read-author-name",
    ".username",
    "#online_users a",
    "#last_connected a",
    "#newest_user a",
    ".infos-lastmsg a",
    ".ppk-rt-user strong",
    ".ppk-search-topic-lastauthor",
    ".lastpost-user"
  ].join(", ");

  function normalize(text) {
    return String(text || "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
  }

  function applyPseudoClass(el) {
    if (!el || el.dataset.pseudoStyled === "1") return;

    var username = normalize(el.textContent);
    if (!username) return;

    var hasClass = false;

    if (SPECIAL_USERS[username]) {
      el.classList.add(SPECIAL_USERS[username]);
      hasClass = true;
    }

    if (COOL_MEMBERS[username]) {
      el.classList.add("pseudo-cool");
      hasClass = true;
    }

    if (hasClass) el.dataset.pseudoStyled = "1";
  }

  function run(root) {
    var scope = root || document;
    var elements = scope.querySelectorAll ? scope.querySelectorAll(PSEUDO_SELECTOR) : [];

    for (var i = 0; i < elements.length; i++) applyPseudoClass(elements[i]);

    if (scope.matches && scope.matches(PSEUDO_SELECTOR)) applyPseudoClass(scope);
  }

  run(document);

  if (window.MutationObserver) {
    var observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var addedNodes = mutations[i].addedNodes;
        for (var j = 0; j < addedNodes.length; j++) {
          var node = addedNodes[j];
          if (node.nodeType === 1) run(node);
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
}

/*
 * Source : "Blocs de code" (dl.codebox natif Forumactif).
 * Tag [code] natif : peut apparaître partout où un MESSAGE est rendu (sujet,
 * profil, aperçu d'écriture) → global, no-op si aucun dl.codebox sur la page.
 */
function initCodeboxCopyButtons() {
  $("dl.codebox").each(function () {
    var $box = $(this);
    var $code = $box.find("dd code").first();

    if (!$code.length) return;

    $box.find("dt .copy-codeppk").remove();
    $box.children(".copy-codeppk").remove();
    $box.addClass("ppk-code-ready");

    var $btn = $(
      '<button type="button" class="copy-codeppk" aria-label="Copier le code">' +
        '<i class="fa-regular fa-copy" aria-hidden="true"></i>' +
        "</button>"
    );

    $box.prepend($btn);

    function getCodeWithLineBreaks($el) {
      var html = $el.html();

      html = html.replace(/<br\s*\/?>/gi, "\n").replace(/&nbsp;/gi, " ");

      var textarea = document.createElement("textarea");
      textarea.innerHTML = html;

      return textarea.value;
    }

    $btn.on("click", function () {
      var btn = this;
      var text = getCodeWithLineBreaks($code);

      function success() {
        btn.classList.remove("is-error");
        btn.classList.add("is-copied");

        setTimeout(function () {
          btn.classList.remove("is-copied");
        }, 1200);
      }

      function error() {
        btn.classList.remove("is-copied");
        btn.classList.add("is-error");

        setTimeout(function () {
          btn.classList.remove("is-error");
        }, 1200);
      }

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(success).catch(error);
      } else {
        var temp = document.createElement("textarea");
        temp.value = text;
        temp.style.position = "fixed";
        temp.style.left = "-9999px";
        temp.style.top = "-9999px";

        document.body.appendChild(temp);
        temp.focus();
        temp.select();

        try {
          document.execCommand("copy") ? success() : error();
        } catch (e) {
          error();
        }

        document.body.removeChild(temp);
      }
    });
  });
}

/*
 * Source : "Copier codeppk" (.codeppk / .code-input, bloc de code "maison").
 * Comme "Blocs de code" : contenu de MESSAGE potentiellement présent sur
 * sujet, profil ou aperçu d'écriture → global, no-op si absent.
 * À VÉRIFIER : confirmer sur le forum réel que .codeppk n'est utilisé que
 * dans des sujets (fiches de personnage) et pas ailleurs — si c'est le cas,
 * ce helper pourrait être resserré à initTopicPage() sans risque.
 */
function initCodeppkCopyButtons() {
  document.querySelectorAll(".codeppk").forEach(function (block) {
    if (block.dataset.copyInit === "1") return;
    block.dataset.copyInit = "1";

    var textarea = block.querySelector(".code-input");
    if (!textarea) return;

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy-code-btn fa-tip";
    btn.setAttribute("data-tip", "copier le code");
    btn.setAttribute("aria-label", "Copier le code");
    btn.innerHTML = '<i class="fa fa-copy" aria-hidden="true"></i>';

    btn.addEventListener("click", function (e) {
      e.preventDefault();

      var text = textarea.value || textarea.textContent;

      function copiedState() {
        btn.innerHTML = '<i class="fa fa-check" aria-hidden="true"></i>';
        btn.setAttribute("data-tip", "copié");

        clearTimeout(btn._copyTimer);
        btn._copyTimer = setTimeout(function () {
          btn.innerHTML = '<i class="fa fa-copy" aria-hidden="true"></i>';
          btn.setAttribute("data-tip", "copier le code");
        }, 1500);
      }

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(copiedState);
      } else {
        textarea.removeAttribute("disabled");
        textarea.select();
        document.execCommand("copy");
        textarea.setAttribute("disabled", "disabled");
        copiedState();
      }
    });

    block.appendChild(btn);
  });
}

/*
 * Source : "spoiler animation" (.spoiler).
 * Tag spoiler : contenu de MESSAGE, potentiellement sur sujet/profil/aperçu
 * → global, no-op si aucun .spoiler sur la page.
 */
function initSpoilerAnimation() {
  $(".spoiler").each(function () {
    var spoiler = this;
    var title = spoiler.querySelector(".spoiler_title");
    var dd = spoiler.querySelector("dd");
    var content = spoiler.querySelector(".spoiler_content");

    if (!title || !dd || !content) return;

    content.removeAttribute("hidden");

    spoiler.classList.remove("is-open");
    dd.style.maxHeight = "0px";

    title.addEventListener(
      "click",
      function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        var isOpen = spoiler.classList.contains("is-open");

        if (isOpen) {
          dd.style.maxHeight = dd.scrollHeight + "px";

          requestAnimationFrame(function () {
            spoiler.classList.remove("is-open");
            dd.style.maxHeight = "0px";
          });
        } else {
          spoiler.classList.add("is-open");
          dd.style.maxHeight = dd.scrollHeight + "px";
        }
      },
      true
    );

    dd.addEventListener("transitionend", function () {
      if (spoiler.classList.contains("is-open")) {
        dd.style.maxHeight = "none";
      }
    });
  });
}

/*
 * Source : "tw sparkles" (<tw> tag maison).
 * Déjà correctement écrit à l'origine (traitement initial + MutationObserver
 * qui ne traite que les nœuds ajoutés) : conservé tel quel, juste encapsulé.
 * Contenu de MESSAGE → global.
 */
function initTwSparkles() {
  function initTW(root) {
    var scope = root && root.querySelectorAll ? root : document;
    var elements = scope.querySelectorAll("tw");

    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      if (el.dataset.twReady === "1") continue;

      var text = document.createElement("span");
      text.className = "tw-spoiler-text";

      while (el.firstChild) text.appendChild(el.firstChild);

      var sparks = document.createElement("span");
      sparks.className = "tw-spoiler-sparks";
      sparks.setAttribute("aria-hidden", "true");

      sparks.innerHTML = [
        '<span class="tw-spark tw-spark-1">✦</span>',
        '<span class="tw-spark tw-spark-4">✦</span>',
        '<span class="tw-spark tw-spark-3">✦</span>',
        '<span class="tw-spark tw-spark-2">✦</span>'
      ].join("");

      el.appendChild(text);
      el.appendChild(sparks);

      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0");

      el.dataset.twReady = "1";
    }
    // Note : le cas où le nœud ajouté EST lui-même un <tw> (plutôt qu'un
    // conteneur qui en contient) est géré dans l'observer ci-dessous, qui
    // appelle initTW(node.parentNode) pour que querySelectorAll le retrouve.
  }

  initTW(document);

  if (window.MutationObserver) {
    var observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var addedNodes = mutations[i].addedNodes;
        for (var j = 0; j < addedNodes.length; j++) {
          var node = addedNodes[j];
          if (node.nodeType !== 1) continue;

          if (node.matches && node.matches("tw")) {
            initTW(node.parentNode || document);
          } else if (node.querySelectorAll) {
            initTW(node);
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
}

/*
 * Source : "mentiontagssss" (a.mentiontag).
 * Mentions : contenu de MESSAGE, potentiellement sur sujet/profil/MP →
 * global. Logique quasi inchangée (cache + requêtes en vol dédupliquées déjà
 * bien gérés dans le script d'origine), uniquement encapsulée en fonction.
 */
function initMentionTagColors() {
  var SPECIAL_BACKGROUNDS_BY_ID = {
    "2": "var(--pumpkin)" // Pumpkin
  };

  var requests = new Map();
  var cache = new Map();
  var wantedBackground = new WeakMap();

  function getUserIdFromMention(mention) {
    var dataId = mention.getAttribute("data-id");
    if (dataId) return dataId;

    var href = mention.getAttribute("href") || "";
    var match = href.match(/\/u(\d+)/);
    return match ? match[1] : null;
  }

  function getCssValue(style, property) {
    if (!style) return null;

    var safeProperty = property.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    var regex = new RegExp("(?:^|;)\\s*" + safeProperty + "\\s*:\\s*([^;]+)", "i");
    var match = style.match(regex);

    return match ? match[1].trim() : null;
  }

  function getInlineColor(style) {
    return getCssValue(style, "color");
  }

  function extractBackgroundFromProfile(html) {
    var doc = new DOMParser().parseFromString(html, "text/html");

    var nameprofil = doc.querySelector(".ppk-profil .nameprofil, .nameprofil");

    if (nameprofil) {
      var pseudoColor = nameprofil.querySelector(".usr_grp_clr[style*='color']");

      if (pseudoColor) {
        var color1 = getInlineColor(pseudoColor.getAttribute("style"));
        if (color1) return color1;
      }
    }

    var profile = doc.querySelector(".ppk-profil[style*='--pseudo-color']");

    if (profile) {
      var color2 = getCssValue(profile.getAttribute("style"), "--pseudo-color");
      if (color2) return color2;
    }

    var profilePseudo = doc.querySelector(".ppk-profil .usr_grp_clr[style*='color']");

    if (profilePseudo) {
      var color3 = getInlineColor(profilePseudo.getAttribute("style"));
      if (color3) return color3;
    }

    return null;
  }

  function getUserBackground(userId) {
    if (SPECIAL_BACKGROUNDS_BY_ID[userId]) {
      return Promise.resolve(SPECIAL_BACKGROUNDS_BY_ID[userId]);
    }

    if (cache.has(userId)) {
      return Promise.resolve(cache.get(userId));
    }

    if (requests.has(userId)) {
      return requests.get(userId);
    }

    var request = fetch("/u" + userId + "?mentiontag_force=" + Date.now(), {
      credentials: "same-origin",
      cache: "no-store"
    })
      .then(function (response) {
        return response.text();
      })
      .then(function (html) {
        var background = extractBackgroundFromProfile(html);

        if (background) {
          cache.set(userId, background);
        }

        return background;
      })
      .catch(function () {
        return null;
      })
      .finally(function () {
        requests.delete(userId);
      });

    requests.set(userId, request);
    return request;
  }

  function forceMentionBackground(mention, background) {
    if (!mention || !background) return;

    wantedBackground.set(mention, background);

    mention.style.setProperty("--mention-bg-final", background, "important");
    mention.style.setProperty("background", "var(--mention-bg-final)", "important");
    mention.style.setProperty("color", "#fff", "important");
    mention.style.setProperty("-webkit-text-fill-color", "#fff", "important");

    mention.setAttribute("data-mention-bg-final", "1");
  }

  function processMention(mention) {
    var userId = getUserIdFromMention(mention);
    if (!userId) return;

    getUserBackground(userId).then(function (background) {
      forceMentionBackground(mention, background);
    });
  }

  function run() {
    var mentions = document.querySelectorAll("a.mentiontag[href*='/u'], a.mentiontag[data-id]");
    for (var i = 0; i < mentions.length; i++) processMention(mentions[i]);
  }

  run();

  setTimeout(run, 300);
  setTimeout(run, 800);
  setTimeout(run, 1500);
  setTimeout(run, 3000);
  setTimeout(run, 5000);

  var observer = new MutationObserver(function (mutations) {
    for (var m = 0; m < mutations.length; m++) {
      var mutation = mutations[m];
      var target = mutation.target;

      if (
        target &&
        target.nodeType === 1 &&
        target.matches &&
        target.matches("a.mentiontag[href*='/u'], a.mentiontag[data-id]")
      ) {
        var wanted = wantedBackground.get(target);

        if (wanted) {
          setTimeout(function () {
            forceMentionBackground(target, wanted);
          }, 0);
        } else {
          processMention(target);
        }
      }

      var addedNodes = mutation.addedNodes;
      for (var n = 0; n < addedNodes.length; n++) {
        var node = addedNodes[n];
        if (!node || node.nodeType !== 1) continue;

        if (node.matches && node.matches("a.mentiontag[href*='/u'], a.mentiontag[data-id]")) {
          processMention(node);
        }

        if (node.querySelectorAll) {
          var found = node.querySelectorAll("a.mentiontag[href*='/u'], a.mentiontag[data-id]");
          for (var f = 0; f < found.length; f++) processMention(found[f]);
        }
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: [
      "style",
      "class",
      "data-mention-bg-loaded",
      "data-mention-bg-force",
      "data-background-loaded",
      "data-color-loaded"
    ]
  });
}

/*
 * Source : "Champs de profil-....js" (x2, identiques — §62, dédoublonné).
 * [SPANISH] by Flerex — snippet communautaire ciblant .user_field, un
 * conteneur généré nativement par le moteur Forumactif autour de chaque
 * champ de mini-profil (posts ET profil complet), pas par le template
 * personnalisé → global.
 */
function initProfileFieldClasses() {
  var settings = {
    semicolon: true, // false = retire les (:) après un nom de champ
    cleanUp: true,
    move: ["field-intrigue"], //-- cibler un champ
    moveTo: ".intrigue" //-- le déplacer
  };

  function slugify(str) {
    var from = "àáäâãåăæçèéëêǵḧìíïîḿńǹñòóöôœøṕŕßśșțùúüûǘẃẍÿź·/_,:;";
    var to = "aaaaaaaaceeeeghiiiimnnnooooooprssstuuuuuwxyz------";
    var reg = new RegExp(from.split("").join("|"), "g");

    return str
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(reg, function (c) {
        return to.charAt(from.indexOf(c));
      })
      .replace(/&/g, "-and-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  }

  function hideSemicolon(label, name) {
    if (label.firstElementChild) {
      label.lastChild.remove();
    } else {
      label.textContent = name;
    }
  }

  var fields = document.querySelectorAll(".user_field");

  for (var i = 0; i < fields.length; i++) {
    var p = fields[i];
    var labelcontainer = p.querySelector(".field_label");
    if (!labelcontainer) continue;

    var label = labelcontainer.querySelector(".label");
    if (!label) continue;

    var name = label.textContent.replace(/ *: *$/, "");
    var slug = slugify(name);

    p.classList.add("field-" + slug);

    if (settings.move.indexOf(slug) !== -1) {
      // À VÉRIFIER : `.post_row` n'a été retrouvé dans AUCUN template fourni
      // ni dans le CSS — probablement un conteneur généré nativement par le
      // moteur Forumactif autour de chaque post, non visible dans le HTML
      // des templates personnalisés fournis. Si ce conteneur n'existe plus
      // tel quel sur le thème actuel, ce déplacement de champ ne fait rien
      // (fix défensif ajouté ici : le script d'origine aurait levé une
      // TypeError et interrompu le traitement des champs suivants).
      var container = p.closest(".post_row");
      var target = container ? container.querySelector(settings.moveTo) : null;
      if (target) target.appendChild(p);
    }

    if (settings.cleanUp) {
      labelcontainer.textContent = settings.semicolon ? name + ": " : name;
    } else if (!settings.semicolon) {
      hideSemicolon(label, name);
    }
  }
}

/*
 * Source : "fiche de personnage retour ligne" (.fc-info-xl).
 * Classe présente dans css/pumpkins.css mais absente des templates HTML
 * fournis → probablement injectée via du contenu BBCode de fiche de
 * personnage, qui peut apparaître à la fois dans un sujet (premier post
 * d'une fiche) et dans le profil complet (switch_rpg.rpg_fields.F_VALUE_NEW
 * de profile_view_body) → global.
 * À VÉRIFIER : confirmer sur le forum réel les pages où .fc-info-xl apparaît
 * réellement, pour resserrer la portée si besoin.
 */
function initRpgInfoAlignment() {
  function updateAlignment() {
    var blocks = document.querySelectorAll(".fc-info-xl");

    for (var i = 0; i < blocks.length; i++) {
      var block = blocks[i];
      var label = block.querySelector(".fc-info-xl-t");
      var value = block.querySelector(".fc-info-xl-t + span");

      if (!label || !value) continue;

      block.classList.remove("is-wrapped");
      value.style.textAlign = "right";

      var text = value.textContent ? value.textContent.trim() : "";
      if (!text) continue;

      var range = document.createRange();
      range.selectNodeContents(value);

      var rects = [];
      var clientRects = range.getClientRects();
      for (var r = 0; r < clientRects.length; r++) {
        if (clientRects[r].width > 0 && clientRects[r].height > 0) rects.push(clientRects[r]);
      }

      if (rects.length > 1) {
        block.classList.add("is-wrapped");
        value.style.textAlign = "left";
      } else {
        block.classList.remove("is-wrapped");
        value.style.textAlign = "right";
      }
    }
  }

  updateAlignment();
  window.addEventListener("load", updateAlignment);
  window.addEventListener("resize", updateAlignment);
}

function initGlobal() {
  initUserBar();
  initRedirects();
  initToolbarConfig();
  initChatboxAtSymbol();
  initNavColonCleanup();
  initStyledUsernames();
  initCodeboxCopyButtons();
  initCodeppkCopyButtons();
  initSpoilerAnimation();
  initTwSparkles();
  initMentionTagColors();
  initProfileFieldClasses();
  initRpgInfoAlignment();
}

/* ================================================================
 * 2. INDEX — page d'accueil uniquement
 * ================================================================ */

/*
 * Source : "no_way Avatar dernier membre QEEL" (§65, 3e brique de la barre
 * utilisateur/avatar — voir initUserBar()).
 * #newest_user / #lastuser_avatar confirmés présents UNIQUEMENT dans
 * templates/index_body.html (bloc QEEL "disable_viewonline").
 */
function initIndexNewestUserAvatar() {
  var $link = $("#newest_user a[href^='/u']").first();
  // Fix défensif : le script d'origine faisait `$(...)[0].href` sans vérifier
  // la présence du lien, ce qui levait une TypeError si absent (ex. membre le
  // plus récent sans lien affiché, ou bloc QEEL désactivé côté admin).
  if (!$link.length) return;

  $.get($link.attr("href"), function (html) {
    var $avatar = $("#user_avatar img", $(html));
    if ($avatar.length) {
      $("#lastuser_avatar").html($avatar);
    }
  });
}

/*
 * Source : "Dates Derniers Messages" (§66) + "Avatars dans le Widget
 * Derniers Messages" (§67), fusionnés car ils opèrent sur le même widget
 * (.ppk-rt-item / .ppk-rt-time / .ppk-rt-avatar), confirmé présent
 * uniquement dans le bloc "ppk-last-messages" de index_body.html
 * ({giefmod_index1.MODVAR}).
 *
 * §66 : remplace le pattern d'origine (ready + load + 3 setTimeout +
 * MutationObserver sur document.body qui relançait un scan complet) par un
 * traitement initial unique + un MutationObserver scopé au conteneur du
 * widget, qui ne traite que les nœuds ajoutés.
 * §67 : remplace les 4 relances (ready/load/500ms/1200ms) par le même schéma
 * initial + observer scopé, et ajoute un cache par URL de profil
 * (avatarCache) pour ne jamais refaire deux fois le $.get d'un même membre
 * apparaissant plusieurs fois dans le widget.
 */
function initRecentMessagesWidget() {
  var avatarCache = {}; // href de profil -> src d'avatar (ou null si introuvable)

  function normalizeText(str) {
    return (str || "")
      .replace(/ /g, " ")
      .replace(/[​-‍﻿]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function formatDateBlock(el) {
    if (!el || el.dataset.formatted === "1") return;

    var raw = normalizeText(el.textContent);
    if (!raw) return;

    var hourMatch = raw.match(/(\d{1,2}:\d{2})$/);

    if (/Aujourd/i.test(raw) && hourMatch) {
      var partsToday = hourMatch[1].split(":");
      var hh = partsToday[0];
      var mm = partsToday[1];

      el.innerHTML =
        '<div class="ppk-date-box is-today">' +
        '<span class="ppk-date-top">' + hh + "</span>" +
        '<span class="ppk-date-bottom ppk-date-hour">h' + mm + "</span>" +
        "</div>";
      el.dataset.formatted = "1";
      return;
    }

    if (/^Hier\b/i.test(raw)) {
      el.innerHTML =
        '<div class="ppk-date-box is-yesterday">' +
        '<span class="ppk-date-top">Hier</span>' +
        "</div>";
      el.dataset.formatted = "1";
      return;
    }

    var cleaned = raw
      .replace(/^[A-Za-zÀ-ÿ.]+\s+/, "")
      .replace(/\s+\d{4}\s*[-–]\s*\d{1,2}:\d{2}$/, "")
      .trim();

    var fullMatch = cleaned.match(/^(\d{1,2})\s+([A-Za-zÀ-ÿ.]+)/i);

    if (fullMatch) {
      el.innerHTML =
        '<div class="ppk-date-box is-date">' +
        '<span class="ppk-date-top ppk-date-day">' + fullMatch[1] + "</span>" +
        '<span class="ppk-date-bottom ppk-date-month">' + fullMatch[2].toUpperCase() + "</span>" +
        "</div>";
      el.dataset.formatted = "1";
    }
  }

  function formatAllRecentTopicsDates(root) {
    var scope = root && root.querySelectorAll ? root : document;
    var nodes = scope.querySelectorAll(".ppk-rt-time");
    for (var i = 0; i < nodes.length; i++) formatDateBlock(nodes[i]);

    if (scope.nodeType === 1 && scope.matches && scope.matches(".ppk-rt-time")) {
      formatDateBlock(scope);
    }
  }

  function applyAvatarResult($avatar, src) {
    if (!src) {
      $avatar.addClass("is-empty");
      return;
    }
    $avatar.removeClass("is-empty").html('<img src="' + src + '" alt="">');
  }

  function loadAvatarForItem(item) {
    var $item = $(item);
    var $avatar = $item.find(".ppk-rt-avatar").first();
    var $link = $item.find(".ppk-rt-user").first();

    if (!$avatar.length || $avatar.data("loaded")) return;

    var href = $link.attr("href");

    if (!$link.length || !href) {
      $avatar.addClass("is-empty");
      $avatar.data("loaded", true);
      return;
    }

    $avatar.data("loaded", true);

    if (Object.prototype.hasOwnProperty.call(avatarCache, href)) {
      applyAvatarResult($avatar, avatarCache[href]);
      return;
    }

    $.get(href)
      .done(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var img = doc.querySelector("#user_avatar img, .ppk-profile-avatar img");
        var src = img ? img.getAttribute("src") : null;

        avatarCache[href] = src;
        applyAvatarResult($avatar, src);
      })
      .fail(function () {
        avatarCache[href] = null;
        $avatar.addClass("is-empty");
      });
  }

  function loadAllRecentTopicAvatars(root) {
    var $scope = root ? $(root) : $(document);
    var $items = $scope.is(".ppk-rt-item") ? $scope : $scope.find(".ppk-rt-item");
    $items.each(function () {
      loadAvatarForItem(this);
    });
  }

  function processRoot(root) {
    formatAllRecentTopicsDates(root);
    loadAllRecentTopicAvatars(root);
  }

  // Traitement initial.
  processRoot(document);

  // Le widget "derniers messages" est rendu par un module Forumactif
  // ({giefmod_index1.MODVAR}) qui peut injecter son contenu après le premier
  // rendu de la page. On observe donc uniquement son conteneur (repli sur
  // document.body si la classe venait à changer) et on ne traite que les
  // nœuds ajoutés, au lieu de rescanner tout le document en continu.
  if (window.MutationObserver) {
    var container = document.querySelector(".ppk-last-messages") || document.body;

    var observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var addedNodes = mutations[i].addedNodes;
        for (var j = 0; j < addedNodes.length; j++) {
          var node = addedNodes[j];
          if (node.nodeType === 1) processRoot(node);
        }
      }
    });

    observer.observe(container, { childList: true, subtree: true });
  }
}

function initIndex() {
  initIndexNewestUserAvatar();
  initRecentMessagesWidget();
}

/* ================================================================
 * 3. FORUM — liste de sujets d'un forum (/fNN)
 * ================================================================ */

/*
 * Source : "tri des fiches de personnages par ordre alphabétique (auteur)".
 * Déjà auto-restreint au forum f21 par son propre regex (forumRegex) : placé
 * dans initForumPage() (branche générique /fNN) plutôt que dans une branche
 * dédiée, cette double garde ne change rien au comportement.
 * Conversion async/await -> chaîne de promesses (pagination récursive), le
 * reste de la logique (collator, tri, reconstruction du DOM, masquage de la
 * pagination) est repris à l'identique.
 */
function initForumAlphabeticalSort() {
  var FORUM_ID = 21;
  var MAX_PAGES = 100;

  var forumRegex = new RegExp("^/f" + FORUM_ID + "(?:p\\d+)?(?:-|$)", "i");

  if (!forumRegex.test(location.pathname)) return;

  var container = document.querySelector(".liste-wrap-topics");

  if (!container) {
    console.warn("[F21 A-Z] Liste des sujets introuvable.");
    return;
  }

  var collator = new Intl.Collator("fr", {
    sensitivity: "base",
    numeric: true,
    ignorePunctuation: true
  });

  function normalizeForumUrl(url, baseUrl) {
    var parsed = new URL(url, baseUrl || location.href);
    return parsed.origin + parsed.pathname;
  }

  function isF21(url) {
    try {
      var parsed = new URL(url, location.origin);
      return parsed.origin === location.origin && forumRegex.test(parsed.pathname);
    } catch (e) {
      return false;
    }
  }

  function isPinned(row) {
    return (
      row.classList.contains("folder_global") ||
      row.classList.contains("folder_announce") ||
      row.classList.contains("folder_sticky")
    );
  }

  function getAuthor(row) {
    var link = row.querySelector(".auteursj a");

    if (link) return link.textContent.trim();

    var block = row.querySelector(".auteursj");
    if (!block) return "";

    return block.textContent.replace(/^\s*par\s+/i, "").trim();
  }

  function getTitle(row) {
    var title = row.querySelector(".titresj");
    return title ? title.textContent.trim() : "";
  }

  function getPaginationUrls(doc, baseUrl) {
    var urls = {};
    var links = doc.querySelectorAll("a[href]");

    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute("href");
      if (!href) continue;

      try {
        var absolute = new URL(href, baseUrl);
        if (!isF21(absolute.href)) continue;

        var paginationRegex = new RegExp("^/f" + FORUM_ID + "p\\d+(?:-|$)", "i");

        if (paginationRegex.test(absolute.pathname)) {
          urls[normalizeForumUrl(absolute.href, baseUrl)] = true;
        }
      } catch (e) {
        // lien invalide : on ignore
      }
    }

    var list = [];
    for (var u in urls) if (Object.prototype.hasOwnProperty.call(urls, u)) list.push(u);
    return list;
  }

  function buildAlphabeticalList() {
    var loader = document.createElement("div");
    loader.id = "f21-alpha-loader";
    loader.textContent = "Chargement et classement des sujets…";
    loader.style.cssText = ["padding:10px 15px", "margin:10px 0", "text-align:center", "font-size:12px", "opacity:.7"].join(";");

    container.parentNode.insertBefore(loader, container);

    var topics = [];
    var visitedPages = {};
    var queue = [];
    var loadedPages = 1;

    var currentUrl = normalizeForumUrl(location.href, location.href);

    function processDocument(doc, pageUrl) {
      var rows = doc.querySelectorAll(".topicslist_row");

      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (isPinned(row)) continue;

        topics.push(document.importNode(row, true));
      }

      var paginationUrls = getPaginationUrls(doc, pageUrl);
      for (var p = 0; p < paginationUrls.length; p++) {
        var url = paginationUrls[p];
        if (!visitedPages[url] && queue.indexOf(url) === -1) {
          queue.push(url);
        }
      }
    }

    function finalizeList() {
      topics.sort(function (a, b) {
        var authorComparison = collator.compare(getAuthor(a), getAuthor(b));
        if (authorComparison !== 0) return authorComparison;
        return collator.compare(getTitle(a), getTitle(b));
      });

      var existingRows = container.querySelectorAll(".topicslist_row");
      for (var i = 0; i < existingRows.length; i++) {
        if (!isPinned(existingRows[i])) existingRows[i].remove();
      }

      var separators = container.querySelectorAll(".topic_separator");
      for (var s = 1; s < separators.length; s++) separators[s].remove();

      var fragment = document.createDocumentFragment();
      for (var t = 0; t < topics.length; t++) fragment.appendChild(topics[t]);
      container.appendChild(fragment);

      var paginations = document.querySelectorAll(".pagination");
      for (var pg = 0; pg < paginations.length; pg++) {
        if (!paginations[pg].closest(".topicslist_row")) {
          paginations[pg].style.display = "none";
        }
      }

      loader.textContent = topics.length + " sujets classés par auteur";
      setTimeout(function () {
        loader.remove();
      }, 2000);

      console.log("[F21 A-Z]", topics.length, "sujets récupérés sur", loadedPages, "page(s).");
    }

    function processNextPage() {
      if (!(queue.length > 0 && loadedPages < MAX_PAGES)) {
        finalizeList();
        return;
      }

      var pageUrl = queue.shift();

      if (visitedPages[pageUrl]) {
        processNextPage();
        return;
      }

      visitedPages[pageUrl] = true;

      fetch(pageUrl, { credentials: "same-origin", cache: "no-store" })
        .then(function (response) {
          if (!response.ok) throw new Error("HTTP " + response.status);
          return response.text();
        })
        .then(function (html) {
          var doc = new DOMParser().parseFromString(html, "text/html");
          processDocument(doc, pageUrl);
          loadedPages++;
          loader.textContent = "Chargement des sujets… " + topics.length + " récupérés";
          processNextPage();
        })
        .catch(function (error) {
          console.error("[F21 A-Z]", "Impossible de charger :", pageUrl, error);
          loader.textContent = "Impossible de charger toutes les pages de f21.";
          setTimeout(function () {
            loader.remove();
          }, 3000);
        });
    }

    visitedPages[currentUrl] = true;
    processDocument(document, currentUrl);
    processNextPage();
  }

  buildAlphabeticalList();
}

function initForumPage() {
  initForumAlphabeticalSort();
}

/* ================================================================
 * 4. TOPIC — un sujet (/tNN)
 * ================================================================ */

/*
 * Source : "Dropdowns dans les sujets" (.rpg-dropdown).
 * CSS .rpg-dropdown confirmé présent UNIQUEMENT dans viewtopic_body.html.
 */
function initDropdowns() {
  function closest(el, selector) {
    while (el && el !== document) {
      if (el.matches && el.matches(selector)) return el;
      el = el.parentNode;
    }
    return null;
  }

  function closeDropdown(dropdown, content) {
    dropdown.classList.remove("active");
    content.style.maxHeight = "0px";
  }

  function openDropdown(dropdown, content) {
    dropdown.classList.add("active");
    content.style.maxHeight = content.scrollHeight + "px";
  }

  document.addEventListener("click", function (e) {
    var head = closest(e.target, ".rpg-dropdown__head");
    if (!head) return;

    var dropdown = closest(head, ".rpg-dropdown");
    if (!dropdown) return;

    var content = dropdown.querySelector(".rpg-dropdown__content");
    if (!content) return;

    e.preventDefault();

    if (dropdown.classList.contains("active")) {
      closeDropdown(dropdown, content);
    } else {
      openDropdown(dropdown, content);
    }
  });

  window.addEventListener("resize", function () {
    var dropdowns = document.querySelectorAll(".rpg-dropdown.active");

    for (var i = 0; i < dropdowns.length; i++) {
      var content = dropdowns[i].querySelector(".rpg-dropdown__content");
      if (content) content.style.maxHeight = content.scrollHeight + "px";
    }
  });
}

/*
 * Source : "cibler images lancers de dés" (.contenu-post.f2.glass).
 * Classe confirmée présente UNIQUEMENT dans viewtopic_body.html.
 */
function initDiceImageTargeting() {
  var correspondances = [
    { regex: /['’"]?\s*Dé\s*20\s*['’"]?\s*:/i, classe: "image-d20" },
    { regex: /Évènement\s+aléatoire/i, classe: "event-aleatoire" },
    { regex: /Tarot/i, classe: "tarot" }
  ];

  function ciblerImages() {
    var images = document.querySelectorAll(".contenu-post.f2.glass img");

    for (var i = 0; i < images.length; i++) {
      var img = images[i];
      var post = img.closest(".contenu-post.f2.glass");
      if (!post) continue;

      var range = document.createRange();
      range.setStart(post, 0);
      range.setEndBefore(img);

      var texteAvantImage = range.toString();

      for (var j = 0; j < correspondances.length; j++) {
        if (correspondances[j].regex.test(texteAvantImage)) {
          img.classList.add(correspondances[j].classe);
        }
      }

      range.detach();
    }
  }

  ciblerImages();
  window.addEventListener("load", ciblerImages);
}

/*
 * Source : "premier post large fiche de personnages".
 * Déjà auto-restreint à /tNN et au forum f2-personnages par le script
 * d'origine : conservé à l'identique, juste encapsulé.
 */
function initFirstPostCharacterSheetStyle() {
  var topicMatch = location.pathname.match(/\/t(\d+)/);
  if (!topicMatch) return;

  var topicId = topicMatch[1];
  var excludedTopics = ["39", "38", "49"];
  if (excludedTopics.indexOf(topicId) !== -1) return;

  if (!$('a[href*="/f2-personnages"]').length) return;

  var firstContent = document.querySelector(".contenu-post");
  var firstAvatar = document.querySelector(".profil-avatar");
  var stickyNone = document.querySelector(".ppk-post1");

  function applyPersonnagesFirstPostStyle() {
    if (firstContent) {
      firstContent.classList.add("personnages-first-post-custom");

      firstContent.style.setProperty("width", "131%", "important");
      firstContent.style.setProperty("margin-left", "-265px", "important");

      if (document.documentElement.dataset.colorScheme === "light") {
        firstContent.style.setProperty("background-color", "var(--color1)", "important");
      } else {
        firstContent.style.removeProperty("background-color");
      }
    }

    if (firstAvatar) {
      firstAvatar.style.setProperty("display", "none", "important");
    }

    if (stickyNone) {
      stickyNone.style.setProperty("position", "inherit", "important");
    }
  }

  applyPersonnagesFirstPostStyle();

  var observer = new MutationObserver(applyPersonnagesFirstPostStyle);

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-color-scheme"]
  });
}

/*
 * Source : "messages de validation" (<valid>/<correct>/<refus>).
 * Tags maison liés au workflow de validation de fiche de personnage, postés
 * en réponse dans les sujets de la section "demandes" → topic.
 * À VÉRIFIER : si ces tags sont un jour utilisés dans l'aperçu d'écriture
 * (POST_PREVIEW_BOX de posting_body.html) avant publication, cette fonction
 * devra aussi être appelée depuis initPostingPage().
 */
function initValidationCards() {
  var valids = document.querySelectorAll("valid");
  for (var i = 0; i < valids.length; i++) {
    var valid = valids[i];

    var card = document.createElement("div");
    card.className = "valid-card";

    var h2 = document.createElement("h2");
    h2.textContent = "Fiche validée !";

    var h3 = document.createElement("h3");
    h3.textContent = "Félicitations, nous te souhaitons la bienvenue parmi nous.";

    var text = document.createElement("div");
    text.className = "valid-text";

    text.appendChild(document.createTextNode("Ta fiche de personnage a été "));

    var bold = document.createElement("ppkb");
    bold.textContent = "validée par l’équipe administrative";

    text.appendChild(bold);
    text.appendChild(
      document.createTextNode(
        ", tu peux donc officiellement rejoindre l’aventure. Nous avons hâte de voir ton personnage évoluer au fil des RP et de découvrir les liens qu’il tissera avec les autres."
      )
    );

    var h4 = document.createElement("h4");
    h4.textContent = "Que faire maintenant ?";

    var buttons = document.createElement("div");
    buttons.className = "valid-buttons";

    var links = [
      ["https://pumpkinsrpg.forumactif.com/profile?mode=editprofile", "fa-solid fa-user", "Remplir ton profil"],
      ["https://pumpkinsrpg.forumactif.com/f24-relations", "fa-solid fa-heart", "Fiche de relations"],
      ["https://pumpkinsrpg.forumactif.com/t38-scenarios-preliens", "fa-solid fa-link", "Proposer un prélien"],
      ["https://pumpkinsrpg.forumactif.com/f23-demandes", "fa-solid fa-feather-pointed", "Demande de RP"],
      ["https://pumpkinsrpg.forumactif.com/t41-evenements-a-debloquer", "fa-solid fa-calendar-day", "Financer un événement"],
      ["https://pumpkinsrpg.forumactif.com/t45-perles-de-pluie", "fa-solid fa-droplet", "Trouver une perle"]
    ];

    for (var l = 0; l < links.length; l++) {
      var href = links[l][0];
      var iconClass = links[l][1];
      var label = links[l][2];

      var a = document.createElement("a");
      a.href = href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.className = "valid-btn";

      var icon = document.createElement("i");
      icon.className = iconClass;

      var span = document.createElement("span");
      span.textContent = label;

      a.appendChild(icon);
      a.appendChild(span);
      buttons.appendChild(a);
    }

    var end = document.createElement("p");
    end.className = "valid-end";
    end.textContent = "Amuse-toi bien sur le forum !";

    card.appendChild(h2);
    card.appendChild(h3);
    card.appendChild(text);
    card.appendChild(h4);
    card.appendChild(buttons);
    card.appendChild(end);

    valid.replaceWith(card);
  }

  document.dispatchEvent(new CustomEvent("pumpkins:valid-cards-ready"));

  var corrects = document.querySelectorAll("correct");
  for (var c = 0; c < corrects.length; c++) {
    var correct = corrects[c];

    var cCard = document.createElement("div");
    cCard.className = "correct-card";

    var cH2 = document.createElement("h2");
    cH2.textContent = "Corrections demandées";

    var cH3 = document.createElement("h3");
    cH3.textContent = "Encore un tout petit effort !";

    var cText = document.createElement("div");
    cText.className = "correct-text";

    while (correct.firstChild) {
      cText.appendChild(correct.firstChild);
    }

    cCard.appendChild(cH2);
    cCard.appendChild(cH3);
    cCard.appendChild(cText);

    correct.replaceWith(cCard);
  }

  var refusList = document.querySelectorAll("refus");
  for (var r = 0; r < refusList.length; r++) {
    var refus = refusList[r];
    var raison = refus.textContent.trim();

    var rCard = document.createElement("div");
    rCard.className = "refus-card";

    var rH2 = document.createElement("h2");
    rH2.textContent = "Fiche refusée";

    var rH3 = document.createElement("h3");
    rH3.appendChild(document.createTextNode("Votre fiche a été refusée par l’équipe administrative."));
    rH3.appendChild(document.createElement("br"));
    rH3.appendChild(document.createTextNode("Votre compte sera supprimé prochainement."));

    var reason = document.createElement("p");
    reason.className = "refus-reason";

    var label = document.createElement("strong");
    label.textContent = "Raison ";

    var facultative = document.createElement("span");
    facultative.textContent = "(facultative) : ";

    reason.appendChild(label);
    reason.appendChild(facultative);
    reason.appendChild(document.createTextNode(raison));

    rCard.appendChild(rH2);
    rCard.appendChild(rH3);
    rCard.appendChild(reason);

    refus.replaceWith(rCard);
  }
}

/*
 * Source : "Confirmation avant de quitter la page d'écriture" (§70).
 * Appelée à la fois depuis initPostingPage() (page d'écriture complète) et
 * initTopicPage() (formulaire de réponse rapide #quick_reply) car les deux
 * utilisent le même textarea/sceditor.
 * §70 : le polling par setInterval (250ms x 40, soit 10s) est remplacé par
 * une tentative immédiate puis, si besoin seulement, un MutationObserver à
 * usage unique (déconnecté dès que le formulaire est câblé) avec un
 * garde-fou de 10s — plus de boucle de vérification permanente.
 */
function initLeaveConfirmation() {
  var postSubmit = false;
  var warningReady = false;

  function getQuickReplyForm() {
    var $form = $("#quick_reply");
    if ($form.length) return $form;

    var $textarea = $('textarea[name="message"], #text_editor_textarea').first();
    if ($textarea.length) return $textarea.closest("form");

    return $();
  }

  function getMessageTextarea() {
    var $textarea = $("#text_editor_textarea");
    if ($textarea.length) return $textarea;

    $textarea = $('textarea[name="message"]').first();
    return $textarea;
  }

  function getMessageContent() {
    var $textarea = getMessageTextarea();
    if (!$textarea.length) return "";

    if ($.fn.sceditor) {
      try {
        var instance = $textarea.sceditor("instance");

        if (instance && typeof instance.val === "function") {
          return $.trim(instance.val() || "");
        }
      } catch (error) {
        return $.trim($textarea.val() || "");
      }
    }

    return $.trim($textarea.val() || "");
  }

  function wireForm() {
    if (warningReady) return true;

    var $form = getQuickReplyForm();
    if (!$form.length) return false;

    warningReady = true;

    $form.on("submit", function () {
      postSubmit = true;
    });

    window.addEventListener("beforeunload", function (e) {
      var content = getMessageContent();

      if (!postSubmit && content.length > 0) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    });

    return true;
  }

  if (wireForm()) return;

  if (window.MutationObserver) {
    var observer = new MutationObserver(function () {
      if (wireForm()) observer.disconnect();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(function () {
      observer.disconnect();
    }, 10000);
  }

  $(window).on("pageshow", function () {
    wireForm();
  });
}

function initTopicPage() {
  initDropdowns();
  initDiceImageTargeting();
  initFirstPostCharacterSheetStyle();
  initValidationCards();
  initLeaveConfirmation(); // réponse rapide présente sur les sujets
}

/* ================================================================
 * 5. POSTING — pages d'écriture (/post...)
 * ================================================================ */

function initPostingPage() {
  initLeaveConfirmation(); // voir définition dans la section TOPIC
}

/* ================================================================
 * 6. PROFILE — /uNN (vue) et /profile (édition)
 * ================================================================ */

/*
 * Source : "supprimer email profil milouze".
 * .liens-profil confirmé présent uniquement dans profile_view_body.html.
 * Déjà auto-restreint à /u... par le script d'origine, conservé.
 */
function initProfileEmailRemoval() {
  if (!/^\/u/.test(location.pathname)) return;

  $(function () {
    $('.liens-profil a[href^="/profile?mode=email&u"]').closest("div").remove();

    // À VÉRIFIER : dans le script d'origine, `$(this)` à l'intérieur de ce
    // handler $(function(){...}) fait référence à `window` (contexte global
    // du document ready), pas à l'élément supprimé juste au-dessus. Le
    // `.find('.separator:first')` qui suit cherche donc le premier séparateur
    // dans TOUT le document plutôt que localement à côté du lien email retiré.
    // Comportement conservé à l'identique (bug préexistant probable).
    $(this).find(".separator:first").remove();
  });
}

/*
 * Source : "Pages de recherche stylisées" — moitié "éditer son profil"
 * (§24 : scindé en deux fonctions, l'autre moitié étant initSearchBodyClass()
 * ci-dessous, pour correspondre à la détection de page).
 */
function initEditProfileBodyClass() {
  var body = document.body;
  var url = new URL(window.location.href);
  var path = url.pathname;
  var params = url.searchParams;

  function clean(str) {
    return String(str).toLowerCase().replace(/[^a-z0-9_-]/g, "-");
  }

  if (path === "/profile" && params.get("mode") === "editprofile") {
    body.classList.add("fa-editprofile");

    var profilPage = params.get("page_profil");
    if (profilPage) {
      body.classList.add("fa-editprofile-" + clean(profilPage));
    }
  }
}

function initProfilePage() {
  initProfileEmailRemoval();
  initEditProfileBodyClass();
}

/* ================================================================
 * 7. SEARCH — /search
 * ================================================================ */

/*
 * Source : "Pages de recherche stylisées" — moitié "page de recherche".
 */
function initSearchBodyClass() {
  var body = document.body;
  var url = new URL(window.location.href);
  var path = url.pathname;
  var params = url.searchParams;

  function clean(str) {
    return String(str).toLowerCase().replace(/[^a-z0-9_-]/g, "-");
  }

  if (path === "/search") {
    body.classList.add("fa-search-page");

    var mode = params.get("mode");
    var searchId = params.get("search_id");

    if (mode) body.classList.add("fa-search-mode-" + clean(mode));
    if (searchId) body.classList.add("fa-search-id-" + clean(searchId));
  }
}

function initSearchPage() {
  initSearchBodyClass();
}

/* ================================================================
 * BOOTSTRAP (§24 du cahier technique)
 * ================================================================ */

function ppkForumBoot() {
  initGlobal();

  if (isIndex()) initIndex();
  if (isForumPage()) initForumPage();
  if (isTopicPage()) initTopicPage();
  if (isPostingPage()) initPostingPage();
  if (isProfilePage()) initProfilePage();
  if (isSearchPage()) initSearchPage();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", ppkForumBoot);
} else {
  ppkForumBoot();
}
