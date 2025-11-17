import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchCalendarNews } from "./news/calendar.mjs";
import { fetchFacebookNews } from "./news/facebook.mjs";
import { fetchInstagramNews } from "./news/instagram.mjs";
import { splitList } from "./utils/fetch-utils.mjs";
import { loadEnv } from "./utils/env.mjs";
import { uploadJsonBlob } from "./utils/blob-storage.mjs";

loadEnv();

const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));
const NEWS_OUTPUT_JSON = path.resolve(ROOT_DIR, "../src/data/news.json");
const NEWS_FUTURE_YEARS = 1;

const META_GRAPH_TOKEN = process.env.META_GRAPH_TOKEN?.trim();
const META_FACEBOOK_PAGES = splitList(process.env.META_FACEBOOK_PAGES);
const META_INSTAGRAM_USERS = splitList(process.env.META_INSTAGRAM_USERS);
const META_NEWS_LIMIT = Number(process.env.META_NEWS_LIMIT || 5);

function withinNewsWindow(date) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setFullYear(end.getFullYear() + NEWS_FUTURE_YEARS);
    end.setHours(23, 59, 59, 999);
    return date >= now && date <= end;
}

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
    // Temporarily disabled Meta (Facebook/Instagram) news fetching.
    // if (META_GRAPH_TOKEN && META_FACEBOOK_PAGES.length > 0) {
    //     console.log(`Fetching Facebook news for: ${META_FACEBOOK_PAGES.join(", ")}`);
    //     sources.push(fetchFacebookNews({ token: META_GRAPH_TOKEN, pageIds: META_FACEBOOK_PAGES, limit: META_NEWS_LIMIT, withinWindow }));
    // }
    // if (META_GRAPH_TOKEN && META_INSTAGRAM_USERS.length > 0) {
    //     console.log(`Fetching Instagram news for: ${META_INSTAGRAM_USERS.join(", ")}`);
    //     sources.push(fetchInstagramNews({ token: META_GRAPH_TOKEN, userIds: META_INSTAGRAM_USERS, limit: META_NEWS_LIMIT, withinWindow }));
    // }
    const results = await Promise.allSettled(sources);
    const newsItems = results.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
    const existingNews = await readExistingNews();
    const mergedNews = mergeNews(existingNews, newsItems);
    await fs.writeFile(NEWS_OUTPUT_JSON, JSON.stringify(mergedNews, null, 2));
    const blobUrl = await uploadJsonBlob("news.json", JSON.stringify(mergedNews));
    if (blobUrl) {
        console.log(`Uploaded news to blob: ${blobUrl}`);
    }
    console.log(`Updated ${NEWS_OUTPUT_JSON} with ${newsItems.length} latest entries (total ${mergedNews.length}).`);
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
