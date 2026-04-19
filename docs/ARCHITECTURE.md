# Architecture

Detected stack: Node.js, TypeScript, Docker Compose

Primary top-level areas:
- `.vercel`
- `_resources`
- `api`
- `content`
- `dist`
- `docs`
- `public`
- `scripts`
- `src`

This file is a lightweight architectural baseline. It should only change when repo structure or major technical shape changes.

Seed excerpt from project docs:

# Zasedba Kranjci — Preact + Vite + Vercel

Mini spletna stran za **Zasedba Kranjci**, narejena s **Preact + Vite** in pripravljena za **Vercel**.
Vključuje:
- rute: domača stran, koncerti, glasba, kontakt
- novice iz Markdown datotek (+ RSS `news.xml`)
- člani zasedbe: seznam + podstrani (Markdown s frontmatterjem; TS fallback)
- kontaktni obrazec prek Vercel Functions (`/api/contact` z `nodemailer`)
- sitemap (`sitemap.xml`) in `robots.txt` generirana po build-u

## Zahteve
- Node 18+ (priporočeno 20+)
