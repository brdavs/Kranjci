import render from "preact-render-to-string";
import { Router } from "wouter-preact";
import { App } from "./app";
import { getPrerenderRoutes, resolveRouteMeta, toPrerenderHeadElements } from "./seo/metadata";

type PrerenderInput = {
    url: string;
};

export async function prerender(data: PrerenderInput) {
    const currentUrl = data?.url || "/";
    const parsed = new URL(currentUrl, "https://www.kranjci.si");
    const path = parsed.pathname;

    const html = render(
        <Router ssrPath={path}>
            <App />
        </Router>
    );

    const meta = resolveRouteMeta(path);

    return {
        html,
        links: new Set(getPrerenderRoutes()),
        head: {
            lang: "sl",
            title: meta.title,
            elements: toPrerenderHeadElements(meta)
        }
    };
}
