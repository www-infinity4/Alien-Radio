const assert = require("node:assert/strict");
const feed = require("./market-feed.js");

class Storage {
  constructor() { this.data = new Map(); }
  getItem(key) { return this.data.has(key) ? this.data.get(key) : null; }
  setItem(key, value) { this.data.set(key, String(value)); }
  removeItem(key) { this.data.delete(key); }
}

const rows = feed.normalizeMetalRows({
  status: "success",
  metals: { gold: 2000, silver: 25, platinum: 1000, palladium: 1100, copper: 0.25, nickel: 0.6, aluminum: 0.07, zinc: 0.08, lead: 0.06 }
});
assert.equal(rows.length, 9);
assert.equal(rows.find(row => row.key === "gold").value, 2000);
assert.ok(Math.abs(rows.find(row => row.key === "copper").value - 3.645833333325) < 0.000001);

const commits = feed.normalizeCommits([{ sha: "abcdef123456", html_url: "https://github.com/example/commit/abcdef", commit: { message: "Real change\nbody", author: { name: "Kris", date: "2026-08-12T00:00:00Z" } } }]);
assert.deepEqual(commits[0], { sha: "abcdef1", message: "Real change", author: "Kris", date: "2026-08-12T00:00:00Z", url: "https://github.com/example/commit/abcdef" });

(async () => {
  const storage = new Storage();
  storage.setItem(feed.KEYS.apiKey, "local-only-key");
  let metalCalls = 0;
  const metalFetch = async () => {
    metalCalls += 1;
    return { ok: true, json: async () => ({ status: "success", timestamp: "2026-08-12T00:00:00Z", metals: Object.fromEntries(feed.METALS.map(item => [item.key, 1])) }) };
  };
  await feed.loadMetals({ storage, fetchImpl: metalFetch, now: 100000 });
  await feed.loadMetals({ storage, fetchImpl: metalFetch, now: 100001 });
  assert.equal(metalCalls, 1, "metals endpoint must be called at most once inside 24 hours");

  let commitCalls = 0;
  const commitFetch = async () => {
    commitCalls += 1;
    return { ok: true, json: async () => [{ sha: "123456789", html_url: "https://github.com/example/commit/123", commit: { message: "Commit", author: { name: "Author", date: "2026-08-12T00:00:00Z" } } }] };
  };
  await feed.loadCommits({ storage, fetchImpl: commitFetch, now: 100000 });
  await feed.loadCommits({ storage, fetchImpl: commitFetch, now: 100001 });
  assert.equal(commitCalls, 1, "GitHub endpoint must be called at most once inside 24 hours");
  console.log("Alien Radio metals and commit feeds: ok");
})();
