(function(){
'use strict';
const QUANTS='musicPhi:quants:v1',SPENT='musicPhi:spent:v1',RECEIVED='musicPhi:received:v1',COMPOSITIONS='musicPhi:compositions:v1';
const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}},write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let composition=read(COMPOSITIONS,[])[0]||null,playCtx=null,playing=[];
async function hash(value){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(value)));return [...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('')}
function available(){const spent=new Set(read(SPENT,[]).map(x=>x.quantId)),source=window.MusicQuantLab?.getQuants?.()||read(QUANTS,[]);return source.filter(q=>!spent.has(q.id))}
function dynamicsGain(mark){return({pp:.07,p:.1,mp:.14,mf:.2,f:.28,ff:.36})[mark]||.2}
function bridge(a,b,settings){const from=a.midi,to=b.midi,diff=to-from;if(Math.abs(diff)<=2)return[];const direction=Math.sign(diff),count=Math.min(4,Math.max(1,Math.floor(Math.abs(diff)/3))),beat=60000/Math.max(30,Number(settings.bpm)||90);return Array.from({length:count},(_,i)=>({name:'bridge',midi:Math.round(from+diff*((i+1)/(count+1))),holdMs:Math.round(beat*.55),offsetMs:Math.round(beat*.6),generated:true,dynamic:settings.dynamic}))}
async function compose(){
 const source=available();
 if(!source.length){status('Record at least one Music Quant first.');return}
 const events=[];let timelineMs=0;
 source.forEach((q,qi)=>{const settings=q.settings||{},notes=q.notes.slice().sort((a,b)=>(Number(a.onsetMs)||0)-(Number(b.onsetMs)||0)||(Number(a.midi)||0)-(Number(b.midi)||0));let legacyOnset=0,previousHold=0;notes.forEach((n,ni)=>{let localOnset;if(Number.isFinite(Number(n.onsetMs)))localOnset=Math.max(0,Number(n.onsetMs));else{if(ni)legacyOnset+=Number(n.offsetMs)>0?Number(n.offsetMs):previousHold;localOnset=legacyOnset}previousHold=Math.max(60,Number(n.holdMs)||250);events.push({...n,compositionOnsetMs:timelineMs+localOnset,settings,quantId:q.id,generated:false,dynamic:settings.dynamic,sourceIndex:qi,noteIndex:ni})});const quantEnd=Math.max(...events.filter(e=>e.sourceIndex===qi).map(e=>e.compositionOnsetMs+Math.max(60,Number(e.holdMs)||250)),timelineMs+250);timelineMs=quantEnd+90;const next=source[qi+1];if(next)bridge(notes[notes.length-1],next.notes[0],settings).forEach((n,bi)=>{events.push({...n,compositionOnsetMs:timelineMs+bi*Math.max(60,Number(n.offsetMs)||120),settings,quantId:q.id+'→'+next.id});timelineMs+=Math.max(60,Number(n.holdMs)||200)})});
 const body={type:'infinity.music-quant.composition.v1',sourceQuantIds:source.map(q=>q.id),events,createdAt:new Date().toISOString(),composer:'music-quant-bridge-engine-v1',gptReady:true};body.hash=await hash(body);composition=body;const saved=read(COMPOSITIONS,[]);saved.unshift(body);write(COMPOSITIONS,saved.slice(0,100));renderComposition();status('Composition built from '+source.length+' Music Quant'+(source.length===1?'':'s')+' with '+events.filter(x=>x.generated).length+' transition notes.')}
