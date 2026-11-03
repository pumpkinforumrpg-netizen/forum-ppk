$(function () {
  const topicMatch = location.pathname.match(/\/t(\d+)/);
  if (!topicMatch) return;

  const topicId = topicMatch[1];

  const excludedTopics = ["39", "38", "49"];
  if (excludedTopics.includes(topicId)) return;

  if (!$('a[href*="/f2-personnages"]').length) return;

  const firstContent = document.querySelector(".contenu-post");
  const firstAvatar = document.querySelector(".profil-avatar");
  const stickyNone = document.querySelector(".ppk-post1");

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

  const observer = new MutationObserver(applyPersonnagesFirstPostStyle);

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-color-scheme"]
  });
});