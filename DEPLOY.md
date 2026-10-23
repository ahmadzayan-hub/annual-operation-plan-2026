# Deploy the standalone Annual Operational Plan

This repository is a complete static, single-user planner. It needs no backend,
API keys, external database, paid hosting plan, or AI service. KPI records, notes,
decision status and gap status stay in browser storage. Save/Load moves a JSON
backup between devices; it is not automatic cloud sync. The project and risk
catalogue are a built-in rail-maintenance planning baseline, not a collaborative
project-management database.

## Existing intended host: GitHub Pages

The repository is public. Standard GitHub-hosted Actions and Pages are available
for public repositories on GitHub Free. See [GitHub's publishing-source guide](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

One-time owner setup, if Pages is not enabled:

1. Open this repository's **Settings → Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. Run **Actions → Deploy to GitHub Pages → Run workflow** on `main`.

Do not create a personal access token, expand an installed GitHub App's
permissions, change repository visibility, or upgrade a plan for this step.
The workflow token can deploy an existing site, but cannot automatically create
one with repository-administration privileges. `Resource not accessible by
integration` at **Create Pages site** means initial owner configuration is missing,
not proof that a paid plan is needed.

The workflow runs the same state, browser, backup round-trip, accessibility and
offline tests as PR CI before deploying. It builds `dist/` from an explicit
application-file allowlist, never publishing development dependencies or tests.
The deployment summary supplies the authoritative live URL. Do not call a URL
live until that exact workflow succeeds and the app is tested at it.

`release.json` in the published package identifies the deployed commit and
SHA-256 hashes of the application files. Use it to compare deployment with the
expected tested commit.

## Reproduce and package

```sh
npm ci
npx playwright install --with-deps chromium
npm test
npm run build
npm run test:browser
npm run test:audit
```

`npm test` uses built-in Node APIs and needs no browser or server. Browser tests
start a temporary loopback-only server and use isolated synthetic data under a
Pages-style repository subpath. `test:audit` preserves the original broader
10-suite audit and now fails on P0 **or P1** findings. Browser-dependent checks
must run only in an execution environment that permits browser launch and local
listeners, such as the standard public GitHub Actions runner.

## Offline and backup contract

- First visit must succeed online so the service worker caches the app shell.
- Subsequent reloads and KPI editing work offline in the same browser profile.
- Clearing site data, private browsing, a new hostname, or a new device can remove
  or separate saved data. Export a JSON backup before changing devices or origins.
- The HTML file also works as a downloaded offline document, subject to that
  browser's file-storage rules. PWA installation needs HTTPS and a compatible
  browser; actual Android installation is a separate device check.
- No subscription or paid-service activation is part of this deployment.
