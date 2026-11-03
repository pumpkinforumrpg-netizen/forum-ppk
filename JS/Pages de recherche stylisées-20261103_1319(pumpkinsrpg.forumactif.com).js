document.addEventListener("DOMContentLoaded", function () {
  const body = document.body;
  const url = new URL(window.location.href);
  const path = url.pathname;
  const params = url.searchParams;

  const clean = (str) =>
    String(str).toLowerCase().replace(/[^a-z0-9_-]/g, "-");

  // Profil > édition
  if (path === "/profile" && params.get("mode") === "editprofile") {
    body.classList.add("fa-editprofile");

    const profilPage = params.get("page_profil");
    if (profilPage) {
      body.classList.add("fa-editprofile-" + clean(profilPage));
    }
  }

  // Pages de recherche
  if (path === "/search") {
    body.classList.add("fa-search-page");

    const mode = params.get("mode");
    const searchId = params.get("search_id");

    if (mode) {
      body.classList.add("fa-search-mode-" + clean(mode));
    }

    if (searchId) {
      body.classList.add("fa-search-id-" + clean(searchId));
    }
  }
});