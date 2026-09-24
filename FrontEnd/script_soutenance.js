/*======================================================================
SOPHIE BLUEL — script.js annoté pour la soutenance
======================================================================

ORDRE DE PRÉSENTATION :
  PARTIE 1 — Afficher et filtrer les projets
  PARTIE 2 — Connexion / état connecté
  PARTIE 3 — Modale / ajout / suppression


*/
// ====================================================================
// PARTIE 1 — AFFICHER ET FILTRER LES PROJETS
// ====================================================================

// --------------------------------------------------------------------
// 1A — RÉCUPÉRER LES TRAVAUX DEPUIS L'API
// --------------------------------------------------------------------
// fetch() envoie ici une requête GET vers /api/works.
// await attend la réponse.
// reponse.json() désérialise le JSON reçu en tableau JavaScript.
//
// Chaîne  :
// GET /api/works -> JSON -> travaux[]
// --------------------------------------------------------------------

const reponse = await fetch("http://localhost:5678/api/works");

let travaux = await reponse.json();

// Conteneur HTML dans lequel seront insérés les projets.
const mesProjets = document.querySelector(".gallery");

// --------------------------------------------------------------------
// 1B — TRANSFORMER LES DONNÉES EN ÉLÉMENTS DU DOM
// --------------------------------------------------------------------
// cette fonction est la fonction de rendu de la galerie.
// Elle reçoit un tableau de travaux et crée pour chaque travail :
//   - une <figure>
//   - une <img>
//   - un <figcaption>
//
// Un objet JavaScript reçu de l'API devient donc un élément visible.
// --------------------------------------------------------------------

function genererTravaux(listeTravaux) {
  for (let i = 0; i < listeTravaux.length; i++) {
    const figureProjet = document.createElement("figure");

    const imageProjet = document.createElement("img");
    imageProjet.src = listeTravaux[i].imageUrl;

    const titreProjet = document.createElement("figcaption");
    titreProjet.innerText = listeTravaux[i].title;

    figureProjet.appendChild(imageProjet);
    figureProjet.appendChild(titreProjet);

    mesProjets.appendChild(figureProjet);
  }
}

// Premier affichage : on affiche tous les travaux récupérés.
genererTravaux(travaux);

// --------------------------------------------------------------------
// 1C — RÉCUPÉRER LES CATÉGORIES
// --------------------------------------------------------------------
// Les boutons de filtre ne sont pas écrits en dur dans le HTML.
// Les catégories sont elles aussi récupérées depuis l'API.
// --------------------------------------------------------------------

const reponseCategories = await fetch("http://localhost:5678/api/categories");

const categories = await reponseCategories.json();

// Conteneur des boutons "Tous", "Objets", "Appartements", etc.
const menuCategories = document.querySelector(".menu-categories");

// --------------------------------------------------------------------
// 1D — CRÉER LE BOUTON "TOUS"
// --------------------------------------------------------------------
// Le bouton "Tous" est sélectionné par défaut car, au premier affichage,
// la galerie contient bien tous les travaux.
// --------------------------------------------------------------------

const boutonTous = document.createElement("button");

boutonTous.innerText = "Tous";

boutonTous.classList.add("categorie-button", "categorie-button-selected");

menuCategories.appendChild(boutonTous);

// --------------------------------------------------------------------
// 1E — GÉRER VISUELLEMENT LE FILTRE ACTIF
// --------------------------------------------------------------------
// querySelectorAll() récupère TOUS les boutons de catégorie.
// On retire d'abord la classe verte partout,
// puis on l'ajoute seulement au bouton sélectionné.
// --------------------------------------------------------------------

function selectionnerCategorie(boutonSelectionne) {
  const boutonsCategories = document.querySelectorAll(".categorie-button");

  for (let i = 0; i < boutonsCategories.length; i++) {
    boutonsCategories[i].classList.remove("categorie-button-selected");
  }

  boutonSelectionne.classList.add("categorie-button-selected");
}

