# WME Site Redesign — Handoff Document

## What This Project Is

A complete website rebuild for **World Missions & Evangelism** (worldmissionsevangelism.com), a church planting missions organization founded in 1988 in Benton, Kentucky. We're replacing their outdated WordPress/Divi site with a modern static site.

## Current State: LIVE

- **Live URL:** https://wme-site-g7zjo.ondigitalocean.app
- **GitHub Repo:** github.com/jeffharlan/wme-site (public — was made public so DO App Platform could clone it)
- **Hosting:** Digital Ocean App Platform under `jeff@wilsonofficesolutions.com` account (doctl context: `wilsoncontract`)
- **Auto-deploy:** Yes — push to `main` triggers a new build on DO App Platform
- **App ID:** `be2f2b24-2ed3-4e3f-ab73-26fcfce3d3da`

## Tech Stack

- **Astro 5.18** — static site generator (outputs pure HTML, zero JS by default)
- **Tailwind CSS 3.4** with `@tailwindcss/forms` plugin
- **Node 22** (required — use `fnm use 22`)
- **Fonts:** Playfair Display (headings) + Inter (body) via Google Fonts
- **No backend** — forms are styled but not wired up yet

## Project Structure

```
/home/jefferey/local-git/wme/
├── src/
│   ├── components/       # All section components
│   │   ├── Navbar.astro
│   │   ├── Hero.astro
│   │   ├── About.astro
│   │   ├── Impact.astro
│   │   ├── Instar.astro
│   │   ├── Regions.astro
│   │   ├── Team.astro
│   │   ├── Events.astro
│   │   ├── Prayer.astro
│   │   ├── Give.astro
│   │   ├── Newsletter.astro
│   │   ├── Contact.astro
│   │   └── Footer.astro
│   ├── layouts/Layout.astro   # Base HTML layout + scroll observer
│   ├── pages/index.astro      # Main page (assembles all components)
│   └── styles/global.css      # All custom CSS, design system
├── public/images/             # All images (downloaded from their current site)
├── tailwind.config.mjs
├── astro.config.mjs
├── package.json
└── .do/app.yaml               # DO App Platform spec (not used — deployed via git clone URL)
```

## Design System (V2 — Current)

- **Aesthetic:** Premium dark mode, Nexterra/Vercel-inspired
- **Base color:** `#0a0f1a` (near-black navy)
- **Accent:** Amber/gold gradient (`#d4a017` → `#b8860b`)
- **Cards:** Glassmorphism — `bg-white/[0.03]` with `backdrop-blur-md`, `border-top: white/10` for "lume" edge lighting
- **Hover:** Cards lift with `-translate-y-1` and deeper shadows
- **Typography:** Playfair Display serif headings, Inter sans body, `tracking-tight` on all headings
- **Animations:** Scroll-triggered reveals via IntersectionObserver in Layout.astro
- **CSS classes to know:** `glass-card`, `floating-card`, `floating-card-hover`, `glass-card-hover`, `gradient-text`, `btn-primary`, `btn-ghost`, `label-text`, `section-container`, `section-narrow`, `reveal`, `reveal-left`, `reveal-right`, `stagger`

## Images Available

All downloaded from their current WordPress site to `public/images/`:
- **Staff headshots:** david-parish.png, jacob-harlan.png, trey-clendenen.png, renee-driskill.png
- **Missionary photos (used in hero/about):** missionary-teaching.jpg, missionary-goodnight.jpg, missionary-crowder.jpg, keith-juanita.jpg, palabra-vida.jpg, campo-mission.jpg, community-prayer.jpg
- **Unused but available:** missionary-gunn.jpg, missionary-watson.jpg, randy-linda.jpg, rodrigues-family.jpg, candace.jpg, missionary-tappert.jpg, gods-promise.jpg, david-fackler.jpg, lisa-sims.jpg
- **Logos/icons:** wme-logo.png, instar-blue.jpg, instar-goal-map.jpg, icon-latin-america.png, icon-southeast-asia.png, icon-africa.png, icon-north-america.png, events-icon.png, resources-icon.png, our-team-icon.png

## Key Content Facts

- **Founded:** 1988 by David Parish
- **INSTAR project:** Launched 2008 in Honduras, now 6,132+ churches across 5 continents
- **Stats:** 23,000+ lives committed, 18,000+ baptisms, 34,000+ participants, 50+ denominations trained, 1,400+ people groups targeted
- **Regions:** Latin America, Southeast Asia, Africa, North America, Caribbean
- **5 INSTAR Pillars:** Intercession, Networking, Serving, Training, Assisting
- **Giving platform:** https://give.ministrylinq.com/App/Giving/cashlinq-1409
- **Contact:** PO Box 790, Benton KY 42025 / (270) 527-9445 / contact@worldmissionsevangelism.com
- **Socials:** Facebook, LinkedIn, YouTube
- **Active event:** Spring Banquet 2026

## What's NOT Done Yet

1. **Contact form backend** — form is styled but `onsubmit="return false;"`. Needs a service (Formspree, Netlify Forms, or custom endpoint)
2. **Newsletter form** — same situation, needs integration with their email provider
3. **Spring Banquet registration** — links to a placeholder Google Form URL, needs their real form link
4. **Custom domain** — currently on `*.ondigitalocean.app`, needs DNS setup if they want `worldmissionsevangelism.com` pointed here
5. **SEO metadata** — basic meta tags are in place but could add structured data, sitemap.xml
6. **Mobile testing** — built responsive but needs thorough mobile QA
7. **Make GitHub repo private again** — was made public for DO deployment. Could set up GitHub integration on the Wilson DO account to allow private repo deploys
8. **Image optimization** — images are raw from their WordPress. Could add Astro's built-in image optimization

## Relationship Context

- Jacob Harlan (COO on the site) is related to Jefferey but this is NOT a family organization. Keep leadership section straightforward — names and roles, no family narrative.
- The customer has very few good photos. Current design uses CSS treatments (low opacity, gradients, contrast boost) to make existing photos work. Better photos would be a big upgrade.
- Primary site goal is education/awareness about WME and INSTAR (not donation-first).

## Commands

```bash
# Dev
fnm use 22
npm run dev          # http://localhost:4321

# Build
npm run build        # outputs to dist/

# Deploy (auto on push, or manual)
doctl auth switch --context wilsoncontract
doctl apps create-deployment be2f2b24-2ed3-4e3f-ab73-26fcfce3d3da --wait

# Push changes
git add -A && git commit -m "description" && git push origin main
```
