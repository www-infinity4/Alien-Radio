(function(){
'use strict';
const UNIFIED='infinity_unified_wallet_v1',PLAYABLE='musicPhi:quants:v1',LISTENING='musicPhi:listeningQuants:v1';
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}};
const digest=async value=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(x=>x.toString(16).padStart(2,'0')).join('');
let wallet=null,started=false,pending=Promise.resolve();
function legacyInfinity(){const state=read(UNIFIED,{}),wallets=state?.wallets&&typeof state.wallets==='object'?Object.values(state.wallets):[];return Math.max(Number(state?.balances?.INFINITY)||0,...wallets.map(item=>Number(item?.balances?.INFINITY)||0),0)}
function localTokens(){return [...read(PLAYABLE,[]).map(data=>({id:data.id,type:'MUSIC_QUANT',source:'Infinity Radio',createdAt:Date.parse(data.createdAt)||Date.now(),provenanceHash:data.hash,data})),...read(LISTENING,[]).map(data=>({id:data.id,type:'LISTENING_QUANT',source:'Infinity Radio',createdAt:Date.parse(data.createdAt)||Date.now(),provenanceHash:data.hash,data}))]}
function mirror(state){
 if(!state?.balances)return;const local=read(UNIFIED,{}),walletId='cloudflare:'+String(state.user?.id||'unified'),wallets=local.wallets&&typeof local.wallets==='object'?local.wallets:{};
 wallets[walletId]={...(wallets[walletId]||{}),id:walletId,label:'Unified Cloud Wallet',balances:{...(wallets[walletId]?.balances||{}),STARCOIN:Number(state.balances.STARCOIN||0),QUANT:Number(state.balances.QUANT||0),MUSIC_QUANT:Number(state.balances.MUSIC_QUANT||0),INFINITY:Number(state.balances.INFINITY||0)},updatedAt:Date.now()};
 write(UNIFIED,{...local,currentWalletId:walletId,wallets,musicQuants:Number(state.balances.MUSIC_QUANT||0),updatedAt:Date.now(),source:'unified-wallet-cloudflare'});
 window.dispatchEvent(new CustomEvent('controlphi:wallet-change',{detail:{...state.balances,source:'unified-wallet-cloudflare'}}));window.ControlPhi?.refreshWallet?.();
}
async function importExisting(){const tokens=localTokens(),signature=await digest(tokens.map(x=>x.id).sort().join('|'));await wallet.importLegacy({importKey:'alien-radio-v1-'+tokens.length+'-'+signature.slice(0,16),balances:{INFINITY:legacyInfinity()},tokens})}
async function mintChanged(event){const id=String(event?.detail?.quantId||'');if(!id)return;const data=[...read(PLAYABLE,[]),...read(LISTENING,[])].find(item=>item?.id===id);if(!data)return;const type=data.kind==='listening'?'LISTENING_QUANT':'MUSIC_QUANT';await wallet.mintToken(type,data,'alien-radio:'+id)}
async function start(){if(started||!window.InfinityUnifiedWallet)return;started=true;wallet=new window.InfinityUnifiedWallet({appName:'Infinity Radio'});window.InfinityRadioUnifiedWallet=wallet;wallet.subscribe(mirror);try{await wallet.connect();await importExisting()}catch(error){console.warn('Unified Wallet waiting for the StarQuest account connection',error);window.dispatchEvent(new CustomEvent('infinity:wallet-error',{detail:{message:String(error?.message||error)}}))}}
addEventListener('musicquant:changed',event=>{pending=pending.then(()=>wallet?mintChanged(event):start()).catch(error=>console.warn('Unified Music Quant sync deferred',error))});
addEventListener('starquest:ledger-connected',()=>void start());addEventListener('online',()=>void (wallet?wallet.refresh().then(mirror).catch(()=>{}):start()));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else void start();
})();
