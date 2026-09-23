/*
======================================================================
SOPHIE BLUEL — login.js annoté pour la soutenance
======================================================================

PARTIE 2 — CONNEXION

FIL À SUIVRE À L'ORAL :
  formulaire
  -> submit
  -> preventDefault()
  -> récupération email / password
  -> vérification des champs
  -> POST /api/users/login
  -> JSON.stringify(...)
  -> réponse HTTP
      -> succès : token + localStorage + redirection
      -> échec   : message d'erreur


*/


// ====================================================================
// PARTIE 2 — SYSTÈME DE CONNEXION
// ====================================================================


// --------------------------------------------------------------------
// 2A — RÉCUPÉRER LE FORMULAIRE DE CONNEXION
// --------------------------------------------------------------------
// SOUTENANCE : login.html contient la structure du formulaire.
// login.js récupère ce formulaire pour lui associer le comportement.
//
// querySelector("#login-form")
// -> cherche dans le DOM l'élément ayant l'id login-form.
// --------------------------------------------------------------------

const form =
    document.querySelector("#login-form");


// --------------------------------------------------------------------
// 2B — INTERCEPTER LA SOUMISSION DU FORMULAIRE
// --------------------------------------------------------------------
// SOUTENANCE : on écoute l'événement "submit",
// pas uniquement un clic sur le bouton.
//
// Avantage :
// le formulaire fonctionne aussi si l'utilisateur valide avec Entrée.
//
// preventDefault() empêche le comportement HTML traditionnel,
// c'est-à-dire l'envoi/rechargement immédiat de la page.
// JavaScript prend donc le contrôle de la soumission.
// --------------------------------------------------------------------

form.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        // --------------------------------------------------------------
        // 2C — RÉCUPÉRER LES VALEURS SAISIES
        // --------------------------------------------------------------
        // .value permet de lire le contenu des champs du formulaire.
        // --------------------------------------------------------------

        const email =
            document.querySelector("#email").value;

        const password =
            document.querySelector("#password").value;


        // --------------------------------------------------------------
        // 2D — VÉRIFIER QUE LES DEUX CHAMPS SONT RENSEIGNÉS
        // --------------------------------------------------------------
        // Avant d'appeler l'API, on vérifie localement
        // que l'utilisateur a saisi un email ET un mot de passe.
        //
        // Si l'un manque :
        // -> message
        // -> return
        // -> la fonction s'arrête
        // -> aucun fetch n'est envoyé
        // --------------------------------------------------------------

        if (!email || !password) {
            alert(
                "Veuillez remplir tous les champs."
            );

            return;
        }


        // ==============================================================
        // 2E — POST LOGIN
        // ==============================================================
        // SOUTENANCE : bloc principal à montrer.
        //
        // Ici, on ne récupère pas des données avec GET.
        // On ENVOIE les identifiants au serveur avec POST.
        //
        // Requête :
        // POST /api/users/login
        //
        // Le serveur attend ici du JSON.
        // On précise donc :
        //   Content-Type: application/json
        //
        // Puis JSON.stringify() transforme l'objet JavaScript :
        //
        //   { email, password }
        //
        // en JSON transmissible dans le body HTTP.
        //
        // Chaîne à retenir :
        // objet JavaScript
        // -> JSON.stringify()
        // -> JSON
        // -> POST /api/users/login
        // ==============================================================

        const reponseLogin =
            await fetch(
                "http://localhost:5678/api/users/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );


        // --------------------------------------------------------------
        // 2F — TRACES DE DÉBOGAGE
        // --------------------------------------------------------------
        // Ces console.log servent à voir ce que renvoie le serveur.
        //
        // reponseLogin.status
        // -> code HTTP : 200, 401, 404...
        //
        // reponseLogin.ok
        // -> true pour une réponse HTTP de succès
        // -> false sinon
        //
        // Pendant la soutenance, inutile de s'attarder sur ces lignes.
        // --------------------------------------------------------------

        console.log(
            "Statut HTTP :",
            reponseLogin.status
        );

        console.log(
            "Réponse OK :",
            reponseLogin.ok
        );


        // ==============================================================
        // 2G — SI LA CONNEXION RÉUSSIT
        // ==============================================================
        // SOUTENANCE : bloc important.
        //
        // Si response.ok est true :
        //   1. on lit le JSON renvoyé par l'API ;
        //   2. on récupère login.token ;
        //   3. on stocke ce token dans localStorage ;
        //   4. on redirige vers index.html.
        //
        // Le token sera ensuite récupéré dans script.js
        // pour :
        //   - afficher le mode édition ;
        //   - afficher "logout" ;
        //   - masquer les filtres ;
        //   - autoriser POST /works ;
        //   - autoriser DELETE /works/:id.
        // ==============================================================

        if (reponseLogin.ok) {

            // Désérialisation :
            // le JSON reçu devient un objet JavaScript.
            const login =
                await reponseLogin.json();


            // TOKEN
            // L'API renvoie notamment une propriété token.
            const token =
                login.token;


            // localStorage conserve le token
            // même après la redirection vers index.html.
            localStorage.setItem(
                "token",
                token
            );


            // Traces de débogage.
            console.log(
                "Connexion réussie"
            );

            console.log(
                "Token :",
                token
            );


            // Redirection vers la page principale.
            window.location.href =
                "index.html";


            // ==============================================================
            // 2H — SI LA CONNEXION ÉCHOUE
            // ==============================================================
            // SOUTENANCE :
            // pas de token,
            // pas de redirection.
            //
            // On affiche simplement un message dans #login-error.
            // ==============================================================

        } else {

            console.log(
                "Connexion refusée"
            );


            const messageErreur =
                document.querySelector(
                    "#login-error"
                );


            messageErreur.innerText =
                "Erreur dans l’adresse e-mail ou le mot de passe.";
        }
    }
);


/*
======================================================================
FIN DU LOGIN — FIL CONDUCTEUR
======================================================================

FORMULAIRE
   ↓
submit
   ↓
preventDefault()
   ↓
email + password
   ↓
vérification locale
   ↓
POST /api/users/login
   ↓
JSON.stringify(...)
   ↓
réponse HTTP
   ↓
┌───────────────────────────────┬──────────────────────────────┐
│ reponseLogin.ok = true        │ reponseLogin.ok = false      │
│                               │                              │
│ response.json()               │ message d'erreur             │
│ -> token                      │ pas de token                 │
│ -> localStorage               │ pas de redirection           │
│ -> index.html                 │                              │
└───────────────────────────────┴──────────────────────────────┘

PUIS DANS script.js :
localStorage.getItem("token")
-> mode édition
-> Authorization: Bearer <token>
-> POST /works et DELETE /works/:id
======================================================================
*/