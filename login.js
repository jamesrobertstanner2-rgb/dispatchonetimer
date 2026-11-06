const form = document.getElementById("login-form");
const message = document.getElementById("message");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "";
  const payload = {
    username: form.username.value.trim(),
    password: form.password.value
  };
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Sign in failed.");
    window.location.href = result.user.role === "owner" ? "/admin" : "/preview";
  } catch (error) {
    message.textContent = error.message;
  }
});
