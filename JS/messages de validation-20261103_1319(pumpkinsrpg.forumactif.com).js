document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("valid").forEach(function (valid) {
    const card = document.createElement("div");
    card.className = "valid-card";

    const h2 = document.createElement("h2");
    h2.textContent = "Fiche validée !";

    const h3 = document.createElement("h3");
    h3.textContent = "Félicitations, nous te souhaitons la bienvenue parmi nous.";

	const text = document.createElement("div");
	text.className = "valid-text";

	text.appendChild(document.createTextNode("Ta fiche de personnage a été "));

	const bold = document.createElement("ppkb");
	bold.textContent = "validée par l’équipe administrative";

	text.appendChild(bold);
    text.appendChild(document.createTextNode(", tu peux donc officiellement rejoindre l’aventure. Nous avons hâte de voir ton personnage évoluer au fil des RP et de découvrir les liens qu’il tissera avec les autres."));

    const h4 = document.createElement("h4");
    h4.textContent = "Que faire maintenant ?";

    const buttons = document.createElement("div");
    buttons.className = "valid-buttons";

    const links = [
      ["https://pumpkinsrpg.forumactif.com/profile?mode=editprofile", "fa-solid fa-user", "Remplir ton profil"],
      ["https://pumpkinsrpg.forumactif.com/f24-relations", "fa-solid fa-heart", "Fiche de relations"],
      ["https://pumpkinsrpg.forumactif.com/t38-scenarios-preliens", "fa-solid fa-link", "Proposer un prélien"],
      ["https://pumpkinsrpg.forumactif.com/f23-demandes", "fa-solid fa-feather-pointed", "Demande de RP"],
      ["https://pumpkinsrpg.forumactif.com/t41-evenements-a-debloquer", "fa-solid fa-calendar-day", "Financer un événement"],
      ["https://pumpkinsrpg.forumactif.com/t45-perles-de-pluie", "fa-solid fa-droplet", "Trouver une perle"]
    ];

    links.forEach(function ([href, iconClass, label]) {
      const a = document.createElement("a");
      a.href = href;
	  a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.className = "valid-btn";

      const icon = document.createElement("i");
      icon.className = iconClass;

      const span = document.createElement("span");
      span.textContent = label;

      a.appendChild(icon);
      a.appendChild(span);
      buttons.appendChild(a);
    });

    const end = document.createElement("p");
    end.className = "valid-end";
    end.textContent = "Amuse-toi bien sur le forum !";

    card.appendChild(h2);
    card.appendChild(h3);
    card.appendChild(text);
    card.appendChild(h4);
    card.appendChild(buttons);
    card.appendChild(end);

    valid.replaceWith(card);
  });
  document.dispatchEvent(new CustomEvent("pumpkins:valid-cards-ready"));
});


document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("correct").forEach(function (correct) {
    const card = document.createElement("div");
    card.className = "correct-card";

    const h2 = document.createElement("h2");
    h2.textContent = "Corrections demandées";

    const h3 = document.createElement("h3");
    h3.textContent = "Encore un tout petit effort !";

    const text = document.createElement("div");
    text.className = "correct-text";

    while (correct.firstChild) {
      text.appendChild(correct.firstChild);
    }

    card.appendChild(h2);
    card.appendChild(h3);
    card.appendChild(text);

    correct.replaceWith(card);
  });
});

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("refus").forEach(function (refus) {
    const raison = refus.textContent.trim();

    const card = document.createElement("div");
    card.className = "refus-card";

    const h2 = document.createElement("h2");
    h2.textContent = "Fiche refusée";

    const h3 = document.createElement("h3");
    h3.appendChild(document.createTextNode("Votre fiche a été refusée par l’équipe administrative."));
    h3.appendChild(document.createElement("br"));
    h3.appendChild(document.createTextNode("Votre compte sera supprimé prochainement."));

    const reason = document.createElement("p");
    reason.className = "refus-reason";

    const label = document.createElement("strong");
    label.textContent = "Raison ";
    
    const facultative = document.createElement("span");
    facultative.textContent = "(facultative) : ";

    reason.appendChild(label);
    reason.appendChild(facultative);
    reason.appendChild(document.createTextNode(raison));

    card.appendChild(h2);
    card.appendChild(h3);
    card.appendChild(reason);

    refus.replaceWith(card);
  });
});