const tenantInput = document.querySelector("#tenantId");
const operationalUnitInput = document.querySelector("#operationalUnitId");
const loadButton = document.querySelector("#loadMe");
const message = document.querySelector("#message");

const userId = document.querySelector("#userId");
const email = document.querySelector("#email");
const sessionId = document.querySelector("#sessionId");
const tenantPermissions = document.querySelector("#tenantPermissions");
const operationalPermissions = document.querySelector("#operationalPermissions");

loadButton.addEventListener("click", loadContext);
window.addEventListener("load", loadContext);

async function loadContext() {
  message.textContent = "Cargando contexto...";

  const response = await fetch("/api/me", {
    method: "GET",
    credentials: "same-origin",
    headers: {
      "X-Tenant-Id": tenantInput.value,
      "X-Operational-Unit-Id": operationalUnitInput.value
    }
  });

  if (!response.ok) {
    message.textContent = response.status === 401
      ? "Sesion no valida. Regresa al login."
      : "No se pudo cargar el contexto. Revisa headers, seed y Redis.";
    clearView();
    return;
  }

  const data = await response.json();
  userId.textContent = data.identity.userId;
  email.textContent = data.identity.email;
  sessionId.textContent = data.identity.sessionId;
  renderPermissions(tenantPermissions, data.tenantPermissions);
  renderPermissions(operationalPermissions, data.operationalPermissions);
  message.textContent = "Contexto cargado.";
}

function renderPermissions(target, permissions) {
  target.innerHTML = "";

  if (!permissions.length) {
    const item = document.createElement("li");
    item.textContent = "Sin permisos";
    target.appendChild(item);
    return;
  }

  for (const permission of permissions) {
    const item = document.createElement("li");
    item.textContent = permission;
    target.appendChild(item);
  }
}

function clearView() {
  userId.textContent = "-";
  email.textContent = "-";
  sessionId.textContent = "-";
  tenantPermissions.innerHTML = "";
  operationalPermissions.innerHTML = "";
}
