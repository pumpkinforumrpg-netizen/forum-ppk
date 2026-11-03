const ORIGIN_ORDER = ["humain", "eveille", "sorcier", "familier", "reliquaire"];

const ORIGIN_LABELS = {
  humain: "Humain",
  eveille: "Eveillé",
  sorcier: "Sorcier",
  familier: "Familier",
  reliquaire: "Reliquaire"
};

const AVATAR_FILTERS = [
  { id: "all", label: "Tout" },
  { id: "abc", label: "abc" },
  { id: "def", label: "def" },
  { id: "ghi", label: "ghi" },
  { id: "jkl", label: "jkl" },
  { id: "mno", label: "mno" },
  { id: "pqr", label: "pqr" },
  { id: "stuv", label: "stuv" },
  { id: "wxyz", label: "wxyz" },
  { id: "0123-#", label: "0123-#" }
];

const JOB_FILTERS = [
  { id: "all", label: "Tout", match: "" },
  { id: "embarcadere", label: "L'Embarcadère", match: "l'embarcadere" },
  { id: "centre-ville", label: "Centre-ville", match: "centre-ville" },
  { id: "hauts-bois", label: "Hauts-Bois", match: "hauts-bois" },
  { id: "foret-ambre", label: "Forêt d'Ambre", match: "foret d'ambre" },
  { id: "vesperune", label: "Vesperune", match: "vesperune" }
];

const POWER_DOMAINS = [
  "all",
  "Soins",
  "Protection",
  "Combat",
  "Illusions",
  "Détection",
  "Mobilité",
  "Influence",
  "Malédictions"
];

const VALID_POWER_DOMAINS = POWER_DOMAINS.filter(function (item) {
  return item !== "all";
});

const WORKPLACE_TYPES = {
  "librairie des brumes": "Librairie",
  "commissariat": "Commissariat",
};

const state = {
  activeTab: "all",
  search: "",
  origin: "all",
  avatarFilter: "all",
  jobFilter: "all",
  sortMode: "alpha",
  pnjOnly: false,
  powerOrigin: "all",
  powerDomain: "all",
  powerAnimalFilters: {},
  powerRelicFilters: {}
};

const workplacesCatalog = [
  /*
    ÉTABLISSEMENT VIERGE
    {
     name: "Nom de l'établissement",
     type: "Type",
     district: "Centre-ville"
    }
  */
  {
    name: "Blackwell Private Investigations (BPI)",
    type: "Cabinet de détectives privés",
    district: "Centre-ville"
  },
  {
    name: "Amberwoods Automobile",
    type: "Garage",
    district: "Centre-ville"
  },
  {
    name: "Red Oak & Co",
    type: "Entreprise de construction & exploitation forestière",
    district: "Centre-ville"
  },
  {
    name: "The Amber Post",
    type: "Éditeur de journaux",
    district: "Centre-ville"
  },
  {
    name: "Scierie de Red Oak",
    type: "Exploitation forestière",
    district: "Forêt d'Ambre"
  },
  {
    name: "Maple & Pine",
    type: "Café",
    district: "L'Embarcadère"
  },
  {
    name: "Tiny Craft",
    type: "Échoppe de faits-main",
    district: "L'Embarcadère"
  },
  {
    name: "Amberbloom",
    type: "Fleuriste",
    district: "L'Embarcadère"
  },
  {
    name: "Timber Tools Supply",
    type: "Magasin d'outillage",
    district: "L'Embarcadère"
  },
  {
    name: "Ash Antiquités",
    type: "Antiquaire",
    district: "L'Embarcadère"
  },
  {
    name: "My'My",
    type: "Institut de beauté & Coiffeur",
    district: "L'Embarcadère"
  },
  {
    name: "Poppin'Pepper",
    type: "Pizzeria",
    district: "L'Embarcadère"
  },
  {
    name: "Farmer's Market",
    type: "Magasin de productions locales",
    district: "L'Embarcadère"
  },
  {
    name: "Château de Chantilly",
    type: "Politique",
    district: "Vesperune"
  },
  {
    name: "Millefeuille",
    type: "École (Opaline)",
    district: "Vesperune"
  },
  {
    name: "Réglisse",
    type: "École (Amarena)",
    district: "Vesperune"
  },
  {
    name: "Clafoutis",
    type: "Village",
    district: "Vesperune"
  },
];

