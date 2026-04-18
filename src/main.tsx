import { hydrate, render } from "preact";
import { inject } from "@vercel/analytics";
import { App } from "./app";

const appRoot = document.getElementById("app")!;

if (appRoot.hasChildNodes()) {
    hydrate(<App />, appRoot);
} else {
    render(<App />, appRoot);
}

inject();
