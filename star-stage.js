/* Alien Radio — Infinity Star Token Stage
   ⭐ is a universal conversion/edit/version mark, not a favorite button.
   Prototype records are local-only and create no money, crypto, security,
   ownership title, or guaranteed reward. */
(() => {
  'use strict';

  const KEY = 'alien_radio_star_stage_v2';
  const QUALIFIED_SECONDS = 24 * 60 * 60;
  const TICK_SECONDS = 5;
  const GRACE_MS = 30000;
  const FACTORS = [
    ['systemDemand', 'System demand', 35],
    ['scarcity', 'Scarcity', 25],
    ['humanUsefulness', 'Human usefulness', 20],
    ['productionReadiness', 'Production readiness', 10],
    ['localCapacity', 'Local capacity', 10]
  ];

  let store = load();
  let usageTimer = null;
  let activeContext = { type: 'project', id: 'alien-radio', label: 'Alien Radio' };

  function iso() { return new Date().toISOString(); }
  function uid(prefix) {
    const n = crypto.getRandomValues(new Uint32Array(2));
    return `${prefix}-${Date.now().toString(36)}-${n[0].toString(36)}${n[1].toString(36)}`;
  }
  function esc(value = '') {
    return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  }
  function seed() {
    const createdAt = iso();
    return {
      version: 2,
      blueprints: [{
        id: 'alien-radio-star-v1', projectId: 'alien-radio', name: 'Alien Radio Star Blueprint',
        creator: 'Kris', version: 1, parentId: null, contextType: 'project', contextId: 'alien-radio',
        product: 'AI-assisted radio station identity, channels, creator tools, research and Avatar Coin activation.',
        need: 'Radio stations need an attributable product, verified use and one locked Avatar Coin per active station identity.',
        stationCount: 1, factors: { systemDemand: 92, scarcity: 84, humanUsefulness: 88, productionReadiness: 78, localCapacity: 65 },
        score: 86.2, priority: 'Critical product priority', productSupply: 2,
        status: 'APPROVED PROTOTYPE', createdAt
      }],
      productTokens: [{
        id: 'product-alien-radio-v1', blueprintId: 'alien-radio-star-v1',
        name: 'Alien Radio Station Product Token', quantity: 2, locked: 1,
        purpose: 'One station build plus one contingency/version reserve.', createdAt
      }],
      avatarCoins: [],
      radioStarCoins: [],
      shareEvents: [],
      shareProgress: {},
      stations: [{
        id: 'station-alien-radio', name: 'Alien Radio', blueprintId: 'alien-radio-star-v1',
        requiredAvatarCoins: 1, lockedAvatarCoinIds: [], status: 'PROTOTYPE — AVATAR ACTIVATION PENDING', createdAt
      }],
      usage: {},
      events: [{ id: uid('event'), type: 'STAR_BLUEPRINT_SEEDED', detail: 'Alien Radio received the universal ⭐ creation mark.', amount: 'v1', createdAt }]
    };
  }
  function load() {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (parsed?.version === 2) {
        parsed.radioStarCoins = Array.isArray(parsed.radioStarCoins) ? parsed.radioStarCoins : [];
        parsed.shareEvents = Array.isArray(parsed.shareEvents) ? parsed.shareEvents : [];
        parsed.shareProgress = parsed.shareProgress && typeof parsed.shareProgress === 'object' ? parsed.shareProgress : {};
        return parsed;
      }
    } catch (_) {}
    const initial = seed();
    localStorage.setItem(KEY, JSON.stringify(initial));
    return initial;
  }
  function save() { localStorage.setItem(KEY, JSON.stringify(store)); }
  function event(type, detail, amount = '') {
    store.events.unshift({ id: uid('event'), type, detail, amount, createdAt: iso() });
    store.events = store.events.slice(0, 250); save();
  }
  function username() {
    try { return window.AUTH?.currentUser()?.username || null; } catch (_) { return null; }
  }
  function requireUser() {
    const user = username();
    if (user) return user;
    window.showToast?.('Sign in to create or convert a Star Blueprint', '🔐');
    window.openModal?.('login-modal');
    return null;
  }
  function score(factors) {
    return Number(FACTORS.reduce((sum, [id, , weight]) => sum + (Number(factors[id]) || 0) * weight / 100, 0).toFixed(1));
  }
  function priority(value) {
    if (value >= 80) return 'Critical product priority';
    if (value >= 60) return 'High product priority';
    if (value >= 40) return 'Build and verify';
    return 'Research before production';
  }
  function color(value) {
    if (value >= 80) return '#ff5a74';
    if (value >= 60) return '#ffe600';
    if (value >= 40) return '#00fff7';
    return '#8fa5ba';
  }
  function latestBlueprint() { return store.blueprints[0]; }
  function coinsFor(blueprintId) { return store.avatarCoins.filter(c => c.blueprintId === blueprintId); }
  function currentChannel() { return document.querySelector('#channel-name')?.textContent?.trim() || 'Alien Radio'; }
  function isQualifiedPlayback() {
    const playButton = document.querySelector('#play-btn');
    const playing = playButton?.textContent?.trim() === '⏸';
    return Boolean(playing && !document.hidden && username());
  }

  function addMark(target, context) {
    if (!target || target.querySelector(':scope > .conversion-star-mark')) return;
    target.classList.add('convertible-star-host');
    const mark = document.createElement('button');
    mark.type = 'button';
    mark.className = 'conversion-star-mark';
    mark.textContent = '⭐';
    mark.title = 'Create, edit, version or convert this item';
    mark.setAttribute('aria-label', `Open creation portal for ${context.label}`);
    mark.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      activeContext = context;
      open('create');
    });
    target.appendChild(mark);
  }

  function markConvertibleItems(root = document) {
    addMark(root.querySelector('.logo'), { type: 'project', id: 'alien-radio', label: 'Alien Radio' });
    addMark(root.querySelector('.now-playing-card'), { type: 'station', id: 'current-station', label: currentChannel() });
    root.querySelectorAll('.channel-item').forEach((item, index) => {
      const label = item.querySelector('.ch-name')?.textContent?.trim() || `Channel ${index + 1}`;
      addMark(item, { type: 'channel', id: `channel-${index + 1}`, label });
    });
    root.querySelectorAll('.ai-card').forEach(item => {
      const label = item.querySelector('.ai-name')?.textContent?.trim() || 'AI module';
      addMark(item, { type: 'ai-module', id: item.id || uid('ai'), label });
    });
    addMark(root.querySelector('.wallet-modal-box'), { type: 'wallet', id: 'alien-radio-wallet', label: 'Alien Radio Wallet' });
    addMark(root.querySelector('.research-modal-box'), { type: 'research-product', id: 'radio-research', label: 'Radio Research Product' });
  }

  function injectEntryPoints() {
    const bar = document.querySelector('#token-action-bar');
    if (bar && !bar.querySelector('.tab-star-stage')) {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'tab-btn tab-star-stage';
      button.innerHTML = '<span class="tab-icon">⭐</span><span class="tab-label">CREATE</span><span class="tab-count" id="tab-avatar-count">0</span>';
      button.title = 'AI Product Token Studio';
      button.addEventListener('click', () => open('create'));
      bar.insertBefore(button, bar.firstChild);
    }
    const drawer = document.querySelector('#hamDrawer');
    if (drawer && !drawer.querySelector('[data-star-link]')) {
      const divider = document.createElement('div'); divider.className = 'ham-divider'; divider.dataset.starLink = '1';
      const label = document.createElement('div'); label.className = 'ham-section-label'; label.dataset.starLink = '1'; label.textContent = '⭐ Token Stage';
      const create = document.createElement('a'); create.className = 'ham-link'; create.href = '#'; create.dataset.starLink = '1'; create.textContent = '⭐ AI Product Token Studio';
      create.addEventListener('click', e => { e.preventDefault(); window.closeHamburger?.(); open('create'); });
      const stations = document.createElement('a'); stations.className = 'ham-link'; stations.href = '#'; stations.dataset.starLink = '1'; stations.textContent = '👾 Avatar Coin Stations';
      stations.addEventListener('click', e => { e.preventDefault(); window.closeHamburger?.(); open('stations'); });
      const point = drawer.querySelector('.ham-divider');
      [divider, label, create, stations].forEach(node => drawer.insertBefore(node, point || null));
    }
    const footer = document.querySelector('.site-footer');
    if (footer && !document.querySelector('#star-stage-launch')) {
      const section = document.createElement('section'); section.id = 'star-stage-launch'; section.className = 'container star-stage-launch';
      section.innerHTML = `<div><div class="star-kicker">⭐ Universal conversion mark</div><h3>Create the Product Token the system needs most, preserve every version, and produce Avatar Coins through verified station use.</h3><p>Every small ⭐ opens the same creation portal with the clicked item already selected. The marks stay quiet until used.</p></div><div class="star-stage-launch-actions"><button class="hud-btn green" id="launch-studio">⭐ TOKEN STUDIO</button><button class="hud-btn orange" id="launch-stations">👾 STATIONS</button></div>`;
      footer.before(section);
      section.querySelector('#launch-studio').addEventListener('click', () => open('create'));
      section.querySelector('#launch-stations').addEventListener('click', () => open('stations'));
    }
  }

  function injectModal() {
    if (document.querySelector('#star-stage-modal')) return;
    const modal = document.createElement('div'); modal.className = 'modal-overlay'; modal.id = 'star-stage-modal'; modal.setAttribute('aria-hidden', 'true'); modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `<div class="modal-box star-stage-modal"><div class="modal-title">⭐ Infinity Token Stage · Alien Radio</div><button class="modal-close" id="close-star-stage" aria-label="Close">✕</button><div class="star-stage-tabs" role="tablist"><button class="star-stage-tab active" data-tab="create">AI PRODUCT TOKEN</button><button class="star-stage-tab" data-tab="stations">AVATAR COINS</button><button class="star-stage-tab" data-tab="blueprints">VERSIONS</button><button class="star-stage-tab" data-tab="ledger">LEDGER</button></div>
      <section class="star-stage-panel active" data-panel="create"><div class="star-stage-grid"><form class="star-form" id="star-form"><label>Selected convertible item<input id="context-label" readonly></label><label>Creation or business name<input id="star-name" value="Alien Radio" maxlength="80" required></label><label>Exact Product Token needed<textarea id="star-product" required>AI-assisted radio station identity with channels, creator tools, research, Store Card offers and Avatar Coin activation.</textarea></label><label>Why the system needs it<textarea id="star-need" required>Radio stations need an attributable identity, verified use, a product plan and a station activation unit.</textarea></label><label>Planned station identities<input id="star-stations" type="number" min="1" max="100000" value="1" required></label>${FACTORS.map(([id, label, weight], index) => `<label>${esc(label)} · ${weight}% weight<div class="star-range-row"><input id="factor-${id}" type="range" min="0" max="100" value="${[92,84,88,78,65][index]}"><output id="out-${id}">${[92,84,88,78,65][index]}</output></div></label>`).join('')}<button class="hud-btn green full" type="submit">⭐ CREATE NAMED VERSION</button></form><div class="star-output"><div class="star-kicker">Transparent AI planning logic</div><h3 id="plan-title">Alien Radio Product Token Plan</h3><span class="priority-badge" id="plan-priority"></span><div class="token-plan-list" id="plan-list"></div><div class="chart-stack"><div class="star-chart"><h4>Product need factors</h4><canvas id="need-chart" width="460" height="190"></canvas></div><div class="star-chart"><h4>Token and station supply</h4><canvas id="supply-chart" width="460" height="190"></canvas></div></div><p class="star-stage-footer-note">The static prototype uses visible weighted logic. A protected AI service can later add research and contract evidence without hiding the scoring.</p></div></div></section>
      <section class="star-stage-panel" data-panel="stations"><div class="star-rule-box"><strong>Two earning paths:</strong> listening continues to collect the existing listener tokens. Confirmed station sharing advances a separate 0/10 cycle; the 10th share creates 1 Radio Star Coin. Avatar Coin remains reserved for another verified user's 24 continuous qualified hours and locks to a station identity.</div><div class="station-status-grid"><div class="station-stat"><span>Blueprints</span><strong id="stat-blueprints">0</strong></div><div class="station-stat"><span>Avatar coins</span><strong id="stat-avatar">0</strong></div><div class="station-stat"><span>Radio Star coins</span><strong id="stat-radio-star">0</strong></div><div class="station-stat"><span>Active stations</span><strong id="stat-active">0</strong></div></div><div class="star-output"><div class="star-kicker">Share the radio star onward</div><h3 id="radio-star-title">0 / 10 confirmed station shares</h3><div class="avatar-progress"><span id="radio-star-progress"></span></div><div class="token-plan-list" id="radio-star-details"></div><button class="star-demo-button" id="share-radio-star" type="button">Share this station</button></div><div class="star-output"><div class="star-kicker">Qualified-use streak</div><h3 id="qualified-title"></h3><div class="avatar-progress"><span id="qualified-progress"></span></div><div class="token-plan-list" id="qualified-details"></div><button class="star-demo-button" id="demo-hour" type="button">Add 1 clearly labeled demonstration hour</button></div><div class="station-card-list" id="station-list"></div></section>
      <section class="star-stage-panel" data-panel="blueprints"><div class="blueprint-list" id="blueprint-list"></div></section><section class="star-stage-panel" data-panel="ledger"><div class="star-ledger" id="star-ledger"></div></section></div>`;
    document.body.appendChild(modal);
    modal.querySelector('#close-star-stage').addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    modal.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => selectTab(b.dataset.tab)));
    modal.querySelector('#star-form').addEventListener('submit', createBlueprint);
    modal.querySelectorAll('input[type="range"]').forEach(input => input.addEventListener('input', () => { modal.querySelector(`#out-${input.id.replace('factor-','')}`).textContent = input.value; renderPlan(); }));
    ['star-name','star-product','star-need','star-stations'].forEach(id => modal.querySelector(`#${id}`).addEventListener('input', renderPlan));
    modal.querySelector('#demo-hour').addEventListener('click', addDemoHour);
    modal.querySelector('#share-radio-star').addEventListener('click', shareRadioStar);
  }

  function open(tab = 'create') {
    document.querySelector('#context-label').value = `${activeContext.type}: ${activeContext.label}`;
    const name = document.querySelector('#star-name');
    if (activeContext.type !== 'project') name.value = activeContext.label;
    const modal = document.querySelector('#star-stage-modal'); modal.classList.add('open'); modal.setAttribute('aria-hidden','false');
    selectTab(tab); renderAll();
  }
  function close() { const modal = document.querySelector('#star-stage-modal'); modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); }
  function selectTab(tab) {
    document.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    document.querySelectorAll('[data-panel]').forEach(p => p.classList.toggle('active', p.dataset.panel === tab));
    if (tab === 'create') renderPlan(); if (tab === 'stations') renderStations(); if (tab === 'blueprints') renderBlueprints(); if (tab === 'ledger') renderLedger();
  }
  function form() {
    const factors = {}; FACTORS.forEach(([id]) => factors[id] = Number(document.querySelector(`#factor-${id}`).value));
    return { name: document.querySelector('#star-name').value.trim() || 'Untitled creation', product: document.querySelector('#star-product').value.trim(), need: document.querySelector('#star-need').value.trim(), stations: Math.max(1, Number(document.querySelector('#star-stations').value || 1)), factors };
  }
  function plan(values) {
    const value = score(values.factors); const reserve = Math.max(1, Math.ceil(values.stations * .2));
    const weakest = [...FACTORS].sort((a,b) => values.factors[a[0]] - values.factors[b[0]])[0];
    return { value, priority: priority(value), reserve, supply: values.stations + reserve, weakest, next: values.factors[weakest[0]] < 60 ? `Raise ${weakest[1].toLowerCase()} with evidence or a verified partner.` : 'Create the version, verify capacity and begin qualified-use measurement.' };
  }
  function renderPlan() {
    const values = form(), p = plan(values), blueprint = latestBlueprint();
    document.querySelector('#plan-title').textContent = `${values.name} Product Token Plan`;
    const badge = document.querySelector('#plan-priority'); badge.textContent = `${p.priority} · ${p.value}/100`; badge.style.color = color(p.value);
    document.querySelector('#plan-list').innerHTML = `<div class="token-plan-row"><span>Selected item</span><strong>${esc(activeContext.label)}</strong></div><div class="token-plan-row"><span>Exact Product Token</span><strong>${esc(values.product)}</strong></div><div class="token-plan-row"><span>System need</span><strong>${esc(values.need)}</strong></div><div class="token-plan-row"><span>Minimum Product Tokens</span><strong>${p.supply} (${values.stations} station + ${p.reserve} reserve)</strong></div><div class="token-plan-row"><span>Avatar activation</span><strong>1 locked Avatar Coin per station</strong></div><div class="token-plan-row"><span>Weakest factor</span><strong>${esc(p.weakest[1])} · ${values.factors[p.weakest[0]]}</strong></div><div class="token-plan-row"><span>AI next action</span><strong>${esc(p.next)}</strong></div>`;
    draw(document.querySelector('#need-chart'), FACTORS.map(([id,label]) => ({label,value:values.factors[id]})), 100);
    draw(document.querySelector('#supply-chart'), [{label:'Stations needed',value:values.stations},{label:'Product supply',value:p.supply},{label:'Avatar available',value:coinsFor(blueprint.id).filter(c=>!c.lockedStationId).length},{label:'Avatar locked',value:store.avatarCoins.filter(c=>c.lockedStationId).length}], Math.max(p.supply,1));
  }
  function draw(canvas, rows, max) {
    const ctx = canvas.getContext('2d'), w = canvas.width, h = canvas.height; ctx.clearRect(0,0,w,h); ctx.font = '12px Share Tech Mono, monospace'; ctx.textBaseline='middle';
    const left=132,right=42,rowH=(h-24)/rows.length; rows.forEach((row,i)=>{ const y=12+i*rowH+rowH/2, usable=w-left-right, ratio=Math.max(0,Math.min(1,row.value/Math.max(max,1))); ctx.fillStyle='#8fa5ba'; ctx.fillText(row.label,6,y); ctx.fillStyle='rgba(255,255,255,.08)'; ctx.fillRect(left,y-8,usable,16); const g=ctx.createLinearGradient(left,0,left+usable,0); g.addColorStop(0,'#00fff7'); g.addColorStop(1,'#ffe600'); ctx.fillStyle=g; ctx.fillRect(left,y-8,usable*ratio,16); ctx.fillStyle='#fff'; ctx.textAlign='right'; ctx.fillText(String(row.value),w-4,y); ctx.textAlign='left'; });
  }
  function createBlueprint(e) {
    e.preventDefault(); const creator = requireUser(); if (!creator) return;
    const values=form(), p=plan(values), prior=store.blueprints.find(b=>b.contextType===activeContext.type&&b.contextId===activeContext.id), version=(prior?.version||0)+1;
    const blueprint={ id:uid('star'), projectId:activeContext.id, contextType:activeContext.type, contextId:activeContext.id, name:`${values.name} Star Blueprint`, creator, version, parentId:prior?.id||null, product:values.product, need:values.need, stationCount:values.stations, factors:values.factors, score:p.value, priority:p.priority, productSupply:p.supply, status:'DRAFT — CAPACITY VERIFICATION REQUIRED', createdAt:iso() };
    store.blueprints.unshift(blueprint); store.productTokens.unshift({id:uid('product'),blueprintId:blueprint.id,name:`${values.name} Product Token`,quantity:p.supply,locked:values.stations,purpose:values.product,createdAt:iso()});
    for(let i=0;i<values.stations;i++) store.stations.unshift({id:uid('station'),name:values.stations>1?`${values.name} Station ${i+1}`:values.name,blueprintId:blueprint.id,requiredAvatarCoins:1,lockedAvatarCoinIds:[],status:'PLANNED — AVATAR ACTIVATION PENDING',createdAt:iso()});
    event('STAR_VERSION_CREATED',`${blueprint.name} v${version} created by ${creator}.`,`${p.value}/100`); window.showToast?.(`⭐ ${blueprint.name} v${version} saved`,'⭐'); renderAll(); selectTab('blueprints');
  }

  function usageKey(blueprintId, listener) { return `${blueprintId}::${listener}`; }
  function usageRecord(blueprintId, listener) {
    const key=usageKey(blueprintId,listener); if(!store.usage[key]) store.usage[key]={blueprintId,listener,seconds:0,lastQualifiedAt:null,startedAt:null,completedCycles:0,demoSeconds:0}; return store.usage[key];
  }
  function tickUsage() {
    const user=username(), blueprint=latestBlueprint(); if(!user||!blueprint) return;
    const record=usageRecord(blueprint.id,user), creatorMatch=user.toLowerCase()===blueprint.creator.toLowerCase(), qualified=isQualifiedPlayback()&&!creatorMatch;
    if(!qualified){ if(record.lastQualifiedAt && Date.now()-new Date(record.lastQualifiedAt).getTime()>GRACE_MS){ record.seconds=0; record.startedAt=null; record.lastQualifiedAt=null; event('QUALIFIED_USE_RESET',`${user}'s continuous-use streak reset.`,'0h'); } save(); renderQualified(); return; }
    if(!record.startedAt) record.startedAt=iso(); record.seconds+=TICK_SECONDS; record.lastQualifiedAt=iso();
    const cycles=Math.floor(record.seconds/QUALIFIED_SECONDS); if(cycles>record.completedCycles){ record.completedCycles=cycles; mintAvatar(blueprint,user,false); }
    save(); renderQualified();
  }
  function mintAvatar(blueprint, listener, demonstration) {
    const coin={id:uid('avatar'),blueprintId:blueprint.id,creator:blueprint.creator,qualifiedUser:listener,qualifiedHours:24,demonstration:Boolean(demonstration),lockedStationId:null,status:demonstration?'DEMONSTRATION — NOT PRODUCTION':'AVAILABLE',createdAt:iso()}; store.avatarCoins.unshift(coin); event(demonstration?'DEMO_AVATAR_CREATED':'AVATAR_COIN_PRODUCED',`${listener} completed a ${demonstration?'demonstration ':''}24-hour qualified-use cycle for ${blueprint.name}.`, '1 Avatar Coin'); autoLock(blueprint.id); window.showToast?.('👾 Avatar Coin produced and checked against station needs','👾');
  }
  function autoLock(blueprintId) {
    const available=store.avatarCoins.filter(c=>c.blueprintId===blueprintId&&!c.lockedStationId&&!c.demonstration);
    store.stations.filter(s=>s.blueprintId===blueprintId&&s.lockedAvatarCoinIds.length<s.requiredAvatarCoins).forEach(station=>{ const coin=available.shift(); if(!coin)return; coin.lockedStationId=station.id; coin.status='LOCKED TO STATION'; station.lockedAvatarCoinIds.push(coin.id); station.status='ACTIVE — AVATAR COIN LOCKED'; event('AVATAR_LOCKED',`${coin.id} locked to ${station.name}.`,'1'); }); save();
  }
  function addDemoHour() {
    const user=requireUser(); if(!user)return; const blueprint=latestBlueprint(), record=usageRecord(blueprint.id,user); record.demoSeconds=(record.demoSeconds||0)+3600; event('DEMO_USE_ADDED',`${user} added one clearly labeled demonstration hour.`,'1h demo'); if(record.demoSeconds>=QUALIFIED_SECONDS){record.demoSeconds-=QUALIFIED_SECONDS; mintAvatar(blueprint,user,true);} save(); renderStations();
  }
  function renderQualified() {
    const user=username(), blueprint=latestBlueprint(), title=document.querySelector('#qualified-title'); if(!title)return;
    if(!user){title.textContent='Sign in to begin qualified use.'; document.querySelector('#qualified-progress').style.width='0%'; document.querySelector('#qualified-details').innerHTML=''; return;}
    const record=usageRecord(blueprint.id,user), creatorMatch=user.toLowerCase()===blueprint.creator.toLowerCase(), pct=Math.min(100,record.seconds/QUALIFIED_SECONDS*100), hours=(record.seconds/3600).toFixed(2);
    title.textContent=creatorMatch?'Creator self-use does not produce Avatar Coins.':isQualifiedPlayback()?`${currentChannel()} qualified-use streak is running.`:'Play the station in a visible tab to continue the streak.';
    document.querySelector('#qualified-progress').style.width=`${pct}%`; document.querySelector('#qualified-details').innerHTML=`<div class="token-plan-row"><span>Verified listener</span><strong>${esc(user)}</strong></div><div class="token-plan-row"><span>Blueprint creator</span><strong>${esc(blueprint.creator)}</strong></div><div class="token-plan-row"><span>Continuous qualified use</span><strong>${hours} / 24 hours</strong></div><div class="token-plan-row"><span>Demonstration time</span><strong>${((record.demoSeconds||0)/3600).toFixed(0)} / 24 demo hours</strong></div>`;
  }
  function shareProgressFor(user, blueprintId) {
    const key = blueprintId + '::' + user;
    if (!store.shareProgress[key]) store.shareProgress[key] = { confirmed: 0, awarded: 0, lastConfirmedAt: null };
    return store.shareProgress[key];
  }
  function renderRadioStar() {
    const user = username();
    const title = document.querySelector('#radio-star-title');
    const bar = document.querySelector('#radio-star-progress');
    const details = document.querySelector('#radio-star-details');
    if (!title || !bar || !details) return;
    if (!user) {
      title.textContent = 'Sign in to share the station and collect Radio Star Coins.';
      bar.style.width = '0%';
      details.innerHTML = '';
      return;
    }
    const blueprint = latestBlueprint();
    const progress = shareProgressFor(user, blueprint.id);
    const cycle = progress.confirmed % 10;
    title.textContent = cycle + ' / 10 confirmed station shares';
    bar.style.width = (cycle * 10) + '%';
    details.innerHTML = '<div class="token-plan-row"><span>Listening rewards</span><strong>Continue collecting through the existing radio wallet</strong></div><div class="token-plan-row"><span>Share reward</span><strong>1 Radio Star Coin on every 10th confirmed share</strong></div><div class="token-plan-row"><span>Your Radio Star Coins</span><strong>' + store.radioStarCoins.filter(c => c.owner === user).length + '</strong></div>';
  }
  function recordRadioStarShare(user, method, shareUrl) {
    const blueprint = latestBlueprint();
    const progress = shareProgressFor(user, blueprint.id);
    const now = Date.now();
    if (progress.lastConfirmedAt && now - new Date(progress.lastConfirmedAt).getTime() < 5 * 60 * 1000) {
      window.showToast?.('This station share was already counted recently. Try another share after the cooldown.', '⭐');
      return false;
    }
    progress.confirmed += 1;
    progress.lastConfirmedAt = iso();
    const shareEvent = { id: uid('radio-share'), owner: user, blueprintId: blueprint.id, stationId: store.stations.find(s => s.blueprintId === blueprint.id)?.id || null, method, url: shareUrl, confirmedAt: progress.lastConfirmedAt };
    store.shareEvents.unshift(shareEvent);
    store.shareEvents = store.shareEvents.slice(0, 250);
    if (progress.confirmed % 10 === 0) {
      progress.awarded += 1;
      const coin = { id: uid('radio-star'), owner: user, blueprintId: blueprint.id, sourceShareEventId: shareEvent.id, cycle: progress.awarded, status: 'COLLECTED — RADIO STAR SHARE REWARD', createdAt: iso() };
      store.radioStarCoins.unshift(coin);
      event('RADIO_STAR_COIN_COLLECTED', user + ' completed 10 confirmed station shares while listening rewards remain separate.', '1 Radio Star Coin');
      window.showToast?.('⭐ Radio Star Coin collected on the 10th confirmed share', '⭐');
    } else {
      event('RADIO_STAR_SHARE_CONFIRMED', user + ' shared ' + blueprint.name + ' by ' + method + '.', (progress.confirmed % 10) + '/10');
      window.showToast?.('⭐ Station share confirmed: ' + (progress.confirmed % 10) + '/10', '⭐');
    }
    save();
    renderRadioStar();
    renderLedger();
    return true;
  }
  async function shareRadioStar() {
    const user = requireUser();
    if (!user) return;
    const blueprint = latestBlueprint();
    const shareUrl = new URL('stage.html', location.href).href;
    const payload = { title: blueprint.name + ' on Alien Radio', text: 'Listen to ' + currentChannel() + ' and carry this radio star onward.', url: shareUrl };
    if (navigator.share) {
      try {
        await navigator.share(payload);
        recordRadioStarShare(user, 'native_share', shareUrl);
      } catch (error) {
        if (error?.name !== 'AbortError') window.showToast?.('The share could not be completed.', '⭐');
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(payload.text + '\n' + shareUrl);
      recordRadioStarShare(user, 'copy_link', shareUrl);
      window.showToast?.('Station link copied and share progress recorded.', '⭐');
    } catch (_) {
      window.showToast?.('Sharing is unavailable in this browser.', '⭐');
    }
  }

  function renderStations() {
    const locked=store.avatarCoins.filter(c=>c.lockedStationId).length, active=store.stations.filter(s=>s.status.startsWith('ACTIVE')).length;
    document.querySelector('#stat-blueprints').textContent=store.blueprints.length; document.querySelector('#stat-avatar').textContent=store.avatarCoins.length; document.querySelector('#stat-radio-star').textContent=store.radioStarCoins.length; document.querySelector('#stat-active').textContent=active; document.querySelector('#tab-avatar-count').textContent=store.avatarCoins.length; renderRadioStar(); renderQualified();
    document.querySelector('#station-list').innerHTML=store.stations.map(s=>`<article class="station-card convertible-star-host"><div class="station-card-head"><h4>${esc(s.name)}</h4><span class="station-state">${esc(s.status)}</span></div><p>Requires ${s.requiredAvatarCoins} Avatar Coin · locked ${s.lockedAvatarCoinIds.length}. Blueprint: ${esc(store.blueprints.find(b=>b.id===s.blueprintId)?.name||s.blueprintId)}</p><button class="conversion-star-mark station-inline-mark" type="button" data-station-id="${esc(s.id)}" aria-label="Open station conversion portal">⭐</button></article>`).join('');
    document.querySelectorAll('[data-station-id]').forEach(b=>b.addEventListener('click',()=>{const s=store.stations.find(x=>x.id===b.dataset.stationId); activeContext={type:'station',id:s.id,label:s.name}; selectTab('create'); renderPlan();}));
  }
  function renderBlueprints() {
    document.querySelector('#blueprint-list').innerHTML=store.blueprints.map(b=>`<article class="blueprint-card convertible-star-host"><div class="blueprint-card-head"><h4>⭐ ${esc(b.name)} v${b.version}</h4><span class="station-state">${esc(b.priority)} · ${b.score}</span></div><p>${esc(b.product)}</p><p>Creator: ${esc(b.creator)} · context: ${esc(b.contextType)} / ${esc(b.contextId)} · supply: ${b.productSupply} · status: ${esc(b.status)}</p><button class="conversion-star-mark blueprint-inline-mark" type="button" data-blueprint-id="${esc(b.id)}" aria-label="Create a new version from this blueprint">⭐</button></article>`).join('');
    document.querySelectorAll('[data-blueprint-id]').forEach(button=>button.addEventListener('click',()=>{const b=store.blueprints.find(x=>x.id===button.dataset.blueprintId); activeContext={type:b.contextType,id:b.contextId,label:b.name.replace(' Star Blueprint','')}; document.querySelector('#star-name').value=activeContext.label; document.querySelector('#star-product').value=b.product; document.querySelector('#star-need').value=b.need; document.querySelector('#star-stations').value=b.stationCount; FACTORS.forEach(([id])=>{document.querySelector(`#factor-${id}`).value=b.factors[id];document.querySelector(`#out-${id}`).textContent=b.factors[id];}); selectTab('create');renderPlan();}));
  }
  function renderLedger() { document.querySelector('#star-ledger').innerHTML=store.events.map(e=>`<div class="star-ledger-row"><time>${new Date(e.createdAt).toLocaleString()}</time><span><strong>${esc(e.type)}</strong> · ${esc(e.detail)}</span><strong>${esc(e.amount)}</strong></div>`).join(''); }
  function renderAll(){ renderPlan(); renderStations(); renderBlueprints(); renderLedger(); }

  function init() {
    const link=document.createElement('link'); link.rel='stylesheet'; link.href='star-stage.css'; if(!document.querySelector('link[href="star-stage.css"]'))document.head.appendChild(link);
    injectModal(); injectEntryPoints(); markConvertibleItems();
    const observer=new MutationObserver(()=>markConvertibleItems()); observer.observe(document.body,{childList:true,subtree:true});
    usageTimer=setInterval(tickUsage,TICK_SECONDS*1000); renderAll();
    window.ALIEN_STAR_STAGE={open,markConvertibleItems,recordRadioStarShare,getState:()=>JSON.parse(JSON.stringify(store))};
  }
  document.addEventListener('DOMContentLoaded',init);
})();
