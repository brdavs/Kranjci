import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const readerPath = new URL("./_content-reader.ts", import.meta.url);
const staticDataPath = new URL("../src/data/shows.json", import.meta.url);

 test("shows reader keeps Blob loading inside its guarded fallback path", async () => {
    const source = await readFile(readerPath, "utf8");

    assert.doesNotMatch(source, /^import \{ list \} from "@vercel\/blob";/m);
    assert.match(source, /try \{\s*const \{ list \} = await import\("@vercel\/blob"\);/);
});

test("bundled shows fallback contains valid data", async () => {
    const shows = JSON.parse(await readFile(staticDataPath, "utf8"));

    assert.ok(Array.isArray(shows));
    assert.ok(shows.length > 0);
    assert.ok(shows.every((show) => show.date && show.city && show.venue));
});
