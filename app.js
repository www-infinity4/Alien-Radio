/* ================================================================
   ALIEN RADIO — Application Logic
   ================================================================ */

'use strict';

/* ── Channel Data ──
   streamUrl: live internet radio stream (SomaFM / Intergalactic FM / Radio Paradise)
   synthType: fallback Web Audio synth profile key if the stream cannot be loaded
── */
const CHANNELS = [
  {
    id: 1,  name: 'ANDROMEDA',     freq: '88.1',  color: '#00fff7', signal: 92,
    genre: 'Deep Space Ambient · SomaFM Drone Zone',
    streamUrl: 'https://ice1.somafm.com/dronezone-128-mp3',
    synthType: 'spaceHum',
  },
  {
    id: 2,  name: 'NEBULA-7',      freq: '91.5',  color: '#cc44ff', signal: 87,
    genre: 'Space Station Soma · SomaFM',
    streamUrl: 'https://ice1.somafm.com/spacestation-128-mp3',
    synthType: 'cosmicPad',
  },
  {
    id: 3,  name: 'PULSAR BEAT',   freq: '94.3',  color: '#00ff88', signal: 78,
    genre: 'Groove Salad · SomaFM Chill',
    streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3',
    synthType: 'pulsarBeat',
  },
  {
    id: 4,  name: 'ZETA WAVE',     freq: '97.7',  color: '#ff8800', signal: 95,
    genre: 'Beat Blender · SomaFM Electronic',
    streamUrl: 'https://ice1.somafm.com/beatblender-128-mp3',
    synthType: 'ionStorm',
  },
  {
    id: 5,  name: 'VOID SIGNAL',   freq: '101.1', color: '#0088ff', signal: 65,
    genre: 'Mission Control · SomaFM',
    streamUrl: 'https://ice1.somafm.com/missioncontrol-128-mp3',
    synthType: 'voidDrone',
  },
  {
    id: 6,  name: 'SOLAR DRIFT',   freq: '104.5', color: '#ff2244', signal: 83,
    genre: 'Fluid · SomaFM Ambient IDM',
    streamUrl: 'https://ice1.somafm.com/fluid-128-mp3',
    synthType: 'solarDrift',
  },
  {
    id: 7,  name: 'QUANTUM FOLD',  freq: '107.9', color: '#ffe600', signal: 71,
    genre: 'Lush · SomaFM Chilled Beats',
    streamUrl: 'https://ice1.somafm.com/lush-128-mp3',
    synthType: 'quantumFM',
  },
  {
    id: 8,  name: 'HYPERDRIVE FM', freq: '110.3', color: '#cc44ff', signal: 89,
    genre: 'Suburbs of Goa · SomaFM Psytrance',
    streamUrl: 'https://ice1.somafm.com/suburbsofgoa-128-mp3',
    synthType: 'hyperFM',
  },
  {
    id: 9,  name: 'STARGAZE',      freq: '113.7', color: '#ff66aa', signal: 76,
    genre: 'Digitalis · SomaFM Indie Electronic',
    streamUrl: 'https://ice1.somafm.com/digitalis-128-mp3',
    synthType: 'cosmicPad',
  },
  {
    id: 10, name: 'WARP CORE',     freq: '116.1', color: '#44ffcc', signal: 88,
    genre: 'Deep Space One · SomaFM Electro',
    streamUrl: 'https://ice1.somafm.com/deepspaceone-128-mp3',
    synthType: 'quantumFM',
  },
  {
    id: 11, name: 'INTERGALACTIC', freq: '119.5', color: '#ff4400', signal: 94,
    genre: 'Intergalactic FM · Electronic / Techno',
    streamUrl: 'https://listen.intergalactic.fm/main.mp3',
    synthType: 'hyperFM',
  },
  {
    id: 12, name: 'DARK MATTER',   freq: '122.0', color: '#8844ff', signal: 61,
    genre: 'Radio Paradise Mellow Mix · Ambient',
    streamUrl: 'https://stream.radioparadise.com/mellow-320',
    synthType: 'voidDrone',
  },
];

/* ── GP Suite AI Entities ── */
const AI_AGENTS = [
  { id: 'gitflow',  symbol: '≋', name: 'Gitflow',  role: 'Streamliner', status: 'Synchronizing momentum…', color: '#00fff7' },
  { id: 'gitpulse', symbol: '♥', name: 'Gitpulse', role: 'Diagnostic',  status: 'Monitoring Erythmia…',    color: '#ff2244' },
  { id: 'gitarch',  symbol: '🏛', name: 'Gitarch',  role: 'Architect',   status: 'Restructuring nodes…',    color: '#ff8800' },
  { id: 'gitsync',  symbol: '⟲', name: 'Gitsync',  role: 'Harmonizer',  status: 'Re-integrating rhythms…', color: '#00ff88' },
  { id: 'gitscan',  symbol: '◈', name: 'Gitscan',  role: 'Sentry',      status: 'Scanning cauldron…',      color: '#cc44ff' },
  { id: 'gitpin',   symbol: '∆', name: 'Gitpin',   role: 'Triangulator',status: 'Mapping spatial field…',  color: '#0088ff' },
];

/* ── BTC Ticker Items ── */
const TICKER_BASE = [
  { label: 'BTC/USD',  value: '$67,420.00', delta: '+2.14%', up: true  },
  { label: 'ETH/USD',  value: '$3,512.88',  delta: '+1.07%', up: true  },
  { label: 'SAT/TX',   value: '24 sat/vB',  delta: '−3.50%', up: false },
  { label: 'MEMPOOL',  value: '148,923 tx', delta: '+8.20%', up: true  },
  { label: 'HASHRATE', value: '642 EH/s',   delta: '+0.95%', up: true  },
  { label: 'BLOCKS',   value: '847,291',    delta: '+1',     up: true  },
  { label: 'FEES',     value: '0.00024 BTC', delta: '−1.10%', up: false },
];

