(function () {
  const SPECIAL_USERS = {
    Pumpkin: "pumpkin-pseudo"
  };

  const COOL_MEMBERS = new Set([
    "Pseudo 1"
    // ajoute ici les autres membres du groupe Cool
  ]);

  const PSEUDO_SELECTOR = [
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
    return String(text || "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function applyPseudoClass(el) {
    if (!el || el.dataset.pseudoStyled === "1") return;

    const username = normalize(el.textContent);
    if (!username) return;

    let hasClass = false;

    if (SPECIAL_USERS[username]) {
      el.classList.add(SPECIAL_USERS[username]);
      hasClass = true;
    }

    if (COOL_MEMBERS.has(username)) {
      el.classList.add("pseudo-cool");
      hasClass = true;
    }

    if (hasClass) {
      el.dataset.pseudoStyled = "1";
    }
  }

  function run(root) {
    const scope = root || document;
    const elements = scope.querySelectorAll
      ? scope.querySelectorAll(PSEUDO_SELECTOR)
      : [];

    elements.forEach(applyPseudoClass);

    if (scope.matches && scope.matches(PSEUDO_SELECTOR)) {
      applyPseudoClass(scope);
    }
  }

  function debounce(fn, delay) {
    let timer;

    return function () {
      clearTimeout(timer);
      timer = setTimeout(fn, delay);
    };
  }

  const rerun = debounce(function () {
    run(document);
  }, 150);

  document.addEventListener("DOMContentLoaded", function () {
    run(document);

    const observer = new MutationObserver(function (mutations) {
      let shouldRun = false;

      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            shouldRun = true;
            break;
          }
        }

        if (shouldRun) break;
      }

      if (shouldRun) rerun();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
})();