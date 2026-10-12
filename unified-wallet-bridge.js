(function(){
'use strict';
const UNIFIED='infinity_unified_wallet_v1',PLAYABLE='musicPhi:quants:v1',LISTENING='musicPhi:listeningQuants:v1';
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}};
const digest=async value=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(x=>x.toString(16).padStart(2,'0')).join('');
const LEDGER='https://quanta-phi-ledger.marvaseater.workers.dev';
let wallet=null,starting=null,pending=Promise.resolve(),connected=false,lastReconciled='',lastError='';
window.InfinityRadioMusicWallet={
 get confirmed(){return Boolean(lastReconciled&&!lastError&&connected)},
 get lastError(){return lastError},
 reconnect(){return start()},
 get receiptCheckpoint(){return Boolean(lastReconciled)}
};
function status(message,problem=false){
 const label=document.getElementById('ledgerState');
 if(label){label.textContent=message;label.dataset.musicWalletProblem=problem?'true':'false';if(problem)label.classList.remove('connected')}
 if(problem)window.dispatchEvent(new CustomEvent('musicquant:wallet-link-error',{detail:{message}}));
}
async function verifyOwner(){
 const bridge=window.StarQuestCloudLedger;
 if(!bridge?.authenticatedFetch)throw Error('Music Quant Cloudflare account is not connected');
 if(!wallet)throw Error('Unified Wallet is not connected');
 const unified=await wallet.refresh();
 if(!unified?.ok||!unified.user?.id)throw Error('Unified Wallet account identity is missing');
 const response=await bridge.authenticatedFetch(LEDGER+'/v1/quants/state',{cache:'no-store'});
 const ledger=await response.json().catch(()=>({}));
 if(!response.ok||!ledger.user_id)throw Error(ledger.error||'Music Quant owner verification failed');
 if(String(ledger.user_id)!==String(unified.user.id))throw Error('Music Quant ledger and Unified Wallet belong to different accounts; no credits transferred');
 return unified;
}
function legacyInfinity(){const state=read(UNIFIED,{}),wallets=state?.wallets&&typeof state.wallets==='object'?Object.values(state.wallets):[];return Math.max(Number(state?.balances?.INFINITY)||0,...wallets.map(item=>Number(item?.balances?.INFINITY)||0),0)}
function legacyMusicQuantBalance(){const state=read(UNIFIED,{}),wallets=state?.wallets&&typeof state.wallets==='object'?Object.values(state.wallets):[];const localLists=(read(PLAYABLE,[]).filter(item=>item?.id&&!item.transferredAt).length+read(LISTENING,[]).filter(item=>item?.id&&!item.transferredAt).length);return Math.max(Number(state?.musicQuants)||0,Number(state?.balances?.MUSIC_QUANT)||0,...wallets.map(item=>Number(item?.balances?.MUSIC_QUANT)||0),localLists,0)}
async function localTokens(){
 const indexed=window.MusicQuantStore?await window.MusicQuantStore.list().catch(()=>[]):[];
 const playable=new Map([...read(PLAYABLE,[]),...indexed].filter(item=>item?.id&&!item.transferredAt).map(item=>[item.id,item]));
 const listening=new Map(read(LISTENING,[]).filter(item=>item?.id&&!item.transferredAt).map(item=>[item.id,item]));
 return [...playable.values()].map(data=>({id:data.id,type:'MUSIC_QUANT',source:'Infinity Radio',createdAt:Date.parse(data.createdAt)||Date.now(),provenanceHash:data.hash,data})).concat([...listening.values()].map(data=>({id:data.id,type:'LISTENING_QUANT',source:'Infinity Radio',createdAt:Date.parse(data.createdAt)||Date.now(),provenanceHash:data.hash,data})));
}
async function hydrateTokens(state){const cloud=(state?.tokens||[]).filter(token=>token.token_type==='MUSIC_QUANT'&&token?.data?.id).map(token=>token.data);if(cloud.length)await window.MusicQuantStore?.putMany(cloud);const listening=new Map(read(LISTENING,[]).map(q=>[q.id,q]));(state?.tokens||[]).forEach(token=>{const data=token?.data;if(data?.id&&(token.token_type==='LISTENING_QUANT'||data.kind==='listening'))listening.set(data.id,data)});write(LISTENING,[...listening.values()].sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||''))) );window.dispatchEvent(new CustomEvent('musicquant:cloud-synced',{detail:state}))}
function mirror(state){
 if(!state?.balances)return;void hydrateTokens(state);const local=read(UNIFIED,{}),walletId='cloudflare:'+String(state.user?.id||'unified'),wallets=local.wallets&&typeof local.wallets==='object'?local.wallets:{};
 wallets[walletId]={...(wallets[walletId]||{}),id:walletId,label:'Unified Cloud Wallet',balances:{...(wallets[walletId]?.balances||{}),STARCOIN:Number(state.balances.STARCOIN||0),QUANT:Number(state.balances.QUANT||0),MUSIC_QUANT:Number(state.balances.MUSIC_QUANT||0),INFINITY:Number(state.balances.INFINITY||0)},updatedAt:Date.now()};
 write(UNIFIED,{...local,currentWalletId:walletId,wallets,musicQuants:Number(state.balances.MUSIC_QUANT||0),updatedAt:Date.now(),source:'unified-wallet-cloudflare'});
 window.dispatchEvent(new CustomEvent('controlphi:wallet-change',{detail:{...state.balances,source:'unified-wallet-cloudflare'}}));window.ControlPhi?.refreshWallet?.();
}
async function importExisting(){
 await verifyOwner(); // no cross-account imports or synthetic new identities.
 const tokens=await localTokens(),sorted=tokens.slice().sort((a,b)=>String(a.id).localeCompare(String(b.id)));
 if(!sorted.length){await wallet.importLegacy({importKey:'alien-radio-empty-v3',balances:{INFINITY:legacyInfinity(),MUSIC_QUANT:legacyMusicQuantBalance()},tokens:[]});return}
 for(let offset=0;offset<sorted.length;offset+=400){
  const batch=sorted.slice(offset,offset+400),signature=await digest(batch.map(x=>x.id).join('|'));
  await wallet.importLegacy({importKey:'alien-radio-v3-'+offset+'-'+batch.length+'-'+signature.slice(0,16),balances:{INFINITY:legacyInfinity(),MUSIC_QUANT:legacyMusicQuantBalance()},tokens:batch});
 }
}
/* New listening/piano records are committed to the dedicated authenticated
 * Music Quant ledger first. The only subsequent Unified Wallet import uses the
 * same permanent mq_ receipt IDs. Do not also mint ut_ copies in parallel. */
