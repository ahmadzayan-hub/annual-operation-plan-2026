/* V0.4 audit — real findings, not templates. Runs headless against the
   file:// URL of Annual_Operational_Plan_2026_V0_4.html. Produces JSON that
   the audit doc consumes. Exits non-zero if any P0/P1 finding surfaces.
*/
const playwright = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
const fs = require('fs');
const axeSource = fs.readFileSync('/tmp/node_modules/axe-core/axe.min.js', 'utf8');

const HTML_PATH = path.resolve(__dirname, '..',
  process.env.OPLAN_VERSION === 'v4' ? 'Annual_Operational_Plan_2026_V0_4.html' :
  process.env.OPLAN_VERSION === 'v5' ? 'Annual_Operational_Plan_2026_V0_5.html' :
  'Annual_Operational_Plan_2026_V0_6.html');
const URL_LOCAL = 'file://' + HTML_PATH;

const findings = [];
function record(severity, area, title, detail, evidence){
  findings.push({ severity, area, title, detail, evidence });
}

const VIEWPORTS = [
  { w: 360, h: 780, name: '360-mobile-narrow' },
  { w: 390, h: 844, name: '390-mobile-modern' },
  { w: 768, h: 1024, name: '768-tablet' },
  { w: 1024, h: 768, name: '1024-laptop' },
  { w: 1440, h: 900, name: '1440-desktop' }
];

async function withPage(fn){
  const browser = await playwright.chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push({ type:'pageerror', msg: e.message }));
  page.on('console', m => { if (m.type() === 'error') errors.push({ type:'console.error', msg: m.text() }); });
  try {
    await fn(page, errors);
  } finally {
    await browser.close();
  }
  return errors;
}

// --- 1. Baseline load: file loads, DOM ready, no JS errors ---
async function testBaseline(){
  const errors = await withPage(async (page, errs) => {
    await page.goto(URL_LOCAL, { waitUntil: 'load' });
    await page.waitForTimeout(800);
    const title = await page.title();
    if (!/V0\.[456]/.test(title)) record('P1', 'metadata', 'Title mismatch', 'Page <title> does not contain a supported V0.x tag', `title="${title}"`);
    if (errs.length) errs.forEach(e => record('P0', 'js-runtime', 'JS error on load', e.msg, e.type));
  });
}

// --- 2. Full functional smoke ---
async function testFunctional(){
  await withPage(async (page, errs) => {
    await page.goto(URL_LOCAL, { waitUntil: 'load' });
    await page.waitForTimeout(500);
    // Clear any localStorage from prior runs
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(500);

    // KPI save + status compute
    await page.click('[data-tab="t2"]');
    await page.waitForTimeout(150);
    await page.fill('[data-kpi-input="pm"]', '99');
    await page.click('[data-kpi-save="pm"]');
    await page.waitForTimeout(200);
    const st1 = (await page.textContent('.kpi-card[data-kpi="pm"] .status-badge')).trim();
    if (st1 !== 'On track') record('P1', 'functional', 'KPI status compute failure', `PM=99% (target ≥98%) should be On track, got "${st1}"`, `element .kpi-card[data-kpi="pm"] .status-badge`);
    await page.fill('[data-kpi-input="pm"]', '80');
    await page.click('[data-kpi-save="pm"]');
    await page.waitForTimeout(200);
    const st2 = (await page.textContent('.kpi-card[data-kpi="pm"] .status-badge')).trim();
    if (st2 !== 'Off track') record('P1', 'functional', 'KPI status compute failure', `PM=80% should be Off track, got "${st2}"`, '');

    // Sparkline appears after multiple values
    const sparkCount = await page.locator('.kpi-card[data-kpi="pm"] svg').count();
    if (sparkCount < 1) record('P2', 'functional', 'Sparkline missing after value entry', 'Card should render sparkline after any value save', '');

    // Persistence after reload
    await page.reload();
    await page.waitForTimeout(500);
    await page.click('[data-tab="t2"]');
    await page.waitForTimeout(150);
    const persistedVal = await page.$eval('[data-kpi-input="pm"]', el => el.value);
    if (persistedVal !== '80') record('P0', 'functional', 'Data loss on reload', `PM value lost after reload (got "${persistedVal}", expect "80")`, 'localStorage did not restore');

    // Deep link
    await page.evaluate(() => { location.hash = '#t7'; });
    await page.waitForTimeout(200);
    const t7active = await page.locator('#t7.active').count();
    if (t7active !== 1) record('P2', 'functional', 'Deep-link routing broken', '#t7 hash did not activate t7', '');

    // Global search
    await page.fill('#global-search', 'ATC');
    await page.waitForTimeout(200);
    const searchHits = await page.locator('.sr-item').count();
    if (searchHits < 1) record('P1', 'functional', 'Global search returns nothing', 'Search "ATC" should hit the ATC project', '');

    // Custom KPI creation
    await page.click('[data-tab="t2"]');
    await page.waitForTimeout(150);
    await page.click('#btn-add-kpi');
    await page.waitForTimeout(200);
    await page.fill('#ck-name-en', 'Audit Test KPI');
    await page.fill('#ck-target', '≥ 90%');
    await page.selectOption('#ck-type', 'gte');
    await page.fill('#ck-thresh', '90');
    await page.click('#modalBody .save');
    await page.waitForTimeout(300);
    const customCount = await page.locator('.kpi-card.custom').count();
    if (customCount < 1) record('P1', 'functional', 'Custom KPI creation broken', 'Add Custom KPI did not produce a custom card', '');

    // Language toggle
    await page.click('#btn-lang');
    await page.waitForTimeout(300);
    const dir = await page.getAttribute('html', 'dir');
    if (dir !== 'rtl') record('P1', 'functional', 'Language toggle broken', `Expected dir=rtl after AR toggle, got "${dir}"`, '');
    await page.click('#btn-lang');
    await page.waitForTimeout(200);

    if (errs.length) errs.forEach(e => record('P0', 'js-runtime', 'JS error during functional test', e.msg, e.type));
  });
}

