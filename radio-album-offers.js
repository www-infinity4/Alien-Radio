/* Verified song-to-album shopping for Infinity Radio.
   Apple store listings are live, not invented advertisements. Physical CD links
   are clearly marked as searches. Playback, billing and wallets are untouched. */
(function(root,build){
 'use strict';
 const api=build();
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root?.document)api.mount(root);
})(globalThis,function(){
 'use strict';
 const COMPOSERS=['Chopin','Bach','Beethoven','Mozart','Brahms','Haydn','Mendelssohn','Schubert','Schumann','Pachelbel','Joplin','Grieg','Dvorak','Borodin','Tchaikovsky','Rimsky-Korsakov','Handel'];
 const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
 function composerOf(title){
   return COMPOSERS.find(name=>clean(title).toLowerCase().includes(name.toLowerCase()))||'';
 }
 function queryForTrack(track){
   const title=clean(track?.title);
   if(!title)return '';
   const composer=composerOf(title);
   if(!composer)return title.replace(/\b\d{1,3}\b/g,' ').replace(/[·:_\-]+/g,' ').replace(/\s+/g,' ').trim().slice(0,100);
   let work=title.replace(/Johann Sebastian|Ludwig van|Wolfgang Amadeus|Felix|Fr[eé]d[eé]ric|Frederic|Robert|Franz|Johannes|Joseph|Anton[ií]n|Edvard|Alexander|Pyotr/gi,' ');
   work=work.replace(/[·:_\-–—]+/g,' ').replace(/\b0?\d{1,3}\b/g,' ')
     .replace(/\b(?:in|no|op|bwv|k)\b/gi,' ').replace(/\s+/g,' ').trim();
   work=work.replace(new RegExp(composer,'gi'),' ').replace(/\s+/g,' ').trim();
   return clean(composer+' '+work.split(' ').slice(0,7).join(' ')).slice(0,110);
 }
 function validAppleUrl(value){
   try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&
     ['music.apple.com','itunes.apple.com'].includes(u.hostname)}
   catch(_){return false}
 }
 function validArtUrl(value){
   try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&
     /^(?:is[0-9]+-ssl|is[0-9]+)\.mzstatic\.com$/.test(u.hostname)}
   catch(_){return false}
 }
 function filterAlbums(trackOrTitle,items){
   const title=typeof trackOrTitle==='string'?trackOrTitle:trackOrTitle?.title;
   const composer=composerOf(title);
   if(!composer)return [];
   const words=queryForTrack({title}).toLowerCase().split(' ').filter(word=>word.length>4&&word!==composer.toLowerCase());
   const seen=new Set(),matches=[];
   for(const album of Array.isArray(items)?items:[]){
     if(album?.wrapperType!=='collection'||album?.collectionType!=='Album'||
       !clean(album.collectionName)||!clean(album.artistName)||
       !validAppleUrl(album.collectionViewUrl)||!validArtUrl(album.artworkUrl100))continue;
     const haystack=(album.collectionName+' '+album.artistName+' '+String(album.collectionArtistName||'')).toLowerCase();
     const score=(haystack.includes(composer.toLowerCase())?3:0)+words.filter(word=>haystack.includes(word)).length;
     if(score<2||seen.has(album.collectionViewUrl))continue;
     seen.add(album.collectionViewUrl);
     matches.push({title:clean(album.collectionName).slice(0,150),artist:clean(album.artistName).slice(0,100),
       storeUrl:album.collectionViewUrl,artworkUrl:album.artworkUrl100,
       price:Number.isFinite(album.collectionPrice)&&album.collectionPrice>0&&album.currency==='USD'?
         new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(album.collectionPrice):'',
       relationship:'Other recording of this composer/work',score});
   }
   return matches.sort((a,b)=>b.score-a.score).slice(0,3);
 }
 function cdSearchUrl(track){
   const query=queryForTrack(track);if(!query)return '';
   const u=new URL('https://www.discogs.com/search/');
   u.searchParams.set('q',query);u.searchParams.set('type','all');u.searchParams.set('format_exact','CD');
   return u.href;
 }
 function ebaySearchUrl(track){
   const query=queryForTrack(track);if(!query)return '';
   const u=new URL('https://www.ebay.com/sch/i.html');
   u.searchParams.set('_nkw',query+' CD');u.searchParams.set('LH_BIN','1');
   return u.href;
 }
 function mount(win){
   const doc=win.document;
   let section=doc.getElementById('radio-album-shop');
   if(!section){
     const quick=doc.getElementById('infinityRadioQuick');if(!quick)return;
     section=doc.createElement('section');
     section.id='radio-album-shop';section.className='radio-album-shop';
     section.setAttribute('aria-label','Albums related to the playing music');section.hidden=true;
     section.innerHTML='<h2>Find this music on an album</h2><p id="radio-shop-track"></p>'+
       '<div id="radio-shop-cards" class="radio-shop-grid"></div>'+
       '<nav class="radio-shop-links" aria-label="Find physical albums">'+
       '<a id="radio-shop-cd" target="_blank" rel="noopener noreferrer">Find CDs · Discogs</a>'+
       '<a id="radio-shop-ebay" target="_blank" rel="noopener noreferrer">Find CDs · eBay Buy It Now</a></nav>'+
       '<p id="radio-shop-note"></p>';
     quick.insertAdjacentElement('afterend',section);
   }
   const trackLabel=doc.getElementById('radio-shop-track');
   const cards=doc.getElementById('radio-shop-cards');
   const cd=doc.getElementById('radio-shop-cd'),ebay=doc.getElementById('radio-shop-ebay');
   const note=doc.getElementById('radio-shop-note');
   if(!trackLabel||!cards||!cd||!ebay||!note)return;
   let current=0,timer=null,lastSearch=0,requestId=0;
   const cache=new Map();
   function make(tag,cls,value){
     const e=doc.createElement(tag);
     if(cls)e.className=cls;
     if(value!==undefined)e.textContent=value;
     return e;
   }
   function render(track,raw){
     cards.replaceChildren();
     const matches=filterAlbums(track,raw);
     matches.forEach(album=>{
       const card=make('article','radio-shop-product');
       const a=make('a','radio-shop-product-link');
       a.href=album.storeUrl;a.target='_blank';a.rel='noopener noreferrer';
       const img=make('img','radio-shop-art');
       img.src=album.artworkUrl;img.alt='Official album cover: '+album.title;
       img.loading='lazy';img.decoding='async';
       img.addEventListener('error',()=>card.remove());
       a.appendChild(img);
       const copy=make('div','radio-shop-product-copy');
       copy.appendChild(make('strong','',album.title));
       copy.appendChild(make('small','',album.artist));
       copy.appendChild(make('small','','Different recording · compare before buying'));
       if(album.price)copy.appendChild(make('small','radio-shop-price','iTunes US listing '+album.price+' · confirm with retailer'));
       a.appendChild(copy);card.appendChild(a);
       const store=make('a','radio-shop-store-action','View on Apple Music');
       store.href=album.storeUrl;store.target='_blank';store.rel='noopener noreferrer';
       card.appendChild(store);
       cards.appendChild(card);
     });
     note.textContent=matches.length?
       'Real store album art and links. These may be different performances from the free radio recording. Prices and stock must be confirmed with the retailer.':
       'No verified digital album match found. You can still search CD editions; no stock or price is claimed.';
   }
   function search(query){
     return new Promise((resolve,reject)=>{
       const callback='InfinityRadioAlbum_'+Date.now()+'_'+(++requestId);
       const script=doc.createElement('script');
       const url=new URL('https://itunes.apple.com/search');
       [['term',query],['media','music'],['entity','album'],['country','US'],['limit','12'],['callback',callback]]
         .forEach(pair=>url.searchParams.set(pair[0],pair[1]));
       let done=false,timeout;
       function finish(error,data){
         if(done)return;done=true;
         win.clearTimeout(timeout);
         script.remove();
         try{delete win[callback]}catch(_){win[callback]=undefined}
         if(error)reject(error);
         else resolve(Array.isArray(data?.results)?data.results:[]);
       }
       win[callback]=data=>finish(null,data);
       script.onerror=()=>finish(new Error('itunes_album_search_failed'));
       script.referrerPolicy='no-referrer';script.src=url.href;
       timeout=win.setTimeout(()=>finish(new Error('itunes_album_search_timeout')),8000);
       doc.head.appendChild(script);
     });
   }
   function showTrack(track){
     const title=clean(track?.title);
     const query=queryForTrack(track);
     if(!title||!query)return;
     const run=++current;
     section.hidden=false;
     trackLabel.textContent='Playing / selected · '+title;
     cd.href=cdSearchUrl(track);ebay.href=ebaySearchUrl(track);
     cards.replaceChildren();
     const cached=cache.get(query);
     if(cached&&cached.expiry>Date.now()){render(track,cached.items);return}
     note.textContent='Checking real digital album listings… The CD links are retailer searches, not guaranteed inventory.';
     if(timer)win.clearTimeout(timer);
     const delay=Math.max(900,6500-(Date.now()-lastSearch));
     timer=win.setTimeout(async()=>{
       if(run!==current)return;
       lastSearch=Date.now();
       try{
         const items=await search(query);
         cache.set(query,{expiry:Date.now()+20*60*1000,items});
         if(run===current)render(track,items);
       }catch(error){
         if(run===current)note.textContent='Digital listings temporarily unavailable; CD searches still work. No price or inventory was fabricated.';
         win.console?.warn?.('Infinity Radio retail lookup deferred',error);
       }
     },delay);
   }
   function selected(){
     const select=doc.getElementById('piano-library-select');
     const option=select?.selectedOptions?.[0];
     if(option)showTrack({title:clean(option.textContent).replace(/^\d+\.\s*/,'')});
   }
   win.addEventListener('infinityradio:track-start',event=>{
     if(event?.detail?.track?.title)showTrack(event.detail.track);
   });
   win.addEventListener('infinityradio:track-selected',event=>{
     if(event?.detail?.track?.title)showTrack(event.detail.track);
   });
   win.addEventListener('infinityradio:library-loaded',selected);
   doc.getElementById('piano-library-select')?.addEventListener('change',selected);
   selected();
   return {showTrack};
 }
 return {queryForTrack,filterAlbums,cdSearchUrl,ebaySearchUrl,validAppleUrl,validArtUrl,mount};
});
