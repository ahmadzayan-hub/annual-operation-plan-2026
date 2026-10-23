const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '..', 'Annual_Operational_Plan_2026_V0_6.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
function app() {
  const data = new Map();
  const context = vm.createContext({
    console, Date, JSON, URL, Blob, setTimeout: () => 0, clearTimeout() {},
    localStorage: { getItem: k => data.get(k) ?? null, setItem: (k, v) => data.set(k, v), removeItem: k => data.delete(k) },
    document: { addEventListener() {}, querySelectorAll: () => [], querySelector: () => null },
    window: { addEventListener() {} }, navigator: {}, location: { hash: '', protocol: 'file:' }, confirm: () => true
  });
  vm.runInContext(script, context);
  vm.runInContext('renderKPIs = renderPortfolioStatus = openKpiModal = closeModal = refreshSearchIndex = toast = () => {};', context);
  return { run: code => vm.runInContext(code, context), context, data };
}
test('inline application and service worker compile', () => {
  new vm.Script(script);
  new vm.Script(fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8'));
});
test('real save/load preserves KPI history, notes, decisions and gaps', () => {
  const a = app();
  a.run(`state.kpi.pm = { value:'99', history:{'2026-01':'99'}, note:'Synthetic fixture' }; state.decisions.D1='approved'; saveState(); state.kpi={}; state.decisions={}; loadState();`);
  assert.equal(a.run('state.kpi.pm.note'), 'Synthetic fixture');
  assert.equal(a.run('state.kpi.pm.history["2026-01"]'), '99');
  assert.equal(a.run('state.decisions.D1'), 'approved');
  assert.equal(a.run('computeStatus(KPIS.find(k=>k.id==="pm")).code'), 'ok');
});
test('deleting final history entry clears stale current value and stays cleared after reload', () => {
  const a = app();
  a.run(`state.kpi.pm={value:'99',history:{'2026-01':'99'}}; deleteHistoryMonth('pm','2026-01');`);
  assert.equal(a.run('state.kpi.pm.value'), '');
  a.run('state.kpi={}; loadState();');
  assert.equal(a.run('latestKpiValue(state.kpi.pm)'), null);
});
test('explicit empty history is not a legacy flat value', () => {
  const a = app();
  assert.equal(a.run(`latestKpiValue({value:'99',history:{}})`), null);
  assert.equal(a.run(`latestKpiValue({value:0}).value`), 0);
});
test('legacy flat snapshots migrate without losing zero values', () => {
  const a = app();
  a.data.set('operationalPlan.v05', JSON.stringify({ kpi:{safety:{value:0}} }));
  a.run('loadState()');
  assert.equal(a.run('Object.values(state.kpi.safety.history)[0]'), 0);
});
for (const [name, snapshot] of [
  ['top-level array', []],
  ['non-object KPI record', {kpi:{pm:'bad'}}],
  ['non-object KPI history', {kpi:{pm:{history:'bad'}}}],
  ['unsafe month key', {kpi:{pm:{history:{"2026-01\" onclick=\"alert(1)":'99'}}}}],
  ['unsafe KPI id', {customKPIs:[{id:'x\" onclick=\"alert(1)',name:{en:'X'}}]}],
  ['unsafe impact class', {customKPIs:[{id:'ck_test',name:{en:'X'},impactClass:'x\" onclick=\"alert(1)'}]}],
  ['invalid decision state', {decisions:{D1:'<img>'}}],
  ['prototype key', JSON.parse('{"kpi":{"__proto__":{}}}')]
]) test('snapshot rejects ' + name, () => {
  const a = app(); a.context.fixture = snapshot;
  assert.equal(a.run('validateSnapshot(fixture).ok'), false);
});
test('snapshot accepts a generated backup and bounded text markup safely', () => {
  const a = app();
  a.run(`state.kpi.pm={value:'99',history:{'2026-01':'99'},note:'<img src=x>'}; saveState();`);
  assert.equal(a.run('validateSnapshot(JSON.parse(localStorage.getItem(STORAGE_KEY))).ok'), true);
});
test('decision and gap controls use keyboard-operable buttons', () => {
  assert.doesNotMatch(html, /<span[^>]+class="status-pill[^>]+data-(?:decision|gap)=/);
});
