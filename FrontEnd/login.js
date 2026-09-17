  //authentification


const form = document.querySelector("#login-form");

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = document.querySelector("#email").value;
  const password = document.querySelector("#password").value;

  if (!email || !password) {
    alert("Veuillez remplir tous les champs.");
    return;
  }

const reponseLogin = await fetch(
  "http://localhost:5678/api/users/login",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: email,
      password: password
    })
  }
);

console.log("Statut HTTP :", reponseLogin.status);
console.log("Réponse OK :", reponseLogin.ok);

if (reponseLogin.ok) {
  const login = await reponseLogin.json();

  const token = login.token;

  localStorage.setItem("token", token);

  console.log("Connexion réussie");
  console.log("Token :", token);

  window.location.href = "index.html";
} else {
  console.log("Connexion refusée");

  const messageErreur = document.querySelector("#login-error");

  messageErreur.innerText =
    "Erreur dans l’adresse e-mail ou le mot de passe.";
}
});