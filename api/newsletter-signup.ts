import type { VercelRequest, VercelResponse } from "@vercel/node";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ApiError = {
    status: number;
    message: string;
};

function apiError(status: number, message: string): ApiError {
    return { status, message };
}

function asNonEmptyString(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function parseBody(body: unknown): Record<string, unknown> {
    if (typeof body === "string") {
        try {
            const parsed = JSON.parse(body) as unknown;
            return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
        } catch {
            throw apiError(400, "Invalid JSON payload");
        }
    }

    return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
}

function toApiError(error: unknown): ApiError {
    if (
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        "message" in error &&
        typeof (error as { status: unknown }).status === "number" &&
        typeof (error as { message: unknown }).message === "string"
    ) {
        return error as ApiError;
    }

    return { status: 500, message: "Unexpected server error" };
}

function asBoolean(value: unknown): boolean {
    return value === true;
}

function validatePayload(body: unknown): { name: string; email: string; gdprConsent: boolean } {
    const parsed = parseBody(body);
    const name = asNonEmptyString(parsed.name);
    const email = asNonEmptyString(parsed.email);
    const gdprConsent = asBoolean(parsed.gdprConsent);

    if (!name) throw apiError(400, "Missing name");
    if (!email) throw apiError(400, "Missing email");
    if (!EMAIL_RE.test(email)) throw apiError(400, "Invalid email");
    if (!gdprConsent) throw apiError(400, "GDPR consent is required");

    return { name, email, gdprConsent };
}

function getMailchimpConfig() {
    const apiKey = asNonEmptyString(process.env.MAILCHIMP_API_KEY);
    const audienceId = asNonEmptyString(process.env.MAILCHIMP_AUDIENCE_ID);
    const serverPrefix = asNonEmptyString(process.env.MAILCHIMP_SERVER_PREFIX);

    if (!apiKey || !audienceId || !serverPrefix) {
        throw apiError(500, "Mailchimp is not configured");
    }

    return { apiKey, audienceId, serverPrefix };
}

async function subscribeToMailchimp(name: string, email: string): Promise<void> {
    const { apiKey, audienceId, serverPrefix } = getMailchimpConfig();

    const response = await fetch(
        `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/members`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${Buffer.from(`any:${apiKey}`).toString("base64")}`
            },
            body: JSON.stringify({
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: name
                }
            })
        }
    );

    if (response.ok) return;

    const data = (await response.json()) as { title?: string; detail?: string; errors?: unknown[] };

    if (response.status === 400 && data?.title === "Member Exists") {
        return;
    }

    const detail = typeof data?.detail === "string" ? data.detail : "Mailchimp subscription failed";
    throw apiError(response.status, detail);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    try {
        const { name, email } = validatePayload(req.body);
        await subscribeToMailchimp(name, email);
        return res.status(200).json({ ok: true });
    } catch (error: unknown) {
        const { status, message } = toApiError(error);
        return res.status(status).json({ ok: false, error: message });
    }
}
