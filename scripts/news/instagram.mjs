import { fetchJson, normalizeText, deriveTitle, slugify, datePartsFromDate } from "../utils/fetch-utils.mjs";

export async function fetchInstagramNews({ token, userIds = [], limit = 5, withinWindow }) {
    if (!token || userIds.length === 0) return [];

    const tasks = userIds.map((userId) => fetchUserMedia(userId, token, limit, withinWindow));
    const results = await Promise.allSettled(tasks);
    return results.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
}

async function fetchUserMedia(userId, token, limit, withinWindow) {
    try {
        const params = new URLSearchParams({
            fields: "id,caption,permalink,media_url,thumbnail_url,timestamp",
            access_token: token,
            limit: String(limit)
        });
        const data = await fetchJson(`https://graph.facebook.com/v19.0/${userId}/media?${params.toString()}`);
        const items = Array.isArray(data?.data) ? data.data : [];
        return items.map((media) => toInstagramNewsItem(media, withinWindow)).filter(Boolean);
    } catch (error) {
        console.warn(`Failed to fetch Instagram media for ${userId}:`, error.message);
        return [];
    }
}

function toInstagramNewsItem(media, withinWindow) {
    if (!media?.id || !media?.timestamp) return null;
    const when = new Date(media.timestamp);
    if (Number.isNaN(when.getTime()) || !withinWindow(when)) return null;
    const { date, time } = datePartsFromDate(when);
    const text = normalizeText(media.caption || "");
    const title = deriveTitle(text, "Objava na Instagramu");
    const markdownSections = [];
    if (text) markdownSections.push(text);
    if (media.permalink) markdownSections.push(`[Preberi objavo na Instagramu](${media.permalink})`);
    const markdown = markdownSections.join("\n\n") || `[Preberi objavo na Instagramu](${media.permalink})`;
    const excerpt = text ? text.slice(0, 220) : undefined;
    const cover = media.media_url?.trim() || media.thumbnail_url?.trim();
    return {
        uid: `ig-${media.id}`,
        slug: slugify(`${date}-${media.id}`),
        title,
        date,
        ...(time ? { time } : {}),
        markdown,
        ...(excerpt ? { excerpt } : {}),
        ...(cover ? { cover } : {})
    };
}
