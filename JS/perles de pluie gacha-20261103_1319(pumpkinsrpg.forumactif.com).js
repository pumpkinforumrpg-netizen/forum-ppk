(function () {
  const GROUPS = {
  commune: parseList("rose|Rose;sapi|Sapin;citr|Citron;mari|Marine;choc|Chocolat;ment|Menthe;gren|Grenat;ivoi|Ivoire;turq|Turquoise;cann|Cannelle;lava|Lavande;miel|Miel;nuit|Nuit;frai|Fraise;saug|Sauge;perl|Perle;oran|Orange;indi|Indigo;till|Tilleul;ceri|Cerise;ciel|Ciel;nois|Noisette;viol|Violette;neig|Neige;emer|Émeraude;pech|Pêche;fume|Fumée;ambr|Ambre;lila|Lilas;lagu|Lagune;cafe|Café;fram|Bonbon;vani|Vanille;oliv|Olive;azur|Azur;prun|Prune;cora|Corail;brum|Brume;mous|Mousse;or|Or;mauv|Mauve;roug|Rouge;crem|Crème;jade|Jade;abri|Abricot;cend|Cendre;grnd|Grenade;parm|Parme;cara|Caramel"),

  rare: parseList("aur|Aurore;onyx|Onyx;mac|Macaron;syl|Sylve;con|Confetti;noc|Nocturne;bra|Braisée;lun|Lunelle;mth|Menthys;fra|Grenadine;aut|Automne;giv|Givrée;carm|Carmine;opa|Opaline;bos|Bosquet;cre|Crépuscule;amet|Améthyste;sol|Solaire;prin|Fleur;azum|Azurine;inf|Infuse;ros|Rosée;est|Estivale;gre|Pourpre;org|Orageuse;vei|Veilleuse;bru|Brumelle;suc|Sucrine;arc|Arcanie;ama|Amarine;lav|Lavandine;hiv|Glacée;cru|Crumble;pas|Passion;vio|Framboise;myr|Myrtille;alis|Alistair;ronce|Ronce;brow|Brownie"),

  legendaire: parseList("lamb|Véga|spark;lopa|Antarès|spark;lrub|Bételgeuse|spark;lcit|Polaris|spark;livo|Rigel|spark;lsap|Maïa|spark;ljad|Bellatrix|spark;leme|Alcyone|spark;lamt|Arcturus|spark;lpou|Spica|spark;lcor|Procyon|spark;lony|Algol|spark;lpri|Sirius|spark"),

  mythique: parseList("ori|Orion|constellation co-ori;lyr|Lyre|constellation co-lyr;cas|Cassiopée|constellation co-cas;and|Andromède|constellation co-and;peg|Pégase|constellation co-peg;per|Persée|constellation co-per;phe|Phénix|constellation co-phe;hyd|Hydre|constellation co-hyd;cyg|Cygne|constellation co-cyg;dra|Dragon|constellation co-dra")
};

  const RARITY_LABELS = {
    commune: "Commune",
    rare: "Rare",
    legendaire: "Légendaire",
    mythique: "Mythique"
  };

	whenReady(function () {
	  convertTextMarkers();
	  initPerlePluie();
	});

	function whenReady(callback) {
	  if (document.body) {
		callback();
		return;
	  }

	  if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", callback);
		return;
	  }

	  setTimeout(function () {
		whenReady(callback);
	  }, 50);
	}
	
function parseList(text) {
  return text
    .trim()
    .split(";")
    .filter(Boolean)
    .map(function (entry) {
      const parts = entry.split("|");

      return {
        id: parts[0],
        name: parts[1],
        icon: parts[2] || ""
      };
    });
}

  function convertTextMarkers() {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          if (!node.nodeValue.includes("[perlepluie]")) {
            return NodeFilter.FILTER_REJECT;
          }

          if (
            node.parentElement &&
            node.parentElement.closest("script, style, textarea, code, pre, blockquote, .quote, .codebox")
          ) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const nodes = [];
    let node;

    while ((node = walker.nextNode())) {
      nodes.push(node);
    }

    nodes.forEach(function (textNode) {
      const parts = textNode.nodeValue.split("[perlepluie]");
      const frag = document.createDocumentFragment();

      parts.forEach(function (part, index) {
        if (part) {
          frag.appendChild(document.createTextNode(part));
        }

        if (index < parts.length - 1) {
          const marker = document.createElement("span");
          marker.className = "perlepluie";
          frag.appendChild(marker);
        }
      });

      textNode.parentNode.replaceChild(frag, textNode);
    });
  }

  function initPerlePluie() {
    const markers = document.querySelectorAll(".perlepluie, [data-perlepluie]");

    markers.forEach(function (marker, index) {
      if (marker.dataset.perlepluieDone === "1") {
        return;
      }

      const post = findPost(marker);
      const seed = findPostSeed(marker, post, index);

      if (post && post.dataset.perlepluieRolled === "1") {
        marker.remove();
        return;
      }

      const face = getFace(seed);
      const result = getResult(face);

      marker.outerHTML = renderResult(face, result);

      if (post) {
        post.dataset.perlepluieRolled = "1";
      }
    });
  }

  function findPost(marker) {
    return (
      marker.closest(".post, .postbody, .postmain, .post-entry, .post-content, .content, tr") ||
      marker.parentElement
    );
  }

  function findPostSeed(marker, post, index) {
    const source = post || marker.parentElement;

    if (source) {
      const candidates = [];

      if (source.id) {
        candidates.push(source.id);
      }

      source.querySelectorAll("[id], a[name]").forEach(function (el) {
        if (el.id) {
          candidates.push(el.id);
        }

        if (el.name) {
          candidates.push(el.name);
        }
      });

      for (const value of candidates) {
        if (/^(p|post)?\d+$/i.test(value)) {
          return value;
        }
      }
    }

    return location.pathname + "::" + index;
  }

  function getFace(seed) {
    return (hash32(seed) % 1000) + 1;
  }

  function hash32(str) {
    let h = 2166136261;

    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }

    return h >>> 0;
  }

  function getResult(face) {
    if (face <= 700) {
      return pickInRange(face, 1, 700, "commune");
    }

    if (face <= 920) {
      return pickInRange(face, 701, 220, "rare");
    }

    if (face <= 990) {
      return pickInRange(face, 921, 70, "legendaire");
    }

    return pickInRange(face, 991, 10, "mythique");
  }

  function pickInRange(face, start, size, rarity) {
    const pool = GROUPS[rarity];
    const local = face - start;
    const index = Math.min(pool.length - 1, Math.floor(local * pool.length / size));

    return {
      rarity: rarity,
      item: pool[index]
    };
  }

  function renderResult(face, result) {
    const rarity = result.rarity;
    const item = result.item;

    const cardClass =
      rarity === "commune"
        ? "perle-card"
        : "perle-card " + rarity;

    const icon = item.icon
      ? '<i class="' + escapeHtml(item.icon) + '"></i>'
      : "";

    const faceText = String(face).padStart(3, "0");

    return [
      '<div class="perlepluie-resultat perlepluie-' + rarity + '">',
        '<div class="' + cardClass + '">',
          '<span class="perle" id="' + escapeHtml(item.id) + '">' + icon + '</span>',
          '<b>' + escapeHtml(item.name) + '</b>',
        '</div>',

        '<div class="perlepluie-infos">',
          '<strong>Perle obtenue<br><span class="resultatperle">' + escapeHtml(item.name) + '</span></strong>',
          '<span class="perlepluie-rarete">' + escapeHtml(RARITY_LABELS[rarity]) + '</span>',
        '</div>',
      '</div>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();