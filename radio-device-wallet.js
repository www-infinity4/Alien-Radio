(function(){
'use strict';
const TOKEN_PREFIX='starquest_ledger_device_v1:';
const STATUS=document.getElementById('ledgerState');
const RECOVERY=document.getElementById('connectAccountButton');
function note(message){if(STATUS)STATUS.textContent=message}
function tokenFor(key){const raw=localStorage.getItem(key)||'';if(/^sq_[A-Za-z0-9_-]{32,}$/.test(raw))return raw;try{const token=JSON.parse(raw)?.deviceToken;return /^sq_[A-Za-z0-9_-]{32,}$/.test(token)?token:''}catch{return ''}}
function randomPart(){const bytes=new Uint8Array(18);crypto.getRandomValues(bytes);return [...bytes].map(byte=>byte.toString(16).padStart(2,'0')).join('')}
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
 if(window.StarQuestAuth?.currentUser?.())return;
 try{
  note('CONNECTING DEVICE WALLET');
  if(await recoverSavedDevice())return;
  const users=JSON.parse(localStorage.getItem('starquest_users')||'{}');
  if(Object.keys(users).length){note('WALLET RECOVERY AVAILABLE');return}
  const username='device_'+randomPart();
  const password=randomPart()+randomPart();
  const result=await window.StarQuestAuth.register(username,password);
  if(typeof result==='string')throw new Error(result);
  const connected=await window.StarQuestCloudLedger.connect();
  if(!connected)throw new Error('Cloudflare device wallet connection pending');
  note('DEVICE WALLET CONNECTED');
  STATUS?.classList.add('connected');
  RECOVERY?.setAttribute('hidden','');
  await window.MusicQuantCloud?.sync?.();
  window.ControlPhi?.refreshWallet?.();
 }catch(error){
  note('DEVICE WALLET PENDING');
  console.warn('Device wallet connection deferred',error);
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>void start(),{once:true});else void start();
})();
