'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const script = fs.readFileSync('app.js', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const feed = JSON.parse(fs.readFileSync('oracle-track-feed.json', 'utf8'));

test('new piano tracks lead the actual player and shared Oracle feed', () => {
  const playlist = script.slice(script.indexOf('const PIANO_PLAYLIST = ['), script.indexOf('];', script.indexOf('const PIANO_PLAYLIST = [')));
  const firstSix = feed.tracks.slice(0, 6);
  assert.equal(firstSix.length, 6);
  for (const track of firstSix) {
    assert.ok(playlist.includes(JSON.stringify(track.url)), track.title + ' should be in radio');
    assert.ok(track.url.startsWith('https://archive.org/download/musopen-chopin/'));
  }
  const firstOriginal = playlist.indexOf('Chopin · Prelude in E Minor Op. 28 No. 4');
  for (const track of firstSix) assert.ok(playlist.indexOf(track.title) < firstOriginal);
  assert.equal(new Set(feed.tracks.map(t => t.url)).size, feed.tracks.length);
  assert.equal(feed.tracks.length, 30);
});

test('screen-off playback has HTML audio and Android media controls', () => {
  assert.match(html, /<audio id="infinity-radio-audio"[^>]*>/);
  assert.match(script, /el = document\.getElementById\('infinity-radio-audio'\)/);
  assert.match(script, /navigator\.mediaSession\.setActionHandler/);
  for (const name of ['play','pause','nexttrack','previoustrack']) assert.ok(script.includes(name + ': () =>'));
  assert.match(script, /document\.addEventListener\('visibilitychange'/);
  assert.match(script, /if \(!document\.hidden && state\.isPlaying/);
  assert.match(script, /el\.dataset\.infinityRadioWired/);
  assert.match(script, /PIANO_QUEUE_REVISION/);
  assert.match(script, /if \(streamAudioEl\) streamAudioEl\.pause\(\);/);
});