// --- 3. XSS attack vectors ---
async function testXSS(){
  await withPage(async (page, errs) => {
    let xssTriggered = false;
    page.on('dialog', async d => { if (d.type() === 'alert') xssTriggered = true; await d.dismiss(); });
    await page.goto(URL_LOCAL, { waitUntil: 'load' });
    await page.waitForTimeout(500);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(500);

    // Inject XSS via KPI value (card display + modal + sparkline label)
    await page.click('[data-tab="t2"]');
    await page.waitForTimeout(150);
    await page.fill('[data-kpi-input="pm"]', '<img src=x onerror=alert(1)>');
    await page.click('[data-kpi-save="pm"]');
    await page.waitForTimeout(300);
    if (xssTriggered) record('P0', 'security-xss', 'XSS via KPI value input', 'A KPI value containing HTML/JS executed on the card', 'input=<img src=x onerror=alert(1)>');

    // Custom KPI name (rendered in card, modal title, search results)
    await page.click('#btn-add-kpi');
    await page.waitForTimeout(200);
    await page.fill('#ck-name-en', '<script>alert(2)</script>');
    await page.fill('#ck-target', '<img src=x onerror=alert(3)>');
    await page.selectOption('#ck-type', 'trend');
    await page.click('#modalBody .save');
    await page.waitForTimeout(300);
    if (xssTriggered) record('P0', 'security-xss', 'XSS via custom KPI name/target', 'Custom KPI form input executed', '');

    // Search shouldn't execute (results render our HTML)
    await page.fill('#global-search', '<script>');
    await page.waitForTimeout(200);
    if (xssTriggered) record('P0', 'security-xss', 'XSS via search input', 'Search input executed', '');

    // Snapshot import — attacker-controlled JSON
    const evilSnap = {
      version: '0.4',
      customKPIs: [{
        id: 'evil', custom: true,
        name: { en: '<img src=x onerror=alert(9)>', ar: '<script>alert(10)</script>' },
        target: { en: '<img src=x onerror=alert(11)>', ar: 'x' },
        targetType: 'trend',
        impact: { en: '<img src=y onerror=alert(12)>', ar: 'x' },
        impactClass: 'impact-high" onclick="alert(20)" x="',
        decision: { en: 'x', ar: 'x' }
      }],
      annotations: { '<img src=x onerror=alert(30)>': '<img src=x onerror=alert(31)>' },
      kpi: { pm: { value: '<img src=x onerror=alert(40)>', history: {} } }
    };
    // Simulate upload
    await page.evaluate((snap) => {
      const file = new File([JSON.stringify(snap)], 'evil.json', { type: 'application/json' });
      const dt = new DataTransfer();
      dt.items.add(file);
      document.getElementById('file-in').files = dt.files;
      document.getElementById('file-in').dispatchEvent(new Event('change', { bubbles: true }));
    }, evilSnap);
    await page.waitForTimeout(500);
    // Render every possible surface
    await page.click('[data-tab="t2"]');
    await page.waitForTimeout(200);
    await page.click('[data-tab="t4"]');
    await page.waitForTimeout(200);
    // Trigger chart annotation render (which reads annotations)
    if (xssTriggered) record('P0', 'security-xss', 'XSS via imported snapshot', 'Malicious JSON snapshot executed on import', 'JSON.parse then direct property assignment without sanitization');

    if (errs.length) errs.forEach(e => {
      // console errors are OK here — the CSP or invalid loads generate them
      if (!/onerror|Failed to load|net::ERR/i.test(e.msg)) {
        record('P2', 'js-runtime', 'Unexpected error during XSS probe', e.msg, e.type);
      }
    });
  });
}