// --------------------------------------------------------------------
// 1F — FILTRE "TOUS"
// --------------------------------------------------------------------
// Pas besoin de filter() :
// on vide la galerie puis on réaffiche directement le tableau complet.
// --------------------------------------------------------------------

boutonTous.addEventListener("click", function () {
  selectionnerCategorie(boutonTous);

  mesProjets.innerHTML = "";
  genererTravaux(travaux);
});

// --------------------------------------------------------------------
// 1G — CRÉER LES FILTRES ET FILTRER AVEC filter()
// --------------------------------------------------------------------
//
// Chaque bouton reçoit l'id de sa catégorie dans data-category-id.
// Au clic :
//   1. on récupère cet id ;
//   2. filter() crée un nouveau tableau ;
//   3. on vide l'ancienne galerie ;
//   4. on réutilise genererTravaux() avec le tableau filtré.
//
// Le tableau travaux d'origine reste disponible.
// --------------------------------------------------------------------

function genererCategories(categories) {
  for (let i = 0; i < categories.length; i++) {
    const boutonCategorie = document.createElement("button");

    boutonCategorie.innerText = categories[i].name;

    boutonCategorie.setAttribute("data-category-id", categories[i].id);

    boutonCategorie.classList.add("categorie-button");

    menuCategories.appendChild(boutonCategorie);

    boutonCategorie.addEventListener("click", function () {
      selectionnerCategorie(this);

      const categoryId = Number(this.getAttribute("data-category-id"));

      // SOUTENANCE :
      // filter() ne modifie pas travaux.
      // Il crée un nouveau tableau contenant seulement
      // les travaux de la catégorie sélectionnée.
      const travauxFiltres = travaux.filter(function (travail) {
        return travail.categoryId === categoryId;
      });

      // On vide le DOM avant de reconstruire la galerie.
      mesProjets.innerHTML = "";

      // Même fonction de rendu, mais avec des données différentes.
      genererTravaux(travauxFiltres);
    });
  }
}

genererCategories(categories);

// ====================================================================
// PARTIE 2 — CONNEXION ET ÉTAT CONNECTÉ / NON CONNECTÉ
// ====================================================================
//
// Le POST de connexion lui-même est dans login.js.
//
// Dans login.js, la chaîne est :
//   submit
//   -> preventDefault()
//   -> POST /api/users/login
//   -> JSON.stringify({ email, password })
//   -> réponse OK
//   -> localStorage.setItem("token", token)
//   -> redirection vers index.html
//
// Ici, dans script.js, on lit le token et on adapte l'interface.
// ====================================================================

// --------------------------------------------------------------------
// 2A — RÉCUPÉRER LES ÉLÉMENTS QUI CHANGENT SELON LA CONNEXION
// --------------------------------------------------------------------

const authLink = document.querySelector("#auth-link");

const editModeBar = document.querySelector("#edit-mode-bar");

const boutonModifier = document.querySelector(".bouton-modifier");

// Le token a été stocké par login.js après une connexion réussie.
const token = localStorage.getItem("token");

// --------------------------------------------------------------------
// 2B — UTILISATEUR CONNECTÉ
// --------------------------------------------------------------------
// La présence du token permet de passer en mode édition.
//
// Interface connectée :
//   - "logout" dans le header
//   - bandeau "Mode édition"
//   - bouton "modifier"
//   - filtres masqués
//
// Le token sera aussi utilisé plus loin dans Authorization: Bearer ...
// pour les routes protégées POST /works et DELETE /works/:id.
// --------------------------------------------------------------------

