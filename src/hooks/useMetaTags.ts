import { useEffect } from "preact/hooks";

type MetaOptions = {
    title?: string;
    description?: string;
    path?: string;
    image?: string;
    type?: string;
};

export const SITE_NAME = "Zasedba Kranjci";
export const DEFAULT_DESCRIPTION = "Zasedba Kranjci glasbeno obarva poroke, poslovne dogodke in vsakovrstne prireditve po vsej Sloveniji.";
export const DEFAULT_OG_IMAGE = "/media/home/00.webp";

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

function resolveUrl(path?: string): string | undefined {
    if (typeof window === "undefined") return undefined;
    const target = path ?? window.location.pathname + window.location.search;
    return new URL(target, window.location.origin).toString();
}

export function useMetaTags(options: MetaOptions) {
    const { title, description, path, image, type } = options;
    useEffect(() => {
        if (typeof document === "undefined") return;
        const resolvedTitle = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
        const resolvedDescription = description || DEFAULT_DESCRIPTION;
        const resolvedImage = image || DEFAULT_OG_IMAGE;
        const resolvedType = type || "website";
        const resolvedUrl = resolveUrl(path);

        document.title = resolvedTitle;
        upsertMeta("name", "description", resolvedDescription);
        upsertMeta("property", "og:title", resolvedTitle);
        upsertMeta("property", "og:description", resolvedDescription);
        upsertMeta("property", "og:type", resolvedType);
        upsertMeta("property", "og:image", resolvedImage);
        upsertMeta("property", "og:site_name", SITE_NAME);

        if (resolvedUrl) {
            upsertMeta("property", "og:url", resolvedUrl);
            updateCanonical(resolvedUrl);
        }

        upsertMeta("name", "twitter:card", "summary_large_image");
        upsertMeta("name", "twitter:title", resolvedTitle);
        upsertMeta("name", "twitter:description", resolvedDescription);
        upsertMeta("name", "twitter:image", resolvedImage);
    }, [title, description, path, image, type]);
}