/* ── BTC Transaction Log ── */
const TX_TEMPLATES = [
  { icon: '⚡', action: 'Channel tuned',      value: () => `+${(Math.random()*0.0001).toFixed(6)} BTC` },
  { icon: '📡', action: 'Signal acquired',    value: () => `+${(Math.random()*0.00005).toFixed(6)} BTC` },
  { icon: '🎵', action: 'Track streamed',     value: () => `+${(Math.random()*0.00002).toFixed(6)} BTC` },
  { icon: '🔬', action: 'AI scan complete',   value: () => `+${(Math.random()*0.00008).toFixed(6)} BTC` },
  { icon: '💎', action: 'Intent harvested',   value: () => `+${(Math.random()*0.0003).toFixed(6)} BTC` },
  { icon: '⚙️',  action: 'Giro pulse fired',   value: () => `+${(Math.random()*0.0001).toFixed(6)} BTC` },
];

/* ── App State ── */
const state = {
  activeChannel: 0,
  isPlaying: false,
  isScanning: false,
  volume: 72,
  visType: 'bars',   // bars | wave | circle
  animFrame: null,
  scanInterval: null,
  txInterval: null,
  btcTotal: 0.00000000,
};

/* ── Helpers ── */
function randomHash() {
  const chars = '0123456789abcdef';
  let h = '';
  for (let i = 0; i < 16; i++) h += chars[Math.floor(Math.random() * 16)];
  return h;
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function showToast(msg, icon = '📡') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span class="toast-icon">${icon}</span>${msg}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3100);
}

/* ── Clock ── */
function updateClock() {
  const el = document.getElementById('header-time');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleTimeString('en-US', { hour12: false }) + ' UTC';
}

/* ── Build Ticker ── */
function buildTicker() {
  const track = document.getElementById('ticker-track');
  if (!track) return;
  // Duplicate for seamless loop
  const items = [...TICKER_BASE, ...TICKER_BASE];
  track.innerHTML = items.map(t => `
    <span class="ticker-item">
      <span class="ticker-label">${t.label}</span>
      <span class="ticker-value">${t.value}</span>
      <span class="${t.up ? 'ticker-up' : 'ticker-down'}">${t.delta}</span>
    </span>
  `).join('');
}

/* ── Build Channel List ── */
function buildChannelList() {
  const list = document.getElementById('channel-list');
  if (!list) return;
  list.innerHTML = CHANNELS.map((ch, idx) => `
    <li class="channel-item ${idx === state.activeChannel ? 'active' : ''}"
        data-idx="${idx}"
        onclick="selectChannel(${idx})">
      <span class="ch-num">${String(ch.id).padStart(2, '0')}</span>
      <span class="ch-dot" style="background:${ch.color}; box-shadow: 0 0 6px ${ch.color};"></span>
      <span class="ch-info">
        <div class="ch-name">${ch.name}</div>
        <div class="ch-freq">${ch.freq} MHz</div>
      </span>
      <span class="ch-sig text-dim">${ch.signal}%</span>
    </li>
  `).join('');
}

/* ── Select Channel ── */
function selectChannel(idx) {
  state.activeChannel = idx;
  const ch = CHANNELS[idx];

  // Update display
  document.getElementById('freq-display').textContent = ch.freq;
  document.getElementById('channel-name').textContent = ch.name;
  document.getElementById('np-channel').textContent   = ch.genre;
  document.getElementById('np-title').textContent     = ch.name + ' BROADCAST';
  document.getElementById('np-artist').textContent    = 'Deep Space Network · Alien Radio';

  // Signal bars
  updateSignalBars(ch.signal);

  // Rebuild channel list highlight
  document.querySelectorAll('.channel-item').forEach((el, i) => {
    el.classList.toggle('active', i === idx);
  });

  // Auto-play / switch audio
  if (!state.isPlaying) {
    togglePlay();
  } else {
    startAudio(idx);
  }

  // Log transaction
  addTx({ icon: '⚡', action: `Tuned to ${ch.name}`, value: `+${(Math.random()*0.0001).toFixed(6)} BTC` });
  showToast(`Locked onto ${ch.name} · ${ch.freq} MHz`, '📡');
}

/* ── Signal Bars ── */
function updateSignalBars(pct) {
  const bars = document.querySelectorAll('.sig-bar');
  const active = Math.round((pct / 100) * bars.length);
  bars.forEach((b, i) => b.classList.toggle('active', i < active));

  // Sig meter
  const meter = document.getElementById('sig-meter-signal');
  if (meter) { meter.style.width = pct + '%'; }
}

/* ── Toggle Play ── */
function togglePlay() {
  state.isPlaying = !state.isPlaying;
  const btn  = document.getElementById('play-btn');
  const art  = document.getElementById('np-art');
  if (btn) btn.textContent = state.isPlaying ? '⏸' : '▶';
  if (art) art.classList.toggle('playing', state.isPlaying);
  if (state.isPlaying) {
    startAudio(state.activeChannel);
    startVisualizer();
    addTx({ icon: '🎵', action: 'Stream started', value: `+${(Math.random()*0.00002).toFixed(6)} BTC` });
  } else {
    stopAudio();
    stopVisualizer();
  }
}

/* ── Auto Scan ── */
function toggleScan() {
  state.isScanning = !state.isScanning;
  const btn = document.getElementById('scan-btn');
  if (btn) btn.classList.toggle('active', state.isScanning);

  if (state.isScanning) {
    showToast('Channel scan initiated…', '🔍');
    state.scanInterval = setInterval(() => {
      const next = (state.activeChannel + 1) % CHANNELS.length;
      selectChannel(next);
    }, 3500);
  } else {
    clearInterval(state.scanInterval);
    showToast('Scan stopped', '⏹');
  }
}

/* ── Web Audio Engine ── */
let audioCtx       = null;
let analyserNode   = null;
let masterGainNode = null;
let activeAudioNodes = [];
let fftBuffer      = null;

// Active HTML5 stream element (null when using synth fallback)
let streamAudioEl  = null;
let streamMediaSrc = null;

