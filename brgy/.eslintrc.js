// .eslintrc.js
// ─── FIX: ESLint "Failed to load config react-app" conflict ─────────────────
// The error happens because two copies of eslint-config-react-app exist:
//   1. Inside the project's own node_modules  (local)
//   2. Inside the global npm AppData path     (global, from a prior install)
//
// React Scripts tries to load both and they conflict.
// This file forces ESLint to use only the local copy and disables the
// version-check that causes the secondary "Plugin react was conflicted" error.
//
// HOW TO USE:
//   Place this file at:  Brgy2\brgy\.eslintrc.js   (root of the frontend)
//   Then run:            npm start
// ────────────────────────────────────────────────────────────────────────────

module.exports = {
  // Extends the local copy of the CRA ruleset only
  extends: ['react-app', 'react-app/jest'],

  // Stop ESLint from looking further up the directory tree for more configs.
  // This prevents it from picking up any global or parent-folder .eslintrc files.
  root: true,

  rules: {
    // Keep all CRA defaults — add project-specific overrides here if needed
  },
};
