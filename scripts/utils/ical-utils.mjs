import { DEFAULT_TIME_ZONE, formatterParts } from "./fetch-utils.mjs";

export function parseICSEvents(ics) {
    const lines = unfold(ics.split(/\r?\n/));
    const events = [];
    let current = null;

    for (const raw of lines) {
        if (raw === "BEGIN:VEVENT") {
            current = {};
            continue;
        }
        if (raw === "END:VEVENT") {
            if (current) events.push(current);
            current = null;
            continue;
        }
        if (!current) continue;
        const idx = raw.indexOf(":");
        if (idx === -1) continue;
        const keyPart = raw.slice(0, idx);
        const [key, ...paramParts] = keyPart.split(";");
        const value = raw.slice(idx + 1);
        current[key] = decodeText(value);
        if (paramParts.length) {
            const params = {};
            for (const part of paramParts) {
                const [paramKey, paramValue] = part.split("=");
                if (!paramKey || !paramValue) continue;
                params[paramKey.toUpperCase()] = paramValue;
            }
            current[`${key}_PARAMS`] = params;
        }
    }
    return events;
}

export function resolveICalDate(event, fallbackTz = DEFAULT_TIME_ZONE) {
    const value = event.DTSTART;
    if (!value) return null;
    const params = event.DTSTART_PARAMS || {};
    const tzid = params.TZID || (value.endsWith("Z") ? "UTC" : fallbackTz);
    return parseICalDateValue(value, tzid);
}

export function parseFrontmatterBlock(markdown = "") {
    const cleaned = markdown.replace(/\r/g, "").trim();
    if (!cleaned.startsWith("---")) {
        return { meta: {}, content: cleaned };
    }
    const end = cleaned.indexOf("\n---", 3);
    if (end === -1) {
        return { meta: {}, content: cleaned };
    }
    const header = cleaned.slice(3, end).trim();
    const body = cleaned.slice(end + 4).trim();
    const meta = {};
    for (const line of header.split("\n")) {
        const idx = line.indexOf(":");
        if (idx === -1) continue;
        const key = line.slice(0, idx).trim();
        const value = line.slice(idx + 1).trim();
        if (key) meta[key] = value;
    }
    return { meta, content: body };
}

function unfold(lines) {
    const out = [];
    for (const line of lines) {
        if (!line) continue;
        if (line.startsWith(" ") && out.length) {
            out[out.length - 1] += line.slice(1);
        } else {
            out.push(line);
        }
    }
    return out;
}

function decodeText(value = "") {
    return value
        .replace(/\\n/g, "\n")
        .replace(/\\,/g, ",")
        .replace(/\\;/g, ";")
        .replace(/\\\\/g, "\\")
        .trim();
}

function parseICalDateValue(value, tzid) {
    const dateTime = value.match(
        /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/
    );
    if (dateTime) {
        const [, y, m, d, hh, mm, ss, z] = dateTime;
        return buildZonedDate(
            Number(y),
            Number(m) - 1,
            Number(d),
            Number(hh),
            Number(mm),
            Number(ss),
            z === "Z" ? "UTC" : tzid
        );
    }
    const dateOnly = value.match(/^(\d{4})(\d{2})(\d{2})$/);
    if (dateOnly) {
        const [, y, m, d] = dateOnly;
        return buildZonedDate(Number(y), Number(m) - 1, Number(d), 0, 0, 0, tzid);
    }
    return null;
}

function buildZonedDate(year, monthZero, day, hour, minute, second, tzid = DEFAULT_TIME_ZONE) {
    const base = Date.UTC(year, monthZero, day, hour, minute, second);
    const date = new Date(base);
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: tzid,
        hour12: false,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
    const parts = formatterParts(formatter, date);
    const utcEquivalent = Date.UTC(
        Number(parts.year),
        Number(parts.month) - 1,
        Number(parts.day),
        Number(parts.hour),
        Number(parts.minute),
        Number(parts.second)
    );
    const offset = utcEquivalent - date.getTime();
    return new Date(base - offset);
}
