import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { test } from "node:test";
import ts from "typescript";

const root = fileURLToPath(new URL("../", import.meta.url));

test("emitted content APIs load in native Node ESM and serve fallback and suffixed Blobs", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "content-api-"));
    const previousToken = process.env.BLOB_READ_WRITE_TOKEN;
    const previousFetch = globalThis.fetch;
    delete process.env.BLOB_READ_WRITE_TOKEN;
    try {
        await writeFile(path.join(dir, "package.json"), JSON.stringify({ type: "module" }));
        for (const relative of ["api/shows.ts", "api/news.ts", "lib/content-reader.ts"]) {
            const source = await readFile(path.join(root, relative), "utf8");
            const output = ts.transpileModule(source, {
                compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 }
            }).outputText;
            const destination = path.join(dir, relative.replace(/\.ts$/, ".js"));
            await mkdir(path.dirname(destination), { recursive: true });
            await writeFile(destination, output);
        }

        const sdkDir = path.join(dir, "node_modules/@vercel/blob");
        await mkdir(sdkDir, { recursive: true });
        await writeFile(path.join(sdkDir, "package.json"), JSON.stringify({ type: "module", exports: "./index.js" }));
        // Reproduce actual Vercel Blob names from the production ingestion logs.
        await writeFile(path.join(sdkDir, "index.js"), `
            export async function list({ prefix }) {
                const blobs = ["shows", "news"].flatMap(name => [
                    { pathname: name + "-old.json", url: "https://fixture.invalid/" + name + "-old.json", uploadedAt: "2026-10-25T00:00:00Z" },
                    { pathname: name + "-latest.json", url: "https://fixture.invalid/" + name + "-latest.json", uploadedAt: "2026-10-26T00:00:00Z" }
                ]);
                return { blobs: blobs.filter(blob => blob.pathname.startsWith(prefix)) };
            }
        `);

        for (const name of ["shows", "news"]) {
            // Import emitted JS without bundler aliases or extension-resolution flags.
            const { default: handler } = await import(pathToFileURL(path.join(dir, "api", `${name}.js`)).href);
            async function invoke() {
                const headers = {};
                let status;
                let body;
                const response = {
                    setHeader(key, value) { headers[key] = value; },
                    status(code) { status = code; return this; },
                    json(value) { body = value; return this; }
                };
                await handler({}, response);
                assert.equal(status, 200, `${name} returns HTTP 200`);
                assert.equal(headers["Cache-Control"], "public, max-age=60, stale-while-revalidate=30");
                return body;
            }

            delete process.env.BLOB_READ_WRITE_TOKEN;
            const expected = JSON.parse(await readFile(path.join(root, "src/data", `${name}.json`), "utf8"));
            assert.deepEqual(await invoke(), expected, `${name} serves bundled array without Blob configuration`);

            process.env.BLOB_READ_WRITE_TOKEN = "test-only-fixture";
            const freshData = [{ date: "2026-11-07", city: "Šmartno", venue: "Južni trg" }];
            globalThis.fetch = async url => {
                assert.equal(url, `https://fixture.invalid/${name}-latest.json`);
                return { ok: true, text: async () => JSON.stringify(freshData) };
            };
            assert.deepEqual(await invoke(), freshData, `${name} selects newest suffixed Blob`);

            globalThis.fetch = async () => { throw new Error("fixture storage unavailable"); };
            assert.deepEqual(await invoke(), expected, `${name} falls back on Blob read failure`);
        }
    } finally {
        globalThis.fetch = previousFetch;
        if (previousToken === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
        else process.env.BLOB_READ_WRITE_TOKEN = previousToken;
        await rm(dir, { recursive: true, force: true });
    }
});
