import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchCalendarNews } from "./news/calendar.mjs";
import { loadEnv } from "./utils/env.mjs";
import { getDataPath, writeJsonAndUpload } from "./utils/output.mjs";

loadEnv();

const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));
const NEWS_OUTPUT_JSON = getDataPath("news.json");

async function readExistingNews() {
    try {
        const content = await fs.readFile(NEWS_OUTPUT_JSON, "utf8");
        return JSON.parse(content);
    } catch {
        return [];
    }
}

function mergeNews(existing, incoming) {
    const map = new Map(existing.map((item) => [item.uid, item]));
    for (const item of incoming) {
        map.set(item.uid, item);
    }
    const toKey = (item) => `${item.date}T${item.time ?? "00:00"}`;
    return Array.from(map.values()).sort((a, b) => toKey(b).localeCompare(toKey(a)));
}

async function main() {
    const sources = [];
    console.log("Fetching calendar news...");
    sources.push(fetchCalendarNews());

    // Meta (Facebook/Instagram) ingestion is intentionally disabled for now.
    // We only ingest calendar-backed news in this script.

    const results = await Promise.allSettled(sources);
    const newsItems = results.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
    const existingNews = await readExistingNews();
    const mergedNews = mergeNews(existingNews, newsItems);
    const { outputPath, blobUrl } = await writeJsonAndUpload("news.json", mergedNews);
    if (blobUrl) console.log(`Uploaded news to blob: ${blobUrl}`);
    console.log(`Updated ${outputPath} with ${newsItems.length} latest entries (total ${mergedNews.length}).`);
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