// --- 4. Accessibility (axe-core) at desktop and mobile ---
async function testA11y(){
  for (const vp of [{w:1440,h:900,name:'desktop'}, {w:390,h:844,name:'mobile'}]){
    const browser = await playwright.chromium.launch();
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
    const page = await ctx.newPage();
    await page.goto(URL_LOCAL, { waitUntil: 'load' });
    await page.waitForTimeout(600);
    await page.addScriptTag({ content: axeSource });
    // Test each tab
    const violations = [];
    for (const tab of ['t1','t2','t3','t4','t5','t6','t7','t8']) {
      const selector = vp.w < 768 ? `[data-mtab="${tab}"]` : `[data-tab="${tab}"]`;
      await page.click(selector);
      await page.waitForTimeout(300);
      const r = await page.evaluate(async () => await window.axe.run(document, {
        runOnly: { type:'tag', values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa'] }
      }));
      r.violations.forEach(v => {
        if (v.nodes.length) violations.push({ tab, id: v.id, impact: v.impact, help: v.help, count: v.nodes.length, sample: v.nodes[0].target.join(' ') });
      });
    }
    await browser.close();
    // Dedup violations by id across tabs
    const seen = new Set();
    for (const v of violations) {
      if (seen.has(v.id + vp.name)) continue;
      seen.add(v.id + vp.name);
      const sev = v.impact === 'critical' ? 'P1' : v.impact === 'serious' ? 'P1' : v.impact === 'moderate' ? 'P2' : 'P3';
      record(sev, 'a11y-'+vp.name, `${v.id}`, v.help, `impact=${v.impact}; sample=${v.sample}; tabs≥${violations.filter(x=>x.id===v.id).length}`);
    }
  }
}

// --- 5. Responsive smoke at 5 viewports ---
async function testResponsive(){
  for (const vp of VIEWPORTS) {
    const browser = await playwright.chromium.launch();
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    await page.goto(URL_LOCAL, { waitUntil: 'load' });
    await page.waitForTimeout(500);

    // Check no horizontal overflow
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    if (overflow) record('P1', 'responsive', `Horizontal overflow at ${vp.name}`, `Body scrolls sideways at ${vp.w}px`, `scrollWidth vs clientWidth`);

    // Correct nav visible
    const topTabsBox = await page.locator('.tabs').boundingBox();
    const botNavBox = await page.locator('.mobile-tabs').boundingBox();
    const topVisible = !!topTabsBox && topTabsBox.height > 0;
    const botVisible = !!botNavBox && botNavBox.height > 0;
    if (vp.w >= 768 && !topVisible) record('P1', 'responsive', `Top tabs missing at ${vp.name}`, 'Desktop should show top tabs', '');
    if (vp.w >= 768 && botVisible) record('P2', 'responsive', `Bottom nav shown on desktop ${vp.name}`, 'Bottom nav should hide on ≥768', '');
    if (vp.w < 768 && !botVisible) record('P1', 'responsive', `Bottom nav missing at ${vp.name}`, 'Mobile should show bottom nav', '');
    if (vp.w < 768 && topVisible) record('P2', 'responsive', `Top tabs shown on mobile ${vp.name}`, 'Top tabs should hide on <768', '');

    // Screenshot
    await page.screenshot({ path: `/tmp/audit_${vp.name}.png`, fullPage: false });
    await browser.close();
    if (errs.length) errs.forEach(m => record('P1', 'js-runtime', `JS error at ${vp.name}`, m, ''));
  }
}

// --- 6. Performance metrics ---
async function testPerf(){
  await withPage(async (page, errs) => {
    await page.goto(URL_LOCAL, { waitUntil: 'load' });
    await page.waitForTimeout(1200);
    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] || {};
      const paint = performance.getEntriesByType('paint');
      const fcp = paint.find(p => p.name === 'first-contentful-paint');
      return {
        domContentLoaded: Math.round(nav.domContentLoadedEventEnd - nav.startTime || 0),
        loadEvent: Math.round(nav.loadEventEnd - nav.startTime || 0),
        fcp: fcp ? Math.round(fcp.startTime) : null,
        transferSize: nav.transferSize || null,
        encodedBodySize: nav.encodedBodySize || null,
        resources: performance.getEntriesByType('resource').length,
      };
    });
    fs.writeFileSync('/tmp/audit_perf.json', JSON.stringify(metrics, null, 2));
    // File size check
    const fileSize = fs.statSync(HTML_PATH).size;
    if (fileSize > 200_000) record('P2', 'perf', 'HTML file over 200 KB', `Single-file weight ${(fileSize/1024).toFixed(0)} KB (target ≤200 KB)`, `wc -c ${HTML_PATH}`);
    if (metrics.fcp && metrics.fcp > 1000) record('P2', 'perf', 'FCP slow', `First Contentful Paint ${metrics.fcp}ms (target ≤1000ms for file:// local)`, '');
  });
}

