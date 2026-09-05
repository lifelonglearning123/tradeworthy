# Deploying Tradeworthy to Vercel

Static site — no build step, no framework, no server code. Vercel serves the folder as-is
and `vercel.json` does the rest.

## What `vercel.json` does

- **`cleanUrls: true`** — pages are served at `/about`, `/book-a-call`, etc.
  Old `/about.html` URLs still work: Vercel 308-redirects them to the clean path,
  so any link already shared stays alive.
- **`trailingSlash: false`** — `/about/` redirects to `/about`. One canonical URL per page.
- **Caching for `/assets/*`** — `max-age=0, s-maxage=31536000, stale-while-revalidate`.
  Vercel's CDN caches images/CSS/JS indefinitely and purges them on every deploy, while
  browsers always revalidate. That means swapping a photo for a real one (same filename,
  as the README instructs) shows up immediately instead of being stuck in someone's cache.
- **Security headers** — nosniff, SAMEORIGIN framing, strict-origin referrer,
  a locked-down Permissions-Policy, and HSTS.

`404.html` is picked up automatically for unknown paths.

## Deploy — CLI (quickest)

    npm i -g vercel
    cd "C:\python\website tradeworthy"
    vercel            # first run: links/creates the project, deploys a preview
    vercel --prod     # promotes to production

## Deploy — Git (recommended once it's live)

Give this folder its own repo so pushes deploy it:

    cd "C:\python\website tradeworthy"
    git init
    git add .
    git commit -m "Tradeworthy website"
    git branch -M main
    git remote add origin https://github.com/<you>/tradeworthy-website.git
    git push -u origin main

Then in Vercel: **Add New → Project → import the repo**. Framework preset **Other**,
build command **empty**, output directory **empty** (the repo root is the site).
Every push to `main` then deploys to production.

## Custom domain

Vercel → Project → Settings → Domains → add `tradeworthy.co.uk` and `www.tradeworthy.co.uk`,
then point DNS at the records Vercel shows. Set one as primary so the other redirects.
`robots.txt` and `sitemap.xml` already assume `https://tradeworthy.co.uk` — change them if
the live domain differs.

## Previewing locally

Clean URLs mean you can no longer double-click the `.html` files (`/about` won't resolve
over `file://`). Run a server instead:

    cd "C:\python\website tradeworthy"
    npx serve .

Then open http://localhost:3000. `serve` is Vercel's own static server, so it matches
production behaviour: `/about` works, `/about.html` redirects to it, and unknown paths
get `404.html`. Ctrl+C to stop. Add `-l 4321` to use a different port.

`vercel dev` also works and honours `vercel.json` headers exactly, but it links this folder
to a Vercel project first — use it only when you're ready for that.

No Node? A plain `python -m http.server` will NOT work: it doesn't do clean URLs, so every
page except the home page 404s.

## Still to do before go-live

Nothing about hosting — see `README.txt` for the content gates (phone number, founder
backgrounds, legal drafts, placeholder photos, pricing, and the Outline decisions).
