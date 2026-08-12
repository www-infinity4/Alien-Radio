(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.AlienMarketFeed = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (root) {
  "use strict";

  const DAY_MS = 24 * 60 * 60 * 1000;
  const METALS_API = "https://api.metals.dev/v1/latest";
  const COMMITS_API = "https://api.github.com/repos/www-infinity4/Alien-Radio/commits?per_page=20";
  const KEYS = {
    apiKey: "alien-radio-metals-dev-key-v1",
    metals: "alien-radio-metals-daily-v1",
    metalsAttempt: "alien-radio-metals-attempt-v1",
    commits: "alien-radio-commits-daily-v1",
    commitsAttempt: "alien-radio-commits-attempt-v1"
  };
  const METALS = [
    { key: "gold", label: "GOLD", symbol: "Au", unit: "USD/toz", industrial: false },
    { key: "silver", label: "SILVER", symbol: "Ag", unit: "USD/toz", industrial: false },
    { key: "platinum", label: "PLATINUM", symbol: "Pt", unit: "USD/toz", industrial: false },
    { key: "palladium", label: "PALLADIUM", symbol: "Pd", unit: "USD/toz", industrial: false },
    { key: "copper", label: "COPPER", symbol: "Cu", unit: "USD/lb", industrial: true },
    { key: "nickel", label: "NICKEL", symbol: "Ni", unit: "USD/lb", industrial: true },
    { key: "aluminum", label: "ALUMINUM", symbol: "Al", unit: "USD/lb", industrial: true },
    { key: "zinc", label: "ZINC", symbol: "Zn", unit: "USD/lb", industrial: true },
    { key: "lead", label: "LEAD", symbol: "Pb", unit: "USD/lb", industrial: true }
  ];

  function readJSON(storage, key) {
    try { return JSON.parse(storage.getItem(key) || "null"); }
    catch (_) { return null; }
  }

  function fresh(record, now) {
    return !!record && Number.isFinite(record.savedAt) && now - record.savedAt < DAY_MS;
  }

  function normalizeMetalRows(payload) {
    if (!payload || payload.status !== "success" || !payload.metals) throw new Error("Metals.Dev returned no metal prices.");
    return METALS.map((metal) => {
      const raw = Number(payload.metals[metal.key]);
      if (!Number.isFinite(raw) || raw <= 0) return { ...metal, value: null };
      // Metals.Dev is requested in troy ounces. Industrial values are converted
      // to the more familiar avoirdupois pound (14.583333 troy oz per lb).
      const value = metal.industrial ? raw * 14.5833333333 : raw;
      return { ...metal, value };
    });
  }

  function normalizeCommits(payload) {
    if (!Array.isArray(payload)) throw new Error("GitHub returned no commit list.");
    return payload.slice(0, 20).map((item) => ({
      sha: String(item.sha || "").slice(0, 7),
      message: String(item.commit && item.commit.message || "Commit").split("\n")[0],
      author: String(item.commit && item.commit.author && item.commit.author.name || "Unknown"),
      date: String(item.commit && item.commit.author && item.commit.author.date || ""),
      url: String(item.html_url || "")
    })).filter(item => item.sha);
  }

  function money(value, industrial) {
    if (!Number.isFinite(value)) return "UNAVAILABLE";
    return new Intl.NumberFormat("en-US", {
      style: "currency", currency: "USD",
      minimumFractionDigits: industrial ? 3 : 2,
      maximumFractionDigits: industrial ? 4 : 2
    }).format(value);
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  }

  function buildTicker(doc, rows, status) {
    const track = doc.getElementById("ticker-track");
    if (!track) return;
    const sourceRows = rows && rows.length ? rows : METALS.map(metal => ({ ...metal, value: null }));
    const items = [...sourceRows, ...sourceRows];
    track.innerHTML = items.map(row => `
      <span class="ticker-item">
        <span class="ticker-label">${row.symbol} · ${row.label}</span>
        <span class="ticker-value">${money(row.value, row.industrial)}</span>
        <span class="ticker-unit">${row.unit}</span>
      </span>`).join("");
    const badge = doc.getElementById("metals-status");
    if (badge) badge.textContent = status;
  }

  function renderCommits(doc, commits, status) {
    const feed = doc.getElementById("commit-feed");
    const badge = doc.getElementById("commit-status");
    if (badge) badge.textContent = status;
    if (!feed) return;
    if (!commits || !commits.length) {
      feed.innerHTML = '<div class="tx-item"><span class="tx-icon">◈</span><div><div class="tx-action">No verified commits available.</div></div></div>';
      return;
    }
    feed.innerHTML = commits.map(commit => `
      <a class="tx-item commit-item" href="${escapeHTML(commit.url)}" target="_blank" rel="noopener noreferrer">
        <span class="tx-icon">◈</span>
        <div>
          <div class="tx-hash">${escapeHTML(commit.sha)}</div>
          <div class="tx-action">${escapeHTML(commit.message)}</div>
          <div class="tx-value">${escapeHTML(commit.author)} · ${escapeHTML(commit.date ? new Date(commit.date).toLocaleDateString() : "date unavailable")}</div>
        </div>
      </a>`).join("");
  }

  async function loadMetals(options) {
    const { storage, fetchImpl, now, apiKey } = options;
    const cached = readJSON(storage, KEYS.metals);
    if (fresh(cached, now)) return { ...cached, source: "daily cache" };
    const key = apiKey || storage.getItem(KEYS.apiKey) || "";
    if (!key) return cached ? { ...cached, source: "stale cache", needsKey: true } : { rows: [], needsKey: true, source: "API key needed" };
    const lastAttempt = Number(storage.getItem(KEYS.metalsAttempt) || 0);
    if (lastAttempt && now - lastAttempt < DAY_MS) return cached ? { ...cached, source: "stale cache" } : { rows: [], source: "daily request already attempted" };
    storage.setItem(KEYS.metalsAttempt, String(now));
    const url = METALS_API + "?api_key=" + encodeURIComponent(key) + "&currency=USD&unit=toz";
    const response = await fetchImpl(url, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("Metals.Dev request failed (" + response.status + ").");
    const payload = await response.json();
    const record = { rows: normalizeMetalRows(payload), timestamp: payload.timestamp || new Date(now).toISOString(), savedAt: now };
    storage.setItem(KEYS.metals, JSON.stringify(record));
    return { ...record, source: "Metals.Dev daily update" };
  }

  async function loadCommits(options) {
    const { storage, fetchImpl, now } = options;
    const cached = readJSON(storage, KEYS.commits);
    if (fresh(cached, now)) return { ...cached, source: "daily cache" };
    const lastAttempt = Number(storage.getItem(KEYS.commitsAttempt) || 0);
    if (lastAttempt && now - lastAttempt < DAY_MS) return cached ? { ...cached, source: "stale cache" } : { commits: [], source: "daily request already attempted" };
    storage.setItem(KEYS.commitsAttempt, String(now));
    const response = await fetchImpl(COMMITS_API, { headers: { Accept: "application/vnd.github+json" } });
    if (!response.ok) throw new Error("GitHub commit request failed (" + response.status + ").");
    const record = { commits: normalizeCommits(await response.json()), savedAt: now };
    storage.setItem(KEYS.commits, JSON.stringify(record));
    return { ...record, source: "GitHub daily update" };
  }

  async function refresh(doc, storage, fetchImpl) {
    const now = Date.now();
    try {
      const metals = await loadMetals({ storage, fetchImpl, now });
      buildTicker(doc, metals.rows, metals.needsKey ? "SET FREE API KEY" : metals.source.toUpperCase());
    } catch (error) {
      const cached = readJSON(storage, KEYS.metals);
      buildTicker(doc, cached && cached.rows, cached ? "STALE METALS CACHE" : "METALS UNAVAILABLE");
    }
    try {
      const commits = await loadCommits({ storage, fetchImpl, now });
      renderCommits(doc, commits.commits, commits.source.toUpperCase());
    } catch (error) {
      const cached = readJSON(storage, KEYS.commits);
      renderCommits(doc, cached && cached.commits, cached ? "STALE COMMIT CACHE" : "GITHUB UNAVAILABLE");
    }
  }

  function configureKey(doc, storage, fetchImpl) {
    const button = doc.getElementById("metals-api-config");
    if (!button) return;
    button.addEventListener("click", async () => {
      const current = storage.getItem(KEYS.apiKey) || "";
      const entered = root.prompt("Enter your free Metals.Dev API key. It stays in this browser and is never committed to GitHub.", current);
      if (entered === null) return;
      const key = entered.trim();
      if (key) storage.setItem(KEYS.apiKey, key); else storage.removeItem(KEYS.apiKey);
      storage.removeItem(KEYS.metalsAttempt);
      storage.removeItem(KEYS.metals);
      await refresh(doc, storage, fetchImpl);
    });
  }

  function init(doc, storage, fetchImpl) {
    const targetDoc = doc || root.document;
    const targetStorage = storage || root.localStorage;
    const targetFetch = fetchImpl || root.fetch.bind(root);
    configureKey(targetDoc, targetStorage, targetFetch);
    return refresh(targetDoc, targetStorage, targetFetch);
  }

  return { DAY_MS, KEYS, METALS, normalizeMetalRows, normalizeCommits, loadMetals, loadCommits, init };
});
