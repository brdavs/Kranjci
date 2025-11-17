import rawNews from "./news.json";
import { markdownToHtml } from "../utils/markdown";

export type RawNewsItem = {
    uid: string;
    slug: string;
    title: string;
    date: string;
    markdown: string;
    excerpt?: string;
    cover?: string;
    time?: string;
};

export type NewsItem = RawNewsItem & { html: string };

const RAW_NEWS = rawNews as RawNewsItem[];

export const news: NewsItem[] = RAW_NEWS.map((item) => ({
    ...item,
    html: markdownToHtml(item.markdown)
}));
