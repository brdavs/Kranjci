import { fetchJson, normalizeText, deriveTitle, slugify, datePartsFromDate } from "../utils/fetch-utils.mjs";

export async function fetchFacebookNews({ token, pageIds = [], limit = 5, withinWindow }) {
    if (!token || pageIds.length === 0) return [];

    const tasks = pageIds.map((pageId) => fetchPagePosts(pageId, token, limit, withinWindow));
    const results = await Promise.allSettled(tasks);
    return results.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
}

async function fetchPagePosts(pageId, token, limit, withinWindow) {
    try {
        const params = new URLSearchParams({
            fields: "id,created_time,message,permalink_url,full_picture",
            access_token: token,
            limit: String(limit)
        });
        const data = await fetchJson(`https://graph.facebook.com/v19.0/${pageId}/posts?${params.toString()}`);
        const items = Array.isArray(data?.data) ? data.data : [];
        return items.map((post) => toFacebookNewsItem(post, withinWindow)).filter(Boolean);
    } catch (error) {
        console.warn(`Failed to fetch Facebook posts for ${pageId}:`, error.message);
        return [];
    }
}

function toFacebookNewsItem(post, withinWindow) {
    if (!post?.id || !post?.created_time) return null;
    const when = new Date(post.created_time);
    if (Number.isNaN(when.getTime()) || !withinWindow(when)) return null;
    const { date, time } = datePartsFromDate(when);
    const text = normalizeText(post.message || "");
    const title = deriveTitle(text, "Objava na Facebooku");
    const markdownSections = [];
    if (text) markdownSections.push(text);
    if (post.permalink_url) markdownSections.push(`[Preberi objavo na Facebooku](${post.permalink_url})`);
    const markdown = markdownSections.join("\n\n") || `[Preberi objavo na Facebooku](${post.permalink_url})`;
    const excerpt = text ? text.slice(0, 220) : undefined;
    const cover = post.full_picture?.trim();
    return {
        uid: `fb-${post.id}`,
        slug: slugify(`${date}-${post.id}`),
        title,
        date,
        ...(time ? { time } : {}),
        markdown,
        ...(excerpt ? { excerpt } : {}),
        ...(cover ? { cover } : {})
    };
}
