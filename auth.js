/* =====================================================================
   Alien Radio — Auth & Wallet System
   auth.js — login / register, SHA-256 passwords, AES-GCM encrypted
             profile storage. Each user gets a wallet with Infinity
             Tokens (∞TOKEN) conceptually backed by Bitcoin.
   Ported from www-infinity/Bitcoin-Crusher auth.js
   ===================================================================== */
/* global window, crypto */
window.AUTH = (() => {
  'use strict';

  const USERS_KEY      = 'ar_users_v1';
  const SESSION_KEY    = 'ar_session_v1';
  const ADMIN_USERNAME = 'Kris';
  const ADMIN_EMAIL    = 'tigerbalm7623@gmail.com';
  const ADMIN_PASSWORD = 'Kris';

  /* ------------------------------------------------------------------
     CRYPTO HELPERS
  ------------------------------------------------------------------ */
  async function sha256(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function deriveKey(password, salt) {
    const mat = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(password), { name: 'PBKDF2' }, false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 310000, hash: 'SHA-256' },
      mat, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
    );
  }

  async function encryptData(data, password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv   = crypto.getRandomValues(new Uint8Array(12));
    const key  = await deriveKey(password, salt);
    const enc  = new TextEncoder().encode(JSON.stringify(data));
    const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc);
    const combined = new Uint8Array(16 + 12 + cipher.byteLength);
    combined.set(salt, 0); combined.set(iv, 16);
    combined.set(new Uint8Array(cipher), 28);
    return btoa(String.fromCharCode(...combined));
  }

  async function decryptData(b64, password) {
    const combined = new Uint8Array(atob(b64).split('').map(c => c.charCodeAt(0)));
    const salt   = combined.slice(0, 16);
    const iv     = combined.slice(16, 28);
    const cipher = combined.slice(28);
    const key    = await deriveKey(password, salt);
    const plain  = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
    return JSON.parse(new TextDecoder().decode(plain));
  }

  /* ------------------------------------------------------------------
     USER STORE (localStorage)
  ------------------------------------------------------------------ */
  function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); }
    catch (_) { return {}; }
  }
  function saveUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }

  function makeWallet() {
    return {
      infinityTokens:  0,          // ∞TOKEN earned by listening / playing
      btcBacking:      0.00000000, // notional BTC backing (display only)
      listenSeconds:   0,          // cumulative listening seconds
      lastTokenAward:  null,       // ISO timestamp of last 1-hr token award
      dailyGameTokens: 0,          // tokens earned from games today
      lastGameDay:     null,       // YYYY-MM-DD of last game token day
    };
  }

  async function ensureAdmin() {
    const users = getUsers();
    if (!users[ADMIN_USERNAME]) {
      const hash = await sha256(ADMIN_PASSWORD);
      users[ADMIN_USERNAME] = {
        username: ADMIN_USERNAME, email: ADMIN_EMAIL, passwordHash: hash,
        role: 'admin', createdAt: new Date().toISOString(),
        wallet: makeWallet(),
        researchArticles: [],
        conversations: [],
      };
      saveUsers(users);
    }
  }

  /* ------------------------------------------------------------------
     SESSION (sessionStorage)
  ------------------------------------------------------------------ */
  function getSession() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); }
    catch (_) { return null; }
  }
  function setSession(user) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      username: user.username, email: user.email, role: user.role,
    }));
  }
  function clearSession() { sessionStorage.removeItem(SESSION_KEY); }

  /* ------------------------------------------------------------------
     PUBLIC AUTH API
  ------------------------------------------------------------------ */
  async function login(usernameOrEmail, password) {
    await ensureAdmin();
    const users = getUsers();
    const hash  = await sha256(password);
    const user  = Object.values(users).find(
      u => (u.username === usernameOrEmail || u.email === usernameOrEmail) && u.passwordHash === hash
    );
    if (!user) throw new Error('Invalid username/email or password.');
    setSession(user);
    return { username: user.username, email: user.email, role: user.role };
  }

  async function register(username, email, password) {
    await ensureAdmin();
    if (!/^[a-zA-Z0-9_-]{2,32}$/.test(username))
      throw new Error('Username must be 2–32 alphanumeric characters (_, - allowed).');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      throw new Error('Please enter a valid email address.');
    if (password.length < 4)
      throw new Error('Password must be at least 4 characters.');
    const users = getUsers();
    if (users[username]) throw new Error('Username already taken.');
    if (Object.values(users).some(u => u.email === email))
      throw new Error('Email already registered.');
    const hash = await sha256(password);
    const user = {
      username, email, passwordHash: hash, role: 'user',
      createdAt: new Date().toISOString(),
      wallet: makeWallet(),
      researchArticles: [],
      conversations: [],
    };
    users[username] = user;
    saveUsers(users);
    setSession(user);
    return { username, email, role: 'user' };
  }

  function logout()      { clearSession(); }
  function currentUser() { return getSession(); }
  function isAdmin()     { const u = getSession(); return u && u.role === 'admin'; }

  /* ------------------------------------------------------------------
     WALLET API
  ------------------------------------------------------------------ */
  function getWallet(username) {
    const users = getUsers();
    if (!users[username]) return null;
    if (!users[username].wallet) users[username].wallet = makeWallet();
    return { ...users[username].wallet };
  }

  /** Add listen time and award 1 ∞TOKEN per completed hour of listening.
   *  Returns the number of new tokens awarded (0 or more). */
  function addListenTime(username, seconds) {
    const users = getUsers();
    if (!users[username]) return 0;
    const w = users[username].wallet || (users[username].wallet = makeWallet());
    w.listenSeconds += seconds;
    const hoursCompleted = Math.floor(w.listenSeconds / 3600);
    const awardedHours = w._awardedHours || 0;
    const newHours = hoursCompleted - awardedHours;
    if (newHours > 0) {
      w.infinityTokens  += newHours;
      w.btcBacking      += newHours * 0.00000001; // notional satoshi per token
      w._awardedHours    = hoursCompleted;
      w.lastTokenAward   = new Date().toISOString();
    }
    users[username].wallet = w;
    saveUsers(users);
    return newHours > 0 ? newHours : 0;
  }

  /** Award game tokens (up to 24 per day). Returns tokens actually awarded. */
  function awardGameTokens(username, amount) {
    const users = getUsers();
    if (!users[username]) return 0;
    const w = users[username].wallet || (users[username].wallet = makeWallet());
    const today = new Date().toISOString().slice(0, 10);
    if (w.lastGameDay !== today) {
      w.dailyGameTokens = 0;
      w.lastGameDay     = today;
    }
    const canAward = Math.min(amount, 24 - w.dailyGameTokens);
    if (canAward <= 0) return 0;
    w.infinityTokens  += canAward;
    w.btcBacking      += canAward * 0.00000001;
    w.dailyGameTokens += canAward;
    users[username].wallet = w;
    saveUsers(users);
    return canAward;
  }

  /** Mint a token manually (e.g. research article generated). */
  function mintToken(username, label) {
    const users = getUsers();
    if (!users[username]) return false;
    const w = users[username].wallet || (users[username].wallet = makeWallet());
    w.infinityTokens += 1;
    w.btcBacking     += 0.00000001;
    users[username].wallet = w;
    saveUsers(users);
    return true;
  }

  /* ------------------------------------------------------------------
     RESEARCH ARTICLE STORE
  ------------------------------------------------------------------ */
  function saveResearchArticle(username, article) {
    const users = getUsers();
    if (!users[username]) return;
    users[username].researchArticles = users[username].researchArticles || [];
    users[username].researchArticles.push({ ...article, savedAt: new Date().toISOString() });
    if (users[username].researchArticles.length > 200)
      users[username].researchArticles = users[username].researchArticles.slice(-200);
    saveUsers(users);
  }

  function getResearchArticles(username) {
    const users = getUsers();
    return (users[username] && users[username].researchArticles) || [];
  }

  /* ------------------------------------------------------------------
     ENCRYPTED CONVERSATIONS
  ------------------------------------------------------------------ */
  async function saveConversation(username, userMsg, aiMsg) {
    const users = getUsers();
    if (!users[username]) return;
    try {
      const seed  = username + '_conv_' + (users[username].createdAt || '');
      const entry = { ts: new Date().toISOString(), user: userMsg, ai: aiMsg };
      const enc   = await encryptData(entry, seed);
      users[username].conversations = users[username].conversations || [];
      users[username].conversations.push({ encryptedAt: entry.ts, data: enc });
      if (users[username].conversations.length > 100)
        users[username].conversations = users[username].conversations.slice(-100);
      saveUsers(users);
    } catch (_) {}
  }

  async function getConversations(username) {
    const users = getUsers();
    const user  = users[username];
    if (!user || !user.conversations || !user.conversations.length) return [];
    const seed = username + '_conv_' + (user.createdAt || '');
    const results = [];
    for (const entry of user.conversations) {
      try {
        results.push(await decryptData(entry.data, seed));
      } catch (_) {
        results.push({ ts: entry.encryptedAt, user: '[encrypted]', ai: '[encrypted]' });
      }
    }
    return results;
  }

  /* ------------------------------------------------------------------
     USER LIST (admin)
  ------------------------------------------------------------------ */
  function getUserList() {
    const users = getUsers();
    return Object.values(users).map(u => ({
      username: u.username, email: u.email, role: u.role,
      createdAt: u.createdAt,
      tokens: u.wallet ? u.wallet.infinityTokens : 0,
      listenHours: u.wallet ? Math.floor(u.wallet.listenSeconds / 3600) : 0,
    }));
  }

  return {
    ensureAdmin, login, register, logout, currentUser, isAdmin,
    getWallet, addListenTime, awardGameTokens, mintToken,
    saveResearchArticle, getResearchArticles,
    saveConversation, getConversations, getUserList,
  };
})();