// Synth profiles — keyed by synthType (used as fallback when stream fails)
const SYNTH_PROFILES = {
  spaceHum:   { baseFreq: 55,  lfoRate: 0.3, filterFreq: 800  },
  cosmicPad:  { baseFreq: 110, lfoRate: 0.5, filterFreq: 1200 },
  pulsarBeat: { baseFreq: 80,  lfoRate: 2.0, filterFreq: 600  },
  ionStorm:   { baseFreq: 200, lfoRate: 0.8, filterFreq: 2000 },
  voidDrone:  { baseFreq: 30,  lfoRate: 0.1, filterFreq: 400  },
  solarDrift: { baseFreq: 220, lfoRate: 0.6, filterFreq: 3000 },
  quantumFM:  { baseFreq: 140, lfoRate: 1.2, filterFreq: 1500 },
  hyperFM:    { baseFreq: 180, lfoRate: 3.0, filterFreq: 2500 },
};

function ensureAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = 128;
    analyserNode.smoothingTimeConstant = 0.8;
    fftBuffer = new Uint8Array(analyserNode.frequencyBinCount);
    masterGainNode = audioCtx.createGain();
    masterGainNode.gain.value = state.volume / 100;
    analyserNode.connect(masterGainNode);
    masterGainNode.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

function stopAudio() {
  // Stop HTML5 stream
  if (streamAudioEl) {
    streamAudioEl.pause();
    streamAudioEl.src = '';
    streamAudioEl = null;
  }
  if (streamMediaSrc) {
    try { streamMediaSrc.disconnect(); } catch (e) {}
    streamMediaSrc = null;
  }
  // Stop synth nodes
  activeAudioNodes.forEach(node => {
    try { if (node.stop) node.stop(0); } catch (e) {}
    try { node.disconnect(); } catch (e) {}
  });
  activeAudioNodes = [];
}

function startAudio(channelIdx) {
  stopAudio();
  ensureAudioContext();
  const ch = CHANNELS[channelIdx] || CHANNELS[0];
  if (ch.streamUrl) {
    startStream(ch.streamUrl, ch.synthType || 'spaceHum');
  } else {
    startSynth(ch.synthType || 'spaceHum');
  }
}

function startStream(url, fallbackSynthType) {
  const el = new Audio();
  el.crossOrigin = 'anonymous';
  el.preload = 'none';
  el.src = url;
  streamAudioEl = el;

  el.addEventListener('canplay', () => {
    // Guard: ignore stale events if the user already switched to another channel
    if (el !== streamAudioEl) return;
    ensureAudioContext();
    if (!streamMediaSrc) {
      streamMediaSrc = audioCtx.createMediaElementSource(el);
      streamMediaSrc.connect(analyserNode);
    }
    el.play().catch(err => {
      if (err.name === 'NotAllowedError') {
        showToast('Click play to start stream (autoplay blocked)', '🔇');
      }
    });
  }, { once: true });

  el.addEventListener('error', () => {
    // Guard: ignore stale events from a previously replaced stream element
    if (el !== streamAudioEl) return;
    streamAudioEl = null;
    startSynth(fallbackSynthType);
    showToast(`Stream unavailable (${url.split('/').pop()}) · using synth`, '🎛');
  }, { once: true });

  el.load();
}

function startSynth(synthType) {
  const profile = SYNTH_PROFILES[synthType] || SYNTH_PROFILES.spaceHum;
  const dest = analyserNode;
  const builders = {
    spaceHum:   () => buildSpaceHum(profile, dest),
    cosmicPad:  () => buildCosmicPad(profile, dest),
    pulsarBeat: () => buildPulsarBeat(profile, dest),
    ionStorm:   () => buildIonStorm(profile, dest),
    voidDrone:  () => buildVoidDrone(profile, dest),
    solarDrift: () => buildSolarDrift(profile, dest),
    quantumFM:  () => buildQuantumFM(profile, dest),
    hyperFM:    () => buildHyperFM(profile, dest),
  };
  (builders[synthType] || builders.spaceHum)();
}

// Node factory helpers
function mkOsc(type, freq, detune = 0) {
  const osc = audioCtx.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  if (detune) osc.detune.value = detune;
  activeAudioNodes.push(osc);
  return osc;
}
function mkGain(val) {
  const g = audioCtx.createGain();
  g.gain.value = val;
  activeAudioNodes.push(g);
  return g;
}
function mkFilter(type, freq, q = 1) {
  const f = audioCtx.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  activeAudioNodes.push(f);
  return f;
}
function mkNoise(gainVal = 0.1) {
  const bufSize = audioCtx.sampleRate * 2;
  const buffer  = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
  const data    = buffer.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
  const src = audioCtx.createBufferSource();
  src.buffer = buffer;
  src.loop   = true;
  const g = mkGain(gainVal);
  src.connect(g);
  activeAudioNodes.push(src);
  return { src, gain: g };
}

// ANDROMEDA — deep-space hum: detuned sine cluster + slow tremolo
function buildSpaceHum({ baseFreq, lfoRate }, dest) {
  const masterG = mkGain(0.4);
  masterG.connect(dest);
  for (let i = 0; i < 5; i++) {
    const osc = mkOsc('sine', baseFreq * (1 + i * 0.5), (Math.random() - 0.5) * 15);
    const g   = mkGain(0.08 / (i + 1));
    osc.connect(g); g.connect(masterG); osc.start();
  }
  const lfo  = mkOsc('sine', lfoRate);
  const lfoG = mkGain(0.15);
  lfo.connect(lfoG); lfoG.connect(masterG.gain); lfo.start();
  const { src: noise, gain: noiseGain } = mkNoise(0.05);
  const lp = mkFilter('lowpass', 200, 2);
  noiseGain.connect(lp); lp.connect(masterG); noise.start();
}

// NEBULA-7 — cosmic pad: sawtooth stack through slow filter sweep
function buildCosmicPad({ baseFreq, lfoRate, filterFreq }, dest) {
  const masterG = mkGain(0.3);
  masterG.connect(dest);
  const filter = mkFilter('lowpass', filterFreq, 3);
  filter.connect(masterG);
  const lfoF  = mkOsc('sine', lfoRate * 0.3);
  const lfoFG = mkGain(filterFreq * 0.5);
  lfoF.connect(lfoFG); lfoFG.connect(filter.frequency); lfoF.start();
  for (let i = 0; i < 4; i++) {
    const osc = mkOsc('sawtooth', baseFreq * (i + 1), i % 2 === 0 ? 10 : -10);
    const g   = mkGain(0.06 / (i + 1));
    osc.connect(g); g.connect(filter); osc.start();
  }
  const shimmer = mkOsc('triangle', baseFreq * 7.1);
  const shimG   = mkGain(0.02);
  shimmer.connect(shimG); shimG.connect(filter); shimmer.start();
}

