const form = document.querySelector("#loginForm");
const message = document.querySelector("#message");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "Entrando...";

  const payload = {
    email: form.email.value,
    password: form.password.value
  };

  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "same-origin",
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    message.textContent = "No se pudo iniciar sesion. Revisa usuario, password, Redis y seed.";
    return;
  }

  window.location.href = "/me.html";
});
