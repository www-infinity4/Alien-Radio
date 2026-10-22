// Regression tests for the real Infinity Radio playback engine, no npm dependencies.
// Run with: node --test radio-playback.test.js
'use strict';
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function buildRadio(trackCount = 3) {
  const source = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
  const start = source.indexOf('/* ── Web Audio Engine ── */');
  const end = source.indexOf('function startSynth()', start);
  assert.ok(start >= 0 && end > start, 'radio engine must be present in app.js');

  class FakeAudio {
    constructor() {
      this.listeners = new Map();
      this.dataset = {};
      this.src = '';
      this.currentSrc = '';
      this.paused = true;
      this.played = [];
      this.playPlan = [];
      this.volume = 0.72;
      this.duration = 120;
    }
    addEventListener(type, callback) {
      const callbacks = this.listeners.get(type) || [];
      callbacks.push(callback);
      this.listeners.set(type, callbacks);
    }
    dispatch(type) {
      for (const cb of this.listeners.get(type) || []) cb();
    }
    play() {
      this.played.push(this.src);
      const outcome = this.playPlan.shift();
      if (outcome?.both) {
        this.dispatch('error'); // Browser can emit error AND reject play().
        return Promise.reject(outcome.error);
      }
      if (outcome instanceof Error) return Promise.reject(outcome);
      if (outcome?.then) return outcome;
      this.paused = false;
      this.currentSrc = this.src;
      this.dispatch('playing');
      return Promise.resolve();
    }
    pause() { this.paused = true; this.dispatch('pause'); }
    removeAttribute(name) { if (name === 'src') this.src = ''; }
    load() {}
  }
  const audio = new FakeAudio();
  const events = [], messages = [], saved = new Map();
  const labels = {
    'infinity-radio-audio': audio,
    'play-btn': { textContent: '▶' },
    'np-channel': { textContent: '' },
  };
  const context = vm.createContext({
    PIANO_PLAYLIST: Array.from({ length: trackCount }, (_, i) => ({
      title: 'Track ' + (i + 1),
      url: 'https://archive.org/download/track-' + (i + 1) + '.mp3',
    })),
    pianoTrackIndex: 0,
    state: { isPlaying: false, volume: 72, activeChannel: 0 },
    document: {
      addEventListener() {},
      getElementById(id) { return labels[id] || null; },
    },
    window: { dispatchEvent(event) { events.push(event); } },
    navigator: { mediaSession: { setActionHandler() {}, playbackState: 'paused' } },
    MediaMetadata: class { constructor(details) { Object.assign(this, details); } },
    CustomEvent: class { constructor(type, { detail }) { this.type = type; this.detail = detail; } },
    sessionStorage: { setItem(key, value) { saved.set(key, value); } },
    showToast(message) { messages.push(message); },
    console,
    setTimeout,
    Audio: FakeAudio,
  });
  vm.runInContext(source.slice(start, end) + `
    globalThis.radioTest = {
      start() { state.isPlaying = true; startStream('ignored'); },
      next() { movePianoTrack(1); },
      pause() { state.isPlaying = false; streamAudioEl.pause(); },
      status() { return { playing: state.isPlaying, index: pianoTrackIndex,
        errors: consecutivePianoErrors, attempts: pianoPlayAttempt }; }
    };
  `, context, { filename: 'app.js radio engine' });
  return { audio, events, messages, saved, api: context.radioTest };
}

const failure = (name) => Object.assign(new Error(name), { name });
const flush = async () => { for (let i = 0; i < 6; i++) await Promise.resolve(); };

test('completed tracks advance through the playlist and emit one receipt each', () => {
  const r = buildRadio();
  r.api.start();
  r.audio.dispatch('ended');
  r.audio.dispatch('ended');
  assert.deepEqual(r.audio.played, [
    'https://archive.org/download/track-1.mp3',
    'https://archive.org/download/track-2.mp3',
    'https://archive.org/download/track-3.mp3',
  ]);
  assert.equal(r.api.status().index, 2);
  assert.equal(r.api.status().playing, true);
  assert.equal(r.events.filter(event => event.type === 'infinityradio:track-complete').length, 2);
});

test('an error event plus a rejected play promise skips exactly one broken song', async () => {
  const r = buildRadio();
  r.audio.playPlan = [null, { both: true, error: failure('NotSupportedError') }, null];
  r.api.start();
  r.audio.dispatch('ended');
  await flush();
  assert.equal(r.api.status().playing, true);
  assert.equal(r.api.status().index, 2);
  assert.equal(r.audio.played.length, 3);
  assert.equal(r.events.filter(event => event.type === 'infinityradio:track-complete').length, 1);
});

test('an old rejected play promise cannot stop a manually selected newer song', async () => {
  const r = buildRadio();
  let rejectOld;
  r.audio.playPlan = [new Promise((_, reject) => { rejectOld = reject; }), null];
  r.api.start();
  r.api.next();
  rejectOld(failure('AbortError'));
  await flush();
  assert.equal(r.api.status().playing, true);
  assert.equal(r.api.status().index, 1);
  assert.equal(r.audio.played.length, 2);
});

test('all unavailable recordings stop after one attempt per playlist entry', async () => {
  const r = buildRadio();
  r.audio.playPlan = [failure('NotSupportedError'), failure('NotSupportedError'),
    failure('NotSupportedError')];
  r.api.start();
  await flush();
  assert.equal(r.api.status().playing, false);
  assert.equal(r.audio.played.length, 3);
  assert.equal(r.api.status().errors, 3);
});

test('autoplay permission failures ask for a tap rather than exhaust the library', async () => {
  const r = buildRadio();
  r.audio.playPlan = [failure('NotAllowedError')];
  r.api.start();
  await flush();
  assert.equal(r.api.status().playing, false);
  assert.equal(r.audio.played.length, 1);
  assert.match(r.messages.join(' '), /Tap Play/);
});

test('a late ended event after pause does not advance playback or award a track', () => {
  const r = buildRadio();
  r.api.start();
  r.api.pause();
  r.audio.dispatch('ended');
  assert.equal(r.api.status().index, 0);
  assert.equal(r.events.filter(event => event.type === 'infinityradio:track-complete').length, 0);
});