// PULSAR BEAT — rhythmic square pulse + noise sweep
function buildPulsarBeat({ baseFreq, lfoRate }, dest) {
  const masterG = mkGain(0.5);
  masterG.connect(dest);
  const osc    = mkOsc('square', baseFreq);
  const filter = mkFilter('bandpass', baseFreq * 2, 5);
  const g      = mkGain(0.0);
  osc.connect(filter); filter.connect(g); g.connect(masterG); osc.start();
  const lfo  = mkOsc('square', lfoRate);
  const lfoG = mkGain(0.15);
  lfo.connect(lfoG); lfoG.connect(g.gain); lfo.start();
  const sub  = mkOsc('sine', baseFreq * 0.5);
  const subG = mkGain(0.1);
  sub.connect(subG); subG.connect(masterG); sub.start();
  const { src: noise, gain: noiseGain } = mkNoise(0.08);
  const bp = mkFilter('bandpass', 1000, 8);
  noiseGain.connect(bp); bp.connect(masterG); noise.start();
  const sweepLFO  = mkOsc('sine', 0.4);
  const sweepLFOG = mkGain(800);
  sweepLFO.connect(sweepLFOG); sweepLFOG.connect(bp.frequency); sweepLFO.start();
}

// ZETA WAVE — ion storm: multi-band noise with independent sweeps
function buildIonStorm(_profile, dest) {
  const masterG = mkGain(0.4);
  masterG.connect(dest);
  [200, 500, 1200, 3000].forEach((freq, i) => {
    const { src: noise, gain: noiseGain } = mkNoise(0.08);
    const bp   = mkFilter('bandpass', freq, 4 + i);
    noiseGain.connect(bp); bp.connect(masterG);
    const lfo  = mkOsc('sine', 0.1 + i * 0.15);
    const lfoG = mkGain(freq * 0.4);
    lfo.connect(lfoG); lfoG.connect(bp.frequency); lfo.start(); noise.start();
  });
  const { src: crackle, gain: crackleGain } = mkNoise(0.2);
  const hp = mkFilter('highpass', 2000, 1);
  crackleGain.connect(hp); hp.connect(masterG); crackle.start();
}

// VOID SIGNAL — ultra-deep drone with very slow beating
function buildVoidDrone({ baseFreq, lfoRate }, dest) {
  const masterG = mkGain(0.5);
  masterG.connect(dest);
  for (let i = 0; i < 3; i++) {
    const osc = mkOsc('sine', baseFreq + i * 7, (Math.random() - 0.5) * 8);
    const g   = mkGain(0.12);
    osc.connect(g); g.connect(masterG); osc.start();
  }
  const lfo  = mkOsc('sine', lfoRate);
  const lfoG = mkGain(0.2);
  lfo.connect(lfoG); lfoG.connect(masterG.gain); lfo.start();
  const { src: noise, gain: noiseGain } = mkNoise(0.1);
  const lp = mkFilter('lowpass', 100, 2);
  noiseGain.connect(lp); lp.connect(masterG); noise.start();
}

// SOLAR DRIFT — shimmering harmonic series with high-register noise
function buildSolarDrift({ baseFreq, lfoRate, filterFreq }, dest) {
  const masterG = mkGain(0.3);
  masterG.connect(dest);
  const filter = mkFilter('highpass', 400, 1);
  filter.connect(masterG);
  for (let i = 1; i <= 6; i++) {
    const osc = mkOsc('triangle', baseFreq * i, (Math.random() - 0.5) * 25);
    const g   = mkGain(0.05 / i);
    osc.connect(g); g.connect(filter); osc.start();
  }
  const lfo  = mkOsc('sine', lfoRate);
  const lfoG = mkGain(0.1);
  lfo.connect(lfoG); lfoG.connect(masterG.gain); lfo.start();
  const { src: noise, gain: noiseGain } = mkNoise(0.04);
  const hp = mkFilter('highpass', filterFreq * 0.5, 3);
  noiseGain.connect(hp); hp.connect(filter); noise.start();
}

// QUANTUM FOLD — FM synthesis with evolving modulation index
function buildQuantumFM({ baseFreq, lfoRate }, dest) {
  const masterG = mkGain(0.35);
  masterG.connect(dest);
  const carrier   = mkOsc('sine', baseFreq);
  const modulator = mkOsc('sine', baseFreq * 2.1);
  const modGain   = mkGain(baseFreq * 3);
  const carrierG  = mkGain(0.15);
  modulator.connect(modGain); modGain.connect(carrier.frequency);
  carrier.connect(carrierG); carrierG.connect(masterG);
  carrier.start(); modulator.start();
  const carrier2   = mkOsc('sine', baseFreq * 1.5);
  const modulator2 = mkOsc('sine', baseFreq * 3.7);
  const modGain2   = mkGain(baseFreq * 1.5);
  const carrier2G  = mkGain(0.08);
  modulator2.connect(modGain2); modGain2.connect(carrier2.frequency);
  carrier2.connect(carrier2G); carrier2G.connect(masterG);
  carrier2.start(); modulator2.start();
  const lfo  = mkOsc('sine', lfoRate * 0.2);
  const lfoG = mkGain(baseFreq * 2);
  lfo.connect(lfoG); lfoG.connect(modGain.gain); lfo.start();
}