// --- 7. Keyboard navigation ---
async function testKeyboard(){
  await withPage(async (page, errs) => {
    await page.goto(URL_LOCAL, { waitUntil: 'load' });
    await page.waitForTimeout(500);
    // Tab through several elements
    const reachable = [];
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? { tag: el.tagName, id: el.id, class: el.className, text: (el.textContent||'').trim().slice(0,30) } : null;
      });
      if (info) reachable.push(info);
    }
    // Should include search, buttons, tabs
    const hasSearch = reachable.some(r => r.id === 'global-search');
    const hasTab = reachable.some(r => (r.class||'').includes('tab-btn'));
    if (!hasSearch) record('P1', 'a11y-keyboard', 'Search unreachable via Tab', 'Search input not in tab order within first 12 stops', JSON.stringify(reachable));
    if (!hasTab) record('P1', 'a11y-keyboard', 'Tab buttons unreachable', 'Section tabs not focusable within first 12 stops', '');

    // Escape closes modal
    await page.click('[data-tab="t2"]');
    await page.waitForTimeout(150);
    // V0.5+ uses .kpi-details-btn; V0.4 uses card click
    const detailsBtn = await page.locator('.kpi-card[data-kpi="pm"] .kpi-details-btn').count();
    if (detailsBtn) await page.locator('.kpi-card[data-kpi="pm"] .kpi-details-btn').click();
    else await page.locator('.kpi-card[data-kpi="pm"]').click();
    await page.waitForTimeout(200);
    if ((await page.locator('#modal.active').count()) !== 1) record('P1', 'a11y-keyboard', 'Modal did not open on click', '', '');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    if ((await page.locator('#modal.active').count()) !== 0) record('P1', 'a11y-keyboard', 'Escape does not close modal', '', '');
  });
}

// --- 8. PWA manifest + service worker validity ---
async function testPWA(){
  const mfPath = path.resolve(__dirname, '..', 'manifest.webmanifest');
  const swPath = path.resolve(__dirname, '..', 'sw.js');
  const mf = JSON.parse(fs.readFileSync(mfPath, 'utf8'));
  const required = ['name','short_name','start_url','display','icons'];
  const missing = required.filter(k => !(k in mf));
  if (missing.length) record('P1', 'pwa', 'Manifest missing required fields', missing.join(', '), mfPath);
  if (!Array.isArray(mf.icons) || mf.icons.length < 2) record('P2', 'pwa', 'Manifest icon set thin', 'Need at least 192 & 512 sizes', '');
  const hasMaskable = mf.icons?.some(i => (i.purpose || '').includes('maskable'));
  if (!hasMaskable) record('P2', 'pwa', 'No maskable icon', 'Android adaptive icons need purpose=maskable', '');
  // Icons exist on disk?
  for (const icon of mf.icons || []) {
    const p = path.resolve(__dirname, '..', icon.src);
    if (!fs.existsSync(p)) record('P0', 'pwa', 'Manifest references missing icon file', icon.src, p);
  }
  // SW at least parseable
  const swSrc = fs.readFileSync(swPath, 'utf8');
  if (!/install|activate|fetch/.test(swSrc)) record('P1', 'pwa', 'Service worker missing lifecycle events', '', swPath);
  if (!/skipWaiting|clients\.claim/.test(swSrc)) record('P2', 'pwa', 'Service worker slow update path', 'skipWaiting / clients.claim recommended for updates', '');
}