const powersCatalog = [
  /*
    POUVOIR VIERGE
    {
      name: "Nom du pouvoir",
      domain: "Domaine",
      description: "Description du pouvoir."
    }
  */
  {
    name: "Pyrokinésie",
    domain: "Combat",
    description: "Matérialisation et contrôle de flammes. [RÉSERVÉ par Alistair]"
  },
  {
    name: "Hydrokinésie",
    domain: "Combat",
    description: "Matérialisation et contrôle de l'eau."
  },
  {
    name: "Cryokinésie",
    domain: "Combat",
    description: "Matérialisation et contrôle de la glace."
  },
  {
    name: "Aérokinésie",
    domain: "Combat",
    description: "Matérialisation et contrôle de l'air."
  },
  {
    name: "Géokinésie",
    domain: "Combat",
    description: "Matérialisation et contrôle de la terre."
  },
  {
    name: "Florakinésie",
    domain: "Combat",
    description: "Matérialisation et contrôle des fleurs (éclosion, fanage, etc.)."
  },
  {
    name: "Photokinésie",
    domain: "Combat",
    description: "Matérialisation et contrôle de la lumière."
  },
  {
    name: "Fumokinésie",
    domain: "Combat",
    description: "Matérialisation et contrôle de la fumée."
  },
  {
    name: "Sonokinésie",
    domain: "Combat",
    description: "Contrôle du son."
  },
  {
    name: "Thermokinésie",
    domain: "Combat",
    description: "Contrôle de la température."
  },
  {
    name: "Barrière",
    domain: "Protection",
    description: "Crée une limite invisible autour d’une personne ou d’un espace restreint. La barrière ralentit ou repousse ce qui tente de la franchir."
  },
  {
    name: "Sirène",
    domain: "Influence",
    description: "Voix envoûtante, chantée ou parlée, permettant d'influencer autrui à réaliser sa volonté, même partiellement."
  },
  {
    name: "Camouflage",
    domain: "Illusions",
    description: "Dissimule une personne, un objet ou une petite zone aux yeux des autres. La cible n’est pas invisible, mais devient difficile à remarquer."
  },
  {
    name: "Invisibilité",
    domain: "Illusions",
    description: "Devenir invisible. Cela ne s'applique pas à autrui ou aux objets, outre les vêtements que l'on porte."
  },
  {
    name: "Métamorphose animale",
    domain: "Illusions",
    description: "Prendre l'apparence physique et les capacités de petits et moyens animaux. (Une maîtrise extrême est requise pour obtenir plus d'1 forme animale)."
  },
  {
    name: "Réminescence",
    domain: "Détection",
    description: "Repère les résidus magiques laissés par l'utilisation de la magie ou d'un objet enchanté, et permet de s'octroyer une vision plus ou moins claire de la scène."
  },
  {
    name: "Lévitation",
    domain: "Mobilité",
    description: "Lévite dans les airs pendant une durée indéterminée. (Peu utile pour les sorciers ayant fait leurs classes.)"
  },
  {
    name: "Téléportation",
    domain: "Mobilité",
    description: "Déplacement instantané sur une distance visible ou connue. Le pouvoir devient risqué si la destination est invisible ou inconnue."
  },
  {
    name: "Patinage",
    domain: "Mobilité",
    description: "Crée une fine couche de glace sous ses pieds afin de glisser sur le sol comme sur une patinoire, en permanence. (Désactivable)."
  },
  {
    name: "Sixième sens",
    domain: "Détection",
    description: "Ressentir un coup de jus chaque fois qu'un danger, une présence ou une anomalie magique est sur le point de se produire ou de toucher le détenteur."
  },
  {
    name: "Télépathie",
    domain: "Influence",
    description: "Entend les pensées d'une personne ciblée."
  },
  {
    name: "Changepeau",
    domain: "Illusions",
    description: "Prendre l'apparence physique d'une personne connue ou non."
  },
  {
    name: "Mirage",
    domain: "Illusions",
    description: "Crée une image illusoire dans un espace donné."
  },
  {
    name: "Projectiles magiques",
    domain: "Combat",
    description: "Lance des projectiles magiques avec de l'énergie brute, non élémentaire."
  },
  {
    name: "Chaînes",
    domain: "Combat",
    description: "Matérialise des chaînes magiques pour retenir, tirer ou immobiliser une cible. Les chaînes disparaissent si la concentration est rompue."
  },
  {
    name: "Contresort",
    domain: "Combat",
    description: "Dévie un sort qui est lancé sur le détenteur. La nouvelle cible est déterminée par le détenteur, ou de façon aléatoire en cas de manque de concentration."
  },
  {
    name: "Manipulation des souvenirs",
    domain: "Influence",
    description: "Rend un souvenir flou, difficile à saisir. Peut les effacer, en cas de maîtrise extrême du pouvoir."
  },
  {
    name: "Sixième sens",
    domain: "Détection",
    description: "Ressentir un coup de jus chaque fois qu'un danger, une présence ou une anomalie magique est sur le point de se produire."
  },
  {
    name: "Sommeil",
    domain: "Influence",
    description: "Pousse une cible vers l'endormissement."
  },
  {
    name: "Sceaux",
    domain: "Protection",
    description: "Pose une marque de protection sur un lieu, un objet ou une personne. Une fois le sceau posé, nul ne peut entrer ou heurter l'intégrité de l'objet ou de la personne."
  },
  {
    name: "Guérison",
    domain: "Soins",
    description: "Soigne les blessures. Plus la blessure est grave, plus le soin prend du temps. Ne peut pas recréer la matière."
  },
  {
    name: "Régénération",
    domain: "Soins",
    description: "Recrée les cellules de son propre corps uniquement. Soigne les blessures et recrée la matière organique du détenteur."
  },
  {
    name: "Force",
    domain: "Combat",
    description: "Possède une force surhumaine."
  },
  {
    name: "Élasticité",
    domain: "Combat",
    description: "Rend sa peau et son corps élastiques."
  },
  {
    name: "Contrôle de la taille",
    domain: "Malédictions",
    description: "Change la taille d'un objet ou d'une personne."
  },
  {
    name: "Toxikinésie",
    domain: "Combat",
    description: "Matérialise et contrôle des substances toxiques, poisons."
  },
  {
    name: "Intangibilité",
    domain: "Mobilité",
    description: "Se rend tangible ou intangible, afin de traverser des structures."
  },
  {
    name: "Météokinésie",
    domain: "Combat",
    description: "Influence ou contrôle les phénomènes météorologiques dans une zone limitée."
  },
  {
    name: "Hématokinésie",
    domain: "Combat",
    description: "Contrôle du sang."
  },
  {
    name: "Communication animale",
    domain: "Influence",
    description: "Entend et comprend les pensées animales, peut communiquer avec eux."
  },
  {
    name: "Communication animique",
    domain: "Influence",
    description: "Entend et comprend les pensées des âmes défuntes, peut communiquer avec elles."
  },
  {
    name: "Amplification des sens",
    domain: "Combat",
    description: "Amplifie au choix l'un des sens du détenteur de façon temporaire : ouïe, vue, goût, vision, odorat."
  },
  {
    name: "Zone de guérison",
    domain: "Soins",
    description: "Crée une zone de soins, utile pour les blessures légères à moyennes."
  },
  {
    name: "Luciole",
    domain: "Illusions",
    description: "Brille dans le noir."
  }
];

const avatarsCatalog = [
  /*
    AVATAR VIERGE
    {
      avatar: "URL_IMAGE",
      faceclaimName: "Nom du faceclaim",
      faceclaimSource: "Source",
      faceclaimSourceType: "Jeu vidéo",
      status: "Libre"
    }
  */
  {
    avatar: "https://i.pinimg.com/736x/d7/c6/99/d7c699ed250ab2246b375498dd1f34bb.jpg",
    faceclaimName: "Réservé",
    faceclaimSource: "Jujutsu Kaisen",
    faceclaimSourceType: "Manga",
    status: "Yuta Okkotsu"
  }
];

