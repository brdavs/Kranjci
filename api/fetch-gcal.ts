import type { VercelRequest, VercelResponse } from "@vercel/node";
import { spawn } from "node:child_process";
import path from "node:path";

function runFetchAll(): Promise<void> {
    const scriptPath = path.join(process.cwd(), "scripts", "fetch-all.mjs");
    return new Promise((resolve, reject) => {
        const child = spawn("node", [scriptPath], {
            stdio: "inherit",
            env: process.env
        });
        child.on("close", (code) => {
            if (code === 0) resolve();
            else reject(new Error(`fetch-all exited with code ${code}`));
        });
        child.on("error", reject);
    });
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
    try {
        await runFetchAll();
        res.status(200).json({ ok: true });
    } catch (error) {
        console.error("fetch-all cron failed:", error);
        res.status(500).json({ ok: false, error: (error as Error).message });
    }
}