// HYPERDRIVE FM — chaotic multi-pair FM with warp noise
function buildHyperFM({ baseFreq, lfoRate }, dest) {
  const masterG = mkGain(0.35);
  masterG.connect(dest);
  [
    { cFreq: baseFreq,        mRatio: 1.41, modIdx: 4 },
    { cFreq: baseFreq * 1.25, mRatio: 2.5,  modIdx: 2 },
    { cFreq: baseFreq * 0.75, mRatio: 3.14, modIdx: 6 },
  ].forEach(p => {
    const carrier   = mkOsc('sine', p.cFreq);
    const modulator = mkOsc('sine', p.cFreq * p.mRatio);
    const modGain   = mkGain(p.cFreq * p.modIdx);
    const carrierG  = mkGain(0.08);
    modulator.connect(modGain); modGain.connect(carrier.frequency);
    carrier.connect(carrierG); carrierG.connect(masterG);
    carrier.start(); modulator.start();
  });
  const lfo  = mkOsc('triangle', lfoRate);
  const lfoG = mkGain(0.2);
  lfo.connect(lfoG); lfoG.connect(masterG.gain); lfo.start();
  const { src: noise, gain: noiseGain } = mkNoise(0.06);
  const bp = mkFilter('bandpass', 800, 5);
  noiseGain.connect(bp); bp.connect(masterG); noise.start();
}

/* ── Visualizer ── */
let visData = new Array(64).fill(0);

function startVisualizer() {
  if (state.animFrame) return;
  const canvas = document.getElementById('visualizer');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function animate() {
    const W = canvas.width  = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);

    // Use real FFT data when audio is playing, otherwise idle animation
    if (analyserNode && state.isPlaying && fftBuffer) {
      analyserNode.getByteFrequencyData(fftBuffer);
      visData = visData.map((v, i) => {
        const target = fftBuffer[i] / 255;
        return v + (target - v) * 0.15;
      });
    } else {
      visData = visData.map((v, i) => {
        const target = state.isPlaying
          ? Math.random() * 0.8 + 0.05 + Math.sin(i * 0.3 + Date.now() * 0.003) * 0.2
          : Math.random() * 0.04;
        return v + (target - v) * 0.12;
      });
    }

    drawVisualizer(ctx, W, H, visData, state.visType);
    state.animFrame = requestAnimationFrame(animate);
  }
  animate();
}

function stopVisualizer() {
  cancelAnimationFrame(state.animFrame);
  state.animFrame = null;
}