if (token) {
  authLink.innerText = "logout";
  authLink.href = "#";

  editModeBar.classList.remove("hidden");
  boutonModifier.classList.remove("hidden");

  // En mode édition, les filtres ne sont pas affichés.
  menuCategories.classList.add("hidden");

  // Déconnexion :
  // on supprime le token puis on recharge l'accueil.
  authLink.addEventListener("click", function (event) {
    event.preventDefault();

    localStorage.removeItem("token");

    window.location.href = "index.html";
  });

  // --------------------------------------------------------------------
  // 2C — UTILISATEUR NON CONNECTÉ
  // --------------------------------------------------------------------
  // Interface publique :
  //   - lien "login"
  //   - pas de bandeau édition
  //   - pas de bouton modifier
  //   - filtres visibles
  // --------------------------------------------------------------------
} else {
  authLink.innerText = "login";
  authLink.href = "login.html";

  editModeBar.classList.add("hidden");
  boutonModifier.classList.add("hidden");

  menuCategories.classList.remove("hidden");
}

// ====================================================================
// PARTIE 3 — MODALE : AJOUTER ET SUPPRIMER DES TRAVAUX
// ====================================================================

// --------------------------------------------------------------------
// 3A — REPÈRES DOM DE LA MODALE
// --------------------------------------------------------------------

const openModalButton = document.querySelector("#open-modal");

const modal = document.querySelector("#modal");

const closeModalButton = document.querySelector("#close-modal");

const galleryView = document.querySelector("#modal-gallery-view");

const addView = document.querySelector("#modal-add-view");

const boutonAjouter = document.querySelector("#add-photo");

const boutonBack = document.querySelector("#back-gallery");

// --------------------------------------------------------------------
// 3B — OUVRIR ET FERMER LA MODALE
// --------------------------------------------------------------------
// Une seule modale existe dans le HTML.
// JavaScript l'affiche ou la masque avec la classe "active".
// À chaque ouverture, la galerie de la modale est régénérée.
// --------------------------------------------------------------------

function openModal() {
  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");

  const galleryModal = document.querySelector(".gallery-modal");

  galleryModal.innerHTML = "";

  genererTravauxModal(travaux);
}

function closeModal() {
  modal.classList.remove("active");

  modal.setAttribute("aria-hidden", "true");
}

// Clic sur "modifier".
openModalButton.addEventListener("click", openModal);

// Clic sur la croix.
closeModalButton.addEventListener("click", closeModal);

// Clic sur l'arrière-plan grisé.
modal.addEventListener("click", function (event) {
  if (event.target === modal) {
    closeModal();
  }
});

// Touche Échap.
window.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeModal();
  }
});

// --------------------------------------------------------------------
// 3C — PASSER ENTRE LES DEUX VUES DE LA MODALE
// --------------------------------------------------------------------
// Vue 1 : Galerie photo
// Vue 2 : Ajout photo
//
// On ne crée pas une deuxième modale.
// On masque simplement une vue et on affiche l'autre.
// --------------------------------------------------------------------

boutonAjouter.addEventListener("click", function () {
  addView.classList.remove("hidden");
  galleryView.classList.add("hidden");
});

boutonBack.addEventListener("click", function () {
  addView.classList.add("hidden");
  galleryView.classList.remove("hidden");
});

// --------------------------------------------------------------------
// 3D — REMPLIR LE SELECT DES CATÉGORIES
// --------------------------------------------------------------------
// On réutilise le tableau categories déjà récupéré
// dans la PARTIE 1. Une même donnée alimente donc :
//   - les filtres de la page ;
//   - le select du formulaire.
// --------------------------------------------------------------------

const selectCategorie = document.querySelector("#category");

selectCategorie.innerHTML = "";

// Option vide par défaut :
// elle oblige l'utilisateur à choisir réellement une catégorie.
const optionVide = document.createElement("option");

optionVide.value = "";
optionVide.textContent = "";
optionVide.selected = true;
optionVide.disabled = true;
optionVide.defaultSelected = true;

selectCategorie.appendChild(optionVide);

