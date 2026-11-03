// Auditable, append-only catalog builder for Infinity Radio.
// Only two audited Musopen sources: item metadata must confirm public domain.
// Run: node scripts/update-radio-catalog.cjs
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const CATALOG_PATH=path.join(ROOT,'oracle-track-feed.json');
const SOURCE='musopen-chopin';
const APPROVED_SOURCES=Object.freeze({
  'musopen-chopin':'zero',
  'MusopenCollectionAsFlac':'mark'
});
function licenseApproved(source, license) {
  if(!Object.hasOwn(APPROVED_SOURCES,source))return false;
  const expected='http://creativecommons.org/publicdomain/'+APPROVED_SOURCES[source]+'/1.0/';
  const expectedHttps=expected.replace('http:','https:');
  return license===expected||license===expectedHttps;
}

function buildCatalog(previous, archiveFiles, date, source=SOURCE) {
  if(!Object.hasOwn(APPROVED_SOURCES,source))throw Error('unapproved_archive_source');
  const BASE='https://archive.org/download/'+source+'/';
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
    incoming.push({track:{title:(source===SOURCE?'Chopin · ':'')+human.slice(0,180),url,archiveItem:source},
      modified:Number(file.mtime||0)});
  }
  incoming.sort((a,b)=>b.modified-a.modified||a.track.url.localeCompare(b.track.url));
  if(!incoming.length)return{catalog:previous,added:0};
  return{catalog:{...previous,version:Math.max(2,Number(previous.version)||2),
    updated:date,tracks:[...incoming.map(item=>item.track),...tracks]},added:incoming.length};
}

async function main() {
  let catalog=JSON.parse(fs.readFileSync(CATALOG_PATH,'utf8'));
  let added=0;
  const date=new Date().toISOString().slice(0,10);
  for(const [source] of Object.entries(APPROVED_SOURCES)){
    const response=await fetch('https://archive.org/metadata/'+source,{
      headers:{'Accept':'application/json'},signal:AbortSignal.timeout(20000)});
    if(!response.ok)throw new Error(source+'_metadata_http_'+response.status);
    const metadata=await response.json();
    if(!licenseApproved(source,String(metadata.metadata?.licenseurl||'')))throw Error(source+'_license_unverified');
    if(!Array.isArray(metadata.files))throw Error(source+'_file_list_missing');
    const batch=buildCatalog(catalog,metadata.files,date,source);
    catalog=batch.catalog; added+=batch.added;
  }
  // Failure while checking any approved source exits before changing the catalog.
  if(added)fs.writeFileSync(CATALOG_PATH,JSON.stringify(catalog,null,2)+'\n');
  process.stdout.write(JSON.stringify({added,total:catalog.tracks.length,updated:catalog.updated})+'\n');
}

if(require.main===module)main().catch(err=>{console.error(err);process.exitCode=1});
module.exports={buildCatalog,licenseApproved,APPROVED_SOURCES};
