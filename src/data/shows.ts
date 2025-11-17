import rawShows from "./shows.json";
import { markdownToHtml } from "../utils/markdown";

export type Show = {
    date: string;
    city: string;
    venue: string;
    more: string;
    time: string;
    type: "open" | "closed";
    link?: string;
};

const RAW_SHOWS = rawShows as Show[];

export const shows: Show[] = RAW_SHOWS.map((show) => ({
    ...show,
    more: markdownToHtml(show.more)
}));
