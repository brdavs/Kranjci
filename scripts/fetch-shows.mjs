import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { httpGet, formatLocalDate, formatLocalTime, DEFAULT_TIME_ZONE } from "./utils/fetch-utils.mjs";
import { parseICSEvents, resolveICalDate, parseFrontmatterBlock } from "./utils/ical-utils.mjs";
import { loadEnv } from "./utils/env.mjs";
import { writeJsonAndUpload } from "./utils/output.mjs";

loadEnv();
const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));
const CALENDAR_URL = process.env.CALENDAR_URL?.trim();
if (!CALENDAR_URL) throw new Error("Missing CALENDAR_URL env var");

const WINDOW_START_MONTHS = -1;
const WINDOW_END_MONTHS = 3;
const EVENT_PREFIX = "[E]";
const EVENT_PREFIX_REGEX = /^\s*\[E\]\s*/i;

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

function hasEventPrefix(summary) {
    if (typeof summary !== "string") return false;
    return EVENT_PREFIX_REGEX.test(summary);
}

function stripEventPrefix(text) {
    if (typeof text !== "string") return text;
    return text.replace(EVENT_PREFIX_REGEX, "").trim();
}

function toShow(event) {
    if (!hasEventPrefix(event.SUMMARY)) return null;
    const when = resolveICalDate(event, DEFAULT_TIME_ZONE);
    if (!when || !withinWindow(when)) return null;
    const { meta, content } = parseFrontmatterBlock(event.DESCRIPTION || "");
    const city = stripEventPrefix(
        meta.city?.trim() || splitCity(event.LOCATION) || stripEventPrefix(event.SUMMARY) || "TBD"
    );
    const venue = stripEventPrefix(meta.venue?.trim() || event.SUMMARY || "TBD");
    const url = meta.url?.trim() || event.url?.trim() || event.URL?.trim();
    let moreRaw = content.replace(/^\n+/, "").replace(/\n+$/, "");
    if (/^-+\s*(\r?\n|$)/.test(moreRaw)) {
        moreRaw = moreRaw.replace(/^-+\s*/, "");
    }
    const more = moreRaw.length > 0 ? moreRaw : "Več informacij sledi.";
    const typeMeta = meta.type?.trim().toLowerCase();
    const type = (typeMeta === "open" || typeMeta === "closed") ? typeMeta : "open";

    return {
        date: formatLocalDate(when),
        city,
        venue,
        more,
        time: formatLocalTime(when),
        type,
        ...(url ? { url } : {})
    };
}

async function main() {
    const ics = await fetchICS(CALENDAR_URL);
    const events = parseICSEvents(ics);
    const shows = events
        .map(toShow)
        .filter(Boolean)
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    const { outputPath, blobUrl } = await writeJsonAndUpload("shows.json", shows);
    if (blobUrl) console.log(`Uploaded shows to blob: ${blobUrl}`);
    console.log(`Updated ${outputPath} with ${shows.length} events.`);
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
