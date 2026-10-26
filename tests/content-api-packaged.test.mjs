import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";
import { copyFile, mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { test } from "node:test";
import { nodeFileTrace } from "@vercel/nft";
import ts from "typescript";

const root = fileURLToPath(new URL("../", import.meta.url));
const transpile = source => ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 }
}).outputText;

async function listen(server) {
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    return `http://127.0.0.1:${server.address().port}`;
}

async function close(server) {
    server.closeAllConnections();
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
}

test("traced function with real Blob SDK serves shows over HTTP outside the repository", async t => {
    const dir = await mkdtemp(path.join(tmpdir(), "packaged-content-api-"));
    const originalCwd = process.cwd();
    const envNames = ["BLOB_READ_WRITE_TOKEN", "VERCEL_BLOB_API_URL", "VERCEL_BLOB_RETRIES", "VERCEL_GIT_COMMIT_SHA"];
    const originalInfo = console.info;
    const logs = [];
    let requestLogs = [];
    console.info = value => { logs.push(JSON.parse(value)); };
    function expectLog(event, details = {}) {
        assert.ok(requestLogs.some(log => log.event === event && Object.entries(details).every(([key, value]) => log[key] === value)),
            `expected ${event} ${JSON.stringify(details)} in ${JSON.stringify(requestLogs)}`);
    }
    const previousEnv = Object.fromEntries(envNames.map(name => [name, process.env[name]]));
    let apiServer;
    let storageServer;
    try {
        const traced = await nodeFileTrace([path.join(root, "api/shows.ts")], {
            base: root,
            processCwd: root,
            ts: true,
            mixedModules: true,
            async readFile(file) {
                try {
                    const source = await readFile(file, "utf8");
                    return file.endsWith(".ts") ? transpile(source) : source;
                } catch { return null; }
            }
        });
        assert.equal(traced.warnings.size, 0, "no dependency tracing warnings");
        assert.ok(traced.fileList.has("src/data/shows.json"), "fallback JSON is traced");
        assert.ok(traced.fileList.has("node_modules/@vercel/blob/dist/index.js"), "real Blob SDK is traced");
        for (const relative of traced.fileList) {
            const source = path.join(root, relative);
            const destination = path.join(dir, relative.replace(/\.ts$/, ".js"));
            await mkdir(path.dirname(destination), { recursive: true });
            if (relative.endsWith(".ts")) {
                await writeFile(destination, transpile(await readFile(source, "utf8")));
            } else {
                await copyFile(source, destination);
            }
        }

        const freshShows = [
            { date: "2026-11-07", city: "Šmartno", venue: "Južni trg", time: "19:00", type: "open", more: "Martinovanje" },
            { date: "2026-11-11", city: "Ljubljana", venue: "Ljubljanski grad", time: "19:00", type: "closed", more: "Martinovanje" }
        ];
        let mode = "success";
        let listCalls = 0;
        let downloadCalls = 0;
        let storageOrigin;
        storageServer = createServer((req, res) => {
            const url = new URL(req.url, storageOrigin);
            res.setHeader("Content-Type", "application/json");
            if (url.pathname === "/blob") {
                listCalls++;
                if (mode === "denied") {
                    res.writeHead(403);
                    res.end(JSON.stringify({ error: { code: "forbidden", message: "private-error-sentinel" } }));
                    return;
                }
                const blobs = [
                    { pathname: "shows-old.json", url: `${storageOrigin}/shows-old.json`, uploadedAt: "2026-10-25T00:00:00Z", size: 2 },
                    { pathname: "shows-current.json", url: `${storageOrigin}/shows-current.json`, uploadedAt: "2026-10-26T00:00:00Z", size: 300 }
                ];
                res.end(JSON.stringify({ blobs: mode === "empty" ? [] : blobs.filter(blob => blob.pathname.startsWith(url.searchParams.get("prefix"))), hasMore: false }));
                return;
            }
            downloadCalls++;
            if (url.pathname === "/shows-current.json") {
                if (mode === "download-failed") res.writeHead(503);
                res.end(mode === "invalid-json" ? "not JSON private-body-sentinel" : mode === "non-array" ? "{}" : JSON.stringify(freshShows));
            } else {
                res.end("[]");
            }
        });
        storageOrigin = await listen(storageServer);
        process.env.BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_fixture_local_only";
        process.env.VERCEL_BLOB_API_URL = `${storageOrigin}/blob`;
        process.env.VERCEL_BLOB_RETRIES = "0";
        process.env.VERCEL_GIT_COMMIT_SHA = "abcdef1234567890abcdef1234567890abcdef12";

        // Isolate filesystem access just like a serverless package: no repository cwd.
        process.chdir(dir);
        const { default: handler } = await import(pathToFileURL(path.join(dir, "api/shows.js")).href);
        apiServer = createServer((req, res) => {
            res.status = code => { res.statusCode = code; return res; };
            res.json = value => { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(value)); return res; };
            Promise.resolve(handler(req, res)).catch(error => {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: error.message }));
            });
        });
        const apiOrigin = await listen(apiServer);
        async function getShows() {
            const offset = logs.length;
            const response = await fetch(`${apiOrigin}/api/shows`);
            assert.equal(response.status, 200);
            const body = await response.json();
            requestLogs = logs.slice(offset);
            assert.ok(requestLogs.length > 0);
            assert.ok(requestLogs.every(log => log.component === "content-reader" && log.filename === "shows.json"));
            assert.ok(requestLogs.every(log => log.readId === requestLogs[0].readId));
            expectLog("read_start", { revision: "abcdef123456" });
            return body;
        }

        await t.test("actual SDK lists and downloads latest suffixed Blob via local HTTP", async () => {
            assert.deepEqual(await getShows(), freshShows);
            assert.equal(listCalls, 1, "real SDK sent list request");
            assert.equal(downloadCalls, 1, "handler downloaded selected Blob");
            expectLog("blob_list", { count: 2, hasMore: false });
            expectLog("blob_selected", { pathname: "shows-current.json" });
            expectLog("blob_download", { status: 200 });
            expectLog("parse", { source: "blob", result: "array", count: 2 });
            expectLog("read_result", { source: "blob", count: 2 });
        });
        const bundled = JSON.parse(await readFile(path.join(dir, "src/data/shows.json"), "utf8"));
        assert.ok(bundled.length > 0);
        await t.test("missing Blob configuration still serves packaged previous shows", async () => {
            delete process.env.BLOB_READ_WRITE_TOKEN;
            assert.deepEqual(await getShows(), bundled);
            expectLog("blob_skipped", { reason: "no_token" });
            expectLog("read_result", { source: "static", count: bundled.length });
        });
        await t.test("real SDK access denial falls back to packaged previous shows", async () => {
            process.env.BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_fixture_local_only";
            mode = "denied";
            assert.deepEqual(await getShows(), bundled);
            expectLog("blob_error", { stage: "list" });
            expectLog("read_result", { source: "static", count: bundled.length });
        });
        await t.test("document current empty-array behavior on invalid downloaded JSON", async () => {
            mode = "invalid-json";
            assert.deepEqual(await getShows(), []);
            expectLog("parse", { source: "blob", result: "invalid_json" });
            expectLog("read_result", { source: "blob", count: 0 });
        });
        await t.test("non-array JSON is distinguishable from malformed JSON", async () => {
            mode = "non-array";
            assert.deepEqual(await getShows(), []);
            expectLog("parse", { source: "blob", result: "not_array" });
        });
        await t.test("empty listing logs fallback reason and preserves bundled shows", async () => {
            mode = "empty";
            assert.deepEqual(await getShows(), bundled);
            expectLog("blob_list", { count: 0, hasMore: false });
            expectLog("blob_skipped", { reason: "no_candidate" });
            expectLog("read_result", { source: "static", count: bundled.length });
        });
        await t.test("failed download logs status and preserves bundled shows", async () => {
            mode = "download-failed";
            assert.deepEqual(await getShows(), bundled);
            expectLog("blob_download", { status: 503 });
            expectLog("read_result", { source: "static", count: bundled.length });
        });
        await t.test("missing packaged fallback logs ENOENT instead of hiding the reason", async () => {
            delete process.env.BLOB_READ_WRITE_TOKEN;
            await rm(path.join(dir, "src/data/shows.json"));
            assert.deepEqual(await getShows(), []);
            expectLog("static_error", { errorCode: "ENOENT" });
            expectLog("read_result", { source: "static", count: 0 });
        });
        const serialized = JSON.stringify(logs);
        for (const privateValue of ["vercel_blob_rw_fixture_local_only", "private-error-sentinel", "private-body-sentinel", storageOrigin, "Martinovanje"]) {
            assert.ok(!serialized.includes(privateValue), `diagnostics do not contain ${privateValue}`);
        }
    } finally {
        console.info = originalInfo;
        process.chdir(originalCwd);
        for (const name of envNames) {
            if (previousEnv[name] === undefined) delete process.env[name];
            else process.env[name] = previousEnv[name];
        }
        if (apiServer) await close(apiServer);
        if (storageServer) await close(storageServer);
        await rm(dir, { recursive: true, force: true });
    }
});
