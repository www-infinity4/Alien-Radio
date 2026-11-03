// Append-only catalog and playback continuity regression tests.
// Run: node --test test/radio-continuity.test.cjs
'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {mergeNewTracks,readSavedTracks}=require('../radio-queue.js');
const {buildCatalog,licenseApproved}=require('../scripts/update-radio-catalog.cjs');

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

test('second Musopen archive enters queue with source attribution, preserving all older recordings',()=>{
 const source='MusopenCollectionAsFlac';
 const files=[{name:'Bach_GoldbergVariations/example.mp3',format:'VBR MP3',title:'Bach - Aria',mtime:'1440000000'}];
 const result=buildCatalog({version:2,tracks:[old]},files,'2026-11-02',source);
 assert.equal(result.added,1);
 assert.deepEqual(result.catalog.tracks.map(t=>t.archiveItem||''),[source,'']);
 assert.equal(result.catalog.tracks[1].url,old.url);
 const verified=mergeNewTracks([old],result.catalog.tracks);
 assert.equal(verified.added,1);
 assert.equal(verified.tracks[0].url,'https://archive.org/download/MusopenCollectionAsFlac/Bach_GoldbergVariations/example.mp3');
});
test('only the exact public-domain declarations of approved Musopen items are accepted',()=>{
 assert.equal(licenseApproved('musopen-chopin','http://creativecommons.org/publicdomain/zero/1.0/'),true);
 assert.equal(licenseApproved('MusopenCollectionAsFlac','http://creativecommons.org/publicdomain/mark/1.0/'),true);
 assert.equal(licenseApproved('MusopenCollectionAsFlac','https://creativecommons.org/licenses/by-nc-sa/3.0/'),false);
 assert.equal(licenseApproved('unknown','http://creativecommons.org/publicdomain/zero/1.0/'),false);
});