const characters = [
  /*
    FICHE PERSONNAGE VIERGE
    {
      id: "pseudo",
      pseudo: "Pseudo",
      isPnj: false,
      origin: "humain",
      jobTitle: "Intitulé du métier",
      workplaceName: "Nom de l'établissement",
      workplaceType: "Salon de thé",
      workDistrict: "Centre-ville",
      presentationLink: "#",
      profileLink: "#",
      avatar: "AVATAR_FORUMACTIF_OU_URL",
      faceclaimName: "Nom du faceclaim",
      faceclaimSource: "Source du faceclaim",
      faceclaimSourceType: "Jeu vidéo",
      powerName: "Aucun pouvoir",
      powerDescription: "",
      magicDomain: "",
      animalForm: "",
      relicForm: ""
    }
  */
  {
    id: "Jace",
    pseudo: "Jace",
    isPnj: false,
    origin: "eveille",
    jobTitle: "Acériculteur",
    workplaceName: "Nom de l'établissement",
    workplaceType: "Érablière",
    workDistrict: "Forêt d'Ambre",
    presentationLink: "#",
    profileLink: "https://pumpkinsrpg.forumactif.com/u3",
    avatar: "https://zupimages.net/up/26/16/t24m.png",
    faceclaimName: "Carlos Sainz Jr.",
    faceclaimSource: "@Mariana",
    faceclaimSourceType: "Fanart",
    powerName: "Électrokinésie",
    powerDescription: "Matérialisation et contrôle de l'électricité'.",
    magicDomain: "Combat",
    animalForm: "",
    relicForm: ""
  },
  {
    id: "Chantilly",
    pseudo: "Chantilly",
    isPnj: true,
    origin: "sorcier",
    jobTitle: "Reine d'Opaline",
    workplaceName: "Château de Chantilly",
    workplaceType: "Politique",
    workDistrict: "Vesperune",
    presentationLink: "#",
    profileLink: "#",
    avatar: "https://2img.net/i.imgur.com/6P6NQcj.png",
    faceclaimName: "Hydaelyn",
    faceclaimSource: "Final Fantasy XIV",
    faceclaimSourceType: "Jeu vidéo",
    powerName: "Inconnu",
    powerDescription: "Il paraît qu'elle surpasse Cendre-Lune... et tous les émissaires réunis.",
    magicDomain: "",
    animalForm: "",
    relicForm: ""
  },
  {
    id: "CendreLune",
    pseudo: "Amaretto",
    isPnj: true,
    origin: "sorcier",
    jobTitle: "Émissaire (Cendre-Lune)",
    workplaceName: "Château de Chantilly",
    workplaceType: "Politique",
    workDistrict: "Vesperune",
    presentationLink: "#",
    profileLink: "#",
    avatar: "https://2img.net/i.imgur.com/fxiJD44.png",
    faceclaimName: "Lycorice Cookie",
    faceclaimSource: "Cookie Run: Kingdom",
    faceclaimSourceType: "Jeu vidéo",
    powerName: "Contrôle de l'âme",
    powerDescription: "Insuffle temporairement la vie aux âmes des défunts afin de pouvoir les contrôler et les façonner. Permet de manipuler l'âme des vivants à sa guise.",
    magicDomain: "Malédictions",
    animalForm: "",
    relicForm: ""
  },
  {
    id: "Praline",
    pseudo: "Praline",
    isPnj: true,
    origin: "sorcier",
    jobTitle: "Héritière au Trône",
    workplaceName: "Château d'Amarena",
    workplaceType: "Politique",
    workDistrict: "Vesperune",
    presentationLink: "#",
    profileLink: "#",
    avatar: "https://2img.net/i.imgur.com/t1MP3g4.png",
    faceclaimName: "Himeko",
    faceclaimSource: "Honkai: Star Rail",
    faceclaimSourceType: "Jeu vidéo",
    powerName: "Sucre-amer",
    powerDescription: "Ancre une émotion positive ou négative dans un petit objet ou un comestible.",
    magicDomain: "Influence",
    animalForm: "",
    relicForm: ""
  },
  {
    id: "Eglantine",
    pseudo: "Églantine",
    isPnj: true,
    origin: "sorcier",
    jobTitle: "Prêtresse du Chœur",
    workplaceName: "Royaume d'Amarena",
    workplaceType: "Église",
    workDistrict: "Vesperune",
    presentationLink: "#",
    profileLink: "#",
    avatar: "https://2img.net/i.imgur.com/G5USgQm.png",
    faceclaimName: "Shorekeeper",
    faceclaimSource: "Wuthering Waves",
    faceclaimSourceType: "Jeu vidéo",
    powerName: "Ronces noires",
    powerDescription: "Crée des ronces noires autour d'un lieu, d'une personne ou d'un objet, afin de protéger, ralentir ou étreindre une cible. Attention aux épines.",
    magicDomain: "Combat",
    animalForm: "",
    relicForm: ""
  },
  {
    id: "Marie",
    pseudo: "Marie",
    isPnj: true,
    origin: "humain",
    jobTitle: "Adjointe au Maire",
    workplaceName: "Mairie d'Amberwoods",
    workplaceType: "Mairie",
    workDistrict: "Centre-ville",
    presentationLink: "#",
    profileLink: "#",
    avatar: "https://2img.net/i.imgur.com/hWldf9D.png",
    faceclaimName: "Grace Ashcroft",
    faceclaimSource: "Resident Evil 9",
    faceclaimSourceType: "Jeu vidéo",
    powerName: "",
    powerDescription: "",
    magicDomain: "",
    animalForm: "",
    relicForm: ""
  },
  {
    id: "Herman",
    pseudo: "Herman & Brett",
    isPnj: true,
    origin: "humain",
    jobTitle: "Investisseurs & Propriétaires de mines",
    workplaceName: "Investissement",
    workplaceType: "Affaires",
    workDistrict: "Centre-ville",
    presentationLink: "#",
    profileLink: "#",
    avatar: "https://2img.net/i.imgur.com/Gch4PrW.png",
    faceclaimName: "Rion Project",
    faceclaimSource: "Gutenberg",
    faceclaimSourceType: "Comic",
    powerName: "",
    powerDescription: "",
    magicDomain: "",
    animalForm: "",
    relicForm: ""
  },
  {
    id: "NouvelleLune",
    pseudo: "Jasmin",
    isPnj: false,
    origin: "sorcier",
    jobTitle: "Émissaire (Nouvelle-Lune) & ???",
    workplaceName: "Amberwoods",
    workplaceType: "À définir",
    workDistrict: "Hauts-Bois",
    presentationLink: "#",
    profileLink: "https://pumpkinsrpg.forumactif.com/u1",
    avatar: "https://2img.net/i.imgur.com/qx5UPlV.png",
    faceclaimName: "Hadrian",
    faceclaimSource: "Forgotten Creatures",
    faceclaimSourceType: "Webtoon",
    powerName: "",
    powerDescription: "",
    magicDomain: "",
    animalForm: "",
    relicForm: ""
  },
  {
    id: "Myrtille",
    pseudo: "Myrtille",
    isPnj: false,
    origin: "sorcier",
    jobTitle: "???",
    workplaceName: "Amberwoods",
    workplaceType: "À définir",
    workDistrict: "???",
    presentationLink: "#",
    profileLink: "#",
    avatar: "https://2img.net/i.imgur.com/GCHpjeR.png",
    faceclaimName: "Charlene",
    faceclaimSource: "Forgotten Creatures",
    faceclaimSourceType: "Webtoon",
    powerName: "",
    powerDescription: "",
    magicDomain: "",
    animalForm: "",
    relicForm: ""
  },
  {
    id: "Cannelle",
    pseudo: "Cannelle",
    isPnj: false,
    origin: "sorcier",
    jobTitle: "???",
    workplaceName: "Amberwoods",
    workplaceType: "À définir",
    workDistrict: "???",
    presentationLink: "#",
    profileLink: "https://pumpkinsrpg.forumactif.com/u4",
    avatar: "https://2img.net/i.imgur.com/o9ZGOZi.png",
    faceclaimName: "Yuji Itadori",
    faceclaimSource: "Jujutsu Kaisen",
    faceclaimSourceType: "Manga",
    powerName: "",
    powerDescription: "",
    magicDomain: "",
    animalForm: "",
    relicForm: ""
  }
];

function enhanceRegisterUI() {
  const title = document.getElementById("register-title");

  if (title && !document.getElementById("register-home-link")) {
    title.style.position = "relative";

    const backLink = document.createElement("a");
    backLink.id = "register-home-link";
    backLink.href = "https://pumpkinsrpg.forumactif.com/";
    backLink.className = "fa-tip";
    backLink.setAttribute("data-tip", "Retour à l'accueil");
    backLink.setAttribute("aria-label", "Retour à l'accueil");
    backLink.style.position = "absolute";
    backLink.style.left = "14px";
    backLink.style.top = "50%";
    backLink.style.transform = "translateY(-50%)";
    backLink.style.display = "flex";
    backLink.style.alignItems = "center";
    backLink.style.justifyContent = "center";
    backLink.style.width = "28px";
    backLink.style.height = "28px";
    backLink.style.borderRadius = "7px";
    backLink.style.color = "var(--color5)";
    backLink.style.textDecoration = "none";

    backLink.innerHTML = '<i class="fa-solid fa-chevron-left" aria-hidden="true"></i>';
    title.appendChild(backLink);
  }

  const tabs = document.querySelector(".character-register__tabs");

  if (tabs && !tabs.querySelector('[data-tab="familiars"]')) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "register-tab";
    btn.dataset.tab = "familiars";
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", "false");
    btn.textContent = "Familiers & Reliquaires";
    tabs.appendChild(btn);
  }

  if (tabs && !document.getElementById("themeSwitch")) {
    const row = document.createElement("div");
    row.className = "register-tabs-row";
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.justifyContent = "space-between";
    row.style.gap = "16px";
    row.style.width = "100%";

    tabs.parentNode.insertBefore(row, tabs);
    row.appendChild(tabs);

    tabs.style.flex = "1 1 auto";

    const switchEl = document.createElement("div");
    switchEl.className = "theme-switch glass";
    switchEl.id = "themeSwitch";

    switchEl.innerHTML = `
      <div class="theme-switch-clip">
        <div class="theme-thumb"></div>
      </div>

      <button type="button" data-tip="Dark" class="theme-btn fa-tip" data-theme="dark" aria-label="Thème sombre" aria-pressed="false">
        <i class="fa-solid fa-moon" aria-hidden="true"></i>
      </button>

      <button type="button" data-tip="Light" class="theme-btn fa-tip" data-theme="light" aria-label="Thème clair" aria-pressed="false">
        <i class="fa-solid fa-sun" aria-hidden="true"></i>
      </button>

      <button type="button" data-tip="Autumn" class="theme-btn fa-tip" data-theme="autumn" aria-label="Thème automne" aria-pressed="false">
        <i class="fa-solid fa-leaf" aria-hidden="true"></i>
      </button>
    `;

    row.appendChild(switchEl);
  }
}

