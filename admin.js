const message = document.getElementById("message");
async function api(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data;
}
async function loadAdmin() {
  try {
    const me = await api("/api/me");
    if (!me.user || me.user.role !== "owner") return window.location.href = "/login";
    document.getElementById("welcome").textContent = `Signed in as ${me.user.username}. You have owner access.`;
    await loadTesters();
  } catch {
    window.location.href = "/login";
  }
}
async function loadTesters() {
  const data = await api("/api/admin/testers");
  const list = document.getElementById("tester-list");
  list.innerHTML = "";
  if (!data.testers.length) {
    list.innerHTML = "<li>No tester accounts have been created yet.</li>";
    return;
  }
  for (const tester of data.testers) {
    const li = document.createElement("li");
    li.textContent = `${tester.username} — created ${tester.created_at} `;
    const button = document.createElement("button");
    button.className = "small-button";
    button.textContent = "Remove";
    button.addEventListener("click", async () => {
      if (!confirm(`Remove tester ${tester.username}?`)) return;
      await api(`/api/admin/testers/${tester.id}`, { method: "DELETE" });
      await loadTesters();
    });
    li.appendChild(button);
    list.appendChild(li);
  }
}
document.getElementById("tester-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "";
  const username = document.getElementById("tester-username").value.trim();
  const password = document.getElementById("tester-password").value;
  try {
    await api("/api/admin/testers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    event.target.reset();
    message.style.color = "#a8dfb7";
    message.textContent = `Tester account "${username}" created. Share its login details privately.`;
    await loadTesters();
  } catch (error) {
    message.style.color = "#ffb3b3";
    message.textContent = error.message;
  }
});
document.getElementById("logout").addEventListener("click", async () => {
  await fetch("/api/logout", { method: "POST" });
  window.location.href = "/";
});
loadAdmin();