async function queueLedgerSync(){
 const cloud=window.MusicQuantCloud;
 if(!cloud?.sync)throw Error('Music Quant ledger sync not loaded');
 const state=await cloud.sync();
 if(state?.reason==='sync_in_progress')return; // cloud queues one more pass
 if(!state?.ok)throw Error(state?.reason||'Music Quant ledger sync pending');
}

async function start(){
 if(!window.InfinityUnifiedWallet){status('MUSIC QUANT WALLET PENDING · Unified Wallet script unavailable',true);return null}
 if(connected)return wallet;
 if(starting)return starting;
 if(!wallet){wallet=new window.InfinityUnifiedWallet({appName:'Infinity Radio'});window.InfinityRadioUnifiedWallet=wallet;wallet.subscribe(mirror)}
 starting=(async()=>{try{
  await wallet.connect();
  await verifyOwner(); // never import into a different wallet
  connected=true;
  await importExisting();
  lastError='';
  status('MUSIC QUANT WALLET VERIFIED');
  return wallet;
 }catch(error){
  connected=false;lastError=String(error?.message||error);
  status('MUSIC QUANT WALLET PENDING · '+lastError,true);
  window.dispatchEvent(new CustomEvent('infinity:wallet-error',{detail:{message:lastError}}));
  return null;
 }finally{starting=null}})();
 return starting;
}
// The Quant ledger can restore records that are absent from this device's
// local radio history. Reconcile these same immutable IDs into Unified Wallet.
// Do not respond to Unified Wallet's own tokens event (would create a loop).
addEventListener('musicquant:cloud-synced',event=>{
 if(!Array.isArray(event?.detail?.quants))return;
 const state=event.detail;
 pending=pending.then(async()=>{
  await start();
  if(!connected||!wallet)throw Error(lastError||'Unified Wallet not connected');
  // Event payload is already authenticated by the music ledger but its user
  // must still match the wallet before importing any receipts.
  const unified=await verifyOwner();
  const ids=(state.quants||[]).filter(q=>q?.id&&!q.transferredAt).map(q=>String(q.id)).sort();
  const signature=await digest(JSON.stringify([unified.user.id,state.wallet_id,state.balance,ids]));
  if(signature===lastReconciled)return;
  await importExisting(); // idempotent by import key and immutable mq_ receipt
  const confirmed=await verifyOwner();
  if(!Number.isFinite(Number(confirmed.balances?.MUSIC_QUANT))||
     Number(confirmed.balances.MUSIC_QUANT)<Number(state.balance||0))
   throw Error('Unified Wallet has not confirmed the Music Quant balance');
  lastReconciled=signature;lastError='';
  status('UNIFIED WALLET · '+Number(confirmed.balances.MUSIC_QUANT)+' MUSIC QUANTS VERIFIED');
  window.dispatchEvent(new CustomEvent('musicquant:wallet-confirmed',{
   detail:{musicQuants:Number(confirmed.balances.MUSIC_QUANT),musicLedgerQuants:Number(state.balance||0),walletId:state.wallet_id}
  }));
 }).catch(error=>{
  lastError=String(error?.message||error);
  status('MUSIC QUANT WALLET PENDING · '+lastError,true);
  console.warn('Music Quant Unified Wallet reconciliation pending',error);
 });
});
addEventListener('musicquant:changed',()=>{
 // New receipts remain in the local outbox until music ledger accepts them.
 // That ledger's cloud-synced event triggers owner-verified wallet import.
 pending=pending.then(queueLedgerSync).catch(error=>{
  lastError=String(error?.message||error);
  status('MUSIC QUANT CREDIT PENDING · '+lastError,true);
 });
});

document.addEventListener('starquest:ledger-connected',()=>{void start();void window.MusicQuantCloud?.sync?.()});
document.addEventListener('starquest:auth-changed',()=>{connected=false;lastReconciled='';void start()});
addEventListener('online',()=>{void start();void window.MusicQuantCloud?.sync?.()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){void start();void window.MusicQuantCloud?.sync?.()}});
setInterval(()=>{if(!document.hidden){void start();void window.MusicQuantCloud?.sync?.()}},30000);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else void start();
})();
