(function(){
'use strict';
const ENDPOINT='https://quanta-phi-ledger.marvaseater.workers.dev';
const LOCAL='musicPhi:quants:v1',UNIFIED='infinity_unified_wallet_v1';
const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}},write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
let syncing=false;
function mirror(state){
 const unified=read(UNIFIED,{}),walletId=state.wallet_id||unified.currentWalletId||'music-quant-cloud';
 const wallets=unified.wallets&&typeof unified.wallets==='object'?unified.wallets:{},wallet=wallets[walletId]&&typeof wallets[walletId]==='object'?wallets[walletId]:{},balances=wallet.balances&&typeof wallet.balances==='object'?wallet.balances:{};
 wallets[walletId]={...wallet,balances:{...balances,MUSIC_QUANT:Number(state.balance||0)},updatedAt:Date.now()};
 write(UNIFIED,{...unified,currentWalletId:walletId,wallets,musicQuants:Number(state.balance||0),updatedAt:Date.now(),source:'music-quant-cloud'});
 window.dispatchEvent(new CustomEvent('controlphi:wallet-change',{detail:{musicQuants:Number(state.balance||0),source:'music-quant-cloud'}}));
 window.ControlPhi?.refreshWallet?.();
}
function mergeCloud(cloud){
 const local=read(LOCAL,[]),map=new Map(local.map(q=>[q.id,q]));
 (Array.isArray(cloud)?cloud:[]).forEach(q=>{if(q?.id&&Array.isArray(q.notes)&&q.notes.length===5)map.set(q.id,q)});
 const merged=[...map.values()].sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||''))).slice(0,500);
 write(LOCAL,merged);return merged;
}
async function sync(){
 if(syncing)return;const bridge=window.StarQuestCloudLedger;if(!bridge?.authenticatedFetch)return;syncing=true;
 try{
  const local=read(LOCAL,[]);
  if(local.length){
   const response=await bridge.authenticatedFetch(ENDPOINT+'/v1/music-quants/sync',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({quants:local.slice(0,100)})});
   if(!response.ok)throw new Error('music_quant_sync_failed');
  }
  const stateResponse=await bridge.authenticatedFetch(ENDPOINT+'/v1/music-quants/state',{cache:'no-store'});
  const state=await stateResponse.json().catch(()=>({}));
  if(!stateResponse.ok)throw new Error(state.error||'music_quant_state_failed');
  mergeCloud(state.quants);mirror(state);
  window.dispatchEvent(new CustomEvent('musicquant:cloud-synced',{detail:state}));
 }catch(error){console.warn('Music Quant cloud sync deferred',error)}
 finally{syncing=false}
}
window.MusicQuantCloud={sync,endpoint:ENDPOINT};
addEventListener('musicquant:changed',()=>void sync());
addEventListener('online',()=>void sync());
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{sync();setInterval(sync,30000)},{once:true});else{sync();setInterval(sync,30000)}
})();