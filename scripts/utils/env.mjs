import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const ENV_PATH = path.join(ROOT_DIR, ".env");

function parseDotEnv(content) {
    const env = {};
    for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
        if (!match) continue;
        const [, key, raw] = match;
        const value = raw.startsWith("\"") && raw.endsWith("\"")
            ? raw.slice(1, -1)
            : raw;
        env[key] = value;
    }
    return env;
}

export function loadEnv() {
    // On Vercel, env vars are already injected; avoid reading local .env there.
    if (process.env.VERCEL) return;
    // Vercel already injects env vars; .env is needed mainly for local runs.
    try {
        const content = fs.readFileSync(ENV_PATH, "utf8");
        const env = parseDotEnv(content);
        for (const [key, value] of Object.entries(env)) {
            if (process.env[key] === undefined) {
                process.env[key] = value;
            }
        }
    } catch {
        // .env missing is fine; rely on process.env
    }
}
