function initPumpkinsCalendar() {
  if (document.querySelector("[data-ppk-calendar-drawer]")) return;

  const MIN_YEAR = 2008;
  const RP_OFFSET = 16;
  const MAX_FUTURE_MONTHS = 13;
  const MOON_BACKGROUND_URL = "URL_DE_TON_IMAGE_DE_PLEINE_LUNE";

  const MONTHS = [
    "JANVIER", "FÉVRIER", "MARS", "AVRIL", "MAI", "JUIN",
    "JUILLET", "AOÛT", "SEPTEMBRE", "OCTOBRE", "NOVEMBRE", "DÉCEMBRE"
  ];

  const MONTHS_NORMAL = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre"
  ];

  /* =========================================================
     CALENDRIER VESPÉRIEN

     1 cycle = 8 phases
     1 phase = 30 jours
     1 cycle = 240 jours

     REPÈRE :
     1er mai 2010
     = Jour 1 du Dernier-Croissant
     = Cycle 61
     ========================================================= */

  const VESPERIAN_PHASE_DAYS = 30;
  const VESPERIAN_CYCLE_DAYS = 240;

  const VESPERIAN_PHASES = [
    "Nouvelle-Lune",
    "Premier-Croissant",
    "Premier-Quartier",
    "Gibbeuse-Croissante",
    "Pleine-Lune",
    "Gibbeuse-Décroissante",
    "Dernier-Quartier",
    "Dernier-Croissant"
  ];

  const VESPERIAN_ANCHOR = {
    date: "2010-05-01",
    phase: "Dernier-Croissant",
    day: 1,
    cycle: 61
  };

  /* =========================================================
     ÉVÉNEMENTS

     DATE UNIQUE
     date: "2010-10-31"

     DATE TOUS LES ANS HUMAINS
     yearly: {
       date: "10-31"
     }

     PLUSIEURS DATES
     dates: [
       "2008-10-31",
       "2009-10-31"
     ]

     PÉRIODE UNIQUE
     start: "2010-12-01",
     end: "2010-12-25"

     PLUSIEURS PÉRIODES
     ranges: [
       { start: "2010-10-02", end: "2010-10-03" },
       { start: "2010-10-09", end: "2010-10-10" }
     ]

     PÉRIODE TOUS LES ANS HUMAINS
     yearlyRange: {
       start: "12-01",
       end: "12-25"
     }

     TOUS LES WEEK-ENDS D'UN MOIS
     weekends: {
       month: 10
     }

     N-IÈME WEEK-END D'UN MOIS
     nthWeekend: {
       month: 9,
       nth: 3
     }

     ÉVÉNEMENT VESPÉRIEN
     vesperian: {
       phase: "Pleine-Lune",
       day: 27
     }

     Icône vespérienne :
     sorcier: "moon"
     ou
     sorcier: "hat"
     ========================================================= */

  const EVENTS = [
    {
      yearly: {
        date: "05-12"
      },
      titre: "Fête des Berges",
      description: "Lorsque l'été montre le bout de son nez, Amberwoods célèbre la rivière et son embarcadère. On y décore les barques, le bord de l'eau et on pique-nique sur la place centrale. Certains prennent même la peine de se baigner dans la crique, si l'ambiance est au rendez-vous. Une course de barques amicale est organisée toute l'après-midi : deux équipes s'affrontent dans des barques personnalisées pour l'occasion. La première arrivée (intacte) gagne la course.",
      url: "https://pumpkinsrpg.forumactif.com/"
    },
    {
      yearly: {
        date: "06-03"
      },
      titre: "Fête de la Fondation",
      description: "Cette fête commémore la fondation d’Amberwoods. Le centre-ville s’anime autour d’un marché artisanal et de buffets communautaires en journée, envoûtant les passants de sa musique. Ensuite, un bal est organisé sur la place de l'Embarcadère à la nuit tombée. Pour les jeunes, il est de coutume d'emmener la fête au lac, un peu plus loin dans la forêt, lorsque sonnent les coups de minuit.",
      url: "https://pumpkinsrpg.forumactif.com/"
    },
    {
      nthWeekend: {
        month: 9,
        nth: 3
      },
      titre: "Temps des Moissons",
      description: "Les rues se couvrent des couleurs de l'automne et de bottes de paille pour célébrer les récoltes et les traditions locales. C’est l’une des fêtes les plus chaleureuses de l’année. On y déguste des tartes aux pommes, on y organise des concours de citrouilles gravées, on se pare de couronnes de feuilles et on partage du cidre chaud tout le week-end.",
      url: "https://pumpkinsrpg.forumactif.com/"
    },
    {
      weekends: {
        month: 10
      },
      titre: "Veillées d'Automne",
      description: "Dès que le jour se lève, des stands ouvrent à tous les coins de rue et de la musique douce est jouée près des cafés indépendants. On y allume des feux de camp, on y organise des promenades nocturnes sous les lumières de la ville et toutes les échoppes sont ouvertes tard dans la nuit. Pour les enfants, des histoires sont contées au bord de la crique.",
      url: "https://pumpkinsrpg.forumactif.com/"
    },
    {
      yearly: {
        date: "10-12"
      },
      titre: "Nuit des Lanternes",
      description: "Après Halloween, la Nuit des Lanternes est la fête la plus attendue de tous les habitants. Au matin, chacun écrit un secret, une vieille honte ou une anecdote sur une lanterne. Elles sont ensuite mélangées et distribuées aléatoirement le soir venu, pour que chacun en lise une. Ce jour-là, la ville se couvre de lanternes, on accroche des banderoles de citrouilles sur les lampadaires et un bal costumé est organisé le soir même. Une parade nocturne précède le bal : des chars fleuris défilent de parts et d'autres, puis un vote est lancé pour élire le meilleur char de l'année.",
      url: "https://pumpkinsrpg.forumactif.com/"
    },
    {
      yearly: {
        date: "10-31"
      },
      titre: "Halloween",
      description: "Halloween est de loin la fête préférée de la population d’Amberwoods — et celle des sorcières qui y vivent. Tous sortent vêtus de déguisements plus vrais que nature, en quête de poignées de sucreries. D’ailleurs, une coutume locale veut que chaque maisonnette affiche un masque de théâtre au-dessus de sa porte.",
      url: "https://pumpkinsrpg.forumactif.com/"
    },
    {
      yearlyRange: {
        start: "12-01",
        end: "12-25"
      },
      titre: "Secret Santa",
      description: "Début décembre, il est de coutume que la mairie installe, au centre de la place principale, un énorme bac en forme de boule de neige dans lequel chacun pourra déposer son nom et en piocher un à son tour, qui lui désignera une personne de la ville à qui offrir un cadeau de Noël.",
      url: "https://pumpkinsrpg.forumactif.com/"
    },
    {
      yearly: {
        date: "12-15"
      },
      titre: "Marché aux Étoiles",
      description: "Le Marché aux Étoiles clôt l’année en avance de façon conviviale. On y organise un concours de bonhommes de neige pendant que le quartier de l'embarcadère offre aux touristes venus juste pour l'occasion des dégustations gratuites de spécialités locales. De nombreux artisans peuvent en profiter pour vendre leurs confections. C'est un marché de Noël particulièrement apprécié par les locaux.",
      url: "https://pumpkinsrpg.forumactif.com/"
    },

    /* =========================================================
       ÉVÉNEMENTS VESPÉRIENS

       Pas de yearly humain ici.
       Ils reviennent automatiquement une fois par cycle.
       ========================================================= */

    {
      vesperian: {
        phase: "Premier-Croissant",
        day: 18
      },
      sorcier: "moon",
      titre: "Les Flocons",
      description: "Cette veillée est la plus grande célébration de Vesperune, commune aux deux royaumes. On y fête l’origine même du monde. Selon les plus anciens récits, le monde aurait été recouvert par une tempête de neige à l’origine de l’essence de la magie. Les flocons auraient fini par se mêler à cette énergie pour créer les premières âmes. Elle est organisée et célébrée lors des premières neiges de l’hiver. La coutume est d’allumer des lanternes blanches, de se parer de vêtements blancs et de partager de bons moments sous la neige, au cœur des capitales. On offre des fleurs blanches aux personnes que l’on apprécie et on y boit des boissons chaudes et réconfortantes. Depuis quelques générations, un concours de bonhommes de neige y a lieu et le gagnant obtient une médaille en forme de flocon de neige, ainsi que le titre de Roi ou Reine des Neiges jusqu’à l’hiver suivant, où celui-ci est remis en jeu.",
      url: "https://pumpkinsrpg.forumactif.com/"
    },
    {
      vesperian: {
        phase: "Nouvelle-Lune",
        day: 1
      },
      sorcier: "moon",
      titre: "Fête de la Nouvelle Lune",
      description: "À chaque début de cycle, sa Nouvelle Lune. Cette fête apparaît originairement d’une tradition religieuse, nous provenant de l’Ordalie Lunaire, créée dans le but de célébrer le nouveau cycle à venir. C’est l’équivalent, chez les humains, du nouvel an. On y célèbre le renouveau et l’espoir d’un avenir radieux, les débuts et l’apprentissage. Des vœux sont formulés, à l’attention de la lune, et posés sur papier avant d’être réduits massivement en poussière d’étoiles par les sorciers. Cette poudre étoilée est ensuite déversée sur la foule, lors de l’ouverture de la soirée dansante ; parfois, elle continue de tomber jusqu’au petit matin. Des buffets sont installés pour l’occasion, une scène est mise en place et les sorciers peuvent discuter autour de boissons rafraîchissantes. C’est le moment du cycle le plus convivial, et cette célébration n’a aucune frontière ; elle est aussi bien fêtée en Opaline qu’en Amarena.",
      url: "https://pumpkinsrpg.forumactif.com/"
    },
    {
      vesperian: {
        phase: "Pleine-Lune",
        day: 27
      },
      sorcier: "moon",
      titre: "Bal des Merveilles",
      description: "Une fois par cycle, pour marquer la fin de la guerre, la Reine Chantilly organise dans son château un bal masqué des plus somptueux, où sont conviés Opalins et Amarénées. Ainsi, le temps d'une nuit, chacun revêtu de ses plus beaux atours, le visage masqué, les deux cultures se mêlent en secret et profitent d'un moment de paix où les rancœurs et les vieux préjugés sont mis de côté. Vu à l'origine comme un moyen de panser les plaies de jadis, il est aujourd'hui un événement incontournable, qui montre que les deux facettes de ce monde peuvent coexister, qu'importe leurs différences.",
      url: "https://pumpkinsrpg.forumactif.com/"
    }
  ];

  /* =========================================================
     PLEINES LUNES HUMAINES
     ========================================================= */

  const FULL_MOONS = new Set([
    "2008-01-22", "2008-02-20", "2008-03-21", "2008-04-20",
    "2008-05-19", "2008-06-18", "2008-07-18", "2008-08-16",
    "2008-09-15", "2008-10-14", "2008-11-13", "2008-12-12",

    "2009-01-10", "2009-02-09", "2009-03-10", "2009-04-09",
    "2009-05-09", "2009-06-07", "2009-07-07", "2009-08-05",
    "2009-09-04", "2009-10-04", "2009-11-02", "2009-12-02",
    "2009-12-31",

    "2010-01-30", "2010-02-28", "2010-03-29", "2010-04-28",
    "2010-05-27", "2010-06-26", "2010-07-25", "2010-08-24",
    "2010-09-23", "2010-10-22", "2010-11-21", "2010-12-21",

    "2011-01-19", "2011-02-18", "2011-03-19", "2011-04-17",
    "2011-05-17", "2011-06-15", "2011-07-15", "2011-08-13",
    "2011-09-12", "2011-10-11", "2011-11-10", "2011-12-10"
  ]);

  /* =========================================================
     HTML
     ========================================================= */

  document.body.insertAdjacentHTML("beforeend", `
    <button type="button" class="ppk-calendar-open" title="Ouvrir le calendrier" data-ppk-calendar-open aria-label="Ouvrir le calendrier" aria-expanded="false"><i class="fa-solid fa-calendar-days"></i></button>

    <div class="ppk-calendar-drawer" data-ppk-calendar-drawer aria-hidden="true">
      <div class="ppk-calendar-modal">
        <div class="ppk-calendar-header">
          <div class="ppk-calendar-title">Calendrier</div>

          <div class="ppk-calendar-nav">
            <button type="button" class="ppk-calendar-arrow" data-calendar-prev aria-label="Mois précédent"><i class="fa-solid fa-chevron-left"></i></button>
            <div class="ppk-calendar-month" data-calendar-month></div>
            <button type="button" class="ppk-calendar-arrow" data-calendar-next aria-label="Mois suivant"><i class="fa-solid fa-chevron-right"></i></button>
          </div>
        </div>

        <div class="ppk-calendar-body">
          <div class="ppk-calendar-board">
            <div class="ppk-calendar-legend">
              <div class="ppk-calendar-legend-item">
                <span class="ppk-calendar-legend-square"></span>
                <span>Période jouable</span>
              </div>

              <div class="ppk-calendar-legend-item">
                <span class="ppk-calendar-legend-moon"></span>
                <span>Pleine lune</span>
              </div>
            </div>

            <div class="ppk-calendar-weekdays">
              <span>LUN</span>
              <span>MAR</span>
              <span>MER</span>
              <span>JEU</span>
              <span>VEN</span>
              <span>SAM</span>
              <span>DIM</span>
            </div>

            <div class="ppk-calendar-days" data-calendar-days></div>
          </div>

          <div class="ppk-calendar-info" data-calendar-info>
            <div class="ppk-calendar-info-empty">
              Veuillez sélectionner un événement.
            </div>
          </div>
        </div>
      </div>
    </div>
  `);

  const openButton = document.querySelector("[data-ppk-calendar-open]");
  const openButtonIcon = openButton.querySelector("i");
  const drawer = document.querySelector("[data-ppk-calendar-drawer]");
  const daysContainer = drawer.querySelector("[data-calendar-days]");
  const monthLabel = drawer.querySelector("[data-calendar-month]");
  const info = drawer.querySelector("[data-calendar-info]");
  const prevButton = drawer.querySelector("[data-calendar-prev]");
  const nextButton = drawer.querySelector("[data-calendar-next]");
  const board = drawer.querySelector(".ppk-calendar-board");

  /* =========================================================
     DATE RP
     ========================================================= */

  function getCurrentRPDate() {
    const parts = new Intl.DateTimeFormat("fr-FR", {
      timeZone: "Europe/Paris",
      year: "numeric",
      month: "numeric",
      day: "numeric"
    }).formatToParts(new Date());

    const date = {};

    parts.forEach(function(part) {
      if (
        part.type === "year" ||
        part.type === "month" ||
        part.type === "day"
      ) {
        date[part.type] = Number(part.value);
      }
    });

    return new Date(
      date.year - RP_OFFSET,
      date.month - 1,
      date.day,
      12
    );
  }

  const currentRP = getCurrentRPDate();

  let displayedYear = currentRP.getFullYear();
  let displayedMonth = currentRP.getMonth();

  /* =========================================================
     PÉRIODE JOUABLE
     ========================================================= */

  function addMonthsClamped(date, amount) {
    const year = date.getFullYear();
    const month = date.getMonth() + amount;
    const day = date.getDate();

    const targetYear =
      year + Math.floor(month / 12);

    const targetMonth =
      ((month % 12) + 12) % 12;

    const lastDay =
      new Date(
        targetYear,
        targetMonth + 1,
        0
      ).getDate();

    return new Date(
      targetYear,
      targetMonth,
      Math.min(day, lastDay),
      12
    );
  }

  const playableStart =
    addMonthsClamped(currentRP, -1);

  const playableEnd =
    addMonthsClamped(currentRP, 1);

  function isPlayableDate(year, month, day) {
    const date =
      new Date(year, month, day, 12);

    return (
      date.getTime() >= playableStart.getTime() &&
      date.getTime() <= playableEnd.getTime()
    );
  }

  /* =========================================================
     OUTILS DATES
     ========================================================= */

  function pad(number) {
    return String(number).padStart(2, "0");
  }

  function getDateKey(year, month, day) {
    return (
      year +
      "-" +
      pad(month + 1) +
      "-" +
      pad(day)
    );
  }

  function parseDateKey(dateKey) {
    const parts =
      dateKey.split("-");

    return new Date(
      Number(parts[0]),
      Number(parts[1]) - 1,
      Number(parts[2]),
      12
    );
  }

  function isValidDateKey(dateKey) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
      return false;
    }

    const parts =
      dateKey.split("-");

    const year =
      Number(parts[0]);

    const month =
      Number(parts[1]);

    const day =
      Number(parts[2]);

    const date =
      new Date(
        year,
        month - 1,
        day,
        12
      );

    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  function getDateStamp(date) {
    return Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
  }

  function getDaysBetween(start, end) {
    return Math.round(
      (
        getDateStamp(end) -
        getDateStamp(start)
      ) / 86400000
    );
  }

  function addDays(date, amount) {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + amount,
      12
    );
  }

  function getRelativeMonth(offset) {
    return new Date(
      currentRP.getFullYear(),
      currentRP.getMonth() + offset,
      1,
      12
    );
  }

  function getMaximumMonth() {
    return getRelativeMonth(
      MAX_FUTURE_MONTHS
    );
  }

  function resetInfo() {
    info.innerHTML =
      '<div class="ppk-calendar-info-empty">Veuillez sélectionner un événement.</div>';
  }

  function formatEventDate(dateKey) {
    const date =
      parseDateKey(dateKey);

    return (
      date.getDate() +
      " " +
      MONTHS_NORMAL[date.getMonth()] +
      " " +
      date.getFullYear()
    );
  }

  function formatEventRange(startKey, endKey) {
    const start =
      parseDateKey(startKey);

    const end =
      parseDateKey(endKey);

    if (startKey === endKey) {
      return formatEventDate(startKey);
    }

    if (
      start.getFullYear() === end.getFullYear() &&
      start.getMonth() === end.getMonth()
    ) {
      return (
        start.getDate() +
        " au " +
        end.getDate() +
        " " +
        MONTHS_NORMAL[start.getMonth()] +
        " " +
        start.getFullYear()
      );
    }

    if (
      start.getFullYear() === end.getFullYear()
    ) {
      return (
        start.getDate() +
        " " +
        MONTHS_NORMAL[start.getMonth()] +
        " au " +
        end.getDate() +
        " " +
        MONTHS_NORMAL[end.getMonth()] +
        " " +
        end.getFullYear()
      );
    }

    return (
      formatEventDate(startKey) +
      " au " +
      formatEventDate(endKey)
    );
  }

  /* =========================================================
     CALENDRIER VESPÉRIEN
     ========================================================= */

  function getVesperianPhasePosition(phase, day) {
    const phaseIndex =
      VESPERIAN_PHASES.indexOf(phase);

    const numericDay =
      Number(day);

    if (
      phaseIndex === -1 ||
      !Number.isInteger(numericDay) ||
      numericDay < 1 ||
      numericDay > VESPERIAN_PHASE_DAYS
    ) {
      return null;
    }

    return (
      phaseIndex *
        VESPERIAN_PHASE_DAYS +
      numericDay -
      1
    );
  }

  function getVesperianOccurrenceDates(rule) {
    if (
      !rule ||
      !rule.phase ||
      !rule.day
    ) {
      return [];
    }

    const targetPosition =
      getVesperianPhasePosition(
        rule.phase,
        rule.day
      );

    const anchorPosition =
      getVesperianPhasePosition(
        VESPERIAN_ANCHOR.phase,
        VESPERIAN_ANCHOR.day
      );

    if (
      targetPosition === null ||
      anchorPosition === null
    ) {
      return [];
    }

    const anchorDate =
      parseDateKey(
        VESPERIAN_ANCHOR.date
      );

    const relativeOffset =
      targetPosition -
      anchorPosition;

    const baseOccurrence =
      addDays(
        anchorDate,
        relativeOffset
      );

    const minimumDate =
      new Date(
        MIN_YEAR,
        0,
        1,
        12
      );

    const maximumMonth =
      getMaximumMonth();

    const maximumDate =
      new Date(
        maximumMonth.getFullYear(),
        maximumMonth.getMonth() + 1,
        0,
        12
      );

    const daysToMinimum =
      getDaysBetween(
        baseOccurrence,
        minimumDate
      );

    const cyclesToMinimum =
      Math.ceil(
        daysToMinimum /
        VESPERIAN_CYCLE_DAYS
      );

    let occurrence =
      addDays(
        baseOccurrence,
        cyclesToMinimum *
          VESPERIAN_CYCLE_DAYS
      );

    const dates = [];

    while (
      getDateStamp(occurrence) <=
      getDateStamp(maximumDate)
    ) {
      if (
        getDateStamp(occurrence) >=
        getDateStamp(minimumDate)
      ) {
        dates.push(
          getDateKey(
            occurrence.getFullYear(),
            occurrence.getMonth(),
            occurrence.getDate()
          )
        );
      }

      occurrence =
        addDays(
          occurrence,
          VESPERIAN_CYCLE_DAYS
        );
    }

    return dates;
  }

  /* =========================================================
     RÉCURRENCES HUMAINES
     ========================================================= */

  function getRuleYears(rule) {
    if (!rule) return [];

    if (Array.isArray(rule.years)) {
      return rule.years
        .map(Number)
        .filter(Number.isInteger);
    }

    const defaultFrom =
      MIN_YEAR;

    const defaultTo =
      getMaximumMonth()
        .getFullYear();

    const parsedFrom =
      Number(rule.from);

    const parsedTo =
      Number(rule.to);

    const from =
      Number.isInteger(parsedFrom)
        ? parsedFrom
        : defaultFrom;

    const to =
      Number.isInteger(parsedTo)
        ? parsedTo
        : defaultTo;

    if (to < from) {
      return [];
    }

    const years = [];

    for (
      let year = from;
      year <= to;
      year++
    ) {
      years.push(year);
    }

    return years;
  }

  function createDateFromMonthDay(
    year,
    monthDay
  ) {
    if (
      !/^\d{2}-\d{2}$/.test(
        monthDay || ""
      )
    ) {
      return null;
    }

    const parts =
      monthDay.split("-");

    const month =
      Number(parts[0]);

    const day =
      Number(parts[1]);

    const dateKey =
      year +
      "-" +
      pad(month) +
      "-" +
      pad(day);

    return isValidDateKey(dateKey)
      ? dateKey
      : null;
  }

  function createYearlyRange(
    year,
    startMonthDay,
    endMonthDay
  ) {
    const start =
      createDateFromMonthDay(
        year,
        startMonthDay
      );

    if (!start) return null;

    const startParts =
      startMonthDay
        .split("-")
        .map(Number);

    const endParts =
      endMonthDay
        .split("-")
        .map(Number);

    let endYear =
      year;

    if (
      endParts[0] < startParts[0] ||
      (
        endParts[0] === startParts[0] &&
        endParts[1] < startParts[1]
      )
    ) {
      endYear++;
    }

    const end =
      createDateFromMonthDay(
        endYear,
        endMonthDay
      );

    if (!end) return null;

    return {
      start: start,
      end: end
    };
  }

  function getNthWeekend(
    year,
    month,
    nth
  ) {
    const numberOfDays =
      new Date(
        year,
        month,
        0
      ).getDate();

    let saturdayCount = 0;

    for (
      let day = 1;
      day <= numberOfDays;
      day++
    ) {
      const date =
        new Date(
          year,
          month - 1,
          day,
          12
        );

      if (
        date.getDay() !== 6
      ) {
        continue;
      }

      saturdayCount++;

      if (
        saturdayCount === nth
      ) {
        const sunday =
          addDays(
            date,
            1
          );

        return {
          start: getDateKey(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          ),
          end: getDateKey(
            sunday.getFullYear(),
            sunday.getMonth(),
            sunday.getDate()
          )
        };
      }
    }

    return null;
  }

  /* =========================================================
     TRANSFORMATION EN OCCURRENCES
     ========================================================= */

  function buildEventOccurrences(events) {
    const occurrences = [];
    const seen = new Set();

    function addOccurrence(
      event,
      eventIndex,
      occurrence
    ) {
      let key =
        eventIndex +
        "|" +
        occurrence.type +
        "|";

      if (
        occurrence.type === "single"
      ) {
        if (
          !isValidDateKey(
            occurrence.date
          )
        ) {
          return;
        }

        key += occurrence.date;
      } else {
        if (
          !isValidDateKey(
            occurrence.start
          ) ||
          !isValidDateKey(
            occurrence.end
          )
        ) {
          return;
        }

        if (
          getDateStamp(
            parseDateKey(
              occurrence.end
            )
          ) <
          getDateStamp(
            parseDateKey(
              occurrence.start
            )
          )
        ) {
          return;
        }

        key +=
          occurrence.start +
          "|" +
          occurrence.end;
      }

      if (
        seen.has(key)
      ) {
        return;
      }

      seen.add(key);

      occurrences.push({
        type: occurrence.type,
        date: occurrence.date || null,
        start: occurrence.start || null,
        end: occurrence.end || null,
        event: event
      });
    }

    events.forEach(
      function(event, eventIndex) {

        /* =========================
           ÉVÉNEMENT VESPÉRIEN
           ========================= */

        if (
          event.vesperian &&
          event.vesperian.phase &&
          event.vesperian.day
        ) {
          const vesperianDates =
            getVesperianOccurrenceDates(
              event.vesperian
            );

          vesperianDates.forEach(
            function(date) {
              addOccurrence(
                event,
                eventIndex,
                {
                  type: "single",
                  date: date
                }
              );
            }
          );
        }

        /* =========================
           DATE UNIQUE
           ========================= */

        if (event.date) {
          addOccurrence(
            event,
            eventIndex,
            {
              type: "single",
              date: event.date
            }
          );
        }

        /* =========================
           PLUSIEURS DATES
           ========================= */

        if (
          Array.isArray(
            event.dates
          )
        ) {
          event.dates.forEach(
            function(date) {
              addOccurrence(
                event,
                eventIndex,
                {
                  type: "single",
                  date: date
                }
              );
            }
          );
        }

        /* =========================
           DATE ANNUELLE
           ========================= */

        if (
          event.yearly &&
          event.yearly.date
        ) {
          const years =
            getRuleYears(
              event.yearly
            );

          years.forEach(
            function(year) {
              const date =
                createDateFromMonthDay(
                  year,
                  event.yearly.date
                );

              if (!date) return;

              addOccurrence(
                event,
                eventIndex,
                {
                  type: "single",
                  date: date
                }
              );
            }
          );
        }

        /* =========================
           PÉRIODE UNIQUE
           ========================= */

        if (
          event.start &&
          event.end
        ) {
          addOccurrence(
            event,
            eventIndex,
            {
              type: "range",
              start: event.start,
              end: event.end
            }
          );
        }

        /* =========================
           PLUSIEURS PÉRIODES
           ========================= */

        if (
          Array.isArray(
            event.ranges
          )
        ) {
          event.ranges.forEach(
            function(range) {
              if (
                !range ||
                !range.start ||
                !range.end
              ) {
                return;
              }

              addOccurrence(
                event,
                eventIndex,
                {
                  type: "range",
                  start: range.start,
                  end: range.end
                }
              );
            }
          );
        }

        /* =========================
           PÉRIODE ANNUELLE
           ========================= */

        if (
          event.yearlyRange &&
          event.yearlyRange.start &&
          event.yearlyRange.end
        ) {
          const years =
            getRuleYears(
              event.yearlyRange
            );

          years.forEach(
            function(year) {
              const range =
                createYearlyRange(
                  year,
                  event.yearlyRange.start,
                  event.yearlyRange.end
                );

              if (!range) return;

              addOccurrence(
                event,
                eventIndex,
                {
                  type: "range",
                  start: range.start,
                  end: range.end
                }
              );
            }
          );
        }

        /* =========================
           TOUS LES WEEK-ENDS
           ========================= */

        if (event.weekends) {
          const rules =
            Array.isArray(
              event.weekends
            )
              ? event.weekends
              : [event.weekends];

          rules.forEach(
            function(rule) {
              const month =
                Number(
                  rule.month
                );

              const years =
                getRuleYears(
                  rule
                );

              if (
                !Number.isInteger(
                  month
                ) ||
                month < 1 ||
                month > 12
              ) {
                return;
              }

              years.forEach(
                function(year) {
                  const numberOfDays =
                    new Date(
                      year,
                      month,
                      0
                    ).getDate();

                  for (
                    let day = 1;
                    day <= numberOfDays;
                    day++
                  ) {
                    const saturday =
                      new Date(
                        year,
                        month - 1,
                        day,
                        12
                      );

                    if (
                      saturday.getDay() !== 6
                    ) {
                      continue;
                    }

                    const sunday =
                      addDays(
                        saturday,
                        1
                      );

                    addOccurrence(
                      event,
                      eventIndex,
                      {
                        type: "range",
                        start: getDateKey(
                          saturday.getFullYear(),
                          saturday.getMonth(),
                          saturday.getDate()
                        ),
                        end: getDateKey(
                          sunday.getFullYear(),
                          sunday.getMonth(),
                          sunday.getDate()
                        )
                      }
                    );
                  }
                }
              );
            }
          );
        }

        /* =========================
           N-IÈME WEEK-END
           ========================= */

        if (
          event.nthWeekend
        ) {
          const rules =
            Array.isArray(
              event.nthWeekend
            )
              ? event.nthWeekend
              : [event.nthWeekend];

          rules.forEach(
            function(rule) {
              const month =
                Number(
                  rule.month
                );

              const nth =
                Number(
                  rule.nth
                );

              if (
                !Number.isInteger(
                  month
                ) ||
                month < 1 ||
                month > 12 ||
                !Number.isInteger(
                  nth
                ) ||
                nth < 1 ||
                nth > 5
              ) {
                return;
              }

              const years =
                getRuleYears(
                  rule
                );

              years.forEach(
                function(year) {
                  const range =
                    getNthWeekend(
                      year,
                      month,
                      nth
                    );

                  if (!range) return;

                  addOccurrence(
                    event,
                    eventIndex,
                    {
                      type: "range",
                      start: range.start,
                      end: range.end
                    }
                  );
                }
              );
            }
          );
        }
      }
    );

    return occurrences;
  }

  const EVENT_OCCURRENCES =
    buildEventOccurrences(
      EVENTS
    );

  function getEventsForDate(
    dateKey
  ) {
    return EVENT_OCCURRENCES.filter(
      function(occurrence) {
        return (
          occurrence.type === "single" &&
          occurrence.date === dateKey
        );
      }
    );
  }

  /* =========================================================
     ÉVÉNEMENTS LONGS
     ========================================================= */

  function getLongEventLayout(
    year,
    month,
    firstWeekDay,
    numberOfDays
  ) {
    const monthStart =
      new Date(
        year,
        month,
        1,
        12
      );

    const monthEnd =
      new Date(
        year,
        month,
        numberOfDays,
        12
      );

    const monthStartStamp =
      getDateStamp(
        monthStart
      );

    const monthEndStamp =
      getDateStamp(
        monthEnd
      );

    const segments = {};
    const weekTracks = {};
    const weekTrackCount = {};

    const longOccurrences =
      EVENT_OCCURRENCES.filter(
        function(occurrence) {
          return (
            occurrence.type === "range"
          );
        }
      );

    longOccurrences.forEach(
      function(occurrence) {
        const eventStart =
          parseDateKey(
            occurrence.start
          );

        const eventEnd =
          parseDateKey(
            occurrence.end
          );

        if (
          getDateStamp(
            eventEnd
          ) < monthStartStamp ||
          getDateStamp(
            eventStart
          ) > monthEndStamp
        ) {
          return;
        }

        const visibleStart =
          getDateStamp(
            eventStart
          ) < monthStartStamp
            ? new Date(
                monthStart
              )
            : new Date(
                eventStart
              );

        const visibleEnd =
          getDateStamp(
            eventEnd
          ) > monthEndStamp
            ? new Date(
                monthEnd
              )
            : new Date(
                eventEnd
              );

        let cursor =
          new Date(
            visibleStart
          );

        while (
          getDateStamp(cursor) <=
          getDateStamp(
            visibleEnd
          )
        ) {
          const day =
            cursor.getDate();

          const cellIndex =
            firstWeekDay +
            day -
            1;

          const weekIndex =
            Math.floor(
              cellIndex /
              7
            );

          const weekdayIndex =
            cellIndex %
            7;

          const remainingInWeek =
            7 -
            weekdayIndex;

          const remainingInEvent =
            getDaysBetween(
              cursor,
              visibleEnd
            ) +
            1;

          const span =
            Math.min(
              remainingInWeek,
              remainingInEvent
            );

          const rangeStart =
            weekdayIndex;

          const rangeEnd =
            weekdayIndex +
            span -
            1;

          if (
            !weekTracks[
              weekIndex
            ]
          ) {
            weekTracks[
              weekIndex
            ] = [];
          }

          let track = 0;

          while (true) {
            if (
              !weekTracks[
                weekIndex
              ][track]
            ) {
              weekTracks[
                weekIndex
              ][track] = [];
            }

            const collision =
              weekTracks[
                weekIndex
              ][track].some(
                function(range) {
                  return !(
                    rangeEnd <
                      range.start ||
                    rangeStart >
                      range.end
                  );
                }
              );

            if (!collision) {
              break;
            }

            track++;
          }

          weekTracks[
            weekIndex
          ][track].push({
            start:
              rangeStart,
            end:
              rangeEnd
          });

          weekTrackCount[
            weekIndex
          ] =
            Math.max(
              weekTrackCount[
                weekIndex
              ] || 0,
              track + 1
            );

          const dateKey =
            getDateKey(
              cursor.getFullYear(),
              cursor.getMonth(),
              cursor.getDate()
            );

          if (
            !segments[
              dateKey
            ]
          ) {
            segments[
              dateKey
            ] = [];
          }

          segments[
            dateKey
          ].push({
            occurrence:
              occurrence,
            span:
              span,
            track:
              track,
            continuesBefore:
              getDateStamp(
                eventStart
              ) <
              getDateStamp(
                cursor
              ),
            continuesAfter:
              getDateStamp(
                eventEnd
              ) >
              getDateStamp(
                addDays(
                  cursor,
                  span - 1
                )
              )
          });

          cursor =
            addDays(
              cursor,
              span
            );
        }
      }
    );

    return {
      segments:
        segments,
      weekTrackCount:
        weekTrackCount
    };
  }

  /* =========================================================
     CONTENU VISUEL DES ÉVÉNEMENTS
     ========================================================= */

  function setEventButtonContent(
    button,
    event
  ) {
    button.innerHTML = "";

    if (
      event.sorcier
    ) {
      button.classList.add(
        "is-witch-event"
      );

      const icon =
        document.createElement(
          "i"
        );

      if (
        event.sorcier ===
        "hat"
      ) {
        icon.className =
          "fa-solid fa-hat-wizard ppk-calendar-witch-icon";
      } else {
        icon.className =
          "fa-solid fa-moon ppk-calendar-witch-icon";
      }

      button.appendChild(
        icon
      );
    }

    const label =
      document.createElement(
        "span"
      );

    label.textContent =
      event.titre;

    button.appendChild(
      label
    );
  }

  /* =========================================================
     FICHE ÉVÉNEMENT
     ========================================================= */

  function showEvent(
    occurrence,
    button
  ) {
    drawer.querySelectorAll(
      ".ppk-calendar-event.is-selected, .ppk-calendar-long-event.is-selected"
    ).forEach(
      function(element) {
        element.classList.remove(
          "is-selected"
        );
      }
    );

    button.classList.add(
      "is-selected"
    );

    const event =
      occurrence.event;

    info.innerHTML = "";

    const date =
      document.createElement(
        "div"
      );

    date.className =
      "ppk-calendar-info-date";

    if (
      occurrence.type ===
      "single"
    ) {
      date.textContent =
        formatEventDate(
          occurrence.date
        );
    } else {
      date.textContent =
        formatEventRange(
          occurrence.start,
          occurrence.end
        );
    }

    const title =
      document.createElement(
        "div"
      );

    title.className =
      "ppk-calendar-info-title";

    title.textContent =
      event.titre;

    let witchLabel = null;

    if (
      event.sorcier
    ) {
      witchLabel =
        document.createElement(
          "div"
        );

      witchLabel.className =
        "ppk-calendar-info-witch";

      witchLabel.textContent =
        "Événement vespérien";
    }

    const description =
      document.createElement(
        "div"
      );

    description.className =
      "ppk-calendar-info-description";

    description.textContent =
      event.description || "";

    info.appendChild(
      date
    );

    info.appendChild(
      title
    );

    if (
      witchLabel
    ) {
      info.appendChild(
        witchLabel
      );
    }

    info.appendChild(
      description
    );

    if (
      event.url
    ) {
      const link =
        document.createElement(
          "a"
        );

      link.className =
        "ppk-calendar-info-link";

      link.href =
        event.url;

      link.target =
        "_blank";

      link.rel =
        "noopener";

      link.textContent =
        "En savoir plus";

      info.appendChild(
        link
      );
    }
  }

  /* =========================================================
     RENDU CALENDRIER
     ========================================================= */

  function renderCalendar() {
    daysContainer.innerHTML = "";

    resetInfo();

    monthLabel.textContent =
      MONTHS[
        displayedMonth
      ] +
      " " +
      displayedYear;

    const numberOfDays =
      new Date(
        displayedYear,
        displayedMonth + 1,
        0
      ).getDate();

    const firstWeekDay =
      (
        new Date(
          displayedYear,
          displayedMonth,
          1
        ).getDay() +
        6
      ) %
      7;

    const longEventLayout =
      getLongEventLayout(
        displayedYear,
        displayedMonth,
        firstWeekDay,
        numberOfDays
      );

    for (
      let i = 0;
      i < firstWeekDay;
      i++
    ) {
      const empty =
        document.createElement(
          "div"
        );

      empty.className =
        "ppk-calendar-day ppk-calendar-day-empty";

      daysContainer.appendChild(
        empty
      );
    }

    for (
      let day = 1;
      day <= numberOfDays;
      day++
    ) {
      const dateKey =
        getDateKey(
          displayedYear,
          displayedMonth,
          day
        );

      const dayEvents =
        getEventsForDate(
          dateKey
        );

      const dayBox =
        document.createElement(
          "div"
        );

      dayBox.className =
        "ppk-calendar-day";

      const cellIndex =
        firstWeekDay +
        day -
        1;

      const weekIndex =
        Math.floor(
          cellIndex /
          7
        );

      dayBox.style.setProperty(
        "--ppk-long-count",
        longEventLayout
          .weekTrackCount[
            weekIndex
          ] || 0
      );

      if (
        isPlayableDate(
          displayedYear,
          displayedMonth,
          day
        )
      ) {
        dayBox.classList.add(
          "is-playable"
        );
      }

      if (
        displayedYear ===
          currentRP.getFullYear() &&
        displayedMonth ===
          currentRP.getMonth() &&
        day ===
          currentRP.getDate()
      ) {
        dayBox.classList.add(
          "is-today"
        );
      }

      if (
        FULL_MOONS.has(
          dateKey
        )
      ) {
        dayBox.classList.add(
          "is-full-moon"
        );

        if (
          MOON_BACKGROUND_URL &&
          MOON_BACKGROUND_URL !==
            "URL_DE_TON_IMAGE_DE_PLEINE_LUNE"
        ) {
          dayBox.style.setProperty(
            "--ppk-moon-background",
            'url("' +
              MOON_BACKGROUND_URL +
              '")'
          );
        }

        const moonIcon =
          document.createElement(
            "span"
          );

        moonIcon.className =
          "ppk-calendar-moon-icon";

        moonIcon.title =
          "Pleine lune";

        moonIcon.setAttribute(
          "aria-label",
          "Pleine lune"
        );

        dayBox.appendChild(
          moonIcon
        );
      }

      const number =
        document.createElement(
          "span"
        );

      number.className =
        "ppk-calendar-number";

      number.textContent =
        day;

      dayBox.appendChild(
        number
      );

      /* ÉVÉNEMENTS LONGS */

      const longSegments =
        longEventLayout
          .segments[
            dateKey
          ] || [];

      longSegments.forEach(
        function(segment) {
          dayBox.classList.add(
            "has-long-event-start"
          );

          const longButton =
            document.createElement(
              "button"
            );

          longButton.type =
            "button";

          longButton.className =
            "ppk-calendar-long-event";

          if (
            segment.continuesBefore
          ) {
            longButton.classList.add(
              "continues-before"
            );
          }

          if (
            segment.continuesAfter
          ) {
            longButton.classList.add(
              "continues-after"
            );
          }

          setEventButtonContent(
            longButton,
            segment
              .occurrence
              .event
          );

          longButton.style.setProperty(
            "--ppk-span-width",
            (
              segment.span *
              100
            ) +
              "%"
          );

          longButton.style.setProperty(
            "--ppk-track",
            segment.track
          );

          longButton.addEventListener(
            "click",
            function() {
              showEvent(
                segment.occurrence,
                longButton
              );
            }
          );

          dayBox.appendChild(
            longButton
          );
        }
      );

      /* ÉVÉNEMENTS SIMPLES */

      if (
        dayEvents.length
      ) {
        const eventsContainer =
          document.createElement(
            "div"
          );

        eventsContainer.className =
          "ppk-calendar-events";

        dayEvents.forEach(
          function(occurrence) {
            const eventButton =
              document.createElement(
                "button"
              );

            eventButton.type =
              "button";

            eventButton.className =
              "ppk-calendar-event";

            setEventButtonContent(
              eventButton,
              occurrence.event
            );

            eventButton.addEventListener(
              "click",
              function() {
                showEvent(
                  occurrence,
                  eventButton
                );
              }
            );

            eventsContainer.appendChild(
              eventButton
            );
          }
        );

        dayBox.appendChild(
          eventsContainer
        );
      }

      daysContainer.appendChild(
        dayBox
      );
    }

    prevButton.disabled =
      displayedYear ===
        MIN_YEAR &&
      displayedMonth ===
        0;

    const maxMonth =
      getMaximumMonth();

    nextButton.disabled =
      displayedYear ===
        maxMonth.getFullYear() &&
      displayedMonth ===
        maxMonth.getMonth();

    board.scrollTop =
      0;
  }

  /* =========================================================
     NAVIGATION
     ========================================================= */

  prevButton.addEventListener(
    "click",
    function() {
      if (
        displayedYear ===
          MIN_YEAR &&
        displayedMonth ===
          0
      ) {
        return;
      }

      displayedMonth--;

      if (
        displayedMonth <
        0
      ) {
        displayedMonth =
          11;

        displayedYear--;
      }

      renderCalendar();
    }
  );

  nextButton.addEventListener(
    "click",
    function() {
      const maxMonth =
        getMaximumMonth();

      if (
        displayedYear ===
          maxMonth.getFullYear() &&
        displayedMonth ===
          maxMonth.getMonth()
      ) {
        return;
      }

      displayedMonth++;

      if (
        displayedMonth >
        11
      ) {
        displayedMonth =
          0;

        displayedYear++;
      }

      renderCalendar();
    }
  );

  /* =========================================================
     OUVERTURE / FERMETURE
     ========================================================= */

  function setButtonState(
    isOpen
  ) {
    if (isOpen) {
      openButtonIcon.className =
        "fa-solid fa-xmark";

      openButton.title =
        "Fermer le calendrier";

      openButton.setAttribute(
        "aria-label",
        "Fermer le calendrier"
      );

      openButton.setAttribute(
        "aria-expanded",
        "true"
      );

      openButton.classList.add(
        "is-open"
      );
    } else {
      openButtonIcon.className =
        "fa-solid fa-calendar-days";

      openButton.title =
        "Ouvrir le calendrier";

      openButton.setAttribute(
        "aria-label",
        "Ouvrir le calendrier"
      );

      openButton.setAttribute(
        "aria-expanded",
        "false"
      );

      openButton.classList.remove(
        "is-open"
      );
    }
  }

  function openCalendar() {
    displayedYear =
      currentRP.getFullYear();

    displayedMonth =
      currentRP.getMonth();

    renderCalendar();

    drawer.classList.add(
      "is-open"
    );

    drawer.setAttribute(
      "aria-hidden",
      "false"
    );

    setButtonState(
      true
    );
  }

  function closeCalendar() {
    drawer.classList.remove(
      "is-open"
    );

    drawer.setAttribute(
      "aria-hidden",
      "true"
    );

    setButtonState(
      false
    );
  }

  function toggleCalendar() {
    if (
      drawer.classList.contains(
        "is-open"
      )
    ) {
      closeCalendar();
    } else {
      openCalendar();
    }
  }

  openButton.addEventListener(
    "click",
    toggleCalendar
  );

  document.addEventListener(
    "keydown",
    function(event) {
      if (
        event.key ===
          "Escape" &&
        drawer.classList.contains(
          "is-open"
        )
      ) {
        closeCalendar();
      }
    }
  );

  /* =========================================================
     INITIALISATION
     ========================================================= */

  setButtonState(false);
  renderCalendar();
}

if (
  document.readyState ===
  "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    initPumpkinsCalendar
  );
} else {
  initPumpkinsCalendar();
}