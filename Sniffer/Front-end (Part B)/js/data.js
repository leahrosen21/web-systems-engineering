/* ================================================
   data.js — Session management
   Stores only the logged-in user's id and username.
   All actual data is fetched from the backend API.
   ================================================ */

const SESSION_KEY = 'sniffer_session';

function getCurrentUser() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

function setCurrentUser(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function logout() {
  localStorage.removeItem(SESSION_KEY);
}

function requireLogin() {
  if (!getCurrentUser()) {
    window.location.href = '../pages/login.html';
  }
}

