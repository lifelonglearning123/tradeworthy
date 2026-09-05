TRADEWORTHY — public website, "Flow" look v3 (5 Sep 2026)
====================================================

Static HTML. No build step, no framework. Configured for Vercel (see DEPLOY.md) — it also
works on Netlify, Cloudflare Pages, cPanel or S3, but those need their own clean-URL rule.
index.html is the home page, served at /.

URLs are extensionless: /about, /book-a-call, /why-tradeworthy. Vercel's cleanUrls setting
maps them to the .html files and 308-redirects the old .html URLs. Because of that you can
no longer open the files by double-clicking them; preview with "npx serve ." or "vercel dev".

Pages
  index.html            Home — Connect
  present.html          Present
  boost.html            Boost
  convert.html          Convert
  can-we-help.html      Can we help?
  why-tradeworthy.html  Why Tradeworthy (includes the lost-revenue calculator and the directories comparison)
  about.html            About
  book-a-call.html      Book a call (form)
  privacy.html / terms.html / cookies.html   Legal (drafts — see below)
  404.html              Not found
  assets/site.css, assets/site.js, assets/favicon.svg, assets/logo.svg
  robots.txt, sitemap.xml   (both assume https://tradeworthy.co.uk — change if the domain differs)
  vercel.json           Clean URLs, asset caching, security headers — see DEPLOY.md
  DEPLOY.md             How to put it live on Vercel

Wiring the Book a call form to GoHighLevel
  Open book-a-call.html and find:   window.TW_CONFIG = { ghlFormId: '', ghlWebhook: '' };
  Option A — embed your HighLevel form: Sites → Forms → Builder → your form → Integrate → Embed.
             Copy the id from the iframe src (…/widget/form/XXXXXXXX) and paste it as ghlFormId.
             The page then shows the HighLevel form instead of its own.
  Option B — keep the page's own form (matches the design) and post it to a HighLevel Inbound Webhook:
             Automation → Workflows → new workflow → trigger "Inbound Webhook" → copy the URL → paste as ghlWebhook.
             Fields sent as JSON: name, business, trade, area, phone, email, team, best_time, notes, sting, consent,
             source, page, submitted_at.
  With both blank the form shows a thank-you but sends nothing (preview mode).

Placeholders still to fill
  [phone number] on book-a-call.html (two places) and the tel: links
  hello@tradeworthy.co.uk / privacy@tradeworthy.co.uk — confirm the addresses
  About: Oliver's and Chao's backgrounds, three photos (the "Photo" boxes)
  Legal: [date], [ICO registration], retention periods, sub-processor regions — the three pages are drafts and say so

Go-live gates carried over from Outline (do not remove without a decision)
  Home §5 / Why §5  "One person who knows your business … reply the same working day" — named contact not staffed
  Home §9           "Only if you pay for leads" — per-platform terms check outstanding; keeps "under 30 minutes"
  Why §8            every competitor cell in the comparison table must be evidenced before it ships
  About §3          founder backgrounds must be real, not generic
  Present §7        the findability check still runs on gbp.artificialignorance.io — no link until rebranded
  Present §3-4      who delivers website build and hosting is TBC

Home hero — the phone
  The hero's "on the call" panel is no longer a live HTML card; it's a photoreal render of a
  phone showing that same screen: assets/img/phone-call.webp (served) and .png (fallback).
  Generated with Higgsfield (Nano Banana Pro) from a pixel-accurate HTML mock of the screen,
  then background-removed, so the wording on it is exactly the site's own copy — WRITTEN UP,
  00:41, "Mobile · unknown number / Details taken", the Name/Number/Job/Where/When chips and
  "Text + email sent to the customer". The screen is a mock-up of the app, not a real
  screenshot; if the product UI ever ships differently, regenerate it. Styled by .hero-phone
  in site.css (NOT .phone — that class is a different component used on other pages).
  The card no longer animates. The p1-p4 phase loop still runs and still drives the TODAY
  card and the ringing tile, so site.js guards the three text nodes that used to live in the
  call card.

Flow look — placeholders to replace before go-live
  assets/img/electrician.jpg, plumber.jpg, van.jpg, hands.jpg, workshop.jpg — AI-generated stand-ins; swap for real photos (same filenames).
  assets/img/map-dark.jpg (and map.jpg) — OpenStreetMap tiles of SW London / Surrey, © OpenStreetMap contributors (credit is on the map). Change the base/pins in index.html to a real customer area, or keep as a demo.
  Pricing section on the home page: £XXX are placeholders. This section reverses the Outline decision "pricing excluded from v1" — chao's call, 5 Sep.
  Dashboard sample data (services, prices, "Sarah M." enquiry) is illustrative.
