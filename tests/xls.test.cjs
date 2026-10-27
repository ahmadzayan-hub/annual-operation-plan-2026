const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '..', 'Annual_Operational_Plan_2026_V0_6.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const context = vm.createContext({
  console, Date, JSON, URL, Blob, setTimeout: () => 0, clearTimeout() {},
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  document: { addEventListener() {}, querySelectorAll: () => [], querySelector: () => null },
  window: { addEventListener() {} }, navigator: {}, location: { hash: '', protocol: 'file:' }, confirm: () => true
});
vm.runInContext(script, context);
const build = (headers, rows) => vm.runInContext(`spreadsheetXml(${JSON.stringify(headers)}, ${JSON.stringify(rows)})`, context);

test('escapes XML special characters in text cells', () => {
  const xml = build(['a'], [['R&D <phase> "x"']]);
  assert.ok(xml.includes('<Data ss:Type="String">R&amp;D &lt;phase&gt; &quot;x&quot;</Data>'));
});

test('numeric values are typed as Number and non-finite numbers as text', () => {
  const xml = build(['n'], [[3000000], [NaN], [null]]);
  assert.ok(xml.includes('<Data ss:Type="Number">3000000</Data>'));
  assert.ok(!xml.includes('ss:Type="Number">NaN'));
  assert.ok(xml.includes('<Data ss:Type="String"></Data>'));
});

test('Arabic text is preserved as UTF-8 text', () => {
  const xml = build(['ar'], [['تطوير المواقع']]);
  assert.ok(xml.includes('<Data ss:Type="String">تطوير المواقع</Data>'));
  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
});

test('one row per record with the header row first and a single named sheet', () => {
  const xml = build(['H1', 'H2'], [['a', 1], ['b', 2]]);
  assert.equal((xml.match(/<Row>/g) || []).length, 3);
  assert.ok(xml.indexOf('H1') < xml.indexOf('>a<'));
  assert.ok(xml.includes('<Worksheet ss:Name="Projects">'));
});

test('a cell containing markup cannot inject extra elements', () => {
  const xml = build(['x'], [['</Data></Cell><Cell><Data ss:Type="Number">999']]);
  assert.equal((xml.match(/<Cell>/g) || []).length, 2);
});
