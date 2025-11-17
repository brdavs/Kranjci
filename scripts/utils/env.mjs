import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv as viteLoadEnv } from "vite";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

export function loadEnv() {
    const mode = process.env.NODE_ENV ?? process.env.VERCEL_ENV ?? "development";
    const env = viteLoadEnv(mode, ROOT_DIR, "");
    for (const [key, value] of Object.entries(env)) {
        if (process.env[key] === undefined) {
            process.env[key] = value;
        }
    }
}
