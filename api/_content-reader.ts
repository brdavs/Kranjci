import { promises as fs } from "node:fs";
import path from "node:path";
type BlobItem = {
    url?: string;
    pathname?: string;
    uploadedAt?: string;
    createdAt?: string;
};

type BlobListResponse = {
    blobs?: unknown;
};

function normalizeDate(item: BlobItem): string {
    return item.uploadedAt || item.createdAt || "";
}

function isArrayOfUnknown(value: unknown): value is unknown[] {
    return Array.isArray(value);
}

function parseJsonArray<T>(value: string): T[] {
    try {
        const parsed = JSON.parse(value) as unknown;
        return isArrayOfUnknown(parsed) ? (parsed as T[]) : [];
    } catch {
        return [];
    }
}

async function readStaticJson<T>(filename: string): Promise<T[]> {
    const jsonPath = path.join(process.cwd(), "src", "data", filename);
    try {
        const raw = await fs.readFile(jsonPath, "utf8");
        return parseJsonArray<T>(raw);
    } catch {
        return [];
    }
}

async function readBlobJson<T>(filename: string): Promise<T[] | null> {
    const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
    if (!token) return null;

    try {
        const { list } = await import("@vercel/blob");
        const response = (await list({
            token,
            prefix: filename,
            limit: 100
        })) as BlobListResponse;

        const blobs = isArrayOfUnknown(response.blobs) ? (response.blobs as BlobItem[]) : [];
        const candidate = blobs
            .filter((item) => typeof item?.url === "string")
            .sort((a, b) => new Date(normalizeDate(b)).getTime() - new Date(normalizeDate(a)).getTime())[0];

        if (!candidate?.url) return null;

        const blobResponse = await fetch(candidate.url);
        if (!blobResponse.ok) return null;

        const text = await blobResponse.text();
        const parsed = parseJsonArray<T>(text);
        return parsed.length > 0 ? parsed : [];
    } catch {
        return null;
    }
}

export async function readContentJson<T>(filename: string): Promise<T[]> {
    const blobData = await readBlobJson<T>(filename);
    if (blobData !== null) return blobData;
    return readStaticJson<T>(filename);
}
