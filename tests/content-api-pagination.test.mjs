import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";
import { mkdtemp, mkdir, readFile, writeFile, symlink, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { test } from "node:test";
import ts from "typescript";

const root = fileURLToPath(new URL("../", import.meta.url));

test("real Blob SDK pagination selects newest across pages, not empty first-page shows.json", async t => {
    const dir = await mkdtemp(path.join(tmpdir(), "blob-pagination-"));
    const cwd = process.cwd();
    const envNames = ["BLOB_READ_WRITE_TOKEN", "VERCEL_BLOB_API_URL", "VERCEL_BLOB_RETRIES"];
    const previousEnv = Object.fromEntries(envNames.map(name => [name, process.env[name]]));
    let origin;
    let mode = "populated";
    let requests = [];
    let downloads = [];
    const server = createServer((req, res) => {
        const url = new URL(req.url, origin);
        res.setHeader("Content-Type", "application/json");
        if (url.pathname === "/blob") {
            const prefix = url.searchParams.get("prefix");
            const cursor = url.searchParams.get("cursor");
            requests.push({ prefix, cursor });
            const item = (pathname, uploadedAt) => ({ pathname, url: `${origin}/${pathname}`, uploadedAt, size: 2 });
            if (!cursor) {
                // Reproduce the production 100-object page and its selected empty canonical object.
                const blobs = Array.from({ length: 99 }, (_, i) => item(`${prefix}-${String(i).padStart(3, "0")}.json`, "2025-01-01T00:00:00Z"));
                blobs.push(item(`${prefix}.json`, "2026-01-01T00:00:00Z"));
                res.end(JSON.stringify({ blobs, hasMore: true, ...(mode === "missing-cursor" ? {} : { cursor: "page-2" }) }));
            } else if (mode === "repeated-cursor") {
                res.end(JSON.stringify({ blobs: [], hasMore: true, cursor: "page-2" }));
            } else {
                res.end(JSON.stringify({ blobs: [item(`${prefix}-fresh.json`, "2026-10-26T12:00:00Z")], hasMore: false }));
            }
            return;
        }
        downloads.push(url.pathname);
        res.end(url.pathname.endsWith("-fresh.json") && mode !== "latest-empty"
            ? JSON.stringify([{ date: "2026-11-07" }, { date: "2026-11-11" }])
            : "[]");
    });
    try {
        await mkdir(path.join(dir, "lib"));
        await mkdir(path.join(dir, "src/data"), { recursive: true });
        await writeFile(path.join(dir, "package.json"), JSON.stringify({ type: "module" }));
        // Use installed SDK and its dependencies unchanged, never a list() replacement.
        await symlink(path.join(root, "node_modules"), path.join(dir, "node_modules"), "dir");
        const source = await readFile(path.join(root, "lib/content-reader.ts"), "utf8");
        await writeFile(path.join(dir, "lib/content-reader.js"), ts.transpileModule(source, {
            compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 }
        }).outputText);
        const fallback = [{ date: "2025-12-31", fixture: "bundled" }];
        for (const name of ["shows", "news"]) {
            await writeFile(path.join(dir, "src/data", `${name}.json`), JSON.stringify(fallback));
        }
        server.listen(0, "127.0.0.1");
        await once(server, "listening");
        origin = `http://127.0.0.1:${server.address().port}`;
        process.env.BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_fixture_local_only";
        process.env.VERCEL_BLOB_API_URL = `${origin}/blob`;
        process.env.VERCEL_BLOB_RETRIES = "0";
        process.chdir(dir);
        const { readContentJson } = await import(pathToFileURL(path.join(dir, "lib/content-reader.js")).href);

        for (const name of ["shows", "news"]) {
            await t.test(`${name} reads page two before selecting latest populated upload`, async () => {
                mode = "populated";
                requests = [];
                downloads = [];
                assert.deepEqual(await readContentJson(`${name}.json`), [{ date: "2026-11-07" }, { date: "2026-11-11" }]);
                assert.deepEqual(requests, [{ prefix: name, cursor: null }, { prefix: name, cursor: "page-2" }]);
                assert.deepEqual(downloads, [`/${name}-fresh.json`]);
            });
        }
        await t.test("newest legitimately empty upload is not replaced with stale events", async () => {
            mode = "latest-empty";
            downloads = [];
            assert.deepEqual(await readContentJson("shows.json"), []);
            assert.deepEqual(downloads, ["/shows-fresh.json"]);
        });
        for (const invalidMode of ["missing-cursor", "repeated-cursor"]) {
            await t.test(`${invalidMode} stops traversal and falls back instead of serving partial results`, async () => {
                mode = invalidMode;
                requests = [];
                downloads = [];
                assert.deepEqual(await readContentJson("shows.json"), fallback);
                assert.equal(requests.length, invalidMode === "missing-cursor" ? 1 : 2);
                assert.deepEqual(downloads, []);
            });
        }
    } finally {
        process.chdir(cwd);
        for (const name of envNames) {
            if (previousEnv[name] === undefined) delete process.env[name];
            else process.env[name] = previousEnv[name];
        }
        if (server.listening) {
            server.closeAllConnections();
            await new Promise(resolve => server.close(resolve));
        }
        await rm(dir, { recursive: true, force: true });
    }
});
