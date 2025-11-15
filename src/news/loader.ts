import { news } from "../data/news";

export type PostMeta = {
    slug: string;
    title: string;
    date: string;
    time?: string;
    excerpt?: string;
    cover?: string;
};
export type Post = PostMeta & { html: string };

const POSTS: Post[] = news
    .map((item) => ({
        slug: item.slug,
        title: item.title,
        date: item.date,
        time: item.time,
        excerpt: item.excerpt,
        cover: item.cover,
        html: item.html
    }))
    .sort((a, b) => {
        const keyA = `${a.date}T${a.time ?? "00:00"}`;
        const keyB = `${b.date}T${b.time ?? "00:00"}`;
        return keyB.localeCompare(keyA);
    });

export function getAllPosts(): PostMeta[] {
    return POSTS.map(({ html, ...meta }) => meta);
}
export function getPost(slug: string): Post | undefined {
    return POSTS.find((p) => p.slug === slug);
}