enhanceRegisterUI();

const el = {
  content: document.getElementById("register-content"),
  tabs: Array.from(document.querySelectorAll(".register-tab")),
  search: document.getElementById("register-search-input"),
  origin: document.getElementById("register-origin-filter"),
  sort: document.getElementById("register-sort-mode"),
  pnj: document.getElementById("register-pnj-toggle"),
  stdTools: document.getElementById("std-tools"),
  avTools: document.getElementById("av-tools")
};

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function cleanText(value, fallback) {
  const text = String(value || "").trim();
  return text || fallback;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildNormMap(text) {
  let normalized = "";
  const map = [];

  for (let i = 0; i < text.length; i += 1) {
    const part = text[i]
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    for (let j = 0; j < part.length; j += 1) {
      normalized += part[j];
      map.push(i);
    }
  }

  return { normalized, map };
}

function getHighlightHtml(text, query) {
  const raw = String(text || "");
  const q = normalizeText(query);

  if (!q) {
    return escapeHtml(raw);
  }

  const built = buildNormMap(raw);
  const start = built.normalized.indexOf(q);

  if (start === -1) {
    return escapeHtml(raw);
  }

  const endNorm = start + q.length;
  const startRaw = built.map[start];
  const endRaw = endNorm < built.map.length ? built.map[endNorm] : raw.length;

  return (
    escapeHtml(raw.slice(0, startRaw)) +
    "<mark>" + escapeHtml(raw.slice(startRaw, endRaw)) + "</mark>" +
    escapeHtml(raw.slice(endRaw))
  );
}

function setHighlightedText(node, text, query) {
  const safe = cleanText(text, "—");
  if (query && normalizeText(safe).includes(normalizeText(query))) {
    node.innerHTML = getHighlightHtml(safe, query);
  } else {
    node.textContent = safe;
  }
}

const THEME_STORAGE_KEY = "ppk-theme-preference";
const THEME_LEGACY_KEY = "color-scheme";
const VALID_THEMES = { dark: true, light: true, autumn: true };

function isValidTheme(theme) {
  return !!VALID_THEMES[theme];
}

function getSystemTheme() {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getSavedTheme() {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);

  if (isValidTheme(saved)) {
    return saved;
  }

  const legacy = localStorage.getItem(THEME_LEGACY_KEY);
  return isValidTheme(legacy) ? legacy : null;
}

function saveTheme(theme) {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  localStorage.setItem(THEME_LEGACY_KEY, theme);
}

function getEffectiveTheme() {
  return getSavedTheme() || getSystemTheme();
}

function syncThemeSwitchUI(theme) {
  const switchEl = document.getElementById("themeSwitch");
  if (!switchEl) return;

  const buttons = switchEl.querySelectorAll(".theme-btn");
  const thumb = switchEl.querySelector(".theme-thumb");
  let activeIndex = 0;

  buttons.forEach(function (button, index) {
    const active = button.getAttribute("data-theme") === theme;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
    if (active) {
      activeIndex = index;
    }
  });

  if (thumb && buttons.length) {
    const width = buttons[0].offsetWidth || 0;
    thumb.style.transform = "translateX(" + (activeIndex * width) + "px)";
  }
}

function applyTheme(theme, persist) {
  const nextTheme = isValidTheme(theme) ? theme : "dark";
  document.documentElement.setAttribute("data-color-scheme", nextTheme);
  syncThemeSwitchUI(nextTheme);

  if (persist) {
    saveTheme(nextTheme);
  }
}

function initThemeSwitch() {
  const switchEl = document.getElementById("themeSwitch");
  if (!switchEl) return;

  if (switchEl.getAttribute("data-theme-bound") === "1") {
    syncThemeSwitchUI(getEffectiveTheme());
    return;
  }

  switchEl.setAttribute("data-theme-bound", "1");

  switchEl.addEventListener("click", function (event) {
    const button = event.target.closest(".theme-btn");
    if (!button) return;

    const theme = button.getAttribute("data-theme");
    if (!isValidTheme(theme)) return;

    applyTheme(theme, true);
  });

  applyTheme(getEffectiveTheme(), false);

  if (window.matchMedia) {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = function () {
      if (!getSavedTheme()) {
        applyTheme(getSystemTheme(), false);
      }
    };

    if (media.addEventListener) {
      media.addEventListener("change", listener);
    } else if (media.addListener) {
      media.addListener(listener);
    }
  }
}

function buildPowerKey(name) {
  return normalizeText(cleanText(name, "Pouvoir inconnu"));
}

function getCanonicalMagicDomain(value) {
  const raw = cleanText(value, "");
  const found = VALID_POWER_DOMAINS.find(function (domain) {
    return normalizeText(domain) === normalizeText(raw);
  });
  return found || "";
}

function getSourceKey(character) {
  return normalizeText(cleanText(character.faceclaimSource, "Source inconnue"));
}

function getSourceLabel(character) {
  return cleanText(character.faceclaimSource, "Source inconnue");
}

function getSourceType(character) {
  return cleanText(character.faceclaimSourceType, "Type inconnu");
}

function getAvatarBucket(source) {
  const first = normalizeText(source).charAt(0);

  if ("abc".includes(first)) return "abc";
  if ("def".includes(first)) return "def";
  if ("ghi".includes(first)) return "ghi";
  if ("jkl".includes(first)) return "jkl";
  if ("mno".includes(first)) return "mno";
  if ("pqr".includes(first)) return "pqr";
  if ("stuv".includes(first)) return "stuv";
  if ("wxyz".includes(first)) return "wxyz";
  return "0123-#";
}

function getWorkplaceKeyFromName(name) {
  return normalizeText(cleanText(name, "Établissement inconnu"));
}

function getWorkplaceKey(character) {
  return getWorkplaceKeyFromName(character.workplaceName);
}

function getWorkplaceLabel(character) {
  return cleanText(character.workplaceName, "Établissement inconnu");
}

function getWorkplaceType(character) {
  return cleanText(
    character.workplaceType,
    WORKPLACE_TYPES[getWorkplaceKey(character)] || "Type inconnu"
  );
}

function getWorkplaceDistrict(character) {
  return cleanText(character.workDistrict, "Quartier inconnu");
}

function getOriginPowerNameByOrigin(origin) {
  if (origin === "familier") return "Châtiment";
  if (origin === "reliquaire") return "Métamorphe";
  return "";
}

function getOriginPowerName(character) {
  return getOriginPowerNameByOrigin(character.origin);
}

function hasOriginPower(character) {
  return !!getOriginPowerName(character);
}

function hasRegisteredPower(character) {
  const powerName = cleanText(character.powerName, "");
  const normalizedPower = normalizeText(powerName);

  if (!normalizedPower || normalizedPower === "aucun pouvoir") {
    return false;
  }

  if (character.origin === "familier" || character.origin === "reliquaire") {
    return normalizedPower !== normalizeText(getOriginPowerName(character));
  }

  return true;
}

function hasAnyPower(character) {
  return hasOriginPower(character) || hasRegisteredPower(character);
}

function getCountLabel(label, count) {
  const text = String(label || "").trim().toLowerCase();
  if (!text) return count + " entrée";
  if (count > 1 && !/s$/i.test(text)) return count + " " + text + "s";
  return count + " " + text;
}

function getSearchableText(character) {
  return normalizeText([
    character.pseudo,
    character.jobTitle,
    character.workplaceName,
    character.workplaceType,
    character.workDistrict,
    ORIGIN_LABELS[character.origin],
    character.faceclaimName,
    character.faceclaimSource,
    character.faceclaimSourceType,
    character.powerName,
    character.powerDescription,
    character.magicDomain,
    getOriginPowerName(character),
    character.animalForm,
    character.relicForm,
    character.isPnj ? "pnj" : "joueur"
  ].join(" "));
}

function matchesSearch(character, term) {
  if (!term) return true;
  return getSearchableText(character).includes(term);
}

function matchesPowerFilters(character) {
  const okOrigin =
    state.powerOrigin === "all" || character.origin === state.powerOrigin;

  const domain = getCanonicalMagicDomain(character.magicDomain);

  const okDomain =
    state.powerDomain === "all" ||
    normalizeText(domain) === normalizeText(state.powerDomain);

  const okSearch = matchesSearch(character, normalizeText(state.search));

  return okOrigin && okDomain && okSearch;
}

function matchesFamRelFilters(character) {
  return matchesSearch(character, normalizeText(state.search));
}

function compareAlpha(a, b) {
  return normalizeText(a.pseudo).localeCompare(normalizeText(b.pseudo), "fr");
}

function compareOrigin(a, b) {
  const oa = ORIGIN_ORDER.indexOf(a.origin);
  const ob = ORIGIN_ORDER.indexOf(b.origin);
  if (oa !== ob) return oa - ob;
  return compareAlpha(a, b);
}

function getFilteredCharacters() {
  const term = normalizeText(state.search);

  return characters
    .filter(function (character) {
      const okOrigin = state.origin === "all" || character.origin === state.origin;
      const okPnj = !state.pnjOnly || character.isPnj;
      const okSearch = matchesSearch(character, term);
      return okOrigin && okPnj && okSearch;
    })
    .sort(state.sortMode === "origin" ? compareOrigin : compareAlpha);
}

function createIconLink(iconClass, href, tip) {
  const a = document.createElement("a");
  a.className = "il fa-tip";
  a.href = href || "#";
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.setAttribute("aria-label", tip);
  a.setAttribute("data-tip", tip);

  const i = document.createElement("i");
  i.className = iconClass;
  i.setAttribute("aria-hidden", "true");

  a.appendChild(i);
  return a;
}

function createEllipsisWithTip(text, textClass, query) {
  const wrap = document.createElement("span");
  wrap.className = "tip-wrap";
  wrap.dataset.fulltext = cleanText(text, "—");

  const inner = document.createElement("span");
  inner.className = textClass + " ov";

  if (query && normalizeText(wrap.dataset.fulltext).includes(normalizeText(query))) {
    inner.innerHTML = getHighlightHtml(wrap.dataset.fulltext, query);
  } else {
    inner.textContent = wrap.dataset.fulltext;
  }

  wrap.appendChild(inner);
  return wrap;
}

function applyOverflowTips() {
  const wraps = document.querySelectorAll(".tip-wrap");

  wraps.forEach(function (wrap) {
    const inner = wrap.querySelector(".ov");
    if (!inner) return;

    const full = (wrap.dataset.fulltext || inner.textContent || "").trim();

    wrap.classList.remove("fa-tip");
    wrap.removeAttribute("data-tip");

    if (!full) return;

    if (inner.scrollWidth > inner.clientWidth + 1) {
      wrap.classList.add("fa-tip");
      wrap.setAttribute("data-tip", full);
    }
  });
}

function createMainAll(character) {
  const wrap = document.createElement("div");
  wrap.className = "main";

  const name = document.createElement("h2");
  name.className = "nm";
  name.textContent = character.pseudo || "Sans pseudo";

  const fcText =
    (character.faceclaimName || "Avatar") +
    " ✦ " +
    (character.faceclaimSource || "Source inconnue");

  const fcWrap = document.createElement("span");
  fcWrap.className = "tip-wrap";
  fcWrap.dataset.fulltext = fcText;

  const fc = document.createElement("p");
  fc.className = "fc ov";

  const fcName = document.createElement("span");
  fcName.className = "fc-n";
  fcName.textContent = character.faceclaimName || "Avatar";

  const fcSep = document.createElement("span");
  fcSep.className = "fc-x";
  fcSep.textContent = " ✦ ";

  const fcSource = document.createElement("span");
  fcSource.className = "fc-s";
  fcSource.textContent = character.faceclaimSource || "Source inconnue";

  fc.appendChild(fcName);
  fc.appendChild(fcSep);
  fc.appendChild(fcSource);
  fcWrap.appendChild(fc);

  const job = createEllipsisWithTip(character.jobTitle || "Sans métier", "job");

  wrap.appendChild(name);
  wrap.appendChild(fcWrap);
  wrap.appendChild(job);

  return wrap;
}

function getCompactMeta(character) {
  if (state.activeTab === "avatars") return character.faceclaimName || "Avatar";
  if (state.activeTab === "jobs") return character.jobTitle || "Sans métier";
  if (state.activeTab === "powers") return ORIGIN_LABELS[character.origin] || "Origine inconnue";
  return "";
}

function createMainCompact(character) {
  const wrap = document.createElement("div");
  wrap.className = "main";

  const name = document.createElement("h2");
  name.className = "nm";

  if (
    (state.activeTab === "avatars" || state.activeTab === "jobs") &&
    state.search
  ) {
    setHighlightedText(name, character.pseudo || "Sans pseudo", state.search);
  } else {
    name.textContent = character.pseudo || "Sans pseudo";
  }

  const meta = createEllipsisWithTip(
    getCompactMeta(character),
    "meta",
    (state.activeTab === "avatars" || state.activeTab === "jobs") ? state.search : ""
  );

  wrap.appendChild(name);
  wrap.appendChild(meta);

  return wrap;
}

function createMainCompactWithMeta(character, metaText) {
  const wrap = document.createElement("div");
  wrap.className = "main";

  const name = document.createElement("h2");
  name.className = "nm";
  name.textContent = character.pseudo || "Sans pseudo";

  const meta = createEllipsisWithTip(metaText || "—", "meta");

  wrap.appendChild(name);
  wrap.appendChild(meta);

  return wrap;
}

function createLinks(character) {
  if (character.isPnj) {
    return null;
  }

  const wrap = document.createElement("div");
  wrap.className = "lnks";

  wrap.appendChild(
    createIconLink("fa-solid fa-feather-pointed", character.presentationLink, "Lire la fiche")
  );

  wrap.appendChild(
    createIconLink("fa-solid fa-user", character.profileLink, "Voir le profil")
  );

  return wrap;
}

function getCharacterCssClass(character) {
  return normalizeText(character.id || character.pseudo || "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createCardShell(character, mode) {
  const card = document.createElement("article");
  const classes = ["cc", mode, character.origin || ""];

  if (character.isPnj) {
    classes.push("isPnj");
  }

  const uniqueClass = getCharacterCssClass(character);
  if (uniqueClass) {
    classes.push(uniqueClass);
  }

  card.className = classes.join(" ");

  const ava = document.createElement("div");
  ava.className = "ava";

  const img = document.createElement("img");
  img.src = character.avatar || "https://dummyimage.com/60x60/ffffff/000000&text=?";
  img.alt = "Avatar de " + (character.pseudo || "personnage");

  const sep = document.createElement("span");
  sep.className = "sep";
  sep.setAttribute("aria-hidden", "true");

  ava.appendChild(img);
  card.appendChild(ava);
  card.appendChild(sep);

  return card;
}

function createCard(character) {
  const mode = state.activeTab === "all" ? "all" : "compact";
  const card = createCardShell(character, mode);

  if (state.activeTab === "all") {
    card.appendChild(createMainAll(character));
  } else {
    card.appendChild(createMainCompact(character));
  }

  const links = createLinks(character);
  if (links) {
    card.appendChild(links);
  }
  return card;
}

function createCompactCardWithMeta(character, metaText) {
  const card = createCardShell(character, "compact");
  card.appendChild(createMainCompactWithMeta(character, metaText));
  const links = createLinks(character);
  if (links) {
    card.appendChild(links);
  }
  return card;
}

function createWideCardWithMeta(character, metaText) {
  const card = createCardShell(character, "all");
  card.appendChild(createMainCompactWithMeta(character, metaText));
  const links = createLinks(character);
  if (links) {
    card.appendChild(links);
  }
  return card;
}

function createAvatarOnlyCard(item) {
  const card = document.createElement("article");
  card.className = "cc compact avatar-only";

  const ava = document.createElement("div");
  ava.className = "ava";

  const img = document.createElement("img");
  img.src = item.avatar || "https://dummyimage.com/60x60/ffffff/000000&text=?";
  img.alt = "Avatar de " + cleanText(item.faceclaimName, "faceclaim");

  const sep = document.createElement("span");
  sep.className = "sep";
  sep.setAttribute("aria-hidden", "true");

  ava.appendChild(img);

  const main = document.createElement("div");
  main.className = "main";

  const name = document.createElement("h2");
  name.className = "nm";
  setHighlightedText(name, cleanText(item.faceclaimName, "Avatar sans nom"), state.search);

  const meta = createEllipsisWithTip(
    cleanText(item.status, "Libre"),
    "meta",
    state.search
  );

  main.appendChild(name);
  main.appendChild(meta);

  card.appendChild(ava);
  card.appendChild(sep);
  card.appendChild(main);

  return card;
}

function createEmptyState() {
  const box = document.createElement("div");
  box.className = "empty-state";

  const inner = document.createElement("div");
  inner.className = "empty-state__inner";

  const title = document.createElement("strong");
  title.textContent = "Aucun personnage à afficher.";

  inner.appendChild(title);
  box.appendChild(inner);

  return box;
}

function createInlineEmpty(text) {
  const box = document.createElement("div");
  box.className = "wr-empty";
  box.textContent = text;
  return box;
}

function renderGrouped(charactersToRender) {
  ORIGIN_ORDER.forEach(function (originKey) {
    const list = charactersToRender.filter(function (character) {
      return character.origin === originKey;
    });

    if (!list.length) return;

    const section = document.createElement("section");
    section.className = "origin-group";

    const title = document.createElement("h2");
    title.className = "origin-group__title";
    title.textContent = ORIGIN_LABELS[originKey] + "s";

    const cards = document.createElement("div");
    cards.className = "origin-group__cards";

    list.forEach(function (character) {
      cards.appendChild(createCard(character));
    });

    section.appendChild(title);
    section.appendChild(cards);
    el.content.appendChild(section);
  });
}

function renderFlat(charactersToRender) {
  const wrap = document.createElement("div");
  wrap.className = "origin-group__cards";

  charactersToRender.forEach(function (character) {
    wrap.appendChild(createCard(character));
  });

  el.content.appendChild(wrap);
}

function getDynamicFilters() {
  if (state.activeTab === "avatars") return AVATAR_FILTERS;
  if (state.activeTab === "jobs") return JOB_FILTERS;
  return [];
}

function getDynamicFilterValue() {
  if (state.activeTab === "avatars") return state.avatarFilter;
  if (state.activeTab === "jobs") return state.jobFilter;
  return "all";
}

function setDynamicFilterValue(value) {
  if (state.activeTab === "avatars") state.avatarFilter = value;
  if (state.activeTab === "jobs") state.jobFilter = value;
}

function buildDynamicFilters() {
  el.avTools.innerHTML = "";

  getDynamicFilters().forEach(function (filter) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "avb";
    btn.dataset.filter = filter.id;
    btn.textContent = filter.label;
    btn.setAttribute("aria-pressed", String(getDynamicFilterValue() === filter.id));

    if (getDynamicFilterValue() === filter.id) {
      btn.classList.add("is-active");
    }

    btn.addEventListener("click", function () {
      setDynamicFilterValue(filter.id);
      syncDynamicFilters();
      render();
    });

    el.avTools.appendChild(btn);
  });
}

function syncDynamicFilters() {
  const buttons = el.avTools.querySelectorAll(".avb");

  buttons.forEach(function (btn) {
    const active = btn.dataset.filter === getDynamicFilterValue();
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", String(active));
  });
}

function renderPowerTools() {
  el.avTools.innerHTML = "";

  const originWrap = document.createElement("label");
  originWrap.className = "register-field";

  const originSelect = document.createElement("select");
  originSelect.innerHTML = `
    <option value="all">Toutes les origines</option>
    <option value="humain">Humains</option>
    <option value="eveille">Eveillés</option>
    <option value="sorcier">Sorciers</option>
    <option value="familier">Familiers</option>
    <option value="reliquaire">Reliquaires</option>
  `;
  originSelect.value = state.powerOrigin;

  originSelect.addEventListener("change", function (event) {
    state.powerOrigin = event.target.value;
    render();
  });

  originWrap.appendChild(originSelect);

  const domainWrap = document.createElement("label");
  domainWrap.className = "register-field";

  const domainSelect = document.createElement("select");

  POWER_DOMAINS.forEach(function (domain) {
    const option = document.createElement("option");
    option.value = domain;
    option.textContent = domain === "all" ? "Domaine magique" : domain;
    domainSelect.appendChild(option);
  });

  domainSelect.value = state.powerDomain;

  domainSelect.addEventListener("change", function (event) {
    state.powerDomain = event.target.value;
    render();
  });

  domainWrap.appendChild(domainSelect);

  el.avTools.appendChild(originWrap);
  el.avTools.appendChild(domainWrap);
}

function syncTools() {
  const showStd = state.activeTab === "all";
  const showDynamic =
    state.activeTab === "avatars" ||
    state.activeTab === "jobs" ||
    state.activeTab === "powers";

  el.stdTools.hidden = !showStd;
  el.avTools.hidden = !showDynamic;

  if (state.activeTab === "avatars" || state.activeTab === "jobs") {
    buildDynamicFilters();
    syncDynamicFilters();
  }

  if (state.activeTab === "powers") {
    renderPowerTools();
  }
}

function getAvatarGroups() {
  const map = new Map();

  function addToGroup(source, type, item) {
    const key = normalizeText(cleanText(source, "Source inconnue"));

    if (!map.has(key)) {
      map.set(key, {
        key: key,
        source: cleanText(source, "Source inconnue"),
        type: cleanText(type, "Type inconnu"),
        items: []
      });
    }

    map.get(key).items.push(item);
  }

  avatarsCatalog.forEach(function (avatar) {
    addToGroup(
      avatar.faceclaimSource,
      avatar.faceclaimSourceType,
      {
        kind: "avatar",
        data: avatar
      }
    );
  });

  characters.forEach(function (character) {
    addToGroup(
      getSourceLabel(character),
      getSourceType(character),
      {
        kind: "character",
        data: character
      }
    );
  });

  let groups = Array.from(map.values());

  groups.forEach(function (group) {
    group.items.sort(function (a, b) {
      const nameA = a.kind === "character"
        ? a.data.pseudo
        : a.data.faceclaimName;

      const nameB = b.kind === "character"
        ? b.data.pseudo
        : b.data.faceclaimName;

      return normalizeText(nameA).localeCompare(normalizeText(nameB), "fr");
    });
  });

  groups.sort(function (a, b) {
    const bucketA = getAvatarBucket(a.source);
    const bucketB = getAvatarBucket(b.source);

    if (bucketA === "0123-#" && bucketB !== "0123-#") return 1;
    if (bucketA !== "0123-#" && bucketB === "0123-#") return -1;

    return normalizeText(a.source).localeCompare(normalizeText(b.source), "fr");
  });

  if (state.avatarFilter !== "all") {
    groups = groups.filter(function (group) {
      return getAvatarBucket(group.source) === state.avatarFilter;
    });
  }

  const term = normalizeText(state.search);

  if (!term) {
    return groups;
  }

  return groups.filter(function (group) {
    if (normalizeText(group.source).includes(term)) {
      return true;
    }

    return group.items.some(function (item) {
      if (item.kind === "character") {
        const character = item.data;

        return (
          normalizeText(character.pseudo).includes(term) ||
          normalizeText(character.faceclaimName).includes(term)
        );
      }

      const avatar = item.data;

      return (
        normalizeText(avatar.faceclaimName).includes(term) ||
        normalizeText(avatar.faceclaimSource).includes(term) ||
        normalizeText(avatar.faceclaimSourceType).includes(term) ||
        normalizeText(avatar.status).includes(term)
      );
    });
  });
}

function createAvatarGroup(group) {
  const block = document.createElement("section");
  block.className = "srcb";

  const left = document.createElement("div");
  left.className = "srcl";

  const source = document.createElement("h2");
  source.className = "srcn";
  setHighlightedText(source, group.source, state.search);

  const type = document.createElement("p");
  type.className = "srct";
  type.textContent = group.type;

  left.appendChild(source);
  left.appendChild(type);

  const right = document.createElement("div");
  right.className = "srcr";

  group.items.forEach(function (item) {
    if (item.kind === "character") {
      right.appendChild(createCard(item.data));
    } else {
      right.appendChild(createAvatarOnlyCard(item.data));
    }
  });

  block.appendChild(left);
  block.appendChild(right);

  return block;
}

function renderAvatars() {
  const groups = getAvatarGroups();

  if (!groups.length) {
    el.content.appendChild(createEmptyState());
    requestAnimationFrame(applyOverflowTips);
    return;
  }

  groups.forEach(function (group) {
    el.content.appendChild(createAvatarGroup(group));
  });

  requestAnimationFrame(applyOverflowTips);
}

function buildWorkplaceGroups() {
  const map = new Map();

  workplacesCatalog.forEach(function (place) {
    const key = getWorkplaceKeyFromName(place.name);

    if (!map.has(key)) {
      map.set(key, {
        key: key,
        name: cleanText(place.name, "Établissement inconnu"),
        type: cleanText(place.type, "Type inconnu"),
        district: cleanText(place.district, "Quartier inconnu"),
        chars: []
      });
    }
  });

  characters.forEach(function (character) {
    const key = getWorkplaceKey(character);

    if (!map.has(key)) {
      map.set(key, {
        key: key,
        name: getWorkplaceLabel(character),
        type: getWorkplaceType(character),
        district: getWorkplaceDistrict(character),
        chars: []
      });
    }

    map.get(key).chars.push(character);
  });

  let groups = Array.from(map.values());

  groups.forEach(function (group) {
    group.chars.sort(compareAlpha);
  });

  groups.sort(function (a, b) {
    return normalizeText(a.name).localeCompare(normalizeText(b.name), "fr");
  });

  if (state.jobFilter !== "all") {
    const filter = JOB_FILTERS.find(function (item) {
      return item.id === state.jobFilter;
    });

    if (filter) {
      groups = groups.filter(function (group) {
        return normalizeText(group.district) === filter.match;
      });
    }
  }

  const term = normalizeText(state.search);

  if (!term) {
    return groups;
  }

  return groups.filter(function (group) {
    const leftMatches =
      normalizeText(group.name).includes(term) ||
      normalizeText(group.type).includes(term) ||
      normalizeText(group.district).includes(term);

    const holderMatches = group.chars.some(function (character) {
      return (
        normalizeText(character.pseudo).includes(term) ||
        normalizeText(character.jobTitle).includes(term)
      );
    });

    return leftMatches || holderMatches;
  });
}

function createJobGroup(group) {
  const block = document.createElement("section");
  block.className = "wb";

  const left = document.createElement("div");
  left.className = "wl";

  const info = document.createElement("div");
  info.className = "wi";

  const name = document.createElement("h2");
  name.className = "wn";
  setHighlightedText(name, group.name, state.search);

  const type = document.createElement("p");
  type.className = "wt";
  setHighlightedText(type, group.type, state.search);

  const district = document.createElement("p");
  district.className = "wd";
  setHighlightedText(district, group.district, state.search);

  info.appendChild(name);
  info.appendChild(type);
  info.appendChild(district);

  const count = document.createElement("div");
  count.className = "wc";
  count.textContent = group.chars.length + " employé" + (group.chars.length > 1 ? "s" : "");

  left.appendChild(info);
  left.appendChild(count);

  const right = document.createElement("div");
  right.className = "wr";

  if (group.chars.length) {
    group.chars.forEach(function (character) {
      right.appendChild(createCard(character));
    });
  } else {
    right.appendChild(createInlineEmpty("Aucun employé enregistré."));
  }

  block.appendChild(left);
  block.appendChild(right);

  return block;
}

function renderJobs() {
  const groups = buildWorkplaceGroups();

  if (!groups.length) {
    el.content.appendChild(createEmptyState());
    requestAnimationFrame(applyOverflowTips);
    return;
  }

  groups.forEach(function (group) {
    el.content.appendChild(createJobGroup(group));
  });

  requestAnimationFrame(applyOverflowTips);
}

function buildPowerGroups() {
  const map = new Map();

  powersCatalog.forEach(function (power) {
    const key = buildPowerKey(power.name);

    if (!map.has(key)) {
      map.set(key, {
        key: key,
        name: cleanText(power.name, "Pouvoir inconnu"),
        domain: getCanonicalMagicDomain(power.domain),
        description: cleanText(power.description, ""),
        chars: []
      });
    }
  });

  characters.forEach(function (character) {
    if (!hasRegisteredPower(character)) {
      return;
    }

    const key = buildPowerKey(character.powerName);

    if (!map.has(key)) {
      map.set(key, {
        key: key,
        name: cleanText(character.powerName, "Pouvoir inconnu"),
        domain: getCanonicalMagicDomain(character.magicDomain),
        description: cleanText(character.powerDescription, ""),
        chars: []
      });
    } else {
      const group = map.get(key);

      if (!group.domain) {
        group.domain = getCanonicalMagicDomain(character.magicDomain);
      }

      if (!group.description) {
        group.description = cleanText(character.powerDescription, "");
      }
    }

    map.get(key).chars.push(character);
  });

  let groups = Array.from(map.values());

  groups.forEach(function (group) {
    group.chars.sort(compareAlpha);

    const holdersByOrigin = group.chars.filter(function (character) {
      return state.powerOrigin === "all" || character.origin === state.powerOrigin;
    });

    group.visibleChars = holdersByOrigin;
  });

  groups.sort(function (a, b) {
    return normalizeText(a.name).localeCompare(normalizeText(b.name), "fr");
  });

  if (state.powerDomain !== "all") {
    groups = groups.filter(function (group) {
      return normalizeText(group.domain) === normalizeText(state.powerDomain);
    });
  }

  const term = normalizeText(state.search);

  groups = groups.filter(function (group) {
    if (state.powerOrigin !== "all" && !group.visibleChars.length) {
      return false;
    }

    if (!term) {
      return state.powerOrigin === "all" || group.visibleChars.length > 0;
    }

    const leftMatches =
      normalizeText(group.name).includes(term) ||
      normalizeText(group.domain).includes(term) ||
      normalizeText(group.description).includes(term);

    const holderMatches = group.visibleChars.some(function (character) {
      return matchesSearch(character, term);
    });

    return leftMatches || holderMatches;
  });

  return groups;
}

function createSectionTitle(text) {
  const title = document.createElement("h2");
  title.className = "origin-group__title";
  title.textContent = text;
  return title;
}

function createRegisteredPowerBlock(group) {
  const block = document.createElement("section");
  block.className = "wb";

  const left = document.createElement("div");
  left.className = "wl desc-pvr";

  const info = document.createElement("div");
  info.className = "wi";

  const name = document.createElement("h2");
  name.className = "wn";
  setHighlightedText(name, cleanText(group.name, "Pouvoir inconnu"), state.search);

  const domain = document.createElement("p");
  domain.className = "wt";
  setHighlightedText(domain, cleanText(group.domain, "—"), state.search);

  const desc = document.createElement("p");
  desc.className = "wd";
  setHighlightedText(desc, cleanText(group.description, "Aucune description."), state.search);

  info.appendChild(name);
  info.appendChild(domain);
  info.appendChild(desc);
  left.appendChild(info);

  const right = document.createElement("div");
  right.className = group.visibleChars.length > 1 ? "wr" : "wr one";

  if (group.visibleChars.length) {
    group.visibleChars.forEach(function (character) {
      right.appendChild(
        createCompactCardWithMeta(
          character,
          ORIGIN_LABELS[character.origin] || "Origine inconnue"
        )
      );
    });
  } else {
    right.appendChild(createInlineEmpty("Aucun détenteur enregistré."));
  }

  block.appendChild(left);
  block.appendChild(right);

  return block;
}

function buildFamRelBlock(originKey, formKey, filterStore, metaGetter) {
  const chars = characters
    .filter(function (character) {
      return (
        character.origin === originKey &&
        hasOriginPower(character) &&
        matchesFamRelFilters(character)
      );
    })
    .sort(compareAlpha);

  if (!chars.length) {
    return null;
  }

  const formsMap = new Map();

  chars.forEach(function (character) {
    const formValue = cleanText(character[formKey], "Inconnu");
    const formNorm = normalizeText(formValue);

    if (!formsMap.has(formNorm)) {
      formsMap.set(formNorm, {
        label: formValue,
        count: 0
      });
    }

    formsMap.get(formNorm).count += 1;
  });

  const activeFilter = filterStore[originKey] || "all";

  const visibleChars = chars.filter(function (character) {
    if (activeFilter === "all") {
      return true;
    }

    return normalizeText(cleanText(character[formKey], "Inconnu")) === activeFilter;
  });

  if (!visibleChars.length) {
    return null;
  }

  const block = document.createElement("section");
  block.className = "wb";

  const left = document.createElement("div");
  left.className = "wl";

  const info = document.createElement("div");
  info.className = "wi";

  const title = document.createElement("h2");
  title.className = "wn";
  setHighlightedText(title, getOriginPowerNameByOrigin(originKey), state.search);

  const subtitle = document.createElement("p");
  subtitle.className = "wt";
  subtitle.textContent = "Pouvoir d’origine";

  info.appendChild(title);
  info.appendChild(subtitle);

  const bottom = document.createElement("div");
  bottom.className = "pbox";

  const note = document.createElement("p");
  note.className = "pnote";
  note.textContent = "Clique pour filtrer.";

  const chips = document.createElement("div");
  chips.className = "pfl";

  formsMap.forEach(function (formData, formNorm) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pfb" + (activeFilter === formNorm ? " is-active" : "");
    btn.textContent = getCountLabel(formData.label, formData.count);

    btn.addEventListener("click", function () {
      if (filterStore[originKey] === formNorm) {
        filterStore[originKey] = "all";
      } else {
        filterStore[originKey] = formNorm;
      }
      render();
    });

    chips.appendChild(btn);
  });

  bottom.appendChild(note);
  bottom.appendChild(chips);

  left.appendChild(info);
  left.appendChild(bottom);

  const right = document.createElement("div");
  right.className = "wr";

  visibleChars.forEach(function (character) {
    right.appendChild(
      createCompactCardWithMeta(character, metaGetter(character))
    );
  });

  block.appendChild(left);
  block.appendChild(right);

  return block;
}

