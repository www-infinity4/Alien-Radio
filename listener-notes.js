(function(){
'use strict';
const composers={
 Chopin:{life:'1810–1849',about:'Frédéric Chopin wrote almost entirely for piano, shaping intimate melody, flexible rubato and highly refined keyboard color.'},
 Bach:{life:'1685–1750',about:'Johann Sebastian Bach joined rigorous counterpoint with expressive harmony. His keyboard writing remains a foundation for technique and musical architecture.'},
 Mozart:{life:'1756–1791',about:'Wolfgang Amadeus Mozart balanced clarity, drama and melodic invention. His piano works move easily between orchestral scale and conversational detail.'},
 Beethoven:{life:'1770–1827',about:'Ludwig van Beethoven expanded the piano’s emotional and structural range, bridging the Classical and Romantic eras.'},
 Schumann:{life:'1810–1856',about:'Robert Schumann’s piano music often works like miniature literature—compressed scenes, characters and shifts of memory.'},
 Joplin:{life:'1868–1917',about:'Scott Joplin gave ragtime lasting formal shape through syncopated rhythm, clear sectional design and memorable melody.'},
 Pachelbel:{life:'1653–1706',about:'Johann Pachelbel was a German Baroque composer and organist whose repeating-bass structures influenced generations of harmonic writing.'}
};
function details(title){const name=Object.keys(composers).find(x=>title.includes(x));const c=composers[name]||{life:'Historical piano repertoire',about:'This selection is part of Infinity Radio’s continuous classical piano rotation.'};return{name:name||'Classical piano',life:c.life,about:c.about}}
function install(){const player=document.querySelector('.player');if(!player)return;const box=document.createElement('article');box.id='listenerNotes';box.style.cssText='margin-top:12px;padding:12px;border:1px solid #21465b;border-radius:12px;background:#06101d;text-align:left;color:#dff';player.after(box);const update=()=>{const title=document.getElementById('np-channel')?.textContent?.trim()||'Infinity Radio piano';const d=details(title);box.innerHTML='<small style="letter-spacing:.14em;opacity:.6">LISTENER NOTES</small><h2 style="font-size:17px;margin:5px 0">'+title+'</h2><strong style="font-size:12px;color:#ffe15a">'+d.name+' · '+d.life+'</strong><p style="font-size:13px;line-height:1.5;opacity:.82;margin-bottom:0">'+d.about+' Hold times, phrasing, dynamics and tempo are useful clues when building your own five-note Music Quants below.</p>'};update();new MutationObserver(update).observe(document.getElementById('np-channel'),{childList:true,subtree:true,characterData:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();