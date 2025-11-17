import { httpGet, formatLocalDate, formatLocalTime, DEFAULT_TIME_ZONE, slugify } from "../utils/fetch-utils.mjs";
import { parseICSEvents, resolveICalDate, parseFrontmatterBlock } from "../utils/ical-utils.mjs";
import { CALENDAR_URL } from "../utils/calendar-url.mjs";

const NEWS_FUTURE_YEARS = 1;

export async function fetchCalendarNews() {
    const ics = await httpGet(CALENDAR_URL);
    const events = parseICSEvents(ics);
    return events.map(toNews).filter(Boolean);
}

function withinNewsWindow(date) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setFullYear(end.getFullYear() + NEWS_FUTURE_YEARS);
    end.setHours(23, 59, 59, 999);
    return date >= now && date <= end;
}

function toNews(event) {
    if (!event.SUMMARY?.startsWith("[N]")) return null;
    const when = resolveICalDate(event, DEFAULT_TIME_ZONE);
    if (!when || !withinNewsWindow(when)) return null;
    const hasTimeComponent = event.DTSTART?.includes("T");
    const { meta, content } = parseFrontmatterBlock(event.DESCRIPTION || "");
    const title = meta.title?.trim();
    if (!title) return null;
    const slugBase = meta.slug?.trim() || slugify(`${formatLocalDate(when)}-${title}`);
    const slug = slugBase || slugify(String(Date.now()));
    const excerpt = meta.excerpt?.trim();
    const cover = meta.cover?.trim();
    const markdown = content || "";
    const uid = event.UID?.trim() || slug;
    return {
        uid,
        slug,
        title,
        date: formatLocalDate(when),
        ...(hasTimeComponent ? { time: formatLocalTime(when) } : {}),
        markdown,
        ...(excerpt ? { excerpt } : {}),
        ...(cover ? { cover } : {})
    };
}
