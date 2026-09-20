// Gestion de l'authentification
const authLink = document.querySelector("#auth-link");
const editModeBar = document.querySelector("#edit-mode-bar");
const boutonModifier = document.querySelector(".bouton-modifier");
const menuCategories = document.querySelector(".menu-categories");

const token = localStorage.getItem("token");
if (token) {
  authLink.innerText = "logout";
  authLink.href = "#";

  editModeBar.classList.remove("hidden");
  boutonModifier.classList.remove("hidden");
  menuCategories.classList.add("hidden");

  authLink.addEventListener("click", function (event) {
    event.preventDefault();

    localStorage.removeItem("token");

    window.location.href = "index.html";
  });
} else {
  authLink.innerText = "login";
  authLink.href = "login.html";

  editModeBar.classList.add("hidden");
  boutonModifier.classList.add("hidden");
  menuCategories.classList.remove("hidden");
}


// Récupération des projets depuis l'API works
const reponse = await fetch("http://localhost:5678/api/works");
let travaux = await reponse.json();

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


// Récupération des catégories depuis l'API categories
const reponseCategories = await fetch(
  "http://localhost:5678/api/categories"
);

const categories = await reponseCategories.json();

const boutonTous = document.createElement("button");

boutonTous.innerText = "Tous";
boutonTous.classList.add(
  "categorie-button",
  "categorie-button-selected"
);

menuCategories.appendChild(boutonTous);

function selectionnerCategorie(boutonSelectionne) {
  const boutonsCategories =
    document.querySelectorAll(".categorie-button");

  for (let i = 0; i < boutonsCategories.length; i++) {
    boutonsCategories[i].classList.remove(
      "categorie-button-selected"
    );
  }

  boutonSelectionne.classList.add(
    "categorie-button-selected"
  );
}

boutonTous.addEventListener("click", function () {
  selectionnerCategorie(boutonTous);

  mesProjets.innerHTML = "";
  genererTravaux(travaux);
});

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

      const travauxFiltres = travaux.filter(function (travail) {
        return travail.categoryId === categoryId;
      });

      mesProjets.innerHTML = "";
      genererTravaux(travauxFiltres);
    });
  }
}

genererCategories(categories);




// Fenêtre modale


const openModalButton = document.querySelector("#open-modal");
const modal = document.querySelector("#modal");
const closeModalButton = document.querySelector("#close-modal");

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
    iconePoubelle.classList.add(
      "fa-solid",
      "fa-trash-can"
    );

    boutonSupprimer.appendChild(iconePoubelle);
    boutonSupprimer.addEventListener(
      "click",
      async function (event) {
        const id =
          event.currentTarget.dataset.id;



        const reponseSuppression =
          await fetch(
            `http://localhost:5678/api/works/${id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

        if (reponseSuppression.ok) {
          figureProjet.remove();

          travaux = travaux.filter(
            function (travail) {
              return travail.id !== Number(id);
            }
          );

          mesProjets.innerHTML = "";
          genererTravaux(travaux);
        }
      }
    );

    figureProjet.appendChild(imageProjet);
    figureProjet.appendChild(
      boutonSupprimer
    );

    galleryModal.appendChild(
      figureProjet
    );
  }
}

// ajout des catégories dans la fenêtre modale
const selectCategorie = document.querySelector("#category");

selectCategorie.innerHTML = "";
for (let i = 0; i < categories.length; i++) {
  const optionCategorie = document.createElement("option");
  optionCategorie.value = categories[i].id;
  optionCategorie.textContent = categories[i].name;
  selectCategorie.appendChild(optionCategorie);
}



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

openModalButton.addEventListener("click", openModal);

closeModalButton.addEventListener("click", closeModal);

modal.addEventListener("click", function (event) {
  if (event.target === modal) {
    closeModal();
  }
});

window.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeModal();
  }
});





const galleryView = document.querySelector("#modal-gallery-view");
const addView = document.querySelector("#modal-add-view");
const boutonAjouter = document.querySelector("#add-photo");
boutonAjouter.addEventListener("click", function () {
  addView.classList.remove("hidden");
  galleryView.classList.add("hidden");
});
const boutonBack = document.querySelector("#back-gallery");
boutonBack.addEventListener("click", function () {
  addView.classList.add("hidden");
  galleryView.classList.remove("hidden");
});



function addWorks() {
  const addWorkForm =
    document.querySelector("#add-work-form");

  const addTitle =
    document.querySelector("#title");

  const addImage =
    document.querySelector("#image");

  const addCategory =
    document.querySelector("#category");

  const validateButton =
    document.querySelector("#validate-work");

  const imagePreview =
    document.querySelector("#image-preview");

  const uploadPlaceholder =
    document.querySelector("#upload-placeholder");

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
  addTitle.addEventListener(
    "input",
    verifierFormulaire
  );
  addImage.addEventListener(
    "change",
    verifierFormulaire
  );
  addCategory.addEventListener(
    "change",
    verifierFormulaire
  );
  verifierFormulaire();
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


  addWorkForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const titre = addTitle.value;
    const image = addImage.files[0];
    const categorie = addCategory.value;

    if (!titre || !image || !categorie) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    const formData = new FormData();

    formData.append("image", image);
    formData.append("title", titre);
    formData.append("category", categorie);

    const reponseAdd = await fetch(
      "http://localhost:5678/api/works",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      }
    );

    if (reponseAdd.ok) {
      const nouveauTravail = await reponseAdd.json();

      travaux.push(nouveauTravail);

      // Mise à jour de la galerie principale
      mesProjets.innerHTML = "";
      genererTravaux(travaux);

      // Mise à jour de la galerie dans la modale
      const galleryModal =
        document.querySelector(".gallery-modal");

      galleryModal.innerHTML = "";
      genererTravauxModal(travaux);

      // Réinitialisation du formulaire
      addWorkForm.reset();

      imagePreview.src = "";
      imagePreview.classList.add("hidden");
      uploadPlaceholder.classList.remove("hidden");

      // Le bouton Valider redevient désactivé et gris
      verifierFormulaire();

      // Retour à l'accueil de la modale
      addView.classList.add("hidden");
      galleryView.classList.remove("hidden");

      alert("Votre ajout a bien été pris en compte.");
    }
  });
}

addWorks();

