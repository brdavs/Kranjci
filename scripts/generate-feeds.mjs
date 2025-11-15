import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.resolve(ROOT, "dist");
const NEWS_DATA_FILE = path.resolve(ROOT, "src", "data", "news.ts");
const MEMBERS_DIR = path.resolve(ROOT, "content", "members");

const SITE_URL = (process.env.SITE_URL || "https://www.kranjci.si").replace(/\/+$/, "");

function escXml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]));
}

async function loadNewsData() {
    try {
        const content = await fs.readFile(NEWS_DATA_FILE, "utf8");
        const match = content.match(/const RAW_NEWS:[^{=]+=\s*(\[[\s\S]*?\]);/);
        if (!match) return [];
        return JSON.parse(match[1]);
    } catch {
        return [];
    }
}

async function loadPosts() {
    const items = await loadNewsData();
    const posts = items.map((item) => {
        const excerpt = item.excerpt || "";
        const lastmod = new Date(item.date + "T00:00:00Z").toISOString();
        return {
            slug: item.slug,
            title: item.title,
            date: item.date,
            excerpt,
            lastmod
        };
    });
    posts.sort((a, b) => b.date.localeCompare(a.date));
    return posts;
}

async function listMemberSlugs() {
    try { await fs.access(MEMBERS_DIR); } catch { return []; }
    const files = await fs.readdir(MEMBERS_DIR);
    return files.filter(f => f.endsWith(".md")).map(f => f.replace(/\.md$/i, ""));
}

function buildRSS(posts) {
    const items = posts.map(p => {
        const link = `${SITE_URL}/news/${encodeURIComponent(p.slug)}`;
        const pubDate = new Date(p.date + "T00:00:00Z").toUTCString();
        return `
        <item>
            <title>${escXml(p.title)}</title>
            <link>${link}</link>
            <guid isPermaLink="true">${link}</guid>
            <pubDate>${pubDate}</pubDate>
            <description>${escXml(p.excerpt)}</description>
        </item>`;
    }).join("");

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
    <title>${escXml("Zasedba Kranjci – Novice")}</title>
    <link>${SITE_URL}/news</link>
    <description>${escXml("Novice in obvestila zasedbe Kranjci.")}</description>
    <language>sl</language>
    ${items}
</channel>
</rss>`;
}

async function buildSitemap(posts) {
    const memberSlugs = await listMemberSlugs();
    const now = new Date().toISOString();

    const urls = [
        { loc: `${SITE_URL}/`,        lastmod: now },
        { loc: `${SITE_URL}/shows`,   lastmod: now },
        { loc: `${SITE_URL}/music`,   lastmod: now },
        { loc: `${SITE_URL}/contact`, lastmod: now },
        { loc: `${SITE_URL}/news`,    lastmod: posts[0]?.lastmod || now },
        { loc: `${SITE_URL}/members`, lastmod: now },
        ...memberSlugs.map(slug => ({ loc: `${SITE_URL}/member/${encodeURIComponent(slug)}`, lastmod: now })),
        ...posts.map(p => ({ loc: `${SITE_URL}/news/${encodeURIComponent(p.slug)}`, lastmod: p.lastmod }))
    ];

    const body = urls.map(u => `  <url>
    <loc>${escXml(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${u.loc.includes("/member/") ? "0.6" : u.loc.endsWith("/members") ? "0.7" : u.loc.endsWith("/news") ? "0.7" : "0.8"}</priority>
  </url>`).join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;
}

async function main() {
    await fs.mkdir(DIST, { recursive: true });
    const posts = await loadPosts();
    await fs.writeFile(path.join(DIST, "news.xml"), buildRSS(posts), "utf8");
    await fs.writeFile(path.join(DIST, "sitemap.xml"), await buildSitemap(posts), "utf8");
    const robots = `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`;
    await fs.writeFile(path.join(DIST, "robots.txt"), robots, "utf8");
    console.log(`Generated RSS (${posts.length} items) and sitemap → dist/`);
}
main().catch(err => { console.error("Feed generation failed:", err); process.exit(1); });
