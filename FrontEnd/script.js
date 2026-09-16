

  // Récupération des projets depuis l'API works
const reponse = await fetch("http://localhost:5678/api/works");
const travaux = await reponse.json();

const mesProjets = document.querySelector(".gallery");

function genererTravaux(travaux) {
  for (let i = 0; i < travaux.length; i++) {
    const figureProjet = document.createElement("figure");

    const imageProjet = document.createElement("img");
    imageProjet.src = travaux[i].imageUrl;

    const titreProjet = document.createElement("figcaption");
    titreProjet.innerText = travaux[i].title;

    figureProjet.appendChild(imageProjet);
    figureProjet.appendChild(titreProjet);

    mesProjets.appendChild(figureProjet);

  }
}

    genererTravaux(travaux);