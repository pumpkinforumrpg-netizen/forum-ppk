(function () {
  const SPECIAL_BACKGROUNDS_BY_ID = {
    "2": "var(--pumpkin)" // Pumpkin
  };

  const requests = new Map();
  const cache = new Map();
  const wantedBackground = new WeakMap();

  function getUserIdFromMention(mention) {
    const dataId = mention.getAttribute("data-id");
    if (dataId) return dataId;

    const href = mention.getAttribute("href") || "";
    const match = href.match(/\/u(\d+)/);
    return match ? match[1] : null;
  }

  function getCssValue(style, property) {
    if (!style) return null;

    const safeProperty = property.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp("(?:^|;)\\s*" + safeProperty + "\\s*:\\s*([^;]+)", "i");
    const match = style.match(regex);

    return match ? match[1].trim() : null;
  }

  function getInlineColor(style) {
    return getCssValue(style, "color");
  }

  function extractBackgroundFromProfile(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");

    /*
      PRIORITÉ 1 :
      La couleur du pseudo affiché dans .nameprofil.
      C’est là que Milo a bien #D9604A.
    */
    const nameprofil = doc.querySelector(".ppk-profil .nameprofil, .nameprofil");

    if (nameprofil) {
      const pseudoColor = nameprofil.querySelector(".usr_grp_clr[style*='color']");

      if (pseudoColor) {
        const color = getInlineColor(pseudoColor.getAttribute("style"));
        if (color) return color;
      }
    }

    /*
      PRIORITÉ 2 :
      La variable --pseudo-color si elle existe.
      Chez toi elle est parfois absente dans le HTML fetché.
    */
    const profile = doc.querySelector(".ppk-profil[style*='--pseudo-color']");

    if (profile) {
      const color = getCssValue(profile.getAttribute("style"), "--pseudo-color");
      if (color) return color;
    }

    /*
      PRIORITÉ 3 :
      Fallback limité au profil uniquement.
      PAS de .usr_grp_clr global, sinon ça reprend #8A53B7.
    */
    const profilePseudo = doc.querySelector(".ppk-profil .usr_grp_clr[style*='color']");

    if (profilePseudo) {
      const color = getInlineColor(profilePseudo.getAttribute("style"));
      if (color) return color;
    }

    return null;
  }

  async function getUserBackground(userId) {
    if (SPECIAL_BACKGROUNDS_BY_ID[userId]) {
      return SPECIAL_BACKGROUNDS_BY_ID[userId];
    }

    if (cache.has(userId)) {
      return cache.get(userId);
    }

    if (requests.has(userId)) {
      return requests.get(userId);
    }

    const request = fetch("/u" + userId + "?mentiontag_force=" + Date.now(), {
      credentials: "same-origin",
      cache: "no-store"
    })
      .then(function (response) {
        return response.text();
      })
      .then(function (html) {
        const background = extractBackgroundFromProfile(html);

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

  async function processMention(mention) {
    const userId = getUserIdFromMention(mention);
    if (!userId) return;

    const background = await getUserBackground(userId);
    forceMentionBackground(mention, background);
  }

  function run() {
    document
      .querySelectorAll("a.mentiontag[href*='/u'], a.mentiontag[data-id]")
      .forEach(processMention);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }

  setTimeout(run, 300);
  setTimeout(run, 800);
  setTimeout(run, 1500);
  setTimeout(run, 3000);
  setTimeout(run, 5000);

  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      const target = mutation.target;

      if (
        target &&
        target.nodeType === 1 &&
        target.matches &&
        target.matches("a.mentiontag[href*='/u'], a.mentiontag[data-id]")
      ) {
        const wanted = wantedBackground.get(target);

        if (wanted) {
          setTimeout(function () {
            forceMentionBackground(target, wanted);
          }, 0);
        } else {
          processMention(target);
        }
      }

      mutation.addedNodes.forEach(function (node) {
        if (!node || node.nodeType !== 1) return;

        if (node.matches && node.matches("a.mentiontag[href*='/u'], a.mentiontag[data-id]")) {
          processMention(node);
        }

        if (node.querySelectorAll) {
          node
            .querySelectorAll("a.mentiontag[href*='/u'], a.mentiontag[data-id]")
            .forEach(processMention);
        }
      });
    });
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
})();