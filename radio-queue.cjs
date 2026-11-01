/* Shared append-only Infinity Radio queue utilities.
   Browser: globalThis.InfinityRadioQueue. Node: require('./radio-queue.cjs').
   Only explicitly approved Archive.org source recordings enter the discovered set. */
(function (root) {
  'use strict';
  const CACHE_KEY = 'infinityRadio:discoveredPianoTracks:v1';
  const ARCHIVE_PREFIX = 'https://archive.org/download/musopen-chopin/';

  function validDiscovery(track) {
    if (!track || typeof track.title !== 'string' || !track.title.trim() ||
        typeof track.url !== 'string' || !track.url.startsWith(ARCHIVE_PREFIX) ||
        !/\.mp3$/i.test(track.url)) return false;
    try {
      const parsed = new URL(track.url);
      return parsed.protocol === 'https:' && parsed.hostname === 'archive.org' &&
        !parsed.username && !parsed.password && !parsed.search && !parsed.hash;
    } catch (_) { return false; }
  }
  function cleanTrack(track) {
    return {title: track.title.trim().slice(0, 200), url: track.url,
      archiveItem: 'musopen-chopin'};
  }
  function mergeNewTracks(existing, incoming) {
    const base = Array.isArray(existing) ? existing : [];
    const seen = new Set(base.map(track => track.url));
    const fresh = [];
    for (const track of Array.isArray(incoming) ? incoming : []) {
      if (!validDiscovery(track) || seen.has(track.url)) continue;
      seen.add(track.url);
      fresh.push(cleanTrack(track));
    }
    return {tracks: fresh.concat(base), added: fresh.length};
  }
  function readSavedTracks(storage) {
    try {
      const value = JSON.parse(storage?.getItem(CACHE_KEY) || '[]');
      return mergeNewTracks([], value).tracks;
    } catch (_) { return []; }
  }
  const api = {CACHE_KEY, ARCHIVE_PREFIX, validDiscovery, mergeNewTracks, readSavedTracks};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.InfinityRadioQueue = api;
})(globalThis);