function drawVisualizer(ctx, W, H, data, type) {
  const ch = CHANNELS[state.activeChannel];
  const baseColor = ch ? ch.color : '#00fff7';

  ctx.save();

  if (type === 'bars') {
    const barW = (W / data.length) * 0.65;
    const gap  = (W / data.length) * 0.35;
    data.forEach((v, i) => {
      const h = v * H * 0.85;
      const x = i * (barW + gap);
      const alpha = 0.3 + v * 0.7;

      const gradient = ctx.createLinearGradient(0, H - h, 0, H);
      gradient.addColorStop(0, baseColor + 'ff');
      gradient.addColorStop(1, baseColor + '22');

      ctx.fillStyle = gradient;
      ctx.shadowColor = baseColor;
      ctx.shadowBlur  = 8 * v;
      ctx.fillRect(x, H - h, barW, h);
    });
  } else if (type === 'wave') {
    ctx.beginPath();
    ctx.moveTo(0, H / 2);
    const step = W / (data.length - 1);
    data.forEach((v, i) => {
      const x = i * step;
      const y = H / 2 + (v - 0.5) * H * 0.75 * (state.isPlaying ? 1 : 0.1);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = baseColor;
    ctx.lineWidth = 2;
    ctx.shadowColor = baseColor;
    ctx.shadowBlur = 10;
    ctx.stroke();

    // Mirror
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = i * step;
      const y = H / 2 - (v - 0.5) * H * 0.75 * (state.isPlaying ? 0.5 : 0.05);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = baseColor + '44';
    ctx.lineWidth = 1;
    ctx.stroke();
  } else if (type === 'circle') {
    const cx = W / 2;
    const cy = H / 2;
    const r  = Math.min(W, H) * 0.28;

    // Base circle
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = baseColor + '22';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Radial bars
    const step = (Math.PI * 2) / data.length;
    data.forEach((v, i) => {
      const angle = i * step - Math.PI / 2;
      const innerR = r;
      const outerR = r + v * r * 0.9;
      const x1 = cx + Math.cos(angle) * innerR;
      const y1 = cy + Math.sin(angle) * innerR;
      const x2 = cx + Math.cos(angle) * outerR;
      const y2 = cy + Math.sin(angle) * outerR;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = 2;
      ctx.shadowColor = baseColor;
      ctx.shadowBlur = 6 * v;
      ctx.stroke();
    });
  }

  ctx.restore();
}

/* ── Mini wave bars ── */
let miniWaveTimer = null;

function animateMiniWave() {
  const bars = document.querySelectorAll('.wave-bar');
  if (!bars.length) return;
  bars.forEach(b => {
    const h = state.isPlaying
      ? Math.floor(randomBetween(20, 100))
      : Math.floor(randomBetween(5, 20));
    b.style.height = h + '%';
  });
  miniWaveTimer = setTimeout(animateMiniWave, 100);
}

/* ── AI Dashboard ── */
function buildAIDashboard() {
  const grid = document.getElementById('ai-grid');
  if (!grid) return;
  grid.innerHTML = AI_AGENTS.map(ai => `
    <div class="ai-card" id="ai-${ai.id}">
      <div class="ai-symbol">${ai.symbol}</div>
      <div class="ai-name" style="color:${ai.color}">${ai.name}</div>
      <div class="ai-role text-dim">${ai.role}</div>
      <div class="ai-progress"><div class="ai-progress-bar" id="bar-${ai.id}" style="background:${ai.color}"></div></div>
      <div class="ai-status-text" id="status-${ai.id}">${ai.status}</div>
    </div>
  `).join('');
}

const AI_STATUS_POOL = [
  'Processing nodes…',
  'Syncing frequencies…',
  'Scanning cauldron…',
  'Healing glitch…',
  'Triangulating field…',
  'Calibrating rhythm…',
  'Patching inertia pool…',
  'Re-integrating patch…',
  'Monitoring Erythmia…',
  'Harmonic lock achieved',
];

function animateAI() {
  AI_AGENTS.forEach(ai => {
    const bar    = document.getElementById('bar-' + ai.id);
    const status = document.getElementById('status-' + ai.id);
    const card   = document.getElementById('ai-' + ai.id);
    if (!bar || !status) return;

    const pct = Math.floor(randomBetween(30, 100));
    bar.style.width = pct + '%';
    status.textContent = AI_STATUS_POOL[Math.floor(Math.random() * AI_STATUS_POOL.length)];
    card.classList.toggle('active-ai', pct > 75);
  });
}

/* ── Signal Meters ── */
function animateMeters() {
  const meters = [
    { id: 'sig-meter-signal',    pct: () => CHANNELS[state.activeChannel].signal + randomBetween(-3, 3) },
    { id: 'sig-meter-cosmic',    pct: () => randomBetween(40, 95)  },
    { id: 'sig-meter-quantum',   pct: () => randomBetween(55, 100) },
    { id: 'sig-meter-harmonic',  pct: () => randomBetween(20, 80)  },
  ];

  meters.forEach(m => {
    const el = document.getElementById(m.id);
    if (el) el.style.width = Math.min(100, Math.max(0, m.pct())) + '%';
  });

  const vals = document.querySelectorAll('.sig-meter-val');
  vals.forEach(v => {
    const bar = v.previousElementSibling?.querySelector('.sig-meter-fill');
    if (bar) v.textContent = parseInt(bar.style.width) + '%';
  });
}

/* ── Bitcoin TX Feed ── */
function addTx(tx) {
  const feed = document.getElementById('btc-feed');
  if (!feed) return;
  const hash = randomHash();

  // Add BTC value (strip everything except digits and decimal point)
  const val = parseFloat(tx.value.replace(/[^0-9.]/g, '')) || 0;
  state.btcTotal += val;

  const el = document.createElement('div');
  el.className = 'tx-item';
  el.innerHTML = `
    <span class="tx-icon">${tx.icon}</span>
    <div>
      <div class="tx-hash">#${hash}</div>
      <div class="tx-action">${tx.action}</div>
      <div class="tx-value">${tx.value}</div>
    </div>
  `;
  feed.prepend(el);

  // Keep max 20 items
  while (feed.children.length > 20) feed.removeChild(feed.lastChild);

  // Update total
  const totalEl = document.getElementById('btc-total');
  if (totalEl) totalEl.textContent = state.btcTotal.toFixed(8) + ' BTC';
}

function startTxFeed() {
  state.txInterval = setInterval(() => {
    const tpl = TX_TEMPLATES[Math.floor(Math.random() * TX_TEMPLATES.length)];
    addTx({ icon: tpl.icon, action: tpl.action, value: tpl.value() });
  }, 4000);
}

/* ── Visualizer Type Switch ── */
function setVisType(type) {
  state.visType = type;
  document.querySelectorAll('.vis-type-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.type === type);
  });
}

/* ── Skip / Prev ── */
function handleModalOption(option) {
  closeModal('radio-type-modal');
  showToast(`Loading: ${option}`, '📻');
  addTx({ icon: '📡', action: `Radio type: ${option}`, value: `+${(Math.random()*0.00005).toFixed(6)} BTC` });
}

/* ── Skip / Prev ── */
function prevChannel() {
  const idx = (state.activeChannel - 1 + CHANNELS.length) % CHANNELS.length;
  selectChannel(idx);
}
function nextChannel() {
  const idx = (state.activeChannel + 1) % CHANNELS.length;
  selectChannel(idx);
}

/* ── Init ── */
function init() {
  buildTicker();
  buildChannelList();
  buildAIDashboard();
  startVisualizer();
  startTxFeed();
  animateMiniWave();

  // Clock
  updateClock();
  setInterval(updateClock, 1000);

  // AI animation
  animateAI();
  setInterval(animateAI, 3000);

  // Signal meters
  animateMeters();
  setInterval(animateMeters, 2000);

  // Select first channel
  selectChannel(0);

  // Volume slider
  const volSlider = document.getElementById('vol-slider');
  if (volSlider) {
    volSlider.value = state.volume;
    volSlider.addEventListener('input', e => {
      state.volume = parseInt(e.target.value, 10);
      if (masterGainNode) masterGainNode.gain.value = state.volume / 100;
      if (streamAudioEl) streamAudioEl.volume = state.volume / 100;
    });
  }

  // Default vis type button
  document.querySelector('[data-type="bars"]')?.classList.add('active');
}

document.addEventListener('DOMContentLoaded', init);

/* ══════════════════════════════════════════════════════════════════
   HAMBURGER MENU
══════════════════════════════════════════════════════════════════ */
function openHamburger() {
  const drawer  = document.getElementById('hamDrawer');
  const overlay = document.getElementById('hamOverlay');
  const btn     = document.getElementById('hamBtn');
  if (drawer)  { drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); }
  if (overlay) overlay.classList.add('open');
  if (btn)     btn.setAttribute('aria-expanded', 'true');
  document.body.classList.add('drawer-open');
}
function closeHamburger() {
  const drawer  = document.getElementById('hamDrawer');
  const overlay = document.getElementById('hamOverlay');
  const btn     = document.getElementById('hamBtn');
  if (drawer)  { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); }
  if (overlay) overlay.classList.remove('open');
  if (btn)     btn.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('drawer-open');
}

// Close hamburger drawer with Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const drawer = document.getElementById('hamDrawer');
    if (drawer && drawer.classList.contains('open')) closeHamburger();
  }
});

/* ══════════════════════════════════════════════════════════════════
   AUTH — LOGIN / REGISTER
══════════════════════════════════════════════════════════════════ */
function switchAuthTab(tab) {
  const loginForm    = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const tabLogin     = document.getElementById('tabLogin');
  const tabRegister  = document.getElementById('tabRegister');
  if (!loginForm || !registerForm) return;
  if (tab === 'login') {
    loginForm.style.display    = '';
    registerForm.style.display = 'none';
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
  } else {
    loginForm.style.display    = 'none';
    registerForm.style.display = '';
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
  }
}

async function handleLogin() {
  const user = document.getElementById('loginUser')?.value.trim();
  const pass = document.getElementById('loginPass')?.value;
  const msg  = document.getElementById('loginMsg');
  if (!user || !pass) { if (msg) { msg.textContent = 'Enter username and password.'; msg.className = 'auth-msg'; } return; }
  try {
    await AUTH.login(user, pass);
    if (msg) { msg.textContent = ''; msg.className = 'auth-msg'; }
    closeModal('login-modal');
    onAuthChange();
    showToast('Signed in — welcome back!', '🔐');
  } catch (e) {
    if (msg) { msg.textContent = e.message; msg.className = 'auth-msg'; }
  }
}

