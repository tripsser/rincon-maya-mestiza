const tenantInput = document.querySelector("#tenantId");
const restaurantInput = document.querySelector("#restaurantId");
const operationalUnitInput = document.querySelector("#operationalUnitId");
const loadButton = document.querySelector("#loadMe");
const message = document.querySelector("#message");

const userId = document.querySelector("#userId");
const email = document.querySelector("#email");
const sessionId = document.querySelector("#sessionId");
const activeTenantId = document.querySelector("#activeTenantId");
const activeRestaurantId = document.querySelector("#activeRestaurantId");
const activeOperationalUnitId = document.querySelector("#activeOperationalUnitId");
const tenantPermissions = document.querySelector("#tenantPermissions");
const restaurantPermissions = document.querySelector("#restaurantPermissions");
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
      "X-Restaurant-Id": restaurantInput.value,
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
  activeTenantId.textContent = data.tenantId ?? "-";
  activeRestaurantId.textContent = data.restaurantId ?? "-";
  activeOperationalUnitId.textContent = data.operationalUnitId ?? "-";
  renderPermissions(tenantPermissions, data.tenantPermissions);
  renderPermissions(restaurantPermissions, data.restaurantPermissions);
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
  activeTenantId.textContent = "-";
  activeRestaurantId.textContent = "-";
  activeOperationalUnitId.textContent = "-";
  tenantPermissions.innerHTML = "";
  restaurantPermissions.innerHTML = "";
  operationalPermissions.innerHTML = "";
}
