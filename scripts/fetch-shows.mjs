import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { httpGet, formatLocalDate, formatLocalTime, DEFAULT_TIME_ZONE } from "./utils/fetch-utils.mjs";
import { parseICSEvents, resolveICalDate, parseFrontmatterBlock } from "./utils/ical-utils.mjs";
import { loadEnv } from "./utils/env.mjs";
import { uploadJsonBlob } from "./utils/blob-storage.mjs";

loadEnv();
const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_JSON = path.resolve(ROOT_DIR, "../src/data/shows.json");
const CALENDAR_URL = process.env.CALENDAR_URL?.trim();
if (!CALENDAR_URL) throw new Error("Missing CALENDAR_URL env var");

const WINDOW_START_MONTHS = -1;
const WINDOW_END_MONTHS = 2;

async function fetchICS(url) {
    return httpGet(url);
}

function withinWindow(date) {
    const now = new Date();
    const start = new Date(now);
    start.setMonth(start.getMonth() + WINDOW_START_MONTHS);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setMonth(end.getMonth() + WINDOW_END_MONTHS);
    end.setHours(23, 59, 59, 999);
    return date >= start && date <= end;
}

function splitCity(location) {
    if (!location) return null;
    const normalized = location.replace(/\s+/g, " ").trim();
    for (const sep of [" - ", " – ", ",", ";", "|"]) {
        if (normalized.includes(sep)) {
            return normalized.split(sep)[0].trim();
        }
    }
    return normalized;
}

function toShow(event) {
    if (!event.SUMMARY?.startsWith("[E]")) return null;
    const when = resolveICalDate(event, DEFAULT_TIME_ZONE);
    if (!when || !withinWindow(when)) return null;
    const { meta, content } = parseFrontmatterBlock(event.DESCRIPTION || "");
    const city = meta.city?.trim() || splitCity(event.LOCATION) || "TBD";
    const venue = meta.venue?.trim() || (event.SUMMARY || "TBD").trim();
    let moreRaw = content.replace(/^\n+/, "").replace(/\n+$/, "");
    if (/^-+\s*(\r?\n|$)/.test(moreRaw)) {
        moreRaw = moreRaw.replace(/^-+\s*/, "");
    }
    const more = moreRaw.length > 0 ? moreRaw : "Več informacij sledi.";
    const link = event.URL?.trim();
    const typeMeta = meta.type?.trim().toLowerCase();
    const type = (typeMeta === "open" || typeMeta === "closed") ? typeMeta : "open";

    return {
        date: formatLocalDate(when),
        city,
        venue,
        more,
        time: formatLocalTime(when),
        type,
        ...(link ? { link } : {})
    };
}

async function main() {
    const ics = await fetchICS(CALENDAR_URL);
    const events = parseICSEvents(ics);
    const shows = events
        .map(toShow)
        .filter(Boolean)
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    await fs.writeFile(OUTPUT_JSON, JSON.stringify(shows, null, 2));
    const blobUrl = await uploadJsonBlob("shows.json", JSON.stringify(shows));
    if (blobUrl) {
        console.log(`Uploaded shows to blob: ${blobUrl}`);
    }
    console.log(`Updated ${OUTPUT_JSON} with ${shows.length} events.`);
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
