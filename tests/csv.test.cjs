const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '..', 'Annual_Operational_Plan_2026_V0_6.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
function csvContext() {
  const context = vm.createContext({
    console, Date, JSON, URL, Blob, setTimeout: () => 0, clearTimeout() {},
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    document: { addEventListener() {}, querySelectorAll: () => [], querySelector: () => null },
    window: { addEventListener() {} }, navigator: {}, location: { hash: '', protocol: 'file:' }, confirm: () => true
  });
  vm.runInContext(script, context);
  return code => vm.runInContext(code, context);
}
const run = csvContext();
const cell = v => run(`csvCell(${JSON.stringify(v)})`);
test('plain values pass through unchanged', () => {
  assert.equal(cell('Hotel fit-out'), 'Hotel fit-out');
  assert.equal(cell(42), '42');
  assert.equal(cell(null), '');
});
test('values with commas, quotes and newlines are quoted and escaped', () => {
  assert.equal(cell('a, b'), '"a, b"');
  assert.equal(cell('say "hi"'), '"say ""hi"""');
  assert.equal(cell('line1\nline2'), '"line1\nline2"');
});
test('Arabic text is kept intact and not prefixed', () => {
  assert.equal(cell('تطوير المواقع، المرحلة الأولى'), 'تطوير المواقع، المرحلة الأولى');
  assert.equal(cell('مشروع, مرحلة'), '"مشروع, مرحلة"');
  assert.equal(cell('مشروع'), 'مشروع');
});
test('cells starting with = + - @ are neutralised with a leading quote', () => {
  assert.equal(cell('=HYPERLINK("http://x","y")'), '"\'=HYPERLINK(""http://x"",""y"")"');
  assert.equal(cell('+1+1'), "'+1+1");
  assert.equal(cell('-2+3'), "'-2+3");
  assert.equal(cell('@SUM(A1)'), "'@SUM(A1)");
});
test('formula-prefixed cell containing a comma is also quoted', () => {
  assert.equal(cell('=A1,B1'), '"\'=A1,B1"');
});
test('a cell with a formula character in the middle is untouched', () => {
  assert.equal(cell('cost = 5'), 'cost = 5');
});
