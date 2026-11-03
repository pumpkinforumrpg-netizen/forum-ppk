(function () {
  function initTW(root) {
    const scope = root && root.querySelectorAll ? root : document;

    scope.querySelectorAll("tw").forEach(function (el) {
      if (el.dataset.twReady === "1") {
        return;
      }

      const text = document.createElement("span");
      text.className = "tw-spoiler-text";

      while (el.firstChild) {
        text.appendChild(el.firstChild);
      }

      const sparks = document.createElement("span");
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

      if (!el.hasAttribute("tabindex")) {
        el.setAttribute("tabindex", "0");
      }

      el.dataset.twReady = "1";
    });
  }

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }

    callback();
  }

  ready(function () {
    initTW(document);

    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) {
            return;
          }

          if (node.matches && node.matches("tw")) {
            initTW(node.parentNode || document);
            return;
          }

          if (node.querySelectorAll) {
            initTW(node);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
})();