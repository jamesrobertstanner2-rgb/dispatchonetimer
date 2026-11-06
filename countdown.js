// Midnight at the start of 1 January 2027 in Sydney (AEDT, UTC+11).
const launchTime = Date.UTC(2026, 11, 31, 13, 0, 0);

function updateCountdown() {
  const remaining = Math.max(0, launchTime - Date.now());
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  document.getElementById("days").textContent = String(days).padStart(2, "0");
  document.getElementById("hours").textContent = String(hours).padStart(2, "0");
  document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
  document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");

  if (remaining === 0) {
    document.querySelector(".countdown-label").textContent = "DISPATCHONE IS LAUNCHING";
  }
}
updateCountdown();
setInterval(updateCountdown, 1000);