// Création dynamique des autres options.
for (let i = 0; i < categories.length; i++) {
  const optionCategorie = document.createElement("option");

  optionCategorie.value = categories[i].id;

  optionCategorie.textContent = categories[i].name;

  selectCategorie.appendChild(optionCategorie);
}

// --------------------------------------------------------------------
// 3E — AJOUTER UN NOUVEAU TRAVAIL
// --------------------------------------------------------------------
// Cette fonction gère :
//   - la validation du formulaire ;
//   - la prévisualisation de l'image ;
//   - FormData ;
//   - POST /api/works ;
//   - la mise à jour des galeries sans rechargement ;
//   - la remise à zéro du formulaire.
// --------------------------------------------------------------------

function addWorks() {
  const addWorkForm = document.querySelector("#add-work-form");

  const addTitle = document.querySelector("#title");

  const addImage = document.querySelector("#image");

  const addCategory = document.querySelector("#category");

  const validateButton = document.querySelector("#validate-work");

  const imagePreview = document.querySelector("#image-preview");

  const uploadPlaceholder = document.querySelector("#upload-placeholder");

  // --------------------------------------------------------------
  // 3E.1 — VALIDER LE FORMULAIRE EN TEMPS RÉEL
  // --------------------------------------------------------------
  // Le bouton reste désactivé et gris tant qu'il manque :
  //   - le titre
  //   - l'image
  //   - la catégorie
  //
  // Quand les trois valeurs existent, disabled devient false
  // et le CSS affiche le bouton en vert.
  // --------------------------------------------------------------

  function verifierFormulaire() {
    const titre = addTitle.value.trim();

    const image = addImage.files[0];

    const categorie = addCategory.value;

    if (titre && image && categorie) {
      validateButton.disabled = false;
    } else {
      validateButton.disabled = true;
    }
  }

  addTitle.addEventListener("input", verifierFormulaire);

  addImage.addEventListener("change", verifierFormulaire);

  addCategory.addEventListener("change", verifierFormulaire);

  verifierFormulaire();

  // --------------------------------------------------------------
  // 3E.2 — PRÉVISUALISER L'IMAGE
  // --------------------------------------------------------------
  // FileReader lit localement le fichier choisi.
  // Il n'y a encore aucun envoi vers l'API à ce stade.
  // --------------------------------------------------------------

  addImage.addEventListener("change", function () {
    const image = addImage.files[0];

    if (!image) {
      return;
    }

    const reader = new FileReader();

    reader.addEventListener("load", function () {
      imagePreview.src = reader.result;

      imagePreview.classList.remove("hidden");

      uploadPlaceholder.classList.add("hidden");
    });

    reader.readAsDataURL(image);
  });

  // --------------------------------------------------------------
  // 3E.3 — SOUMETTRE LE FORMULAIRE
  // --------------------------------------------------------------
  // preventDefault() empêche le rechargement HTML traditionnel.
  // --------------------------------------------------------------

  addWorkForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const titre = addTitle.value;

    // files[0] est un objet File.
    const image = addImage.files[0];

    const categorie = addCategory.value;

    if (!titre || !image || !categorie) {
      alert("Veuillez remplir tous les champs.");

      return;
    }

    // ----------------------------------------------------------
    // 3E.4 — FORMDATA
    // ----------------------------------------------------------
    //
    // Login :
    //   JSON.stringify(...)
    //
    // Ajout d'un travail :
    //   FormData, car il faut envoyer un fichier + des textes.
    //
    // On NE fixe PAS Content-Type manuellement :
    // le navigateur construit lui-même le multipart/form-data.
    // ----------------------------------------------------------

    const formData = new FormData();

    formData.append("image", image);

    formData.append("title", titre);

    formData.append("category", categorie);

    // ----------------------------------------------------------
    // 3E.5 — POST /api/works + TOKEN
    // ----------------------------------------------------------
    // Route protégée.
    // Le token stocké après le login est envoyé dans Authorization.
    // ----------------------------------------------------------

    const reponseAdd = await fetch("http://localhost:5678/api/works", {
      method: "POST",

      headers: {
        Authorization: `Bearer ${token}`,
      },

      body: formData,
    });

    // ----------------------------------------------------------
    // 3E.6 — SI L'API CONFIRME L'AJOUT
    // ----------------------------------------------------------
    // Chaîne à expliquer :
    //
    // API confirme
    // -> nouveauTravail
    // -> travaux.push()
    // -> galerie principale régénérée
    // -> galerie modale régénérée
    // -> formulaire reset
    // -> retour à "Galerie photo"
    //
    // Aucun F5 n'est nécessaire.
    // ----------------------------------------------------------

    if (reponseAdd.ok) {
      const nouveauTravail = await reponseAdd.json();

      travaux.push(nouveauTravail);

      mesProjets.innerHTML = "";

      genererTravaux(travaux);

      const galleryModal = document.querySelector(".gallery-modal");

      galleryModal.innerHTML = "";

      genererTravauxModal(travaux);

      addWorkForm.reset();

      imagePreview.src = "";

      imagePreview.classList.add("hidden");

      uploadPlaceholder.classList.remove("hidden");

      verifierFormulaire();

      addView.classList.add("hidden");

      galleryView.classList.remove("hidden");

      alert("Votre ajout a bien été pris en compte.");
    }
  });
}

