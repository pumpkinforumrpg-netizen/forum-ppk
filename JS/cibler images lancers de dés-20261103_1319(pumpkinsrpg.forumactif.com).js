(function () {
  const correspondances = [
    {
      regex: /['’"]?\s*Dé\s*20\s*['’"]?\s*:/i,
      classe: "image-d20"
    },
    {
      regex: /Évènement\s+aléatoire/i,
      classe: "event-aleatoire"
    },
    {
      regex: /Tarot/i,
      classe: "tarot"
    }
  ];

  function ciblerImages() {
    document.querySelectorAll(".contenu-post.f2.glass img").forEach(function (img) {
      const post = img.closest(".contenu-post.f2.glass");
      if (!post) return;

      const range = document.createRange();
      range.setStart(post, 0);
      range.setEndBefore(img);

      const texteAvantImage = range.toString();

      correspondances.forEach(function (item) {
        if (item.regex.test(texteAvantImage)) {
          img.classList.add(item.classe);
        }
      });

      range.detach();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ciblerImages);
  } else {
    ciblerImages();
  }

  window.addEventListener("load", ciblerImages);
})();