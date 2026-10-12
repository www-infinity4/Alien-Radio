const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const read=file=>fs.readFileSync(file,'utf8');
test('Music Quants never overwrite selected wallet with a different authenticated ledger owner',()=>{
 const cloud=read('music-quant-cloud.js');
 assert.match(cloud,/currentWalletId:selected\|\|walletId/);
 assert.match(cloud,/const confirmed=Math.max\(0,Number\(state.balance\)\|\|0\)/);
 assert.match(cloud,/displayMusic=selected===walletId\?confirmed:/,'music receipts must not overwrite the unified balance');
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
 assert.match(bridge,/await verifyOwner\(\)/);
 assert.match(bridge,/queueLedgerSync/);
 assert.doesNotMatch(bridge,/wallet\.mintToken\(/,'only the authenticated immutable music receipt import should credit the wallet');
 assert.match(bridge,/MUSIC QUANT WALLET PENDING/);
});


test('Radio restores existing account rather than creating a new wallet when historic Music Quants exist',()=>{
 const device=read('radio-device-wallet.js');
 assert.match(device,/EXISTING WALLET RECOVERY REQUIRED/);
 assert.match(device,/Number\(priorWallet\?\.musicQuants\|\|0\)>0/);
 assert.match(device,/if\(Object\.keys\(users\)\.length\|\|storedDevice\|\|historical/);
});

test('Unified Wallet reconciliation verifies identical Cloudflare user identity before importing receipts',async()=>{
 const vm=require('node:vm');
 const {webcrypto}=require('node:crypto');
 const code=read('unified-wallet-bridge.js'),storage=new Map([
  ['musicPhi:listeningQuants:v1',JSON.stringify([{id:'mq_real_listening',hash:'a'.repeat(64),kind:'listening',notes:[],song:'Classical track',createdAt:'2026-10-11T23:00:00Z'}])]
 ]);
 const handlers=new Map(),imports=[],errors=[],statusNode={
  textContent:'',dataset:{},classList:{remove(){}}
 };
 let ledgerOwner='another-wallet-account',inst;
 class FakeWallet{
  constructor(){inst=this}
  subscribe(fn){this.listener=fn}
  async connect(){return true}
  async refresh(){return {ok:true,user:{id:'authenticated-wallet-account'},balances:{MUSIC_QUANT:2327},tokens:[]}}
  async importLegacy(data){imports.push(data);return {ok:true}}
 }
 const context={
  console:{warn:(...args)=>errors.push(args.map(String).join(' '))},crypto:webcrypto,TextEncoder,
  Date,Promise,JSON,Map,Set,Array,Number,String,Math,
  localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
  document:{readyState:'loading',hidden:true,getElementById:id=>id==='ledgerState'?statusNode:null,addEventListener:(name,fn)=>handlers.set('document:'+name,fn)},
  addEventListener:(name,fn)=>handlers.set(name,fn),setInterval(){},
  CustomEvent:class{constructor(type,opt){this.type=type;this.detail=opt.detail}},
  window:{InfinityUnifiedWallet:FakeWallet,MusicQuantStore:{list:async()=>[]},ControlPhi:{refreshWallet(){}},
   dispatchEvent(){},StarQuestCloudLedger:{authenticatedFetch:async()=>({ok:true,json:async()=>({user_id:ledgerOwner})})}}
 };
 vm.runInNewContext(code,context);
 const receipt={id:'mq_real_listening',kind:'listening',notes:[]};
 const emit=()=>handlers.get('musicquant:cloud-synced')({detail:{wallet_id:'qw_owned',balance:1,quants:[receipt]}});
 const idle=async()=>{for(let i=0;i<20;i++)await new Promise(resolve=>setImmediate(resolve))};
 emit();await idle();
 assert.equal(imports.length,0,'another wallet may never receive the music tokens');
 assert.match(statusNode.textContent,/different accounts/);
 ledgerOwner='authenticated-wallet-account';await context.window.InfinityRadioMusicWallet.reconnect();emit();await idle();
 assert.ok(imports.length>0,'same verified owner should trigger durable import: '+statusNode.textContent+' '+errors.join(' || '));
 assert.ok(imports.some(batch=>batch.tokens.some(t=>t.id==='mq_real_listening')));
 assert.match(statusNode.textContent,/MUSIC QUANTS VERIFIED/);
 assert.equal(inst.listener instanceof Function,true);
});
