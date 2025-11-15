import https from "node:https";

export const DEFAULT_TIME_ZONE = "Europe/Ljubljana";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
    timeZone: DEFAULT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
});

const TIME_FORMATTER = new Intl.DateTimeFormat("en-GB", {
    timeZone: DEFAULT_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
});

export function splitList(value) {
    return value
        ? value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];
}

export function httpGet(url) {
    return new Promise((resolve, reject) => {
        https
            .get(url, (res) => {
                if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    httpGet(res.headers.location).then(resolve).catch(reject);
                    return;
                }
                if (res.statusCode !== 200) {
                    reject(new Error(`Request failed for ${url}: ${res.statusCode} ${res.statusMessage}`));
                    return;
                }
                let data = "";
                res.setEncoding("utf8");
                res.on("data", (chunk) => (data += chunk));
                res.on("end", () => resolve(data));
            })
            .on("error", reject);
    });
}

export async function fetchJson(url) {
    const body = await httpGet(url);
    return JSON.parse(body);
}

export function formatterParts(formatter, date) {
    const parts = {};
    for (const part of formatter.formatToParts(date)) {
        if (part.type === "literal") continue;
        parts[part.type] = part.value;
    }
    return parts;
}

export function formatLocalDate(date) {
    return DATE_FORMATTER.format(date);
}

export function formatLocalTime(date) {
    return TIME_FORMATTER.format(date);
}

export function datePartsFromDate(date) {
    return {
        date: formatLocalDate(date),
        time: formatLocalTime(date)
    };
}

export function normalizeText(text = "") {
    return text.replace(/\r/g, "").trim();
}

export function deriveTitle(text, fallback) {
    const firstLine = text.split(/\r?\n/).find((line) => line.trim().length > 0);
    if (firstLine) {
        const trimmed = firstLine.trim();
        return trimmed.length > 80 ? `${trimmed.slice(0, 77)}…` : trimmed;
    }
    return fallback;
}

export function slugify(input) {
    return input
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/--+/g, "-");
}