function getNoPowerCharacters() {
  if (state.powerDomain !== "all") return [];

  return characters
    .filter(function (character) {
      const okOrigin =
        state.powerOrigin === "all" || character.origin === state.powerOrigin;

      const okSearch = matchesSearch(character, normalizeText(state.search));

      return !hasAnyPower(character) && okOrigin && okSearch;
    })
    .sort(compareAlpha);
}

function renderPowers() {
  const registered = buildPowerGroups();
  const noPower = getNoPowerCharacters();

  let hasContent = false;

  if (registered.length) {
    hasContent = true;
    el.content.appendChild(createSectionTitle("POUVOIRS ENREGISTRÉS"));

    registered.forEach(function (group) {
      el.content.appendChild(createRegisteredPowerBlock(group));
    });
  }

  if (noPower.length) {
    hasContent = true;
    el.content.appendChild(createSectionTitle("AUCUN POUVOIR"));

    const wrap = document.createElement("div");
    wrap.className = "origin-group__cards";

    noPower.forEach(function (character) {
      wrap.appendChild(
        createWideCardWithMeta(
          character,
          ORIGIN_LABELS[character.origin] || "Origine inconnue"
        )
      );
    });

    el.content.appendChild(wrap);
  }

  if (!hasContent) {
    el.content.appendChild(createEmptyState());
  }

  requestAnimationFrame(applyOverflowTips);
}