async function handleRegister() {
  const user  = document.getElementById('regUser')?.value.trim();
  const email = document.getElementById('regEmail')?.value.trim();
  const pass  = document.getElementById('regPass')?.value;
  const msg   = document.getElementById('registerMsg');
  if (!user || !email || !pass) { if (msg) { msg.textContent = 'Fill in all fields.'; msg.className = 'auth-msg'; } return; }
  try {
    await AUTH.register(user, email, pass);
    if (msg) { msg.textContent = ''; msg.className = 'auth-msg'; }
    closeModal('login-modal');
    onAuthChange();
    showToast('Account created — your wallet is ready!', '🟡');
  } catch (e) {
    if (msg) { msg.textContent = e.message; msg.className = 'auth-msg'; }
  }
}

/** Called after any auth state change. */
function onAuthChange() {
  const user       = AUTH.currentUser();
  const badge      = document.getElementById('user-badge');
  const badgeName  = document.getElementById('user-badge-name');
  const tokenCount = document.getElementById('user-token-count');
  const loginBtn   = document.getElementById('loginBtn');

  if (user) {
    if (badge)      badge.style.display = 'flex';
    if (loginBtn)   loginBtn.style.display = 'none';
    if (badgeName)  badgeName.textContent = user.username;
    updateTokenDisplay();
  } else {
    if (badge)      badge.style.display = 'none';
    if (loginBtn)   loginBtn.style.display = '';
    if (tokenCount) tokenCount.textContent = '0 ∞';
    updateTabTokenCount(0);
  }
}

function updateTokenDisplay() {
  const user = AUTH.currentUser();
  if (!user) return;
  const wallet     = AUTH.getWallet(user.username);
  if (!wallet) return;
  const tokens     = wallet.infinityTokens || 0;
  const tokenCount = document.getElementById('user-token-count');
  if (tokenCount)  tokenCount.textContent = tokens + ' ∞';
  updateTabTokenCount(tokens);
}

function updateTabTokenCount(n) {
  const el = document.getElementById('tab-token-count');
  if (el) el.textContent = n;
}

/* ══════════════════════════════════════════════════════════════════
   WALLET MODAL
══════════════════════════════════════════════════════════════════ */
function renderWalletModal() {
  const content = document.getElementById('wallet-content');
  if (!content) return;
  const user = AUTH.currentUser();
  if (!user) {
    content.innerHTML = '<div class="wallet-not-logged">Sign in to view your wallet.</div>';
    return;
  }
  const wallet = AUTH.getWallet(user.username) || {};
  const tokens  = wallet.infinityTokens || 0;
  const btc     = (wallet.btcBacking || 0).toFixed(8);
  const hours   = Math.floor((wallet.listenSeconds || 0) / 3600);
  const mins    = Math.floor(((wallet.listenSeconds || 0) % 3600) / 60);
  const secsIntoHour = (wallet.listenSeconds || 0) % 3600;
  const nextHourPct  = Math.round((secsIntoHour / 3600) * 100);
  const daily   = wallet.dailyGameTokens || 0;

  content.innerHTML = `
    <div class="wallet-hero">
      <div class="wallet-symbol">🟡</div>
      <div>
        <div class="wallet-tokens">${tokens}</div>
        <div class="wallet-token-label">∞ INFINITY TOKENS</div>
        <div class="wallet-btc">≈ ${btc} BTC (notional)</div>
      </div>
    </div>
    <div class="wallet-stats">
      <div class="wallet-stat">
        <div class="wallet-stat-label">Listen Time</div>
        <div class="wallet-stat-val">${hours}h ${mins}m</div>
      </div>
      <div class="wallet-stat">
        <div class="wallet-stat-label">Game Tokens Today</div>
        <div class="wallet-stat-val">${daily}/24</div>
      </div>
    </div>
    <div class="wallet-progress">
      <div class="wallet-progress-label">
        <span>Next listen token</span>
        <span>${nextHourPct}%</span>
      </div>
      <div class="wallet-progress-bar">
        <div class="wallet-progress-fill" style="width:${nextHourPct}%"></div>
      </div>
    </div>
    <p class="text-dim" style="font-size:.65rem;line-height:1.5;">
      Earn 1 ∞TOKEN per hour of listening. Earn up to 24 extra tokens per day playing Signal Catch.
      Tokens are backed by Bitcoin and stored in the AI system — no real crypto is handled.
    </p>
    <div style="display:flex;gap:.5rem;margin-top:.75rem;">
      <button class="hud-btn green full" onclick="openMiniGame();closeModal('wallet-modal')">🎮 Play &amp; Earn</button>
      <button class="hud-btn orange full" onclick="handleMintToken();closeModal('wallet-modal')">₿ Mint Token</button>
    </div>
  `;
}

/* ══════════════════════════════════════════════════════════════════
   TOKEN ACTIONS
══════════════════════════════════════════════════════════════════ */
function handleMintToken() {
  const user = AUTH.currentUser();
  if (!user) {
    showToast('Sign in to mint tokens', '🔐');
    openModal('login-modal');
    return;
  }
  AUTH.mintToken(user.username, 'Manual mint');
  updateTokenDisplay();
  addTx({ icon: '🟡', action: 'Token minted', value: '+1 ∞TOKEN' });
  showToast('∞TOKEN minted to your wallet!', '🟡');
}

function handleMushroom() {
  const user = AUTH.currentUser();
  if (!user) {
    showToast('Sign in to activate boost', '🍄');
    openModal('login-modal');
    return;
  }
  // Mushroom boost: double the next listen-time award window temporarily
  showToast('🍄 Signal BOOST active — 2× tokens for 5 minutes!', '🍄');
  addTx({ icon: '🍄', action: 'Signal boost activated', value: '+BOOST' });
  // Visual flash on the giro core
  const core = document.querySelector('.giro-core');
  if (core) {
    core.style.filter = 'drop-shadow(0 0 30px #00ff88) brightness(1.5)';
    setTimeout(() => { core.style.filter = ''; }, 2000);
  }
}

