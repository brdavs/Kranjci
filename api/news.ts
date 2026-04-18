import type { VercelRequest, VercelResponse } from "@vercel/node";
import { readContentJson } from "./_content-reader";

type RawNewsItem = {
    uid: string;
    slug: string;
    title: string;
    date: string;
    markdown: string;
    time?: string;
    excerpt?: string;
    cover?: string;
};

export default async function handler(_req: VercelRequest, res: VercelResponse) {
    try {
        const data = await readContentJson<RawNewsItem>("news.json");
        res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=30");
        res.status(200).json(data);
    } catch (error) {
        console.error("Failed to read news.json:", error);
        res.status(500).json({ ok: false, error: (error as Error).message });
    }
}
