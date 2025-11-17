import { put } from "@vercel/blob";

const DEFAULT_ACCESS = "public";

export async function uploadJsonBlob(pathname, data) {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
        console.warn(`[blob] BLOB_READ_WRITE_TOKEN missing, skipping upload for ${pathname}`);
        return null;
    }
    const result = await put(pathname, data, {
        access: DEFAULT_ACCESS,
        contentType: "application/json",
        token
    });
    return result?.url || null;
}
