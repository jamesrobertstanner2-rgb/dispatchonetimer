require("dotenv").config();
const path = require("path");
const express = require("express");
const session = require("express-session");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcryptjs");
const db = require("./database");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === "production";

if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.startsWith("CHANGE_ME")) {
  console.warn("WARNING: Set a private SESSION_SECRET in your .env file before using this beyond local testing.");
}

app.disable("x-powered-by");
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:"]
    }
  }
}));
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: false }));
app.use(session({
  name: "dispatchone.sid",
  secret: process.env.SESSION_SECRET || "local-development-only-change-this-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: 1000 * 60 * 60 * 8
  }
}));
app.use(express.static(path.join(__dirname, "public")));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please wait 15 minutes and try again." }
});

function requireLogin(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: "Please sign in first." });
  next();
}
function requireOwner(req, res, next) {
  if (!req.session.user || req.session.user.role !== "owner") {
    return res.status(403).json({ error: "Owner access required." });
  }
  next();
}
function safeUser(user) {
  return { id: user.id, username: user.username, role: user.role };
}

// Create the initial owner account if it does not exist.
const ownerUsername = process.env.OWNER_USERNAME;
const ownerPassword = process.env.OWNER_PASSWORD;
if (ownerUsername && ownerPassword && !db.getUserByUsername(ownerUsername)) {
  const hash = bcrypt.hashSync(ownerPassword, 12);
  db.createUser(ownerUsername, hash, "owner");
  console.log(`Created initial owner account: ${ownerUsername}`);
}

app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "public", "login.html")));
app.get("/preview", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.sendFile(path.join(__dirname, "public", "preview.html"));
});
app.get("/admin", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  if (req.session.user.role !== "owner") return res.redirect("/preview");
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.get("/api/me", (req, res) => {
  res.json({ user: req.session.user || null });
});

app.post("/api/login", loginLimiter, (req, res) => {
  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "");
  if (!username || !password) return res.status(400).json({ error: "Enter your username and password." });

  const user = db.getUserByUsername(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Those login details were not recognised." });
  }

  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: "Could not start your session." });
    req.session.user = safeUser(user);
    res.json({ user: req.session.user });
  });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("dispatchone.sid");
    res.json({ success: true });
  });
});

app.get("/api/private/overview", requireLogin, (req, res) => {
  res.json({
    user: req.session.user,
    message: "Private DispatchOne preview access is working.",
    launchDate: "1 January 2027",
    modules: ["Moderator Panel", "Department Panel", "CAD System", "Bot Management"]
  });
});

app.get("/api/admin/testers", requireOwner, (req, res) => {
  res.json({ testers: db.listTesters() });
});

app.post("/api/admin/testers", requireOwner, (req, res) => {
  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "");
  if (!/^[a-zA-Z0-9_-]{3,24}$/.test(username)) {
    return res.status(400).json({ error: "Username must be 3–24 characters and use letters, numbers, _ or -." });
  }
  if (password.length < 10) {
    return res.status(400).json({ error: "Tester passwords must be at least 10 characters." });
  }
  if (db.getUserByUsername(username)) {
    return res.status(409).json({ error: "That username is already in use." });
  }
  const hash = bcrypt.hashSync(password, 12);
  db.createUser(username, hash, "tester");
  res.status(201).json({ success: true, username });
});

app.delete("/api/admin/testers/:id", requireOwner, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid tester ID." });
  db.deleteTester(id);
  res.json({ success: true });
});

app.get("/{*splat}", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.listen(PORT, () => {
  console.log(`DispatchOne website running at http://localhost:${PORT}`);
});
