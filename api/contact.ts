import type { VercelRequest, VercelResponse } from "@vercel/node";
import nodemailer from "nodemailer";

const required = (name: string, v: unknown) => {
    if (!v || String(v).trim() === "") throw new Error(`Missing ${name}`);
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

    try {
        const { name, email, message, website, hcaptchaToken } = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) || {};

        if (website) return res.status(200).json({ ok: true }); // honeypot

        required("name", name);
        required("email", email);
        required("message", message);

        await verifyHCaptchaToken(hcaptchaToken);

        const host = process.env.SMTP_HOST!;
        const port = Number(process.env.SMTP_PORT || 587);
        const user = process.env.SMTP_USER!;
        const pass = process.env.SMTP_PASS!;
        const to = process.env.MAIL_TO || "kranjci.band@example.com";
        const from = process.env.MAIL_FROM || `Zasedba Kranjci <${user}>`;

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
    } catch (err: any) {
        return res.status(400).json({ ok: false, error: err?.message || "Bad request" });
    }
}

async function verifyHCaptchaToken(token?: string) {
    const secret = process.env.HCAPTCHA_SECRET;
    if (!secret) return;
    required("hCaptcha token", token);
    const params = new URLSearchParams({ secret, response: token! });
    const response = await fetch("https://hcaptcha.com/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString()
    });
    const data = await response.json();
    if (!data.success) throw new Error("hCaptcha verification failed");
}

function escapeHtml(s: string) {
    return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
