async function loadPreview() {
  const response = await fetch("/api/private/overview");
  if (!response.ok) return window.location.href = "/login";
  const data = await response.json();
  document.getElementById("welcome").textContent = `Signed in as ${data.user.username} (${data.user.role}). Launch target: ${data.launchDate}.`;
}
document.getElementById("logout").addEventListener("click", async () => {
  await fetch("/api/logout", { method: "POST" });
  window.location.href = "/";
});
loadPreview();
