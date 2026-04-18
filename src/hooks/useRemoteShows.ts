import { useEffect, useState } from "preact/hooks";
import { shows as staticShows } from "../data/shows";
import { markdownToHtml } from "../utils/markdown";

type StaticShow = (typeof staticShows)[number];

type ApiShow = {
    date?: string;
    city?: string;
    venue?: string;
    more?: string;
    time?: string;
    type?: "open" | "closed";
    url?: string;
    html?: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function normalize(item: unknown): StaticShow | null {
    if (!isObject(item)) return null;

    const date = typeof item.date === "string" ? item.date.trim() : "";
    const city = typeof item.city === "string" ? item.city.trim() : "";
    const venue = typeof item.venue === "string" ? item.venue.trim() : "";
    const rawMore = typeof item.more === "string" ? item.more : "";
    const typeRaw = typeof item.type === "string" ? item.type.trim().toLowerCase() : "open";

    if (!date || !city || !venue) return null;

    return {
        date,
        city,
        venue,
        more: typeof item.html === "string" ? item.html : markdownToHtml(rawMore),
        time: typeof item.time === "string" ? item.time : "00:00",
        type: typeRaw === "closed" ? "closed" : "open",
        ...(typeof item.url === "string" ? { url: item.url } : {})
    };
}

const STATIC_SHOWS = staticShows;

function toItems(payload: unknown): StaticShow[] {
    if (!Array.isArray(payload)) return [];
    return payload
        .map(normalize)
        .filter((item): item is StaticShow => item !== null);
}

export function useRemoteShows() {
    const [items, setItems] = useState<StaticShow[]>(() => STATIC_SHOWS);

    useEffect(() => {
        const controller = new AbortController();
        let cancelled = false;

    const refresh = async () => {
            try {
                const response = await fetch("/api/shows", {
                    signal: controller.signal,
                    cache: "no-store"
                });
                if (!response.ok) return;

                const payload = await response.json();
                if (!Array.isArray(payload)) return;
                const nextItems = toItems(payload);
                if (!cancelled) {
                    setItems(nextItems);
                }
            } catch {
                // Keep static fallback on any transient error.
            }
        };

        refresh();

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, []);

    return { items };
}

export type { StaticShow };
