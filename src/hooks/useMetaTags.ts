import { useEffect } from "preact/hooks";
import { resolveMeta, SITE_NAME, type MetaOptions } from "../seo/metadata";

function upsertMeta(attr: "name" | "property", key: string, value: string) {
    if (typeof document === "undefined") return;
    let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
    if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attr, key);
        document.head.appendChild(tag);
    }
    tag.setAttribute("content", value);
}

function updateCanonical(url: string) {
    if (typeof document === "undefined") return;
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
    }
    link.href = url;
}

export function useMetaTags(options: MetaOptions) {
    const { title, description, path, image, type } = options;

    useEffect(() => {
        if (typeof document === "undefined") return;
        const fallbackPath = window.location.pathname + window.location.search;
        const resolved = resolveMeta({ title, description, path: path ?? fallbackPath, image, type });

        document.title = resolved.title;
        upsertMeta("name", "description", resolved.description);
        upsertMeta("property", "og:title", resolved.title);
        upsertMeta("property", "og:description", resolved.description);
        upsertMeta("property", "og:type", resolved.type);
        upsertMeta("property", "og:image", resolved.image);
        upsertMeta("property", "og:site_name", SITE_NAME);

        upsertMeta("property", "og:url", resolved.canonical);
        updateCanonical(resolved.canonical);

        upsertMeta("name", "twitter:card", "summary_large_image");
        upsertMeta("name", "twitter:title", resolved.title);
        upsertMeta("name", "twitter:description", resolved.description);
        upsertMeta("name", "twitter:image", resolved.image);
    }, [title, description, path, image, type]);
}