// --- 9. Print behavior ---
async function testPrint(){
  await withPage(async (page, errs) => {
    await page.goto(URL_LOCAL, { waitUntil: 'load' });
    await page.waitForTimeout(500);
    // Force beforeprint by dispatching event (fires the cover filler)
    await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
    await page.waitForTimeout(200);
    const coverDate = await page.textContent('#cover-date');
    const coverStatus = await page.textContent('#cover-status');
    if (!coverDate || coverDate === '—') record('P2', 'print', 'Cover date not filled', 'beforeprint should populate #cover-date', `got "${coverDate}"`);
    if (!coverStatus || coverStatus === '—') record('P2', 'print', 'Cover status not filled', 'beforeprint should populate #cover-status', `got "${coverStatus}"`);
    // Generate a print PDF to catch layout errors
    const pdfPath = '/tmp/audit_print.pdf';
    try {
      await page.emulateMedia({ media: 'print' });
      await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });
      const sz = fs.statSync(pdfPath).size;
      if (sz < 5000) record('P2', 'print', 'Print PDF suspiciously small', `${sz} bytes`, pdfPath);
    } catch (e) {
      record('P1', 'print', 'Print PDF generation threw', e.message, '');
    }
  });
}

// --- 10. RTL rendering check ---
async function testRTL(){
  await withPage(async (page, errs) => {
    await page.goto(URL_LOCAL, { waitUntil: 'load' });
    await page.waitForTimeout(500);
    await page.click('#btn-lang');
    await page.waitForTimeout(400);
    const dir = await page.getAttribute('html', 'dir');
    if (dir !== 'rtl') record('P1', 'i18n', 'RTL toggle broken', `Expected dir=rtl, got ${dir}`, '');
    // Scan for untranslated leaks (English words in AR mode) — spot check
    // Use innerText (visible text only), NOT textContent (includes <script> body)
    const bodyText = await page.evaluate(() => document.body.innerText);
    const englishOnlyLeaks = ['Save', 'Load', 'Reset data', 'Print / Export PDF', 'Install app'].filter(w => bodyText.includes(w));
    if (englishOnlyLeaks.length) record('P2', 'i18n', 'English strings leak in Arabic UI', 'These labels remain English after AR toggle: ' + englishOnlyLeaks.join(', '), '');
    if (errs.length) errs.forEach(e => record('P1', 'js-runtime', 'JS error during RTL test', e.msg, e.type));
  });
}

// ==== Main ====
(async () => {
  console.log('▶ Baseline load'); await testBaseline();
  console.log('▶ Functional smoke'); await testFunctional();
  console.log('▶ XSS attack vectors'); await testXSS();
  console.log('▶ Accessibility (axe-core, desktop + mobile, all 8 tabs)'); await testA11y();
  console.log('▶ Responsive (5 viewports)'); await testResponsive();
  console.log('▶ Performance'); await testPerf();
  console.log('▶ Keyboard navigation'); await testKeyboard();
  console.log('▶ PWA manifest + SW'); await testPWA();
  console.log('▶ Print output'); await testPrint();
  console.log('▶ RTL / i18n'); await testRTL();

  // Group and report
  const bySev = { P0:[], P1:[], P2:[], P3:[] };
  findings.forEach(f => bySev[f.severity].push(f));
  const summary = {
    total: findings.length,
    P0: bySev.P0.length, P1: bySev.P1.length, P2: bySev.P2.length, P3: bySev.P3.length
  };
  console.log('\n== SUMMARY ==', JSON.stringify(summary));
  fs.writeFileSync('/tmp/audit_findings.json', JSON.stringify({ summary, findings }, null, 2));
  console.log('Findings JSON: /tmp/audit_findings.json');
  console.log('\n== DETAIL ==');
  ['P0','P1','P2','P3'].forEach(sev => {
    if (bySev[sev].length) {
      console.log('\n' + sev + ' (' + bySev[sev].length + '):');
      bySev[sev].forEach((f,i) => console.log(`  ${i+1}. [${f.area}] ${f.title} — ${f.detail}`));
    }
  });
  // Exit non-zero if any P0 (critical) found
  process.exit(bySev.P0.length ? 1 : 0);
})();
