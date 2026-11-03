(function () {
  const PERLES = [
    /* COMMUNES */
    p("rose", "commune", "Rose", ["rose"]),
    p("sapi", "commune", "Sapin", ["sapin", "sapi"]),
    p("citr", "commune", "Citron", ["citron", "citr"]),
    p("mari", "commune", "Marine", ["marine", "mari"]),
    p("choc", "commune", "Chocolat", ["chocolat", "choc"]),
    p("ment", "commune", "Menthe", ["menthe", "ment"]),
    p("gren", "commune", "Grenat", ["grenat", "gren"]),
    p("ivoi", "commune", "Ivoire", ["ivoire", "ivoi"]),
    p("turq", "commune", "Turquoise", ["turquoise", "turq"]),
    p("cann", "commune", "Cannelle", ["cannelle", "cann"]),
    p("lava", "commune", "Lavande", ["lavande", "lava"]),
    p("miel", "commune", "Miel", ["miel"]),
    p("nuit", "commune", "Nuit", ["nuit"]),
    p("frai", "commune", "Fraise", ["fraise", "frai"]),
    p("saug", "commune", "Sauge", ["sauge", "saug"]),
    p("perl", "commune", "Perle", ["perle", "perl"]),
    p("oran", "commune", "Orange", ["orange", "oran"]),
    p("indi", "commune", "Indigo", ["indigo", "indi"]),
    p("till", "commune", "Tilleul", ["tilleul", "till"]),
    p("ceri", "commune", "Cerise", ["cerise", "ceri"]),
    p("ciel", "commune", "Ciel", ["ciel"]),
    p("nois", "commune", "Noisette", ["noisette", "nois"]),
    p("viol", "commune", "Violette", ["violette", "viol"]),
    p("neig", "commune", "Neige", ["neige", "neig"]),
    p("emer", "commune", "Émeraude", ["emeraude", "émeraude", "emer"]),
    p("pech", "commune", "Pêche", ["peche", "pêche", "pech"]),
    p("fume", "commune", "Fumée", ["fumee", "fumée", "fume"]),
    p("ambr", "commune", "Ambre", ["ambre", "ambr"]),
    p("lila", "commune", "Lilas", ["lilas", "lila"]),
    p("lagu", "commune", "Lagune", ["lagune", "lagu"]),
    p("cafe", "commune", "Café", ["cafe", "café"]),
    p("fram", "commune", "Bonbon", ["bonbon", "fram"]),
    p("vani", "commune", "Vanille", ["vanille", "vani"]),
    p("oliv", "commune", "Olive", ["olive", "oliv"]),
    p("azur", "commune", "Azur", ["azur"]),
    p("prun", "commune", "Prune", ["prune", "prun"]),
    p("cora", "commune", "Corail", ["corail", "cora"]),
    p("brum", "commune", "Brume", ["brume", "brum"]),
    p("mous", "commune", "Mousse", ["mousse", "mous"]),
    p("or", "commune", "Or", ["or"]),
    p("mauv", "commune", "Mauve", ["mauve", "mauv"]),
    p("roug", "commune", "Rouge", ["rouge", "roug"]),
    p("crem", "commune", "Crème", ["creme", "crème", "crem"]),
    p("jade", "commune", "Jade", ["jade"]),
    p("abri", "commune", "Abricot", ["abricot", "abri"]),
    p("cend", "commune", "Cendre", ["cendre", "cend"]),
    p("grnd", "commune", "Grenade", ["grenade", "grnd"]),
    p("parm", "commune", "Parme", ["parme", "parm"]),
    p("cara", "commune", "Caramel", ["caramel", "cara"]),

    /* RARES */
    p("aur", "rare", "Aurore", ["aurore", "aur"]),
    p("onyx", "rare", "Onyx", ["onyx"]),
    p("mac", "rare", "Macaron", ["macaron", "mac"]),
    p("syl", "rare", "Sylve", ["sylve", "syl"]),
    p("con", "rare", "Confetti", ["confetti", "con"]),
    p("noc", "rare", "Nocturne", ["nocturne", "noc"]),
    p("bra", "rare", "Braisée", ["braisee", "braisée", "bra"]),
    p("lun", "rare", "Lunelle", ["lunelle", "lun"]),
    p("mth", "rare", "Menthys", ["menthys", "mth"]),
    p("fra", "rare", "Grenadine", ["grenadine", "fra"]),
    p("aut", "rare", "Automne", ["automne", "aut"]),
    p("giv", "rare", "Givrée", ["givree", "givrée", "giv"]),
    p("carm", "rare", "Carmine", ["carmine", "carm"]),
    p("opa", "rare", "Opaline", ["opaline", "opa"]),
    p("bos", "rare", "Bosquet", ["bosquet", "bos"]),
    p("cre", "rare", "Crépuscule", ["crepuscule", "crépuscule", "cre"]),
    p("amet", "rare", "Améthyste", ["amethyste", "améthyste", "amet"]),
    p("sol", "rare", "Solaire", ["solaire", "sol"]),
    p("prin", "rare", "Fleur", ["fleur", "prin"]),
    p("azum", "rare", "Azurine", ["azurine", "azum"]),
    p("inf", "rare", "Infuse", ["infuse", "inf"]),
    p("ros", "rare", "Rosée", ["rosee", "rosée", "ros"]),
    p("est", "rare", "Estivale", ["estivale", "est"]),
    p("gre", "rare", "Pourpre", ["pourpre", "gre"]),
    p("org", "rare", "Orageuse", ["orageuse", "org"]),
    p("vei", "rare", "Veilleuse", ["veilleuse", "vei"]),
    p("bru", "rare", "Brumelle", ["brumelle", "bru"]),
    p("suc", "rare", "Sucrine", ["sucrine", "suc"]),
    p("arc", "rare", "Arcanie", ["arcanie", "arc"]),
    p("ama", "rare", "Amarine", ["amarine", "ama"]),
    p("lav", "rare", "Lavandine", ["lavandine", "lav"]),
    p("hiv", "rare", "Glacée", ["glacee", "glacée", "hiv"]),
    p("cru", "rare", "Crumble", ["crumble", "cru"]),
    p("pas", "rare", "Passion", ["passion", "pas"]),
    p("vio", "rare", "Framboise", ["framboise", "vio"]),
    p("myr", "rare", "Myrtille", ["myrtille", "myr"]),
	 /* PERLES DES MEMBRES */
    p("alis", "rare", "Alistair", ["alistair", "alis"]),
    p("ronce", "rare", "Ronce", ["ronce", "ronce"]),
    p("brow", "rare", "Brownie", ["brownie", "brow"]),

    /* LÉGENDAIRES */
    p("lamb", "legendaire", "Véga", ["vega", "véga", "lamb"], "spark"),
    p("lopa", "legendaire", "Antarès", ["antares", "antarès", "lopa"], "spark"),
    p("lrub", "legendaire", "Bételgeuse", ["betelgeuse", "bételgeuse", "lrub"], "spark"),
    p("lcit", "legendaire", "Polaris", ["polaris", "lcit"], "spark"),
    p("livo", "legendaire", "Rigel", ["rigel", "livo"], "spark"),
    p("lsap", "legendaire", "Maïa", ["maia", "maïa", "lsap"], "spark"),
    p("ljad", "legendaire", "Bellatrix", ["bellatrix", "ljad"], "spark"),
    p("leme", "legendaire", "Alcyone", ["alcyone", "leme"], "spark"),
    p("lamt", "legendaire", "Arcturus", ["arcturus", "lamt"], "spark"),
    p("lpou", "legendaire", "Spica", ["spica", "lpou"], "spark"),
    p("lcor", "legendaire", "Procyon", ["procyon", "lcor"], "spark"),
    p("lony", "legendaire", "Algol", ["algol", "lony"], "spark"),
    p("lpri", "legendaire", "Sirius", ["sirius", "lpri"], "spark"),

    /* MYTHIQUES */
    p("ori", "mythique", "Orion", ["orion", "ori"], "constellation co-ori"),
    p("lyr", "mythique", "Lyre", ["lyre", "lyr"], "constellation co-lyr"),
    p("cas", "mythique", "Cassiopée", ["cassiopee", "cassiopée", "cas"], "constellation co-cas"),
    p("and", "mythique", "Andromède", ["andromede", "andromède", "and"], "constellation co-and"),
    p("peg", "mythique", "Pégase", ["pegase", "pégase", "peg"], "constellation co-peg"),
    p("per", "mythique", "Persée", ["persee", "persée", "per"], "constellation co-per"),
    p("phe", "mythique", "Phénix", ["phenix", "phénix", "phe"], "constellation co-phe"),
    p("hyd", "mythique", "Hydre", ["hydre", "hyd"], "constellation co-hyd"),
    p("cyg", "mythique", "Cygne", ["cygne", "cyg"], "constellation co-cyg"),
    p("dra", "mythique", "Dragon", ["dragon", "dra"], "constellation co-dra")
  ];

  const RARITY_LABELS = {
    commune: "Commune",
    rare: "Rare",
    legendaire: "Légendaire",
    mythique: "Mythique"
  };

  function p(id, rarity, name, keys, icon) {
    return {
      id: id,
      rarity: rarity,
      name: name,
      keys: keys.map(normalizeKey),
      icon: icon || ""
    };
  }

  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }

    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    initCollections();
    initFloatingTooltip();
  });

  function initCollections() {
    document.querySelectorAll(".ppk-profil").forEach(function (profile) {
      if (profile.dataset.perleCollectionInit === "1") {
        return;
      }

      const button = profile.querySelector(".user-collection");
      const infosPersonnage = profile.querySelector(".infos-personnage");

      if (!button || !infosPersonnage) {
        return;
      }

      let awards = profile.querySelector(".awards_block_simple_wrapper");

      if (!awards) {
        awards = document.createElement("div");
        awards.className = "awards_block_simple_wrapper";
        awards.innerHTML = [
          '<div class="h3">Collection de perles</div>',
          '<div class="awards_block simple"></div>'
        ].join("");
      }

      if (awards.parentElement !== infosPersonnage) {
        infosPersonnage.appendChild(awards);
      }

      let title = awards.querySelector(".h3");

      if (!title) {
        title = document.createElement("div");
        title.className = "h3";
        awards.prepend(title);
      }

      title.textContent = "Collection de perles";

      let awardsBlock = awards.querySelector(".awards_block.simple");

      if (!awardsBlock) {
        awardsBlock = document.createElement("div");
        awardsBlock.className = "awards_block simple";
        awards.appendChild(awardsBlock);
      }

      buildCollection(awardsBlock);

      if (!awards.querySelector(".user-awards-close")) {
        const close = document.createElement("div");
        close.className = "user-awards-close fa-tip";
        close.setAttribute("data-tip", "Retour au profil");
        close.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        awards.prepend(close);

        close.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          closeCollection(profile, awards);
        });
      }

      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();

        const isOpen = awards.classList.contains("user-awards-open");

        if (isOpen) {
          closeCollection(profile, awards);
        } else {
          openCollection(profile, awards);
        }
      });

      profile.dataset.perleCollectionInit = "1";
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeAllCollections();
      }
    });
  }

  function openCollection(profile, awards) {
    closeAllCollections(profile);

    awards.classList.remove("user-awards-closing");
    awards.classList.remove("user-awards-open");

    void awards.offsetWidth;

    profile.classList.add("user-collection-open");
    awards.classList.add("user-awards-open");
  }

  function closeCollection(profile, awards) {
    if (!awards.classList.contains("user-awards-open")) {
      return;
    }

    if (awards.classList.contains("user-awards-closing")) {
      return;
    }

    awards.classList.add("user-awards-closing");
	profile.classList.remove("user-collection-open");

    let closed = false;

    function finishClose() {
      if (closed) {
        return;
      }

      closed = true;

      awards.classList.remove("user-awards-open");
      awards.classList.remove("user-awards-closing");

      awards.removeEventListener("animationend", handleAnimationEnd);
    }

    function handleAnimationEnd(event) {
      if (event.target !== awards) {
        return;
      }

      if (event.animationName !== "perleCollectionClose") {
        return;
      }

      finishClose();
    }

    awards.addEventListener("animationend", handleAnimationEnd);

    setTimeout(finishClose, 340);
  }

  function closeAllCollections(exceptProfile) {
    document.querySelectorAll(".ppk-profil").forEach(function (profile) {
      if (exceptProfile && profile === exceptProfile) {
        return;
      }

      const awards = profile.querySelector(".awards_block_simple_wrapper.user-awards-open");

      if (awards) {
        closeCollection(profile, awards);
      }
    });
  }

  function buildCollection(awardsBlock) {
    if (awardsBlock.dataset.perleCollectionBuilt === "1") {
      return;
    }

    const owned = getOwnedAwardKeys(awardsBlock);

    awardsBlock.innerHTML = "";
    awardsBlock.classList.add("perlepluie-collection-grid");

    PERLES.forEach(function (perle) {
      const ownedPerle = perle.keys.some(function (key) {
        return owned.has(key);
      });

      awardsBlock.insertAdjacentHTML("beforeend", renderPerle(perle, ownedPerle));
    });

    awardsBlock.dataset.perleCollectionBuilt = "1";
  }

  function getOwnedAwardKeys(awardsBlock) {
    const owned = new Set();

    awardsBlock.querySelectorAll(".award").forEach(function (award) {
      award.classList.forEach(function (className) {
        if (className !== "award") {
          owned.add(normalizeKey(className));
        }
      });

      const tooltip = award.querySelector("[data-award-class]");

      if (tooltip) {
        owned.add(normalizeKey(tooltip.getAttribute("data-award-class")));
      }
    });

    awardsBlock.querySelectorAll("[data-award-class]").forEach(function (item) {
      owned.add(normalizeKey(item.getAttribute("data-award-class")));
    });

    return owned;
  }

	function renderPerle(perle, owned) {
	  const rarityClass = owned && perle.rarity !== "commune" ? " " + perle.rarity : "";
	  const lockedClass = owned ? "" : " perle-locked";

	  const icon = owned && perle.icon
		? '<i class="' + escapeHtml(perle.icon) + '"></i>'
		: "";

	  const content = owned
		? [
			'<span class="perle" id="' + escapeHtml(perle.id) + '">',
			  icon,
			'</span>'
		  ].join("")
		: '<span class="perle-mystere">?</span>';

	  const tip = owned
		? "<strong>" + escapeHtml(perle.name) + "</strong><br>" + escapeHtml(RARITY_LABELS[perle.rarity])
		: "???";

	  return [
		'<div class="perle-card perle-collection-card fa-tip' + rarityClass + lockedClass + '" data-tip="' + escapeAttr(tip) + '">',
		  content,
		'</div>'
	  ].join("");
	}

  function initFloatingTooltip() {
    let tooltip = document.getElementById("perlepluie-floating-tip");
    let currentCard = null;

    const CARD_SELECTOR = ".ppk-profil .perle-collection-card.fa-tip, .ppk-profil .user-awards-close.fa-tip";

    if (!tooltip) {
      tooltip = document.createElement("div");
      tooltip.id = "perlepluie-floating-tip";
      document.body.appendChild(tooltip);
    }

    document.addEventListener("mouseover", function (event) {
      const card = event.target.closest(CARD_SELECTOR);

      if (!card) {
        return;
      }

      const tip = card.getAttribute("data-tip");

      if (!tip) {
        return;
      }

      if (card === currentCard) {
        positionTooltip(card, tooltip);
        return;
      }

      currentCard = card;

      tooltip.innerHTML = sanitizeTip(tip);

      tooltip.classList.remove("is-visible");
      void tooltip.offsetWidth;
      tooltip.classList.add("is-visible");

      positionTooltip(card, tooltip);
    });

    document.addEventListener("mousemove", function (event) {
      const card = event.target.closest(CARD_SELECTOR);

      if (!card || card !== currentCard) {
        return;
      }

      positionTooltip(card, tooltip);
    });

    document.addEventListener("mouseout", function (event) {
      const card = event.target.closest(CARD_SELECTOR);

      if (!card || card !== currentCard) {
        return;
      }

      if (event.relatedTarget && card.contains(event.relatedTarget)) {
        return;
      }

      const nextCard = event.relatedTarget
        ? event.relatedTarget.closest(CARD_SELECTOR)
        : null;

      if (nextCard) {
        return;
      }

      currentCard = null;
      tooltip.classList.remove("is-visible");
    });

    document.addEventListener(
      "scroll",
      function () {
        currentCard = null;
        tooltip.classList.remove("is-visible");
      },
      true
    );
  }

  function positionTooltip(card, tooltip) {
    const rect = card.getBoundingClientRect();
    const gap = 10;

    let left = rect.left + rect.width / 2;

    tooltip.style.left = left + "px";
    tooltip.style.top = "0px";

    const tipRect = tooltip.getBoundingClientRect();

    let top = rect.top - tipRect.height - gap;

    if (top < 8) {
      top = rect.bottom + gap;
    }

    if (left - tipRect.width / 2 < 8) {
      left = 8 + tipRect.width / 2;
    }

    if (left + tipRect.width / 2 > window.innerWidth - 8) {
      left = window.innerWidth - 8 - tipRect.width / 2;
    }

    tooltip.style.left = left + "px";
    tooltip.style.top = top + "px";
  }

  function sanitizeTip(value) {
    return escapeHtml(value)
      .replace(/&lt;br\s*\/?&gt;/gi, "<br>")
      .replace(/&lt;strong&gt;/gi, "<strong>")
      .replace(/&lt;\/strong&gt;/gi, "</strong>");
  }

  function normalizeKey(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[_\s]+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }
})();