// Activation de toute la logique du formulaire d'ajout.
addWorks();

// --------------------------------------------------------------------
// 3F — AFFICHER LA GALERIE DE LA MODALE ET SUPPRIMER UN TRAVAIL
// --------------------------------------------------------------------
// Chaque poubelle reçoit l'id du travail dans data-id.
// Au clic :
//   id
//   -> DELETE /api/works/{id}
//   -> Authorization Bearer token
//   -> si réponse OK
//   -> mise à jour de travaux[]
//   -> mise à jour du DOM
// --------------------------------------------------------------------

function genererTravauxModal(listeTravaux) {
  const galleryModal = document.querySelector(".gallery-modal");

  for (let i = 0; i < listeTravaux.length; i++) {
    const figureProjet = document.createElement("figure");

    const imageProjet = document.createElement("img");

    imageProjet.src = listeTravaux[i].imageUrl;

    const boutonSupprimer = document.createElement("button");

    boutonSupprimer.classList.add("delete-photo");

    boutonSupprimer.type = "button";

    boutonSupprimer.dataset.id = listeTravaux[i].id;

    const iconePoubelle = document.createElement("i");

    iconePoubelle.classList.add("fa-solid", "fa-trash-can");

    boutonSupprimer.appendChild(iconePoubelle);

    boutonSupprimer.addEventListener("click", async function (event) {
      const id = event.currentTarget.dataset.id;

      const reponseSuppression = await fetch(
        `http://localhost:5678/api/works/${id}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (reponseSuppression.ok) {
        figureProjet.remove();

        travaux = travaux.filter(function (travail) {
          return travail.id !== Number(id);
        });

        mesProjets.innerHTML = "";

        genererTravaux(travaux);
      }
    });

    figureProjet.appendChild(imageProjet);

    figureProjet.appendChild(boutonSupprimer);

    galleryModal.appendChild(figureProjet);
  }
}

/*
======================================================================
FIN DU SCRIPT — FIL CONDUCTEUR DE LA SOUTENANCE
======================================================================

PARTIE 1
API -> travaux[] -> genererTravaux()
-> catégories -> clic -> filter() -> nouveau DOM

PARTIE 2
login.js -> POST /login -> token -> localStorage
script.js -> lecture du token -> mode édition / logout

PARTIE 3
modale -> formulaire -> validation -> FileReader
-> FormData -> POST /works + Bearer token
-> travaux.push() -> DOM régénéré sans F5

Suppression :
data-id -> DELETE /works/:id + Bearer token
-> filter() -> DOM régénéré
======================================================================
*/
