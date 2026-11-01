// Append-only catalog and playback continuity regression tests.
// Run: node --test test/radio-continuity.test.cjs
'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {mergeNewTracks,readSavedTracks}=require('../radio-queue.js');
const {buildCatalog}=require('../scripts/update-radio-catalog.cjs');

const url=(name)=>'https://archive.org/download/musopen-chopin/'+encodeURIComponent(name)+'.mp3';
const old={title:'Original',url:url('old')};
const cached={title:'Previously added',url:url('cached'),archiveItem:'musopen-chopin'};
const newest={title:'Just discovered',url:url('new'),archiveItem:'musopen-chopin'};

test('new discoveries lead the queue without dropping or duplicating older recordings',()=>{
 const result=mergeNewTracks([cached,old],[newest,cached,newest]);
 assert.equal(result.added,1);
 assert.deepEqual(result.tracks.map(track=>track.url),[newest.url,cached.url,old.url]);
 assert.equal(result.tracks[0].title,'Just discovered');
});

test('only HTTPS recordings from the approved source enter the discovered queue',()=>{
 const invalid=[{title:'bad',url:'https://example.com/secret.mp3'},
  {title:'javascript',url:'javascript:alert(1)'},
  {title:'not audio',url:'https://archive.org/download/musopen-chopin/cover.jpg'}];
 assert.equal(mergeNewTracks([old],invalid).added,0);
 assert.deepEqual(mergeNewTracks([old],invalid).tracks.map(x=>x.url),[old.url]);
});

test('cached songs survive when offline and malformed cache is ignored',()=>{
 const fake={getItem:()=>JSON.stringify([cached])};
 assert.deepEqual(readSavedTracks(fake).map(track=>track.url),[cached.url]);
 assert.deepEqual(readSavedTracks({getItem:()=>'{'}),[]);
 assert.deepEqual(readSavedTracks({getItem:()=>JSON.stringify([cached,{url:'http://elsewhere'}])}).map(x=>x.url),[cached.url]);
});

test('catalog ingestion is cumulative, newest first, idempotent, and preserves published titles',()=>{
 const catalog={version:2,source:'Infinity Radio piano playlist',station:'Classical Piano',updated:'2026-10-20',tracks:[cached,old]};
 const files=[
  {name:'new.mp3',format:'VBR MP3',mtime:'1793462000'},
  {name:'cached.mp3',format:'VBR MP3',mtime:'1793362000'},
  {name:'extra.mp3',format:'VBR MP3',mtime:'1793361000'},
  {name:'cover.jpg',format:'JPEG',mtime:'1793480000'}
 ];
 const next=buildCatalog(catalog,files,'2026-11-01');
 assert.equal(next.added,2);
 assert.equal(next.catalog.updated,'2026-11-01');
 assert.deepEqual(next.catalog.tracks.map(t=>t.url),[url('new'),url('extra'),cached.url,old.url]);
 assert.equal(next.catalog.tracks[2].title,cached.title);
 const rerun=buildCatalog(next.catalog,files,'2026-11-02');
 assert.equal(rerun.added,0);
 assert.deepEqual(rerun.catalog,next.catalog);
});

test('empty or failed discovery never replaces the existing catalog',()=>{
 const prior={version:2,tracks:[old]};
 const result=buildCatalog(prior,[],'2026-11-01');
 assert.equal(result.added,0);
 assert.deepEqual(result.catalog,prior);
});
