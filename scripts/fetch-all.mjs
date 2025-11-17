import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));

function runScript(script) {
    return new Promise((resolve, reject) => {
        const child = spawn("node", [path.join(ROOT_DIR, script)], {
            stdio: "inherit",
            env: process.env
        });
        const timeout = setTimeout(() => {
            child.kill("SIGTERM");
            reject(new Error(`${script} timed out`));
        }, 30000);
        child.on("close", (code) => {
            clearTimeout(timeout);
            if (code === 0) resolve();
            else reject(new Error(`${script} exited with code ${code}`));
        });
        child.on("error", (err) => {
            clearTimeout(timeout);
            reject(err);
        });
    });
}

async function main() {
    console.log("Starting fetch-shows...");
    await runScript("fetch-shows.mjs");
    console.log("fetch-shows done. Starting fetch-news...");
    await runScript("fetch-news.mjs");
    console.log("fetch-news done.");
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
