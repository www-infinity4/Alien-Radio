// Auditable, append-only catalog builder for Infinity Radio.
// Source intentionally limited to the established Musopen Chopin archive item.
// Run: node scripts/update-radio-catalog.cjs
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const CATALOG_PATH=path.join(ROOT,'oracle-track-feed.json');
const SOURCE='musopen-chopin';
const BASE='https://archive.org/download/'+SOURCE+'/';

function buildCatalog(previous, archiveFiles, date) {
  const tracks=Array.isArray(previous?.tracks)?previous.tracks:[];
  const existing=new Set(tracks.map(track=>track.url));
  const incoming=[];
  for(const file of Array.isArray(archiveFiles)?archiveFiles:[]) {
    const name=String(file?.name||'');
    if(!/\.mp3$/i.test(name)||!/mp3/i.test(String(file?.format||'')) ||
        name.includes('..') || name.startsWith('/') || name.includes('\\')) continue;
    const url=BASE+name.split('/').map(encodeURIComponent).join('/');
    if(existing.has(url))continue;
    existing.add(url);
    const human=String(file.title||file.track||name.replace(/\.mp3$/i,'').replace(/[_-]+/g,' ')).trim();
    if(!human)continue;
    incoming.push({track:{title:'Chopin · '+human.slice(0,180),url,archiveItem:SOURCE},
      modified:Number(file.mtime||0)});
  }
  incoming.sort((a,b)=>b.modified-a.modified||a.track.url.localeCompare(b.track.url));
  if(!incoming.length)return{catalog:previous,added:0};
  return{catalog:{...previous,version:Math.max(2,Number(previous.version)||2),
    updated:date,tracks:[...incoming.map(item=>item.track),...tracks]},added:incoming.length};
}

async function main() {
  const original=JSON.parse(fs.readFileSync(CATALOG_PATH,'utf8'));
  const response=await fetch('https://archive.org/metadata/'+SOURCE,{
    headers:{'Accept':'application/json'},signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw new Error('archive_metadata_http_'+response.status);
  const metadata=await response.json();
  if(!Array.isArray(metadata.files))throw new Error('missing_archive_file_list');
  const date=new Date().toISOString().slice(0,10);
  const {catalog,added}=buildCatalog(original,metadata.files,date);
  if(added)fs.writeFileSync(CATALOG_PATH,JSON.stringify(catalog,null,2)+'\n');
  process.stdout.write(JSON.stringify({added,total:catalog.tracks.length,updated:catalog.updated})+'\n');
}

if(require.main===module)main().catch(err=>{console.error(err);process.exitCode=1});
module.exports={buildCatalog};
