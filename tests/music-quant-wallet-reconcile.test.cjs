const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const read=file=>fs.readFileSync(file,'utf8');
test('Music Quants never overwrite selected wallet with a different authenticated ledger owner',()=>{
 const cloud=read('music-quant-cloud.js');
 assert.match(cloud,/currentWalletId:unified.currentWalletId\|\|walletId/);
 assert.match(cloud,/const confirmed=Math.max\(0,Number\(state.balance\)\|\|0\)/);
 assert.doesNotMatch(cloud,/preserved=Math.max\(Number\(unified.musicQuants\)/);
});
test('Cloud restored music receipts are backfilled to IndexedDB before Unified Wallet notices',()=>{
 const cloud=read('music-quant-cloud.js');
 const bridge=read('unified-wallet-bridge.js');
 assert.match(cloud,/await window.MusicQuantStore.putMany\(playableMerged\)/);
 assert.match(cloud,/await mergeCloud\(state.quants\)/);
 assert.match(bridge,/addEventListener\('musicquant:cloud-synced'/);
 assert.match(bridge,/Array.isArray\(event\?\.detail\?\.quants\)/);
 assert.match(bridge,/lastReconciled=signature/);
 assert.match(bridge,/await importExisting\(\)/);
});
test('Wallet write failures keep records pending; no synthetic ledger balance or new minted IDs',()=>{
 const cloud=read('music-quant-cloud.js');
 assert.match(cloud,/if\(submitted.some\(id=>!accepted.has\(id\)\)\)throw/);
 assert.match(cloud,/Music Quant cloud sync deferred/);
 assert.match(cloud,/window.MusicQuantCloud.lastError=/);
 const bridge=read('unified-wallet-bridge.js');
 assert.match(bridge,/if\(connected&&wallet\)await mintChanged/);
});
