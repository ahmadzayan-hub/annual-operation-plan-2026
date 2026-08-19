# Deploy — pick one host

Five ways to get `operational-plan/` live at a URL you can open on your
phone. Ranked easiest → most involved. All are free-tier.

Every option here works with a **private** repo. Every option ends with
you receiving a live HTTPS URL that supports the PWA install prompt on
Android Chrome.

---

## 0. GitHub Pages (already wired) — needs Pages on the plan

Workflow: `.github/workflows/deploy-operational-plan.yml`

Currently red-badged because your plan doesn't include Pages on
private repos (the Pages `Create site` API call returned "Resource not
accessible by integration"). Two ways to fix:

- **Make the repo public.** Settings → General → Danger Zone → Change
  visibility → Public. Zero cost. Zero credentials.
- **Upgrade to GitHub Pro** ($4/month) — Pages then works on private.

Either way, the workflow succeeds on the next push and the URL is:

```
https://ahmadzayan-hub.github.io/desktop-tutorial/
```

---

## 1. Surge.sh — the fastest to a URL

**Time to first deploy: ~60 seconds after adding the secrets.**

Workflow: `.github/workflows/deploy-operational-plan-surge.yml`

### One-time setup

1. On your machine:
   ```bash
   npx surge whoami   # creates a free account if you don't have one
   npx surge token    # prints your API token — copy it
   ```
2. Pick a subdomain, e.g. `operational-plan-2026.surge.sh`.
3. In this repo → **Settings → Secrets and variables → Actions → New
   repository secret**. Add three:
   - `SURGE_LOGIN` = your email address
   - `SURGE_TOKEN` = token from step 1
   - `SURGE_DOMAIN` = `operational-plan-2026.surge.sh`
4. Next push to `operational-plan/**` fires the workflow. Or trigger
   manually: **Actions → Deploy operational plan — Surge.sh → Run workflow**.

Live URL: `https://operational-plan-2026.surge.sh/`

Pros: fastest setup; one token; no dashboard to babysit.
Cons: Surge subdomains only (no custom HTTPS domain on the free tier).

---

## 2. Cloudflare Pages — best performance, free custom domain

**Time to first deploy: ~2 minutes after adding the secrets.**

Workflow: `.github/workflows/deploy-operational-plan-cloudflare.yml`

### One-time setup

1. Create a free Cloudflare account: https://dash.cloudflare.com/sign-up
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Direct
   Upload**. Name the project e.g. `operational-plan`. Note the name.
3. Cloudflare → **My Profile → API Tokens → Create Token → Edit
   Cloudflare Workers** template. Copy the token.
4. Cloudflare dashboard homepage → right sidebar shows your **Account ID**.
5. In this repo → **Settings → Secrets and variables → Actions**. Add
   three secrets:
   - `CLOUDFLARE_API_TOKEN` = token from step 3
   - `CLOUDFLARE_ACCOUNT_ID` = account ID from step 4
   - `CLOUDFLARE_PROJECT_NAME` = project name from step 2

Live URL: `https://<project-name>.pages.dev/`

Pros: CDN performance, free custom-domain HTTPS.
Cons: three secrets; project must exist first.

---

## 3. Vercel — dedicated project (recommend if you already have a Vercel account)

**Time to first deploy: ~3 minutes after adding the secrets.**

Workflow: `.github/workflows/deploy-operational-plan-vercel.yml`

**Important:** this is a DEDICATED project, separate from the Maktab
Vercel project (`desktop-tutorial`) that's currently erroring on the
main deploy. That project's Next.js build failure doesn't affect this one.

### One-time setup

1. On your machine:
   ```bash
   cd operational-plan
   npx vercel link
   # Prompts you to create/link a NEW Vercel project. Pick "Other"
   # for framework (no build step). Creates .vercel/project.json.
   ```
2. Copy the two IDs from `.vercel/project.json` and add secrets:
   - `VERCEL_ORG_ID` = orgId from project.json
   - `VERCEL_PROJECT_ID` = projectId from project.json
3. Create a token at https://vercel.com/account/tokens → Create Token.
   Add secret:
   - `VERCEL_TOKEN` = token
4. Delete the local `.vercel/` folder (it's gitignored anyway).

Live URL: `https://<project-slug>.vercel.app/`

Pros: excellent DX, generous free tier.
Cons: three secrets; needs local `vercel link` first.

---

## 4. Netlify — dedicated site (recommend if you already have a Netlify account)

**Time to first deploy: ~2 minutes after adding the secrets.**

Workflow: `.github/workflows/deploy-operational-plan-netlify.yml`

**Important:** dedicated site, separate from the two existing Netlify
sites on this repo (`symphonious-madeleine-83e0ae`, `gentle-sundae-3bd078`)
whose publish paths don't include `operational-plan/`.

### One-time setup

1. Create a free Netlify account: https://app.netlify.com
2. Netlify dashboard → **Add new site → Deploy manually**. Name the
   site e.g. `operational-plan`.
3. Copy the Site ID from site → Site settings → General → Site details.
4. Create a token at **User settings → Applications → Personal access
   tokens → New access token**. Name it "GitHub Actions deploy". Copy it.
5. In this repo → Settings → Secrets and variables → Actions. Add:
   - `NETLIFY_AUTH_TOKEN` = token from step 4
   - `NETLIFY_SITE_ID` = site ID from step 3

Live URL: `https://<site-slug>.netlify.app/`

---

## Which one should I pick?

- **Want a URL in 60 seconds and don't care about branding?** → Surge.
- **Care about performance / want a custom domain?** → Cloudflare Pages.
- **Already have a Vercel / Netlify account?** → their dedicated workflow.
- **Willing to make the repo public OR pay $4/mo?** → GitHub Pages
  (works out of the box, URL is `github.io/desktop-tutorial/`).

All four alternative workflows are dormant until you add their secrets.
They preflight-check for their required secrets and skip cleanly (job
turns green with a warning) if any secret is missing — so having all
four workflows in the repo does not spam your Actions tab with red badges.
