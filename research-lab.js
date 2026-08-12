'use strict';
const state={query:'',sources:[],selected:new Set()};
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const safe=(v='')=>String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

function status(kind,text){const el=$('#robot-status');el.className=`robot-status ${kind}`;el.querySelector('span').textContent=text}
async function json(url){const r=await fetch(url,{headers:{Accept:'application/json'}});if(!r.ok)throw new Error(`${r.status} ${r.statusText}`);return r.json()}
function year(value){return Array.isArray(value?.['date-parts'])?value['date-parts'][0]?.[0]:value||'Year unavailable'}
function cleanText(value=''){const el=document.createElement('textarea');el.innerHTML=value;return el.value.replace(/<[^>]*>/g,'').trim()}

async function searchCrossref(query){
  const data=await json(`https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=10&select=DOI,title,author,published,publisher,URL,type`);
  return (data.message?.items||[]).map((item,index)=>({id:`crossref:${item.DOI||index}`,index:'Crossref',title:item.title?.[0]||'Untitled',authors:(item.author||[]).map(a=>`${a.given||''} ${a.family||''}`.trim()).join(', ')||'Authors unavailable',year:year(item.published),publisher:item.publisher||item.type||'Publisher unavailable',url:item.DOI?`https://doi.org/${item.DOI}`:item.URL,doi:item.DOI||''}));
}
async function searchOpenAlex(query){
  const data=await json(`https://api.openalex.org/works?search=${encodeURIComponent(query)}&per-page=10&select=id,display_name,publication_year,authorships,primary_location,doi,type`);
  return (data.results||[]).map((item,index)=>({id:`openalex:${item.id||index}`,index:'OpenAlex',title:cleanText(item.display_name||'Untitled'),authors:(item.authorships||[]).slice(0,5).map(a=>a.author?.display_name).filter(Boolean).join(', ')||'Authors unavailable',year:item.publication_year||'Year unavailable',publisher:item.primary_location?.source?.display_name||item.type||'Source unavailable',url:item.doi||item.primary_location?.landing_page_url||item.id,doi:(item.doi||'').replace('https://doi.org/','')}));
}
function dedupe(sources){const seen=new Set();return sources.filter(source=>{const key=(source.doi||source.title).toLowerCase();if(seen.has(key))return false;seen.add(key);return true})}

async function runSearch(event){
  event.preventDefault();state.query=$('#research-query').value.trim();if(!state.query)return;
  status('working','Research Robot querying live indexes…');$('#result-title').textContent=`Researching “${state.query}”`;
  $('#source-results').innerHTML='<div class="empty">Cross-checking scholarly metadata…</div>';state.selected.clear();
  const settled=await Promise.allSettled([searchCrossref(state.query),searchOpenAlex(state.query)]);
  state.sources=dedupe(settled.flatMap(result=>result.status==='fulfilled'?result.value:[]));
  renderSources();
  const failed=settled.filter(result=>result.status==='rejected').length;
  status(failed===settled.length?'error':failed?'working':'',failed?`${failed} index unavailable; showing verified results from the other`:`${state.sources.length} real source records found`);
}
function renderSources(){
  $('#source-results').innerHTML=state.sources.length?state.sources.map(source=>`<label class="source-card"><input type="checkbox" data-id="${safe(source.id)}"><div><span class="source-badge">${safe(source.index)}</span><h3>${safe(source.title)}</h3><p>${safe(source.authors)}</p><p>${safe(source.year)} · ${safe(source.publisher)}</p>${source.url?`<a href="${safe(source.url)}" target="_blank" rel="noreferrer">Open original record ↗</a>`:''}</div></label>`).join(''):'<div class="empty">No source metadata was returned. Refine the question and search again.</div>';
  $$('.source-card input').forEach(input=>input.addEventListener('change',()=>{input.checked?state.selected.add(input.dataset.id):state.selected.delete(input.dataset.id);updateSelection()}));updateSelection();
}
function chosen(){return state.sources.filter(source=>state.selected.has(source.id))}
function updateSelection(){const count=state.selected.size;$('#result-count').textContent=`${count} selected`;$('#build-research').disabled=!count;$('#export-research').disabled=!count}
function record(){return{schema:'infinity/research-action/v1',query:state.query,createdAt:new Date().toISOString(),evidence:chosen(),notes:{observations:$('#observations').value.trim(),hypothesis:$('#hypothesis').value.trim(),decision:$('#decision').value.trim()},status:'research-brief-awaiting-commit'}}
function markdown(data){const citations=data.evidence.map((source,index)=>`${index+1}. [${source.title}](${source.url}) — ${source.authors}; ${source.publisher}; ${source.year}${source.doi?`; DOI ${source.doi}`:''}`).join('\n');return`## Research question\n\n${data.query}\n\n## Selected evidence\n\n${citations}\n\n## Observed evidence\n\n${data.notes.observations||'To be recorded after reading the selected sources.'}\n\n## Working hypothesis\n\n${data.notes.hypothesis||'Not yet stated.'}\n\n## Requested build output\n\n${data.notes.decision||'Turn this evidence into a readable project page with a reproducible next action.'}\n\n## Definition of done\n\n- [ ] Direct claims cite an original source\n- [ ] Hypotheses are visibly separated from observations\n- [ ] Output page, data, plan or prototype is attached\n- [ ] Completion commit SHA is linked as the permanent action-token serial`;}
function build(){const data=record();const url=`https://github.com/www-infinity4/Alien-Radio/issues/new?title=${encodeURIComponent(`Research build: ${data.query}`)}&body=${encodeURIComponent(markdown(data))}`;window.open(url,'_blank','noopener')}
function exportRecord(){const data=record();const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));a.download=`alien-radio-research-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href)}
$('#research-form').addEventListener('submit',runSearch);$('#build-research').addEventListener('click',build);$('#export-research').addEventListener('click',exportRecord);
