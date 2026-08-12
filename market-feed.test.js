const assert = require("node:assert/strict");
const feed = require("./market-feed.js");

class Storage {
  constructor() { this.data = new Map(); }
  getItem(key) { return this.data.has(key) ? this.data.get(key) : null; }
  setItem(key, value) { this.data.set(key, String(value)); }
  removeItem(key) { this.data.delete(key); }
}

const commits = feed.normalizeCommits([{ sha: "abcdef123456", html_url: "https://github.com/example/commit/abcdef", commit: { message: "Real change\nbody", author: { name: "Kris", date: "2026-08-12T00:00:00Z" } } }]);
assert.deepEqual(commits[0], { sha: "abcdef1", message: "Real change", author: "Kris", date: "2026-08-12T00:00:00Z", url: "https://github.com/example/commit/abcdef" });

(async () => {
  const storage = new Storage();
  let commitCalls = 0;
  const commitFetch = async () => {
    commitCalls += 1;
    return { ok: true, json: async () => [{ sha: "123456789", html_url: "https://github.com/example/commit/123", commit: { message: "Commit", author: { name: "Author", date: "2026-08-12T00:00:00Z" } } }] };
  };
  await feed.loadCommits({ storage, fetchImpl: commitFetch, now: 100000 });
  await feed.loadCommits({ storage, fetchImpl: commitFetch, now: 100001 });
  assert.equal(commitCalls, 1, "GitHub endpoint must be called at most once inside 24 hours");
  assert.equal(Object.prototype.hasOwnProperty.call(feed.KEYS, "apiKey"), false, "no API-key configuration may remain");
  console.log("Alien Radio no-key live metals and daily commit feed: ok");
})();
