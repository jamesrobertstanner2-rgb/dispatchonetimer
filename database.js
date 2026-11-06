const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, "dispatchone.sqlite"));
db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('owner', 'tester')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

module.exports = {
  getUserByUsername(username) {
    return db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  },
  createUser(username, passwordHash, role) {
    return db.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)")
      .run(username, passwordHash, role);
  },
  listTesters() {
    return db.prepare("SELECT id, username, created_at FROM users WHERE role = 'tester' ORDER BY created_at DESC").all();
  },
  deleteTester(id) {
    return db.prepare("DELETE FROM users WHERE id = ? AND role = 'tester'").run(id);
  }
};