function renderFamiliarsReliquaries() {
  const familiarBlock = buildFamRelBlock(
    "familier",
    "animalForm",
    state.powerAnimalFilters,
    function (character) {
      return cleanText(character.animalForm, "Inconnu");
    }
  );

  const relicBlock = buildFamRelBlock(
    "reliquaire",
    "relicForm",
    state.powerRelicFilters,
    function (character) {
      return cleanText(character.relicForm, "Inconnu");
    }
  );

  let hasContent = false;

  if (familiarBlock) {
    hasContent = true;
    el.content.appendChild(createSectionTitle("FORMES ANIMALES - FAMILIERS"));
    el.content.appendChild(familiarBlock);
  }

  if (relicBlock) {
    hasContent = true;
    el.content.appendChild(createSectionTitle("RELIQUES MAGIQUES - RELIQUAIRES"));
    el.content.appendChild(relicBlock);
  }

  if (!hasContent) {
    el.content.appendChild(createEmptyState());
  }

  requestAnimationFrame(applyOverflowTips);
}

function render() {
  el.content.innerHTML = "";

  if (state.activeTab === "avatars") {
    renderAvatars();
    return;
  }

  if (state.activeTab === "jobs") {
    renderJobs();
    return;
  }

  if (state.activeTab === "powers") {
    renderPowers();
    return;
  }

  if (state.activeTab === "familiars") {
    renderFamiliarsReliquaries();
    return;
  }

  const list = getFilteredCharacters();

  if (!list.length) {
    el.content.appendChild(createEmptyState());
    requestAnimationFrame(applyOverflowTips);
    return;
  }

  if (state.sortMode === "origin") {
    renderGrouped(list);
  } else {
    renderFlat(list);
  }

  requestAnimationFrame(applyOverflowTips);
}

function syncTabs() {
  el.tabs.forEach(function (tab) {
    const active = tab.dataset.tab === state.activeTab;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });
}

function bindEvents() {
  el.tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      state.activeTab = tab.dataset.tab;
      syncTabs();
      syncTools();
      render();
    });
  });

  el.search.addEventListener("input", function (event) {
    state.search = event.target.value;
    render();
  });

  el.origin.addEventListener("change", function (event) {
    state.origin = event.target.value;
    render();
  });

  el.sort.addEventListener("change", function (event) {
    state.sortMode = event.target.value;
    render();
  });

  el.pnj.addEventListener("click", function () {
    state.pnjOnly = !state.pnjOnly;
    el.pnj.classList.toggle("is-active", state.pnjOnly);
    el.pnj.setAttribute("aria-pressed", String(state.pnjOnly));
    render();
  });

  window.addEventListener("resize", function () {
    applyOverflowTips();
    syncThemeSwitchUI(getEffectiveTheme());
  });
}

bindEvents();
syncTabs();
syncTools();
initThemeSwitch();
render();