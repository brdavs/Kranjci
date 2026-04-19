import type { VercelRequest, VercelResponse } from "@vercel/node";
import nodemailer from "nodemailer";
import { createChallenge, randomInt } from "altcha-lib";
import { deriveKey } from "altcha-lib/algorithms/pbkdf2";
import { deriveHmacKeySecret, verify } from "altcha-lib/frameworks/shared";

type ContactPayload = {
    name: string;
    email: string;
    message: string;
    website?: string;
    altchaPayload?: string;
    newsletterOptIn?: boolean;
    newsletterConsent?: boolean;
    // hCaptchaToken?: string;
};

type ApiError = {
    status: number;
    message: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function apiError(status: number, message: string): ApiError {
    return { status, message };
}

function asNonEmptyString(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function asBoolean(value: unknown): boolean {
    return value === true;
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

function validatePayload(body: unknown): ContactPayload {
    const parsed = parseBody(body);
    const name = asNonEmptyString(parsed.name);
    const email = asNonEmptyString(parsed.email);
    const message = asNonEmptyString(parsed.message);
    const website = asNonEmptyString(parsed.website);
    const altchaPayload = asNonEmptyString(parsed.altchaPayload);
    const newsletterOptIn = asBoolean(parsed.newsletterOptIn);
    const newsletterConsent = asBoolean(parsed.newsletterConsent);
    // const hCaptchaToken = asNonEmptyString(parsed.hCaptchaToken);

    if (!name) throw apiError(400, "Missing name");
    if (!email) throw apiError(400, "Missing email");
    if (!EMAIL_RE.test(email)) throw apiError(400, "Invalid email");
    if (!newsletterOptIn && !message) throw apiError(400, "Missing message");
    if (newsletterOptIn && !newsletterConsent) throw apiError(400, "GDPR consent is required");

    return {
        name,
        email,
        message,
        website,
        altchaPayload,
        newsletterOptIn,
        newsletterConsent,
        // hCaptchaToken
    };
}

type AltchaConfig = {
    hmacSignatureSecret: string;
    hmacKeySignatureSecret: string;
};

async function getResolvedAltchaConfig(): Promise<AltchaConfig | null> {
    const hmacSignatureSecret = asNonEmptyString(process.env.ALTCHA_HMAC_SIGNATURE_SECRET);
    if (!hmacSignatureSecret) return null;

    const configuredHmacKeySignatureSecret = asNonEmptyString(process.env.ALTCHA_HMAC_KEY_SIGNATURE_SECRET);
    const hmacKeySignatureSecret = configuredHmacKeySignatureSecret || (await deriveHmacKeySecret(hmacSignatureSecret));

    return { hmacSignatureSecret, hmacKeySignatureSecret };
}

function getMailerConfig() {
    const host = asNonEmptyString(process.env.SMTP_HOST);
    const user = asNonEmptyString(process.env.SMTP_USER);
    const pass = asNonEmptyString(process.env.SMTP_PASS);
    const port = Number(process.env.SMTP_PORT || 587);

    if (!host || !user || !pass) {
        throw apiError(500, "Mail service is not configured");
    }

    return {
        host,
        user,
        pass,
        port,
        to: process.env.MAIL_TO || "kranjci.band@example.com",
        from: process.env.MAIL_FROM || `Zasedba Kranjci <${user}>`
    };
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === "GET") return getAltchaChallenge(res);
    if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

    try {
        const { name, email, message, website, altchaPayload } = validatePayload(req.body);
        // const { name, email, message, website, hCaptchaToken } = validatePayload(req.body);

        if (website) return res.status(200).json({ ok: true }); // honeypot

        await verifyAltchaPayload(altchaPayload);
        // ----- HCAPTCHA FALLBACK (disabled) -------------------------------------
        // To restore fallback, run this check instead of the ALTCHA verification above.
        // await verifyHcaptchaPayload(hCaptchaToken);

        const { host, port, user, pass, to, from } = getMailerConfig();

        const transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: { user, pass }
        });

        await transporter.sendMail({
            from,
            to,
            replyTo: email,
            subject: `Kontakt: ${name}`,
            text: message,
            html: `<p><strong>Ime:</strong> ${escapeHtml(name)}<br/>
                   <strong>E-pošta:</strong> ${escapeHtml(email)}</p>
                   <pre style="white-space:pre-wrap">${escapeHtml(message)}</pre>`
        });

        return res.status(200).json({ ok: true });
    } catch (error: unknown) {
        const { status, message } = toApiError(error);
        return res.status(status).json({ ok: false, error: message });
    }
}

async function verifyAltchaPayload(payload?: string) {
    const config = await getResolvedAltchaConfig();
    if (!config) return;

    if (!payload) throw apiError(400, "Missing ALTCHA payload");

    const { error } = await verify(payload, deriveKey, config.hmacSignatureSecret, config.hmacKeySignatureSecret);
    if (error) throw apiError(400, error);
}

// ----- HCAPTCHA FALLBACK (disabled) ------------------------------------------
// async function verifyHcaptchaPayload(token?: string) {
//     if (!token) throw apiError(400, "Missing hCaptcha token");
//
//     const hcaptchaSecret = asNonEmptyString(process.env.HCAPTCHA_SECRET);
//     if (!hcaptchaSecret) return;
//
//     const response = await fetch("https://api.hcaptcha.com/siteverify", {
//         method: "POST",
//         headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         body: `secret=${encodeURIComponent(hcaptchaSecret)}&response=${encodeURIComponent(token)}`
//     });
//
//     const data = (await response.json()) as { success?: boolean; "error-codes"?: string[] };
//     if (!response.ok || !data.success) {
//         const detail = data["error-codes"]?.join(", ") || "hCaptcha verification failed";
//         throw apiError(400, detail);
//     }
// }

async function getAltchaChallenge(res: VercelResponse) {
    const config = await getResolvedAltchaConfig();
    if (!config) {
        return res.status(500).json({ error: "ALTCHA is not configured." });
    }

    const hmacSignatureSecret = config.hmacSignatureSecret;
    const hmacKeySignatureSecret = config.hmacKeySignatureSecret;

    const challenge = await createChallenge({
        deriveKey,
        hmacSignatureSecret,
        hmacKeySignatureSecret,
        ...getAltchaChallengeParameters()
    });

    return res.status(200).json(challenge);
}

function getAltchaChallengeParameters() {
    return {
        algorithm: "PBKDF2/SHA-256" as const,
        cost: 5000,
        counter: randomInt(5_000, 10_000),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    };
}

function escapeHtml(s: string) {
    return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
