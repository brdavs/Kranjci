import rawReviews from "./reviews.json";

export type Review = {
    quote: string;
    name: string;
    role: string;
    context?: string;
};

export const reviews = rawReviews as Review[];
