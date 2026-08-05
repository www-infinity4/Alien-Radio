/* Alien Radio — live Bitcoin Harvest adapters
 * Read-only browser prototype. Production writes and rewards must be server-signed.
 */
'use strict';

const HARVEST_CONFIG = {
  githubOwner: 'www-infinity4',
  repositories: [
    'Gitflow', 'Gitpin', 'GP', 'Gitpro', 'Gitpub', 'Git-Stream',
    'Bitcoin-Crusher', 'Alien-Coin', 'TV-Database', 'Infinity-Graphics',
    '3d-world', 'Image-Generator', 'Alien-Radio'
  ],
  refreshMs: 5 * 60 * 1000,
  bitcoinEndpoints: {
    price: 'https://api.coindesk.com/v1/bpi/currentprice/USD.json',
    mempool: 'https://mempool.space/api/mempool',
    fees: 'https://mempool.space/api/v1/fees/recommended',
    tipHeight: 'https://mempool.space/api/blocks/tip/height'
  }
};

const HarvestBus = new EventTarget();

function emitHarvest(type, detail) {
  HarvestBus.dispatchEvent(new CustomEvent(type, { detail }));
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { Accept: 'application/json', ...(options.headers || {}) }
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

async function scanRepository(repo) {
  const base = `https://api.github.com/repos/${HARVEST_CONFIG.githubOwner}/${repo}`;
  const [metadata, commits] = await Promise.all([
    fetchJson(base),
    fetchJson(`${base}/commits?per_page=5`)
  ]);

  return {
    id: repo.toLowerCase(),
    name: repo,
    url: metadata.html_url,
    defaultBranch: metadata.default_branch,
    stars: metadata.stargazers_count,
    forks: metadata.forks_count,
    openIssues: metadata.open_issues_count,
    sizeKb: metadata.size,
    updatedAt: metadata.updated_at,
    pushedAt: metadata.pushed_at,
    latestCommits: commits.map(item => ({
      sha: item.sha.slice(0, 7),
      message: item.commit.message.split('\n')[0],
      author: item.commit.author?.name || 'Unknown',
      date: item.commit.author?.date || null,
      url: item.html_url
    }))
  };
}

async function scanGpSuite() {
  const settled = await Promise.allSettled(
    HARVEST_CONFIG.repositories.map(scanRepository)
  );

  const repositories = [];
  const failures = [];
  settled.forEach((result, index) => {
    if (result.status === 'fulfilled') repositories.push(result.value);
    else failures.push({
      repository: HARVEST_CONFIG.repositories[index],
      error: result.reason?.message || 'Unknown scan error'
    });
  });

  const snapshot = {
    scannedAt: new Date().toISOString(),
    repositories,
    failures,
    totals: repositories.reduce((totals, repo) => ({
      stars: totals.stars + repo.stars,
      forks: totals.forks + repo.forks,
      openIssues: totals.openIssues + repo.openIssues,
      sizeKb: totals.sizeKb + repo.sizeKb
    }), { stars: 0, forks: 0, openIssues: 0, sizeKb: 0 })
  };

  emitHarvest('gp-suite-snapshot', snapshot);
  return snapshot;
}

async function scanBitcoinNetwork() {
  const [mempool, fees, tipHeight] = await Promise.all([
    fetchJson(HARVEST_CONFIG.bitcoinEndpoints.mempool),
    fetchJson(HARVEST_CONFIG.bitcoinEndpoints.fees),
    fetchJson(HARVEST_CONFIG.bitcoinEndpoints.tipHeight)
  ]);

  const snapshot = {
    scannedAt: new Date().toISOString(),
    mempoolCount: mempool.count,
    mempoolVsize: mempool.vsize,
    totalFeesSats: mempool.total_fee,
    fastestFee: fees.fastestFee,
    halfHourFee: fees.halfHourFee,
    hourFee: fees.hourFee,
    economyFee: fees.economyFee,
    minimumFee: fees.minimumFee,
    tipHeight
  };

  emitHarvest('bitcoin-network-snapshot', snapshot);
  return snapshot;
}

function recordInteraction(action, metadata = {}) {
  const event = {
    eventId: crypto.randomUUID(),
    action,
    metadata,
    occurredAt: new Date().toISOString(),
    status: 'observed',
    reward: null
  };

  const key = 'alien_radio_harvest_events_v1';
  const previous = JSON.parse(localStorage.getItem(key) || '[]');
  previous.unshift(event);
  localStorage.setItem(key, JSON.stringify(previous.slice(0, 500)));
  emitHarvest('interaction-recorded', event);
  return event;
}

async function runHarvestScan() {
  const startedAt = Date.now();
  const results = await Promise.allSettled([scanGpSuite(), scanBitcoinNetwork()]);
  const result = {
    completedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    github: results[0].status === 'fulfilled' ? results[0].value : null,
    bitcoin: results[1].status === 'fulfilled' ? results[1].value : null,
    errors: results
      .filter(item => item.status === 'rejected')
      .map(item => item.reason?.message || 'Unknown scan error')
  };
  emitHarvest('harvest-complete', result);
  return result;
}

window.AlienHarvest = {
  config: HARVEST_CONFIG,
  bus: HarvestBus,
  scanRepository,
  scanGpSuite,
  scanBitcoinNetwork,
  recordInteraction,
  runHarvestScan
};
