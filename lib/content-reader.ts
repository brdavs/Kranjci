import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

type BlobItem = {
    url?: string;
    pathname?: string;
    uploadedAt?: string;
    createdAt?: string;
};

type BlobListResponse = {
    blobs?: unknown;
    hasMore?: boolean;
};

type ReadContext = { filename: string; readId: string; revision: string };
type Source = "blob" | "static";

class DiagnosticLoggingError extends Error {}

function diagnostic(context: ReadContext, event: string, details: Record<string, unknown> = {}) {
    try {
        console.info(JSON.stringify({ component: "content-reader", ...context, event, ...details }));
    } catch {
        throw new DiagnosticLoggingError("Content reader diagnostic logging failed");
    }
}

function errorDetails(error: unknown): Record<string, unknown> {
    // Never log exception messages: SDK/network errors may contain credentials or URLs.
    if (error instanceof DiagnosticLoggingError) throw error;
    const code = typeof error === "object" && error !== null && "code" in error ? error.code : undefined;
    return {
        errorType: error instanceof Error ? error.constructor.name.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 64) : "unknown",
        errorCode: typeof code === "string" && /^[A-Z0-9_]{1,80}$/.test(code) ? code : "unavailable"
    };
}

function normalizeDate(item: BlobItem): string {
    return item.uploadedAt || item.createdAt || "";
}

function isArrayOfUnknown(value: unknown): value is unknown[] {
    return Array.isArray(value);
}

function parseJsonArray<T>(value: string, context: ReadContext, source: Source): T[] {
    let parsed: unknown;
    try {
        parsed = JSON.parse(value) as unknown;
    } catch {
        diagnostic(context, "parse", { source, result: "invalid_json", count: 0 });
        return [];
    }
    if (!isArrayOfUnknown(parsed)) {
        diagnostic(context, "parse", { source, result: "not_array", count: 0 });
        return [];
    }
    diagnostic(context, "parse", { source, result: "array", count: parsed.length });
    return parsed as T[];
}

async function readStaticJson<T>(filename: string, context: ReadContext): Promise<T[]> {
    const jsonPath = path.join(process.cwd(), "src", "data", filename);
    diagnostic(context, "static_read");
    try {
        const raw = await fs.readFile(jsonPath, "utf8");
        return parseJsonArray<T>(raw, context, "static");
    } catch (error) {
        diagnostic(context, "static_error", errorDetails(error));
        return [];
    }
}

async function readBlobJson<T>(filename: string, context: ReadContext): Promise<T[] | null> {
    const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
    if (!token) {
        diagnostic(context, "blob_skipped", { reason: "no_token" });
        return null;
    }

    let stage = "sdk_import";
    try {
        const { list } = await import("@vercel/blob");
        stage = "list";
        const prefix = path.parse(filename).name;
        const response = (await list({ token, prefix, limit: 100 })) as BlobListResponse;
        const blobs = isArrayOfUnknown(response.blobs) ? (response.blobs as BlobItem[]) : [];
        diagnostic(context, "blob_list", { prefix, count: blobs.length, hasMore: response.hasMore === true });
        const candidate = blobs
            .filter((item) => typeof item?.url === "string")
            .sort((a, b) => new Date(normalizeDate(b)).getTime() - new Date(normalizeDate(a)).getTime())[0];

        if (!candidate?.url) {
            diagnostic(context, "blob_skipped", { reason: "no_candidate" });
            return null;
        }
        diagnostic(context, "blob_selected", {
            pathname: typeof candidate.pathname === "string"
                ? path.basename(candidate.pathname).replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 180)
                : "unavailable"
        });
        stage = "download";
        const blobResponse = await fetch(candidate.url);
        diagnostic(context, "blob_download", { status: blobResponse.status });
        if (!blobResponse.ok) return null;

        stage = "read_body";
        const text = await blobResponse.text();
        return parseJsonArray<T>(text, context, "blob");
    } catch (error) {
        diagnostic(context, "blob_error", { stage, ...errorDetails(error) });
        return null;
    }
}

export async function readContentJson<T>(filename: string): Promise<T[]> {
    const sha = process.env.VERCEL_GIT_COMMIT_SHA || "";
    const context: ReadContext = {
        filename,
        readId: randomUUID(),
        revision: /^[a-f0-9]{7,64}$/i.test(sha) ? sha.slice(0, 12) : "unavailable"
    };
    diagnostic(context, "read_start");
    const blobData = await readBlobJson<T>(filename, context);
    if (blobData !== null) {
        diagnostic(context, "read_result", { source: "blob", count: blobData.length });
        return blobData;
    }
    const staticData = await readStaticJson<T>(filename, context);
    diagnostic(context, "read_result", { source: "static", count: staticData.length });
    return staticData;
}
