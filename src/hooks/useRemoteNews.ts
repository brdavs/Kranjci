import { useEffect, useState } from "preact/hooks";
import { news as staticNews } from "../data/news";
import { markdownToHtml } from "../utils/markdown";

type StaticNewsItem = (typeof staticNews)[number];

type ApiNewsItem = {
    uid?: string;
    slug?: string;
    title?: string;
    date?: string;
    time?: string;
    excerpt?: string;
    cover?: string;
    markdown?: string;
    html?: string;
};

type NewsItem = StaticNewsItem;

function isValid(item: unknown): item is ApiNewsItem {
    return typeof item === "object" && item !== null;
}

function normalize(item: unknown): NewsItem | null {
    if (!isValid(item)) return null;

    const slug = typeof item.slug === "string" ? item.slug.trim() : "";
    const title = typeof item.title === "string" ? item.title.trim() : "";
    const date = typeof item.date === "string" ? item.date.trim() : "";

    if (!slug || !title || !date) return null;

    const markdown = typeof item.markdown === "string" ? item.markdown : "";
    const html =
        typeof item.html === "string"
            ? item.html
            : markdownToHtml(markdown);

    return {
        uid: typeof item.uid === "string" ? item.uid : `${date}-${slug}`,
        slug,
        title,
        date,
        time: typeof item.time === "string" ? item.time : undefined,
        excerpt: typeof item.excerpt === "string" ? item.excerpt : undefined,
        cover: typeof item.cover === "string" ? item.cover : undefined,
        markdown,
        html
    };
}

function sortByDateDesc(items: NewsItem[]): NewsItem[] {
    return [...items].sort((a, b) => {
        const keyA = `${a.date}T${a.time ?? "00:00"}`;
        const keyB = `${b.date}T${b.time ?? "00:00"}`;
        return keyB.localeCompare(keyA);
    });
}

const STATIC = sortByDateDesc(staticNews);

function toItems(payload: unknown): NewsItem[] {
    if (!Array.isArray(payload)) return [];
    const normalized = payload.map(normalize).filter((item): item is NewsItem => item !== null);
    return sortByDateDesc(normalized);
}

export type RemoteNewsState = {
    items: NewsItem[];
    isLoading: boolean;
};

export function useRemoteNews() {
    const [items, setItems] = useState<NewsItem[]>(() => STATIC);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const controller = new AbortController();
        let cancelled = false;

        const refresh = async () => {
            setIsLoading(true);
            try {
                const response = await fetch("/api/news", {
                    signal: controller.signal,
                    cache: "no-store"
                });
                if (!response.ok) return;

                const payload = await response.json();
                const nextItems = toItems(payload);
                if (!cancelled) {
                    setItems(nextItems);
                }
            } catch {
                // Keep static fallback on any transient error.
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        refresh();

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, []);

    return { items, isLoading };
}

export type { NewsItem };
