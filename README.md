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
- npm 9+

## Namestitev
```bash
npm install
```

## Razvojni strežnik
```bash
npm run dev
# odpri http://localhost:5173
```

### Docker Compose
```bash
docker compose up --build
# odpri http://localhost:5173
```
Koda je mountana v kontejner, zato se spremembe samodejno odražajo v dev strežniku.

## Produkcijski build in predogled
```bash
npm run build
npm run preview
# odpri http://localhost:4173
```

## Posodobitev dogodkov iz Google Calendar
```bash
npm run fetch-all
# ali posebej:
npm run fetch-shows
npm run fetch-news
```
`fetch-shows` posodobi `src/data/shows.ts` iz Google Calendar ICS. `fetch-news` združi koledarske novice z Meta (Facebook/Instagram) objavami in posodobi `src/data/news.ts`. Datoteke so generirane – ne urejaj jih ročno.

Na Vercelu cron kliče `/api/fetch-all` (ki interno zažene `fetch-all`) vsak dan ob 6:00 UTC – glej `vercel.json`/`api/fetch-all.ts`. Če uporabiš drugo infrastrukturo, nastavi lasten cron da pokliče enak endpoint ali zažene skripte lokalno.

## Vercel (deploy)
1. Poveži repozitorij v **Vercel** in izberi framework **Vite** (output: `dist/`), ali lokalno:
   ```bash
   npx vercel --prod
   ```
   (Če želiš samo predogled brez produkcije: `npx vercel`.)
2. V **Project Settings → Environment Variables** nastavi:
   - `SITE_URL = https://www.kranjci.si`
- za kontaktni obrazec (SMTP):
    - `SMTP_HOST`
    - `SMTP_PORT` (npr. 587)
    - `SMTP_USER`
    - `SMTP_PASS`
    - `MAIL_TO` (npr. `kranjci.band@example.com`)
    - `MAIL_FROM` (npr. `Zasedba Kranjci <no-reply@kranjci.si>`)
- za Meta Graph API novice (opcijsko):
    - `META_GRAPH_TOKEN`
    - `META_FACEBOOK_PAGES` (vejicami ločen seznam page ID-jev)
    - `META_INSTAGRAM_USERS` (vejicami ločen seznam IG user ID-jev)
    - `META_NEWS_LIMIT` (opcijsko število objav na profil, privzeto 5)
3. V korenu obstaja skripta `DEPLOY`; zaženi jo, da iz glavne git veje (main) sprožiš deploy na Vercel.

## Struktura
```
.
├─ api/contact.ts              # Vercel serverless funkcija (nodemailer)
├─ api/fetch-all.ts         # Cron endpoint za sinhronizacijo koledarja
├─ content/
│  └─ members/*.md            # Člani (Markdown + frontmatter)
├─ public/
│  ├─ styles/global.css
│  ├─ favicon.svg
│  └─ og.jpg
├─ scripts/generate-feeds.mjs  # Generira news.xml, sitemap.xml, robots.txt
├─ scripts/fetch-shows.mjs     # ICS → shows.ts
├─ scripts/fetch-news.mjs      # ICS + Meta API → news.ts
├─ scripts/fetch-all.mjs       # Zaporedno zažene fetch-shows in fetch-news
├─ src/
│  ├─ app.tsx
│  ├─ main.tsx
│  ├─ data/members.ts         # Fallback podatki članov
│  ├─ data/shows.ts
│  ├─ data/news.ts            # Avtomatsko generirane novice (Google Calendar)
│  ├─ news/loader.ts
│  ├─ members/loader.ts
│  └─ routes/{Home,Shows,Music,Contact,News,NewsPost,Members,Member}.tsx
├─ index.html
├─ vercel.json                 # SPA rewrite
├─ vite.config.ts
├─ tsconfig.json
└─ package.json
```

## Vsebina
### Novice (Google Calendar)
Dogodki z oznako `[N]` v Google Calendar (isti ICS kot koncerti) predstavljajo novice. Opis dogodka mora vsebovati Markdown z YAML frontmatterjem, npr.:
```md
---
title: "Pozdravljen svet"
date: 2025-11-01
excerpt: "Prva novica in kratek opis."
cover: "/og.jpg"
slug: "pozdravljen-svet"
---

Telo novice je klasičen **Markdown**.
```

- Naslov v koledarju (`SUMMARY`) mora začeti z `[N]`, a se nikoli ne izpiše na strani.
- Frontmatter `title` je obvezen in je edini vir naslova novice.
- `excerpt` (če ga vpišeš) je edini prikazani izvleček; `cover` in `slug` so opcijski (slug se sicer generira iz datuma + naslova).
- Novice se samodejno zapišejo v `src/data/news.ts`, sinhronizacija pa vsakič ponovno zajame vse koledarske vnose do (vključno) današnjega datuma.
- Poleg koledarja lahko novice prihajajo tudi iz Meta Graph API (Facebook/Instagram). Če nastaviš zgornje env spremenljivke, skripta `fetch-news` doda najnovejše objave teh profilov (tekst kot Markdown + link in naslov iz prve vrstice).


### Dogodki (Shows)
- Podatki o nastopih se generirajo v `src/data/shows.ts` preko skripte `npm run fetch-shows` ali `npm run fetch-all`.
- Vir je Google Calendar (ICS). Upoštevajo se dogodki z oznako `[E]` in v oknu od enega meseca nazaj do treh mesecev naprej.
- Polja: `date`, `time`, `city`, `venue`, `more` (Markdown → HTML), `type` (`open`/`closed`), `url?`.
- V Markdown frontmatterju dogodka lahko nastaviš `city`, `venue`, `type` in `url` (če `url` ni nastavljen, se uporabi `URL` iz ICS).
- Na produkciji Vercel cron pokliče `/api/fetch-all` (interno `fetch-all`) ob 6:00 UTC, kar osveži `shows.ts` + `news.ts`.
- Ročno osveževanje pred deployem: `npm run fetch-shows` ali `npm run fetch-all` (lokalno ali v CI) in nato deploy.


### Člani (Markdown)
Primer `content/members/luka-kranjc.md`:
```md
---
name: "Luka Kranjc"
role: "Vokal, kitara"
photo: "/members/luka.jpg"
instagram: "https://instagram.com/"
youtube: "https://youtube.com/"
---

Kratek opis člana v **Markdown** obliki.
```

Če Markdown za člana ne obstaja, se uporabi fallback iz `src/data/members.ts`.

## Kontaktni obrazec
Pošilja na `/api/contact` (Vercel Function); uporabljen je `nodemailer`. Poskrbi za pravilne SMTP spremenljivke okolja.

## Licenca
MIT (po potrebi spremenite).