function ensureAudio(){if(!playCtx)playCtx=new (AudioContext||webkitAudioContext)();if(playCtx.state==='suspended')playCtx.resume()}
function stop(){playing.forEach(x=>{try{x.stop()}catch{}});playing=[]}
function instrumentPartials(name){if(name==='organ')return[{ratio:1,type:'sine',amount:.8},{ratio:2,type:'sine',amount:.2}];if(name==='bell')return[{ratio:1,type:'sine',amount:.72},{ratio:2.76,type:'sine',amount:.2},{ratio:5.4,type:'sine',amount:.08}];if(name==='electric')return[{ratio:1,type:'sine',amount:.82},{ratio:2,type:'triangle',amount:.12},{ratio:3.01,type:'sine',amount:.05}];return[{ratio:1,type:'sine',amount:.86},{ratio:2.01,type:'sine',amount:.17},{ratio:3.99,type:'sine',amount:.065},{ratio:6.02,type:'sine',amount:.02}]}
function play(){
 if(!composition){status('Build the composition first.');return}
 ensureAudio();stop();
 const origin=playCtx.currentTime+.08;
 let onset=origin,previousDuration=.25;
 composition.events.forEach((event,index)=>{
  const s=event.settings||{};
  const gain=playCtx.createGain();
  const duration=Math.max(.06,Math.min(8,Number(event.holdMs||250)/1000));
  if(Number.isFinite(Number(event.compositionOnsetMs)))onset=origin+Math.max(0,Number(event.compositionOnsetMs))/1000;
  else if(index){
   const recordedOffset=Number(event.offsetMs);
   // offsetMs is onset-to-onset time captured while the player performed.
   // Never add the previous hold duration too: that made playback unevenly slow.
   const onsetDelta=Number.isFinite(recordedOffset)&&recordedOffset>0
    ?Math.max(.01,Math.min(8,recordedOffset/1000))
    :previousDuration;
   onset+=onsetDelta;
  }
  const midi=Math.max(0,Math.min(127,Number(event.midi)||60));
  const frequency=440*Math.pow(2,(midi-69)/12);
  const level=dynamicsGain(event.dynamic||s.dynamic);
  const attackEnd=onset+Math.min(.018,duration*.25);
  const releaseStart=onset+Math.max(.025,duration-Math.min(.08,duration*.35));
  gain.gain.setValueAtTime(.0001,onset);
  gain.gain.exponentialRampToValueAtTime(level,attackEnd);
  gain.gain.setValueAtTime(level,releaseStart);
  gain.gain.exponentialRampToValueAtTime(.0001,onset+duration);
  gain.connect(playCtx.destination);
  instrumentPartials(s.instrument).forEach(partial=>{const osc=playCtx.createOscillator(),partialGain=playCtx.createGain();osc.type=partial.type;osc.frequency.setValueAtTime(frequency*partial.ratio,onset);partialGain.gain.value=partial.amount;osc.connect(partialGain);partialGain.connect(gain);osc.start(onset);osc.stop(onset+duration+.03);playing.push(osc)});previousDuration=duration;
 });
 status('Playing '+composition.events.length+' notes at their recorded timing. Infinity Radio remains independent.')
}
async function spend(){
 const q=available()[0];if(!q){status('No unspent Music Quant is available.');return}
 const packet={type:'infinity.music-quant.transfer.v1',version:1,quantId:q.id,originHash:q.hash,notes:q.notes,settings:q.settings,createdAt:q.createdAt,spentAt:new Date().toISOString(),playable:true,unit:'Music Quant',quantity:1};packet.transferHash=await hash(packet);
 const blob=new Blob([JSON.stringify(packet,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=q.id+'.music-quant.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 const spent=read(SPENT,[]);spent.unshift({quantId:q.id,originHash:q.hash,transferHash:packet.transferHash,spentAt:packet.spentAt,quantity:1});write(SPENT,spent);window.dispatchEvent(new CustomEvent('musicquant:changed',{detail:{action:'spend-packet',quantId:q.id}}));status('Spent 1 Music Quant into a playable transfer packet. The notes and settings travel with it.');renderBalance()}
async function receive(file){
 try{const packet=JSON.parse(await file.text());if(packet?.type!=='infinity.music-quant.transfer.v1'||!Array.isArray(packet.notes)||packet.notes.length<5||packet.notes.length>15)throw new Error('invalid packet');const claimed=packet.transferHash;const copy={...packet};delete copy.transferHash;const actual=await hash(copy);if(actual!==claimed)throw new Error('hash mismatch');const received=read(RECEIVED,[]);if(!received.some(x=>x.transferHash===claimed)){received.unshift(packet);write(RECEIVED,received)}composition={type:'infinity.music-quant.composition.v1',sourceQuantIds:[packet.quantId],events:packet.notes.map(n=>({...n,compositionOnsetMs:Number(n.onsetMs)||0,settings:packet.settings,dynamic:packet.settings?.dynamic})),createdAt:new Date().toISOString(),composer:'received-transfer',hash:claimed};renderComposition();renderBalance();status('Received and verified 1 playable Music Quant. Press Play composition to hear it.')}catch(e){status('That Music Quant packet could not be verified: '+e.message)}}
function renderComposition(){const out=document.getElementById('mqComposerOutput');if(!out)return;if(!composition){out.innerHTML='<p>No composition built yet.</p>';return}const generated=composition.events.filter(x=>x.generated).length;out.innerHTML='<strong>'+composition.events.length+' notes · '+generated+' generated transitions</strong><code>'+esc(composition.hash.slice(0,20))+'</code><div class="mq-sequence">'+composition.events.map(e=>'<span class="'+(e.generated?'generated':'')+'">'+(e.generated?'↝':esc(e.name||String(e.midi)))+'</span>').join('')+'</div>'}
function renderBalance(){const el=document.getElementById('mqSpendable');if(el)el.textContent=available().length+' spendable · '+read(RECEIVED,[]).length+' received'}
function status(text){const el=document.getElementById('mqComposerStatus');if(el)el.textContent=text}
function install(){
 const lab=document.querySelector('.music-quant-lab');if(!lab)return;const panel=document.createElement('section');panel.className='mq-composer';panel.innerHTML='<div class="mq-composer-head"><div><small>COMPOSITION INTELLIGENCE · GPT-READY</small><h3>Build Quants into music</h3></div><strong id="mqSpendable"></strong></div><p>Recorded Quants remain intact. The composer adds short measured transition notes between them and plays the complete sequence with each source Quant’s instrument, tempo, dynamics and durations.</p><div class="mq-composer-actions"><button id="mqCompose">Build composition</button><button id="mqPlayComposition">Play composition</button><button id="mqStopComposition">Stop</button><button id="mqSpend">Spend 1 playable Quant</button><label class="mqReceive">Receive Quant<input id="mqReceiveFile" type="file" accept=".json,application/json"></label></div><div id="mqComposerOutput"></div><p id="mqComposerStatus"></p>';
 const style=document.createElement('style');style.textContent='.mq-composer{margin-top:16px;padding:13px;border:1px solid #7359b8;border-radius:14px;background:#0d0920}.mq-composer-head{display:flex;justify-content:space-between;gap:10px}.mq-composer h3{margin:4px 0}.mq-composer small{color:#bfa8ff;font-size:9px;letter-spacing:.13em}.mq-composer p{font-size:12px;color:#b9b2cf}.mq-composer-actions{display:flex;gap:7px;flex-wrap:wrap}.mq-composer button,.mqReceive{border:1px solid #8066c6;border-radius:10px;background:#24184a;color:#fff;padding:9px 11px;font-weight:800;cursor:pointer}.mqReceive input{display:none}.mq-composer code{display:block;color:#9fe4df;font-size:9px;margin-top:5px}.mq-sequence{display:flex;gap:5px;flex-wrap:wrap;margin-top:9px}.mq-sequence span{width:28px;height:28px;display:grid;place-items:center;border-radius:50%;background:#e9f7f5;color:#15202a;font-weight:900}.mq-sequence span.generated{background:#ffe15a;color:#251a00}';document.head.appendChild(style);lab.appendChild(panel);
 document.getElementById('mqCompose').onclick=compose;document.getElementById('mqPlayComposition').onclick=play;document.getElementById('mqStopComposition').onclick=stop;document.getElementById('mqSpend').onclick=spend;document.getElementById('mqReceiveFile').onchange=e=>{const f=e.target.files?.[0];if(f)receive(f);e.target.value=''};addEventListener('storage',renderBalance);addEventListener('musicquant:changed',renderBalance);addEventListener('musicquant:cloud-synced',()=>{renderBalance();if(!composition){composition=read(COMPOSITIONS,[])[0]||null;renderComposition()}});renderBalance();renderComposition();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
