(function () {
  function normalizeText(str) {
    return (str || "")
      .replace(/\u00A0/g, " ")
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function formatDateBlock(el) {
    if (!el || el.dataset.formatted === "1") return;

    var raw = normalizeText(el.textContent);
    if (!raw) return;

    var hourMatch = raw.match(/(\d{1,2}:\d{2})$/);

    // Aujourd'hui / Aujourd’hui
    if (/Aujourd/i.test(raw) && hourMatch) {
      var partsToday = hourMatch[1].split(":");
      var hh = partsToday[0];
      var mm = partsToday[1];

      el.innerHTML =
        '<div class="ppk-date-box is-today">' +
          '<span class="ppk-date-top">' + hh + '</span>' +
          '<span class="ppk-date-bottom ppk-date-hour">h' + mm + '</span>' +
        '</div>';
      el.dataset.formatted = "1";
      return;
    }

    // Hier
    if (/^Hier\b/i.test(raw)) {
      el.innerHTML =
        '<div class="ppk-date-box is-yesterday">' +
          '<span class="ppk-date-top">Hier</span>' +
        '</div>';
      el.dataset.formatted = "1";
      return;
    }

    // Ex: Jeu 26 Fév 2026 - 21:10
    // Ex: Mer 7 Jan 2026 - 09:05
    // Ex: Lun 15 Avr 2025 - 18:42
    var cleaned = raw
      .replace(/^[A-Za-zÀ-ÿ.]+\s+/, "")
      .replace(/\s+\d{4}\s*[-–]\s*\d{1,2}:\d{2}$/, "")
      .trim();

    var fullMatch = cleaned.match(/^(\d{1,2})\s+([A-Za-zÀ-ÿ.]+)/i);

    if (fullMatch) {
      el.innerHTML =
        '<div class="ppk-date-box is-date">' +
          '<span class="ppk-date-top ppk-date-day">' + fullMatch[1] + '</span>' +
          '<span class="ppk-date-bottom ppk-date-month">' + fullMatch[2].toUpperCase() + '</span>' +
        '</div>';
      el.dataset.formatted = "1";
    }
  }

  function formatAllRecentTopicsDates() {
    document.querySelectorAll(".ppk-rt-time").forEach(formatDateBlock);
  }

  function bootFormat() {
    formatAllRecentTopicsDates();
    setTimeout(formatAllRecentTopicsDates, 300);
    setTimeout(formatAllRecentTopicsDates, 1000);
    setTimeout(formatAllRecentTopicsDates, 2000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootFormat);
  } else {
    bootFormat();
  }

  window.addEventListener("load", bootFormat);

  var observer = new MutationObserver(function () {
    formatAllRecentTopicsDates();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();