(function(){
'use strict';
const ENDPOINT='https://quanta-phi-ledger.marvaseater.workers.dev';
const PLAYABLE='musicPhi:quants:v1',LISTENING='musicPhi:listeningQuants:v1';
const esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'[]')||[]}catch{return[]}};
function archive(key,id,recipient){
 const items=read(key);const index=items.findIndex(q=>q?.id===id);
 if(index<0)return;items[index]={...items[index],transferredAt:new Date().toISOString(),transferredTo:recipient};
 try{localStorage.setItem(key,JSON.stringify(items))}catch{}
}
async function archiveDevice(id,recipient){
 const playable=await window.MusicQuantStore?.list().catch(()=>[])||[];
 const record=playable.find(q=>q.id===id);
 if(record)await window.MusicQuantStore.put({...record,transferredAt:new Date().toISOString(),transferredTo:recipient});
 archive(PLAYABLE,id,recipient);archive(LISTENING,id,recipient);
}
function render(){
 const panel=document.getElementById('controlPhiWalletPanel');if(!panel)return;
 let host=document.getElementById('musicQuantTransfer');
 if(!host){host=document.createElement('section');host.id='musicQuantTransfer';host.className='mq-transfer';panel.appendChild(host)}
 const state=window.MusicQuantCloud?.state;
 if(!state?.ok||!state.wallet_id){
  host.innerHTML='<strong>Music Quant ownership</strong><p>Connect your StarQuest account to receive or transfer saved Music Quants.</p>';return
 }
 const quants=Array.isArray(state.quants)?state.quants:[];
 host.innerHTML='<strong>Music Quant ownership</strong><p>Your receiving wallet ID</p><div class="mq-receive"><code>'+esc(state.wallet_id)+'</code><button type="button" data-copy-wallet>Copy</button></div>'+
 (quants.length?'<form id="mqTransferForm"><label>Music Quant<select name="quant">'+quants.map(q=>'<option value="'+esc(q.id)+'">'+esc(q.song||q.context?.playback?.song||q.id)+'</option>').join('')+'</select></label><label>Recipient wallet ID<input name="recipient" placeholder="qw_…" required autocomplete="off"></label><button type="submit">Transfer selected Music Quant</button><small>Ownership moves after the Cloudflare ledger confirms the transfer. Keep the receipt.</small></form>':'<p>No owned Music Quants are available to transfer.</p>')+'<p class="mq-transfer-status" role="status"></p>';
 host.querySelector('[data-copy-wallet]')?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(state.wallet_id);host.querySelector('.mq-transfer-status').textContent='Wallet ID copied.'}catch{host.querySelector('.mq-transfer-status').textContent='Select and copy the wallet ID above.'}});
 host.querySelector('form')?.addEventListener('submit',async event=>{
  event.preventDefault();const form=event.currentTarget,button=form.querySelector('button[type=submit]'),status=host.querySelector('.mq-transfer-status'),id=form.elements.quant.value,recipient=form.elements.recipient.value.trim();
  if(!/^qw_[A-Za-z0-9-]{20,}$/.test(recipient)){status.textContent='Enter the recipient’s complete wallet ID.';return}
  if(recipient===state.wallet_id){status.textContent='Choose another wallet.';return}
  const quant=quants.find(item=>item.id===id);if(!quant)return;
  if(!window.confirm('Transfer '+(quant.song||quant.id)+' to '+recipient+'? This changes ownership.'))return;
  button.disabled=true;status.textContent='Waiting for ledger confirmation…';
  try{
   const bridge=window.StarQuestCloudLedger;
   if(!bridge?.authenticatedFetch)throw new Error('account_not_connected');
   const response=await bridge.authenticatedFetch(ENDPOINT+'/v1/music-quants/transfer',{method:'POST',body:JSON.stringify({quant_id:id,recipient_wallet_id:recipient,idempotency_key:'radio-transfer:'+id+':'+recipient})});
   const receipt=await response.json().catch(()=>({}));
   if(!response.ok||!receipt.ok)throw new Error(receipt.error||'transfer_failed');
   await archiveDevice(id,recipient);
   status.textContent='Transferred. Receipt '+String(receipt.transfer_id||'replayed')+'.';
   await window.MusicQuantCloud.sync();
  }catch(error){status.textContent='Transfer not completed: '+String(error?.message||error)}
  finally{button.disabled=false}
 });
}
const css=document.createElement('style');css.textContent='.mq-transfer{margin-top:15px;padding:13px;border:1px solid #dbc5e9;border-radius:14px;background:#fbf7ff;color:#321647}.mq-transfer>strong{font-size:16px!important}.mq-transfer p{margin:7px 0!important}.mq-receive{display:flex;gap:6px;align-items:center}.mq-receive code{flex:1;min-width:0;overflow-wrap:anywhere;font-size:11px}.mq-transfer button{border:0;border-radius:9px;padding:9px 11px;background:#65308e;color:#fff;font-weight:800}.mq-transfer form{display:grid;gap:9px;margin-top:12px}.mq-transfer label{display:grid;gap:4px;font-size:11px;font-weight:800}.mq-transfer input,.mq-transfer select{width:100%;box-sizing:border-box;padding:10px;border:1px solid #c7add8;border-radius:9px;background:#fff;color:#321647}.mq-transfer small{color:#644779}.mq-transfer-status{font-size:12px;font-weight:700}';document.head.appendChild(css);
addEventListener('musicquant:cloud-synced',render);
addEventListener('controlphi:wallet-change',()=>{if(!document.getElementById('musicQuantTransfer'))render()});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{render();setTimeout(render,1000)},{once:true});else{render();setTimeout(render,1000)}
})();
