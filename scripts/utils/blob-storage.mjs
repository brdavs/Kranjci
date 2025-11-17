const DEFAULT_ACCESS = "public";

export async function uploadJsonBlob(pathname, data) {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
        console.warn(`[blob] BLOB_READ_WRITE_TOKEN missing, skipping upload for ${pathname}`);
        return null;
    }

    // Lazy-load @vercel/blob so the script can run even if the package
    // is not bundled (e.g., in Vercel cron without a dependency trace).
    let put;
    try {
        ({ put } = await import("@vercel/blob"));
    } catch (err) {
        console.warn(`[blob] @vercel/blob not available, skipping upload for ${pathname}:`, err?.message || err);
        return null;
    }

    const result = await put(pathname, data, {
        access: DEFAULT_ACCESS,
        contentType: "application/json",
        token
    });
    return result?.url || null;
}
