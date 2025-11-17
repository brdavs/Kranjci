import { render } from "preact";
import { inject } from "@vercel/analytics";
import { App } from "./app";

render(<App />, document.getElementById("app")!);
inject();
