const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const load=file=>fs.readFileSync(file,'utf8');

test('Completed-song listening records are not discarded after 500 entries',async()=>{
 const listeners={},memory=new Map(),events=[];
 const old=Array.from({length:520},(_,i)=>({id:'mq_old_'+i,kind:'listening',song:'Song '+i,startedAt:'2026-01-'+String(i%28+1).padStart(2,'0')+'T00:00:00Z',notes:[],createdAt:new Date(Date.UTC(2026,0,1,0,0,i)).toISOString()}));
 memory.set('musicPhi:listeningQuants:v1',JSON.stringify(old));
 const ctx={window:{dispatchEvent:event=>events.push(event)},localStorage:{getItem:key=>memory.get(key)||null,setItem:(key,v)=>memory.set(key,v)},
  document:{readyState:'loading',addEventListener(){}},addEventListener:(type,fn)=>listeners[type]=fn,
  CustomEvent:class{constructor(type,init){this.type=type;this.detail=init.detail}},
  crypto:{subtle:{digest:async()=>Uint8Array.from({length:32},(_,i)=>i).buffer}},
  TextEncoder,console};
 vm.runInNewContext(load('listening-quant.js'),ctx);
 listeners['infinityradio:track-complete']({detail:{track:{title:'Track 521',url:'https://archive.org/download/example'},startedAt:'2026-10-11T01:00:00Z',endedAt:'2026-10-11T01:04:00Z',durationSec:240}});
 await new Promise(resolve=>setImmediate(resolve));
 const saved=JSON.parse(memory.get('musicPhi:listeningQuants:v1'));
 assert.equal(saved.length,521);assert.ok(saved.some(x=>x.id==='mq_old_519'));
 assert.equal(events.filter(x=>x.type==='musicquant:changed').length,1);
});
test('Unified wallet backfill never truncates listening history at 500 records',()=>{
 const bridge=load('unified-wallet-bridge.js');
 assert.doesNotMatch(bridge,/write\(LISTENING,[\s\S]{0,300}\.slice\(0,500\)/);
 assert.match(bridge,/token\.token_type==='LISTENING_QUANT'/);
});
