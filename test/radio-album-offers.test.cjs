'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const shop=require('../radio-album-offers.js');
const page=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const engine=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');

test('composer and composition drive the shopping query, not the source filename',()=>{
  const a=shop.queryForTrack({title:'Johann Sebastian Bach - 01 - Goldberg Variations, BWV 988 - Aria'});
  assert.match(a,/Bach/);
  assert.match(a,/Goldberg/);
  assert.doesNotMatch(a,/ - 01 - /);
  const b=shop.queryForTrack({title:'Chopin · Nocturne, Op. 55 no. 1 in F minor'});
  assert.match(b,/Chopin Nocturne/i);
  assert.equal(shop.queryForTrack({title:''}),'');
});

test('only verified Apple albums with real artwork, matching composer, and store links are offered',()=>{
  const data=[
    {wrapperType:'collection',collectionType:'Album',collectionId:7,collectionName:'Chopin: Nocturnes',artistName:'Arthur Rubinstein',collectionViewUrl:'https://music.apple.com/us/album/chopin-nocturnes/7',artworkUrl100:'https://is1-ssl.mzstatic.com/image/thumb/album.jpg/100x100bb.jpg',collectionPrice:10.99,currency:'USD'},
    {wrapperType:'collection',collectionType:'Album',collectionId:7,collectionName:'Chopin: Nocturnes',artistName:'Arthur Rubinstein',collectionViewUrl:'https://music.apple.com/us/album/chopin-nocturnes/7',artworkUrl100:'https://is1-ssl.mzstatic.com/image/thumb/album.jpg/100x100bb.jpg'},
    {wrapperType:'collection',collectionType:'Album',collectionId:8,collectionName:'Metallica',artistName:'Metallica',collectionViewUrl:'https://music.apple.com/us/album/metallica/8',artworkUrl100:'https://is1-ssl.mzstatic.com/album.jpg'},
    {wrapperType:'collection',collectionType:'Album',collectionId:9,collectionName:'Chopin',artistName:'Artist',collectionViewUrl:'javascript:alert(1)',artworkUrl100:'https://is1-ssl.mzstatic.com/album.jpg'},
    {wrapperType:'collection',collectionType:'Album',collectionId:10,collectionName:'Chopin',artistName:'Artist',collectionViewUrl:'https://music.apple.com/us/album/id10',artworkUrl100:'https://evil.example.invalid/album.jpg'}
  ];
  const matches=shop.filterAlbums('Chopin · Nocturne Op. 9 No. 2',data);
  assert.equal(matches.length,1);
  assert.equal(matches[0].title,'Chopin: Nocturnes');
  assert.equal(matches[0].price,'$10.99');
  assert.match(matches[0].storeUrl,/^https:\/\/music\.apple\.com\//);
  assert.match(matches[0].artworkUrl,/^https:\/\/is1-ssl\.mzstatic\.com\//);
  assert.equal(matches[0].relationship,'Other recording of this composer/work');
});

test('never fabricate prices, exact-performance claims, merchant stock, or artwork',()=>{
  const matches=shop.filterAlbums('Beethoven · Symphony No. 3',[
    {wrapperType:'collection',collectionType:'Album',collectionId:90,collectionName:'Beethoven: Symphony No. 3',artistName:'Berlin Philharmonic',collectionViewUrl:'https://music.apple.com/us/album/id90',artworkUrl100:'https://is1-ssl.mzstatic.com/image.jpg',currency:'USD'},
  ]);
  assert.equal(matches.length,1);
  assert.equal(matches[0].price,'');
  assert.equal(matches[0].relationship,'Other recording of this composer/work');
});

test('physical CD entry is a clearly labeled retailer SEARCH, never a claimed listing',()=>{
  const url=new URL(shop.cdSearchUrl({title:'Mozart · Piano Sonata No. 11'}));
  assert.equal(url.origin,'https://www.discogs.com');
  assert.match(url.pathname,/^\/search\/?$/);
  assert.match(url.searchParams.get('q'),/Mozart/);
  assert.equal(url.searchParams.get('format_exact'),'CD');
  assert.equal(shop.cdSearchUrl({title:''}),'');
});

test('shopping cards follow track-start and library selections without modifying music or wallet',()=>{
  assert.match(page,/id="radio-album-shop"/);
  assert.match(page,/radio-album-offers\.js\?v=/);
  const source=fs.readFileSync(path.join(__dirname,'../radio-album-offers.js'),'utf8');
  assert.match(source,/infinityradio:track-start/);
  assert.match(source,/infinityradio:library-loaded/);
  assert.match(engine,/infinityradio:track-start/);
  assert.doesNotMatch(source,/recordListeningQuant|creditStar|mintQuant|wallet\.|audio\.play\(/);
  assert.match(source,/Download on iTunes|View on Apple Music/);
});
