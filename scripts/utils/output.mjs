import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { uploadJsonBlob } from "./blob-storage.mjs";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

function dataDir() {
    return process.env.VERCEL ? "/tmp" : path.join(ROOT_DIR, "src", "data");
}

export function getDataPath(filename) {
    return path.join(dataDir(), filename);
}

export async function writeJsonAndUpload(filename, data) {
    const json = JSON.stringify(data, null, 2);
    const outputPath = getDataPath(filename);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, json);
    const blobUrl = await uploadJsonBlob(filename, json);
    return { outputPath, blobUrl };
}
