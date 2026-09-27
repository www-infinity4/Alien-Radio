(function(){
'use strict';
const STORE='musicPhi:listeningQuants:v1',CONTEXT='phiContext:events:v1';
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}};
const esc=value=>String(value??'').replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
let quants=read(STORE,[]);
async function digest(value){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(value)));return [...new Uint8Array(bytes)].map(byte=>byte.toString(16).padStart(2,'0')).join('')}
function contextBetween(startedAt,endedAt){const start=Date.parse(startedAt||0),end=Date.parse(endedAt||new Date().toISOString());return read(CONTEXT,[]).filter(event=>{const at=Date.parse(event?.at||0);return at>=start&&at<=end}).slice(0,20).map(event=>({action:String(event.action||'').slice(0,40),topic:String(event.topic||'').slice(0,180),channel:String(event.channel||'').slice(0,100),program:String(event.program||'').slice(0,180),page:String(event.page||'').slice(0,180),at:String(event.at||'')}))}
async function mint(detail){
 const track=detail?.track||{},title=String(track.title||'').trim();if(!title||!detail.startedAt)return;
 if(quants.some(quant=>quant.startedAt===detail.startedAt&&quant.song===title))return;
 const events=contextBetween(detail.startedAt,detail.endedAt);
 const body={version:2,kind:'listening',notes:[],settings:{},song:title,sourceUrl:String(track.url||''),archiveItem:String(track.archiveItem||''),startedAt:String(detail.startedAt),endedAt:String(detail.endedAt||new Date().toISOString()),durationSec:Number(detail.durationSec)||null,createdAt:new Date().toISOString(),source:'infinity-radio-listening-quant',context:{version:1,playback:{song:title,station:'Infinity Radio',playing:true,capturedAt:String(detail.endedAt||new Date().toISOString())},events,retention:'user-owned-context'}};
 body.hash=await digest(body);body.id='mq_'+body.hash.slice(0,20);quants.unshift(body);quants=quants.slice(0,500);write(STORE,quants);render();window.dispatchEvent(new CustomEvent('musicquant:changed',{detail:{action:'listen',kind:'listening',quantId:body.id}}));
}
function install(){
 const host=document.createElement('section');host.className='listening-quant-panel';host.innerHTML='<div><small>AUTOMATIC · ONE PER COMPLETED SONG</small><h2>Listening Quants</h2><p>Listening earns a Music Quant even when you do not click. Searches, shopping and shares during that song can travel with it as useful context.</p></div><strong id="listeningQuantBalance">0 Listening Quants</strong><div id="listeningQuantList"></div>';
 const style=document.createElement('style');style.textContent='.listening-quant-panel{margin-top:14px;padding:14px;border:1px solid #51447d;border-radius:16px;background:linear-gradient(150deg,#100d25,#06111d);color:#eef}.listening-quant-panel>div:first-child{max-width:680px}.listening-quant-panel small{color:#a99cff;letter-spacing:.12em;font-size:9px}.listening-quant-panel h2{margin:3px 0}.listening-quant-panel p{margin:6px 0;color:#b9b6cf;font-size:12px}.listening-quant-panel>strong{display:block;margin:8px 0;color:#ffe15a;font-size:12px}.lq-card{margin-top:7px;padding:8px 10px;border:1px solid #ffffff18;border-radius:10px;background:#070d18}.lq-card b,.lq-card small{display:block}.lq-card small{color:#9ba7bb;margin-top:3px}';document.head.appendChild(style);
 const composer=document.querySelector('.music-quant-lab');if(composer)composer.before(host);else document.querySelector('.radio-shell')?.appendChild(host);render();
}
function render(){const balance=document.getElementById('listeningQuantBalance'),list=document.getElementById('listeningQuantList');if(balance)balance.textContent=quants.length+' Listening Quant'+(quants.length===1?'':'s');if(list)list.innerHTML=quants.slice(0,10).map((quant,index)=>'<article class="lq-card"><b>'+esc(quant.song)+'</b><small>Listening Quant '+(quants.length-index)+' · '+(quant.context?.events?.length||0)+' purposeful event'+((quant.context?.events?.length||0)===1?'':'s')+' · '+esc(quant.hash?.slice(0,16)||'pending')+'</small></article>').join('')||'<p>No completed-song Quant yet. Finish the current song to earn one automatically.</p>'}
addEventListener('infinityradio:track-complete',event=>void mint(event.detail));
addEventListener('musicquant:cloud-synced',()=>{quants=read(STORE,[]);render()});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();