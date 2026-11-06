# DispatchOne Website — Starter Project

This is the first private pre-launch website build for DispatchOne.

## What works in this version

- Public countdown page targeting **1 January 2027 at 12:00 AM Sydney time**.
- Private login for the owner and testers.
- Owner console for creating and removing tester accounts.
- Private preview page for signed-in testers.
- SQLite database for user accounts.
- Password hashing and basic login rate limiting.
- Server-side access checks: hiding a page link is not the security boundary.

## What is not built yet

Discord OAuth2 login/invitation, Discord server registration, live bot connection, the real Moderator Panel, Department Panel, production CAD integration, subscriptions and deployment. The preview cards are placeholders only.

## Windows setup

1. Install Node.js (Node 20 or newer).
2. Extract this folder to `C:\dispatchonewebsite\dispatchone-website`.
3. Open the folder in File Explorer.
4. Click the address bar, type `cmd`, and press Enter.
5. Run:

   ```bat
   npm install
   ```

6. Copy `.env.example` and name the copy `.env`.
7. Open `.env` in Notepad and set:
   - `SESSION_SECRET` to a long random private value.
   - `OWNER_USERNAME` to your chosen owner username.
   - `OWNER_PASSWORD` to a strong password (at least 10 characters).
8. Start the website:

   ```bat
   npm start
   ```

9. Open `http://localhost:3000` in your browser.

## First login

- Public countdown: `http://localhost:3000`
- Staff login: `http://localhost:3000/login`
- Owner console: after signing in as the owner, you are sent to `/admin`.
- Tester accounts: create them from the owner console. Testers are sent to `/preview`.

The first owner account is created on the first start when the username does not already exist in the database. The database is stored in the `data` folder.

## Important security notes

- Keep `.env` private. Never upload it to Discord or GitHub.
- Do not expose this development server to the public internet yet.
- Express's default in-memory session store is for local development only. Before public deployment, configure a persistent production session store, HTTPS, secure secrets, backups, CSRF protection and appropriate monitoring.
- Use a production hosting provider and environment variables for secrets when deploying.
- The countdown is a display only; it does not automatically publish the rest of the website on launch day. We will implement a controlled launch switch and test it before release.
- Do not overwrite your existing `dispatchone-cad` project. This is a separate website folder.
