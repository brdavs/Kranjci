import type { VercelRequest, VercelResponse } from "@vercel/node";
import { readContentJson } from "./_content-reader";

type RawShow = {
    date: string;
    city: string;
    venue: string;
    more: string;
    time: string;
    type: "open" | "closed";
    url?: string;
};

export default async function handler(_req: VercelRequest, res: VercelResponse) {
    try {
        const data = await readContentJson<RawShow>("shows.json");
        res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=30");
        res.status(200).json(data);
    } catch (error) {
        console.error("Failed to read shows.json:", error);
        res.status(500).json({ ok: false, error: (error as Error).message });
    }
}
