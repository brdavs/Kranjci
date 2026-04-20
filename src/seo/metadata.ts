import { getAllMembers, getMember } from "../members/loader";
import { getAllPosts, getPost } from "../news/loader";

export type MetaOptions = {
    title?: string;
    description?: string;
    path?: string;
    image?: string;
    type?: string;
};

export type ResolvedMeta = {
    title: string;
    description: string;
    canonical: string;
    image: string;
    type: string;
};

export const SITE_NAME = "Zasedba Kranjci";
export const SITE_ORIGIN = (typeof process !== "undefined" && process.env.SITE_URL
    ? process.env.SITE_URL
    : "https://www.kranjci.si").replace(/\/+$/, "");
export const DEFAULT_DESCRIPTION = "Zasedba Kranjci glasbeno obarva poroke, poslovne dogodke in vsakovrstne prireditve po vsej Sloveniji.";
export const DEFAULT_OG_IMAGE = "/media/home/00.webp";

function normalizePath(pathname: string): string {
    if (!pathname) return "/";
    if (pathname === "/") return "/";
    const noTrailing = pathname.replace(/\/+$/, "");
    return noTrailing || "/";
}

function toCanonical(path: string): string {
    return new URL(path, SITE_ORIGIN).toString();
}

export function resolveMeta(options: MetaOptions): ResolvedMeta {
    const resolvedPath = normalizePath(options.path ?? "/");
    const pageTitle = options.title ? `${options.title} · ${SITE_NAME}` : SITE_NAME;

    return {
        title: pageTitle,
        description: options.description || DEFAULT_DESCRIPTION,
        canonical: toCanonical(resolvedPath),
        image: options.image || DEFAULT_OG_IMAGE,
        type: options.type || "website"
    };
}

function staticMetaForPath(pathname: string): MetaOptions | undefined {
    const path = normalizePath(pathname);
    switch (path) {
        case "/":
            return {
                description: "Zasedba Kranjci - glasba vsega sveta v vsako srce.",
                path: "/"
            };
        case "/shows":
            return {
                title: "Dogodki",
                description: "Preverite prihajajoče dogodke Zasedbe Kranjci.",
                path
            };
        case "/music":
            return {
                title: "Glasba",
                description: "Oglejte si videe, koncertne posnetke in seznam skladb Zasedbe Kranjci.",
                path
            };
        case "/news":
            return {
                title: "Novice",
                description: "Utrinki, zgodbe in sveže novice Zasedbe Kranjci.",
                path
            };
        case "/history":
            return {
                title: "Zgodovina",
                description: "Kronologija razvoja Zasedbe Kranjci od prvih nastopov do sodobne zasedbe.",
                path
            };
        case "/clients":
            return {
                title: "Reference",
                description: "Organizacije in podjetja, ki jim je Zasedba Kranjci že pomagala ustvariti nepozabne dogodke.",
                path
            };
        case "/members":
            return {
                title: "Člani zasedbe",
                description: "Spoznajte člane Zasedbe Kranjci.",
                path
            };
        case "/contact":
            return {
                title: "Kontakt",
                description: "Stopite v stik z Zasedbo Kranjci za poroke, poslovne dogodke ali posebne priložnosti.",
                path
            };
        case "/privacy":
            return {
                title: "Politika zasebnosti",
                description: "Kako Zasedba Kranjci obdeluje osebne podatke pri kontaktnem obrazcu in prijavi na e-novice.",
                path
            };
        default:
            return undefined;
    }
}

export function resolveRouteMeta(pathname: string): ResolvedMeta {
    const path = normalizePath(pathname);
    const newsMatch = path.match(/^\/news\/([^/]+)$/);
    if (newsMatch) {
        const slug = decodeURIComponent(newsMatch[1]);
        const post = getPost(slug);
        return resolveMeta({
            title: post?.title ?? "Novica ni bila najdena",
            description: post?.excerpt ?? "Preberi najnovejše dogajanje Zasedbe Kranjci.",
            path,
            type: "article"
        });
    }

    const memberMatch = path.match(/^\/member\/([^/]+)$/);
    if (memberMatch) {
        const slug = decodeURIComponent(memberMatch[1]);
        const member = getMember(slug);
        const description = member
            ? `${member.name}${member.role ? ` – ${member.role}` : ""} v Zasedbi Kranjci.`
            : "Člana, ki ga iščete, ni v naši zasedbi.";

        return resolveMeta({
            title: member?.name ?? "Člana ni mogoče najti",
            description,
            path,
            type: "profile"
        });
    }

    const meta = staticMetaForPath(path);
    if (meta) {
        return resolveMeta(meta);
    }

    return resolveMeta({
        title: "Stran ni najdena",
        description: "Stran, ki jo iščete, ni na voljo. Vrnite se na prvo stran Zasedbe Kranjci.",
        path
    });
}

export function toPrerenderHeadElements(meta: ResolvedMeta) {
    return new Set([
        { type: "meta", props: { name: "description", content: meta.description } },
        { type: "link", props: { rel: "canonical", href: meta.canonical } },
        { type: "meta", props: { property: "og:title", content: meta.title } },
        { type: "meta", props: { property: "og:description", content: meta.description } },
        { type: "meta", props: { property: "og:type", content: meta.type } },
        { type: "meta", props: { property: "og:image", content: meta.image } },
        { type: "meta", props: { property: "og:url", content: meta.canonical } },
        { type: "meta", props: { property: "og:site_name", content: SITE_NAME } },
        { type: "meta", props: { name: "twitter:card", content: "summary_large_image" } },
        { type: "meta", props: { name: "twitter:title", content: meta.title } },
        { type: "meta", props: { name: "twitter:description", content: meta.description } },
        { type: "meta", props: { name: "twitter:image", content: meta.image } }
    ]);
}

export function getPrerenderRoutes(): string[] {
    const staticRoutes = [
        "/",
        "/news",
        "/shows",
        "/music",
        "/history",
        "/clients",
        "/members",
        "/contact",
        "/privacy"
    ];

    const memberRoutes = getAllMembers().map((member) => `/member/${encodeURIComponent(member.slug)}`);
    const newsRoutes = getAllPosts().map((post) => `/news/${encodeURIComponent(post.slug)}`);

    return [...new Set([...staticRoutes, ...memberRoutes, ...newsRoutes])];
}
