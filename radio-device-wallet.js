(function(){
'use strict';
const TOKEN_PREFIX='starquest_ledger_device_v1:';
const STATUS=document.getElementById('ledgerState');
const RECOVERY=document.getElementById('connectAccountButton');
function note(message){if(STATUS)STATUS.textContent=message}
function tokenFor(key){const raw=localStorage.getItem(key)||'';if(/^sq_[A-Za-z0-9_-]{32,}$/.test(raw))return raw;try{const token=JSON.parse(raw)?.deviceToken;return /^sq_[A-Za-z0-9_-]{32,}$/.test(token)?token:''}catch{return ''}}
async function recoverSavedDevice(){
 const users=JSON.parse(localStorage.getItem('starquest_users')||'{}');
 for(let i=0;i<localStorage.length;i++){
  const key=localStorage.key(i)||'';
  if(!key.startsWith(TOKEN_PREFIX))continue;
  const token=tokenFor(key);if(!token)continue;
  try{
   const response=await fetch('https://starquest-ledger.marvaseater.workers.dev/v1/state',{headers:{Authorization:'Bearer '+token},cache:'no-store'});
   if(!response.ok)continue;
   const result=await response.json();
   const username=String(result?.state?.username||'').toLowerCase();
   if(!username||username!==key.slice(TOKEN_PREFIX.length))continue;
   let user=users[username];
   if(!user){
    const state=result?.state||{};
    user={
     key:username,username:String(state.username||username),passwordHash:'',
     joinedAt:Date.now(),lastLoginAt:Date.now(),tokens:Math.max(0,Number(state.starCoins)||0),
     pendingShareCredits:Math.max(0,Number(state.pendingShareCredits)||0),shareCount:Math.max(0,Number(state.shareCount)||0),
     shareEvents:[],ledger:Array.isArray(state.ledger)?state.ledger:[],watchHistory:Array.isArray(state.watchHistory)?state.watchHistory:[],
     watchPositions:{},unlockedContent:{}
    };
    users[username]=user;
    localStorage.setItem('starquest_users',JSON.stringify(users));
   }
   localStorage.setItem('starquest_session',JSON.stringify({key:username,username:user.username||username,signedInAt:Date.now()}));
   document.dispatchEvent(new CustomEvent('starquest:auth-changed',{detail:{user:window.StarQuestAuth.currentUser(),action:'device-recovery'}}));
   return true;
  }catch(error){console.warn('Saved wallet device check deferred',error)}
 }
 return false;
}
async function start(){
 try{
  note('CHECKING SAVED DEVICE WALLET');
  // Existing StarQuest credential may live on the old GitHub Pages origin.
  // Wait for its owner-verified, first-party handoff before testing identity.
  if(window.QuantaCloudConnection?.ready)await window.QuantaCloudConnection.ready;
  if(!window.StarQuestAuth?.currentUser?.())
   await window.QuantaCloudConnection?.recoverAccountProfileFromDevice?.();
  if(window.StarQuestAuth?.currentUser?.()){
   const connected=await window.StarQuestCloudLedger?.connect?.();
   if(!connected)throw new Error('Cloudflare device wallet connection pending');
   note('UNIFIED WALLET CONNECTED');
   STATUS?.classList.add('connected');
   // A StarQuest session alone does not verify Music Quant wallet ownership.
   await window.MusicQuantCloud?.sync?.();
   window.ControlPhi?.refreshWallet?.();
   return;
  }
  if(await recoverSavedDevice()){
   const connected=await window.StarQuestCloudLedger?.connect?.();
   if(connected){note('DEVICE WALLET VERIFIED');await window.MusicQuantCloud?.sync?.();}
   return;
  }
  const users=JSON.parse(localStorage.getItem('starquest_users')||'{}');
  let priorWallet={};try{priorWallet=JSON.parse(localStorage.getItem('infinity_unified_wallet_v1')||'{}')}catch{}
  const historical=Number(priorWallet?.musicQuants||0)>0||
   Object.values(priorWallet?.wallets||{}).some(w=>Number(w?.balances?.MUSIC_QUANT||0)>0||
    Number(w?.balances?.INFINITY||0)>0||Number(w?.balances?.QUANT||0)>0);
  const storedDevice=Array.from({length:localStorage.length},(_,i)=>localStorage.key(i)||'').some(k=>k.startsWith(TOKEN_PREFIX));
  // Existing wallet evidence MUST NOT silently turn into a brand-new wallet.
  // Preserve the local histories and offer recovery for their real owner.
  if(Object.keys(users).length||storedDevice||historical||localStorage.getItem('starquest_session')){
   note('EXISTING WALLET RECOVERY REQUIRED · balances preserved');
   if(RECOVERY){RECOVERY.hidden=false;RECOVERY.removeAttribute('hidden')}
   return;
  }
  // No identity proof -> no new account. Existing holdings remain untouched.
  note('NO VERIFIED DEVICE WALLET · RECONNECT EXISTING ACCOUNT');
  if(RECOVERY){RECOVERY.hidden=false;RECOVERY.removeAttribute('hidden')}
 }catch(error){
  note('DEVICE WALLET PENDING');
  console.warn('Device wallet connection deferred',error);
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>void start(),{once:true});else void start();
})();
