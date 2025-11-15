export type SocialLink = { type: string; url: string; label?: string };
export type MemberMeta = {
    slug: string;
    name: string;
    role: string;
    photo?: string;
    socials?: SocialLink[];
};
export type Member = MemberMeta & { html: string };

const rawMods = import.meta.glob("/content/members/*.md", { as: "raw", eager: true }) as Record<string, string>;

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
    if (!raw.startsWith("---")) return { meta: {}, body: raw };
    const end = raw.indexOf("\n---");
    if (end === -1) return { meta: {}, body: raw };
    const head = raw.slice(3, end).trim();
    const body = raw.slice(end + 4).replace(/^\r?\n/, "");
    const meta: Record<string, string> = {};
    for (const line of head.split(/\r?\n/)) {
        const m = line.match(/^(\w+)\s*:\s*(.+)$/);
        if (m) meta[m[1]] = m[2].replace(/^"|"$/g, "");
    }
    return { meta, body };
}
function slugFromPath(p: string): string {
    return (p.split("/").pop() || "").replace(/\.md$/i, "");
}

import { marked } from "marked";
import DOMPurify from "dompurify";

const MEMBERS: Member[] = Object.entries(rawMods).map(([p, raw]) => {
    const { meta, body } = parseFrontmatter(raw);
    const slug = slugFromPath(p);
    const html = DOMPurify.sanitize(marked.parse(body) as string);
    let socials: SocialLink[] | undefined;
    if (meta.socials) {
        try {
            const parsed = JSON.parse(meta.socials);
            if (Array.isArray(parsed)) {
                socials = parsed
                    .filter((item) => item && typeof item.type === "string" && typeof item.url === "string")
                    .map((item) => ({
                        type: item.type,
                        url: item.url,
                        label: typeof item.label === "string" ? item.label : undefined
                    }));
            }
        } catch (err) {
            console.warn("Invalid socials JSON for", slug, err);
        }
    }
    return {
        slug,
        name: meta.name || slug,
        role: meta.role || "",
        photo: meta.photo,
        socials,
        html
    };
}).sort((a, b) => a.name.localeCompare(b.name));

export function getAllMembers(): MemberMeta[] {
    return MEMBERS.map(({ html, ...meta }) => meta);
}
export function getMember(slug: string): Member | undefined {
    return MEMBERS.find(m => m.slug === slug);
}