/* ══════════════════════════════════════════════════════════════════
   LISTEN-TIME TOKEN TICKER
   Awards 1 ∞TOKEN per completed hour of listening.
══════════════════════════════════════════════════════════════════ */
(function startListenTimer() {
  const TICK_MS = 5000; // update every 5 seconds
  setInterval(() => {
    const user = AUTH.currentUser();
    if (!user || !state.isPlaying) return;
    const awarded = AUTH.addListenTime(user.username, TICK_MS / 1000);
    updateTokenDisplay();
    if (awarded > 0) {
      showToast(`+${awarded} ∞TOKEN earned for listening!`, '🟡');
      addTx({ icon: '🟡', action: '1-hour listen reward', value: `+${awarded} ∞TOKEN` });
    }
  }, TICK_MS);
})();

/* ══════════════════════════════════════════════════════════════════
   RESEARCH ARTICLE WRITER
══════════════════════════════════════════════════════════════════ */
function openResearchWriter() {
  const user = AUTH.currentUser();
  const { html, topic, summary } = RESEARCH.generateArticle();
  const body = document.getElementById('research-modal-body');
  if (body) body.innerHTML = html;
  openModal('research-modal');
  // Save and reward token if logged in
  if (user) {
    AUTH.saveResearchArticle(user.username, summary);
    AUTH.mintToken(user.username, 'Research article generated');
    updateTokenDisplay();
    addTx({ icon: '🔬', action: `Research: ${topic.title}`, value: '+1 ∞TOKEN' });
  }
}

function showResearchLibrary() {
  const user = AUTH.currentUser();
  if (!user) {
    showToast('Sign in to view your research library', '🔬');
    openModal('login-modal');
    return;
  }
  const articles = AUTH.getResearchArticles(user.username);
  if (!articles.length) {
    showToast('No research articles yet — click Research to generate one!', '🔬');
    return;
  }
  // Show most recent article
  const latest = articles[articles.length - 1];
  const topic  = RESEARCH.getTopicById(latest.id);
  if (topic) {
    const body = document.getElementById('research-modal-body');
    if (body) body.innerHTML = RESEARCH.buildArticleHTML(topic);
    openModal('research-modal');
  } else {
    showToast(`Latest research: ${latest.title}`, '📚');
  }
}

/* ══════════════════════════════════════════════════════════════════
   MINI-GAME: Signal Catch
══════════════════════════════════════════════════════════════════ */
let gameActive    = false;
let gameScore     = 0;
let gameInterval  = null;

function openMiniGame() {
  updateGameUI();
  openModal('minigame-modal');
}

function updateGameUI() {
  const user  = AUTH.currentUser();
  const today = document.getElementById('game-today');
  const score = document.getElementById('game-score');
  if (score) score.textContent = gameScore;
  if (today && user) {
    const wallet = AUTH.getWallet(user.username);
    today.textContent = wallet ? wallet.dailyGameTokens : 0;
  }
}

function startMiniGame() {
  if (gameActive) return;
  gameActive = true;
  gameScore  = 0;
  updateGameUI();
  document.getElementById('game-status').textContent = 'Catch the signal node!';
  moveNode();
  gameInterval = setInterval(() => {
    if (gameActive) moveNode();
  }, 1800);
}

function moveNode() {
  const arena = document.getElementById('minigame-arena');
  const node  = document.getElementById('minigame-node');
  if (!arena || !node) return;
  const maxX = arena.offsetWidth  - 44;
  const maxY = arena.offsetHeight - 44;
  node.style.left = Math.floor(Math.random() * maxX) + 'px';
  node.style.top  = Math.floor(Math.random() * maxY) + 'px';
}

function catchNode() {
  if (!gameActive) return;
  gameScore++;
  moveNode();
  const user = AUTH.currentUser();
  if (user) {
    const awarded = AUTH.awardGameTokens(user.username, 1);
    if (awarded > 0) {
      updateTokenDisplay();
      document.getElementById('game-status').textContent = `+1 ∞TOKEN earned!`;
      addTx({ icon: '🎮', action: 'Signal Catch', value: '+1 ∞TOKEN' });
    } else {
      document.getElementById('game-status').textContent = 'Daily limit (24) reached.';
    }
  } else {
    document.getElementById('game-status').textContent = `Sign in to earn tokens!`;
  }
  document.getElementById('game-score').textContent = gameScore;
  updateGameUI();
  // Flash the node
  const node = document.getElementById('minigame-node');
  if (node) {
    node.textContent = '✨';
    setTimeout(() => { node.textContent = '📡'; }, 300);
  }
}

/* ══════════════════════════════════════════════════════════════════
   MODAL HELPERS (open/close with aria + wallet re-render)
══════════════════════════════════════════════════════════════════ */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.add('open'); el.setAttribute('aria-hidden', 'false'); }
  if (id === 'wallet-modal') renderWalletModal();
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.remove('open'); el.setAttribute('aria-hidden', 'true'); }
  // Close mini-game when its modal closes
  if (id === 'minigame-modal' && gameActive) {
    gameActive = false;
    clearInterval(gameInterval);
    document.getElementById('game-status').textContent = '';
  }
}

/* ══════════════════════════════════════════════════════════════════
   BOOTSTRAP AUTH
══════════════════════════════════════════════════════════════════ */
(async function bootstrapAuth() {
  try {
    await AUTH.ensureAdmin();
  } catch (e) {
    // crypto.subtle may be unavailable on non-secure origins; auth features will be degraded
    console.warn('Auth init failed (crypto unavailable?):', e);
  }
  onAuthChange();

  // Hamburger close on overlay click
  const overlay = document.getElementById('hamOverlay');
  if (overlay) overlay.addEventListener('click', closeHamburger);
  const hamClose = document.getElementById('hamClose');
  if (hamClose) hamClose.addEventListener('click', closeHamburger);

  // Enter key on login/register inputs
  ['loginPass', 'regPass'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('keydown', e => {
      if (e.key === 'Enter') { id === 'loginPass' ? handleLogin() : handleRegister(); }
    });
  });
})();
