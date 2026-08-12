(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.AlienMarketFeed = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const DAY_MS = 24 * 60 * 60 * 1000;
  const COMMITS_API = "https://api.github.com/repos/www-infinity4/Alien-Radio/commits?per_page=20";
  const KEYS = {
    commits: "alien-radio-commits-daily-v1",
    commitsAttempt: "alien-radio-commits-attempt-v1"
  };

  function readJSON(storage, key) {
    try { return JSON.parse(storage.getItem(key) || "null"); }
    catch (_) { return null; }
  }

  function fresh(record, now) {
    return !!record && Number.isFinite(record.savedAt) && now - record.savedAt < DAY_MS;
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

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
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

  async function loadCommits(options) {
    const { storage, fetchImpl, now } = options;
    const cached = readJSON(storage, KEYS.commits);
    if (fresh(cached, now)) return { ...cached, source: "daily cache" };
    const lastAttempt = Number(storage.getItem(KEYS.commitsAttempt) || 0);
    if (lastAttempt && now - lastAttempt < DAY_MS) {
      return cached ? { ...cached, source: "stale cache" } : { commits: [], source: "daily request already attempted" };
    }
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
      const commits = await loadCommits({ storage, fetchImpl, now });
      renderCommits(doc, commits.commits, commits.source.toUpperCase());
    } catch (_) {
      const cached = readJSON(storage, KEYS.commits);
      renderCommits(doc, cached && cached.commits, cached ? "STALE COMMIT CACHE" : "GITHUB UNAVAILABLE");
    }
  }

  function init(doc, storage, fetchImpl) {
    const targetDoc = doc || document;
    const targetStorage = storage || localStorage;
    const targetFetch = fetchImpl || fetch.bind(globalThis);
    return refresh(targetDoc, targetStorage, targetFetch);
  }

  return { DAY_MS, KEYS, normalizeCommits, loadCommits, init };
});
