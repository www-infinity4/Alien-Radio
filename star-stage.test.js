'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const index = fs.readFileSync('index.html', 'utf8');
const stage = fs.readFileSync('stage.html', 'utf8');
const engine = fs.readFileSync('star-stage.js', 'utf8');
const manifest = JSON.parse(fs.readFileSync('token-manifest.json', 'utf8'));

assert.match(index, /href="stage\.html">⭐ Star Token Stage/);
assert.match(index, /LIVE RESEARCH/);
assert.match(index, /COMMIT DATA/);
assert.match(stage, /id="radioFrame" src="index\.html"/);
assert.match(engine, /QUALIFIED_SECONDS = 24 \* 60 \* 60/);
assert.match(engine, /Creator self-use does not produce Avatar Coins/);
assert.match(engine, /demonstration:Boolean\(demonstration\)/);
assert.match(engine, /progress\.confirmed % 10 === 0/);
assert.match(engine, /RADIO_STAR_COIN_COLLECTED/);
assert.match(engine, /existing radio wallet/);
assert.equal(manifest.project.id, 'alien-radio');
assert.equal(manifest.needScore.weights.systemDemand, 35);
assert.equal(manifest.tokenTypes.find(item => item.id === 'avatar-coin').transferable, false);
assert.equal(manifest.tokenTypes.find(item => item.id === 'radio-star-coin').transferable, false);
assert.equal(manifest.shareReward.confirmedSharesPerCoin, 10);
assert.match(manifest.tokenTypes.find(item => item.id === 'radio-star-coin').listenerTokenRelationship, /Listening tokens continue/);

console.log('current-main Star Token Stage contract: ok');
