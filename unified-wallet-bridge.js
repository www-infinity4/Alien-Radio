(function(){
'use strict';
const UNIFIED='infinity_unified_wallet_v1',PLAYABLE='musicPhi:quants:v1',LISTENING='musicPhi:listeningQuants:v1';
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}};
const digest=async value=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(x=>x.toString(16).padStart(2,'0')).join('');
let wallet=null,starting=null,pending=Promise.resolve();
function legacyInfinity(){const state=read(UNIFIED,{}),wallets=state?.wallets&&typeof state.wallets==='object'?Object.values(state.wallets):[];return Math.max(Number(state?.balances?.INFINITY)||0,...wallets.map(item=>Number(item?.balances?.INFINITY)||0),0)}
async function localTokens(){
 const indexed=window.MusicQuantStore?await window.MusicQuantStore.list().catch(()=>[]):[];
 const playable=new Map([...read(PLAYABLE,[]),...indexed].filter(item=>item?.id&&!item.transferredAt).map(item=>[item.id,item]));
 const listening=new Map(read(LISTENING,[]).filter(item=>item?.id&&!item.transferredAt).map(item=>[item.id,item]));
 return [...playable.values()].map(data=>({id:data.id,type:'MUSIC_QUANT',source:'Infinity Radio',createdAt:Date.parse(data.createdAt)||Date.now(),provenanceHash:data.hash,data})).concat([...listening.values()].map(data=>({id:data.id,type:'LISTENING_QUANT',source:'Infinity Radio',createdAt:Date.parse(data.createdAt)||Date.now(),provenanceHash:data.hash,data})));
}
async function hydrateTokens(state){const cloud=(state?.tokens||[]).filter(token=>token.token_type==='MUSIC_QUANT'&&token?.data?.id).map(token=>token.data);if(cloud.length)await window.MusicQuantStore?.putMany(cloud);const listening=new Map(read(LISTENING,[]).map(q=>[q.id,q]));(state?.tokens||[]).forEach(token=>{const data=token?.data;if(data?.id&&(token.token_type==='LISTENING_QUANT'||data.kind==='listening'))listening.set(data.id,data)});write(LISTENING,[...listening.values()].sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||''))).slice(0,500));window.dispatchEvent(new CustomEvent('musicquant:cloud-synced',{detail:state}))}
function mirror(state){
 if(!state?.balances)return;void hydrateTokens(state);const local=read(UNIFIED,{}),walletId='cloudflare:'+String(state.user?.id||'unified'),wallets=local.wallets&&typeof local.wallets==='object'?local.wallets:{};
 wallets[walletId]={...(wallets[walletId]||{}),id:walletId,label:'Unified Cloud Wallet',balances:{...(wallets[walletId]?.balances||{}),STARCOIN:Number(state.balances.STARCOIN||0),QUANT:Number(state.balances.QUANT||0),MUSIC_QUANT:Number(state.balances.MUSIC_QUANT||0),INFINITY:Number(state.balances.INFINITY||0)},updatedAt:Date.now()};
 write(UNIFIED,{...local,currentWalletId:walletId,wallets,musicQuants:Number(state.balances.MUSIC_QUANT||0),updatedAt:Date.now(),source:'unified-wallet-cloudflare'});
 window.dispatchEvent(new CustomEvent('controlphi:wallet-change',{detail:{...state.balances,source:'unified-wallet-cloudflare'}}));window.ControlPhi?.refreshWallet?.();
}
async function importExisting(){
 const tokens=await localTokens(),sorted=tokens.slice().sort((a,b)=>String(a.id).localeCompare(String(b.id)));
 if(!sorted.length){await wallet.importLegacy({importKey:'alien-radio-empty-v2',balances:{INFINITY:legacyInfinity()},tokens:[]});return}
 for(let offset=0;offset<sorted.length;offset+=400){
  const batch=sorted.slice(offset,offset+400),signature=await digest(batch.map(x=>x.id).join('|'));
  await wallet.importLegacy({importKey:'alien-radio-v2-'+offset+'-'+batch.length+'-'+signature.slice(0,16),balances:{INFINITY:legacyInfinity()},tokens:batch});
 }
}
async function mintChanged(event){
 const ids=[event?.detail?.quantId,...(Array.isArray(event?.detail?.quantIds)?event.detail.quantIds:[])].filter(Boolean);
 if(!ids.length)return;
 const saved=await localTokens(),byId=new Map(saved.map(token=>[token.id,token]));
 for(const id of new Set(ids)){
  const token=byId.get(String(id));
  if(!token)continue;
  await wallet.mintToken(token.type,token.data,'alien-radio:'+token.id);
 }
 await wallet.refresh();
}
async function start(){if(!window.InfinityUnifiedWallet)return;if(starting)return starting;if(!wallet){wallet=new window.InfinityUnifiedWallet({appName:'Infinity Radio'});window.InfinityRadioUnifiedWallet=wallet;wallet.subscribe(mirror)}starting=(async()=>{try{await wallet.connect();await importExisting()}catch(error){console.warn('Unified Wallet waiting for the StarQuest account connection',error);window.dispatchEvent(new CustomEvent('infinity:wallet-error',{detail:{message:String(error?.message||error)}}))}finally{starting=null}})();return starting}
addEventListener('musicquant:changed',event=>{
 pending=pending.then(async()=>{
  await start();
  if(wallet)await mintChanged(event);
 }).catch(error=>console.warn('Unified Music Quant sync deferred',error));
});
document.addEventListener('starquest:ledger-connected',()=>void start());addEventListener('online',()=>void (wallet?wallet.refresh().then(mirror).catch(()=>{}):start()));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else void start();
})();
