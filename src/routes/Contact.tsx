import { useEffect, useState } from "preact/hooks";
import type { ComponentChildren } from "preact";
import { useMetaTags } from "../hooks/useMetaTags";

const DIRECT_CONTACTS = [
    { name: "Igor Oražem", phone: "+386 41 577 893" },
    { name: "Martin Oražem", phone: "+386 31 635 987" },
    { name: "Toni Anžlovar", phone: "+386 41 900 855" },
    { name: "Mitja Jeršič", phone: "+386 40 540 852" }
];

const COMPANIES = [
    {
        name: "Artisan, umetniško ustvarjanje, Igor Oražem s.p.",
        address: ["Albrehtova ulica 88a, 1291 Škofljica", "1291 Škofljica"],
        tax: "SI46666974",
        iban: "SI56 6100 0001 1797 196 · Delavska hranilnica d.d.",
        swift: "HDELSI22"
    },
    {
        name: "Formalibre d.o.o.",
        address: ["Brodarjev trg 7", "1000 Ljubljana"],
        tax: "SI21653917",
        iban: "LT57 3250 0081 0606 2936 · Revolut Business",
        swift: "RETBLT21XXX"
    },
    {
        name: "Martin Oražem s.p.",
        address: ["Prigorica 97a", "1331 Dolenja vas"],
        tax: "89112130 (ni davčni zavezanec)",
        iban: "SI56 6100 0000 5742 068 · Delavska hranilnica d.d.",
        swift: "HDELSI22"
    },
    {
        name: "Umetniško uprizarjanje, Mitja Jeršič s.p.",
        address: ["Ulica Mirkota Roglja 3", "4270 Jesenice"],
        tax: "71851569 (ni davčni zavezanec)",
        iban: "SI56 6100 0001 1339 647 · Delavska hranilnica d.d.",
        swift: "HDELSI22"
    }
];

const STAGE_SETUPS = [
    { label: "Inštrumentalna zasedba Kranjci", size: "8 m²" },
    { label: "Koncertna »Cross-over« zasedba Kranjci", size: "14 m²" },
    { label: "Pevsko plesna »live band« zasedba Kranjci", size: "20 m²" }
];

declare global {
    interface Window {
        hcaptcha?: {
            reset: (widgetId?: string | number) => void;
        };
    }
}

let hcaptchaLoader: Promise<void> | null = null;
function ensureHCaptchaScript() {
    if (typeof window !== "undefined" && window.hcaptcha) return Promise.resolve();
    if (!hcaptchaLoader) {
        hcaptchaLoader = new Promise<void>((resolve, reject) => {
            if (typeof document === "undefined") {
                reject(new Error("Document is not available"));
                return;
            }
            const existing = document.querySelector<HTMLScriptElement>('script[src="https://js.hcaptcha.com/1/api.js"]');
            if (existing) {
                existing.addEventListener("load", () => resolve(), { once: true });
                existing.addEventListener("error", () => reject(new Error("hCaptcha failed to load")), { once: true });
                return;
            }
            const script = document.createElement("script");
            script.src = "https://js.hcaptcha.com/1/api.js";
            script.async = true;
            script.defer = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("hCaptcha failed to load"));
            document.head.appendChild(script);
        });
    }
    return hcaptchaLoader;
}

export default function Contact() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [website, setWebsite] = useState("");
    const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
    const [error, setError] = useState<string>("");
    const hcaptchaSiteKey = import.meta.env.VITE_HCAPTCHA_SITEKEY || "";
    const [captchaReady, setCaptchaReady] = useState(!hcaptchaSiteKey);
    const [captchaLoadError, setCaptchaLoadError] = useState<string>("");

    useMetaTags({
        title: "Kontakt",
        description: "Stopite v stik z Zasedbo Kranjci za poroke, poslovne dogodke ali posebne priložnosti.",
        path: "/contact"
    });

    const readCaptchaToken = () => {
        if (typeof document === "undefined") return "";
        const field = document.querySelector<HTMLTextAreaElement>('textarea[name="h-captcha-response"]');
        return field?.value?.trim() || "";
    };

    const resetCaptcha = () => {
        if (typeof window !== "undefined" && typeof window.hcaptcha?.reset === "function") {
            try { window.hcaptcha.reset(); } catch { /* ignore */ }
        }
        if (typeof document !== "undefined") {
            const field = document.querySelector<HTMLTextAreaElement>('textarea[name="h-captcha-response"]');
            if (field) field.value = "";
        }
    };

    useEffect(() => {
        if (!hcaptchaSiteKey) return;
        setCaptchaLoadError("");
        ensureHCaptchaScript()
            .then(() => setCaptchaReady(true))
            .catch((err) => {
                setCaptchaReady(false);
                setCaptchaLoadError(err?.message || "hCaptcha se ni naložila.");
            });
    }, [hcaptchaSiteKey]);
    async function onSubmit(e: Event) {
        e.preventDefault();
        setStatus("sending");
        setError("");
        try {
            let hcaptchaToken: string | undefined;
            if (hcaptchaSiteKey) {
                if (!captchaReady) {
                    setStatus("err");
                    setError("hCaptcha ni pripravljena. Poskusite znova.");
                    return;
                }
                hcaptchaToken = readCaptchaToken();
                if (!hcaptchaToken) {
                    setStatus("err");
                    setError("Prosimo, potrdite, da niste robot.");
                    return;
                }
            }
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, message, website, hcaptchaToken })
            });
            const json = await res.json();
            if (json.ok) {
                setStatus("ok");
                setName(""); setEmail(""); setMessage(""); setWebsite("");
                if (hcaptchaSiteKey) resetCaptcha();
            } else {
                setStatus("err");
                setError(json.error || "Napaka pri pošiljanju.");
            }
        } catch (err: any) {
            setStatus("err");
            setError(err?.message || "Napaka pri pošiljanju.");
        }
    }

    return (
        <div class="container contact-page">
            <h2>Kontakt</h2>

            <div class="contact-layout">
                <ContactCard title="Pišite nam">
                    <p>Izpolnite obrazec in vrnili se bomo z odgovorom v najkrajšem času.</p>
                    <form onSubmit={onSubmit} class="contact-form">
                        <label>Ime
                            <input value={name} onInput={(e: any) => setName(e.currentTarget.value)} required />
                        </label>
                        <label>E-pošta
                            <input type="email" value={email} onInput={(e: any) => setEmail(e.currentTarget.value)} required />
                        </label>
                        <label class="contact-honeypot">
                            Website
                            <input value={website} onInput={(e: any) => setWebsite(e.currentTarget.value)} tabIndex={-1} autoComplete="off" />
                        </label>
                        <label>Sporočilo
                            <textarea value={message} onInput={(e: any) => setMessage(e.currentTarget.value)} required rows={6}></textarea>
                        </label>
                        {hcaptchaSiteKey && (
                            <div class="contact-captcha">
                                <div class="h-captcha" data-sitekey={hcaptchaSiteKey}></div>
                                {captchaLoadError && <span class="contact-status contact-status--err">{captchaLoadError}</span>}
                            </div>
                        )}
                        <div class="contact-actions">
                            <button class="btn" disabled={status === "sending" || (hcaptchaSiteKey && !captchaReady)} type="submit">
                                {status === "sending" ? "Pošiljanje…" : "Pošlji"}
                            </button>
                            {status === "ok" && <span class="contact-status contact-status--ok">Poslano. Hvala!</span>}
                            {status === "err" && <span class="contact-status contact-status--err">{error}</span>}
                        </div>
                    </form>
                </ContactCard>

                <ContactCard title="Mobilni telefon in e-pošta">
                    <dl class="contact-list">
                        {DIRECT_CONTACTS.map((contact) => (
                            <div key={contact.phone}>
                                <dt>{contact.name}</dt>
                                <dd><a href={`tel:${contact.phone.replace(/\s+/g, "")}`}>{contact.phone}</a></dd>
                            </div>
                        ))}
                    </dl>
                    <p class="contact-email">
                        e-pošta za splošni kontakt:<br />
                        <a href="mailto:booking@kranjci.si">booking@kranjci.si</a>
                    </p>
                </ContactCard>
            </div>

            <ContactCard title="Zasedba Kranjci deluje preko več pravnih subjektov">
                <div class="contact-entities">
                    {COMPANIES.map((company) => (
                        <article key={company.name}>
                            <h4>{company.name}</h4>
                            {company.address.map((line) => <p key={line}>{line}</p>)}
                            <p>DŠ: {company.tax}</p>
                            <p>IBAN: {company.iban}</p>
                            <p>SWIFT: {company.swift}</p>
                        </article>
                    ))}
                </div>
            </ContactCard>

            <ContactCard title="Tehnične zahteve in odrska postavitev">
                <p>
                    Kranjci smo v celoti opremljeni s profesionalnimi mikrofoni in odjemalci (Sennheiser, Neuman, DPA, AMT, Shure, David Gage…),
                    z brezžičnim sistemom Sennheiser in digitalno mešalno mizo Behringer X32. Za unikatni zvok skrbita tonska tehnika Franci
                    Zupančič in Matej Jerele. Kadar se uporablja obstoječe ozvočenje, tonski mojster po dogovoru prinese “backend” opremo in se
                    priključi na FOH (zaželeno LR + SUB).
                </p>
                <p>Najmanjše priporočljive odrske zahteve:</p>
                <ul>
                    {STAGE_SETUPS.map((setup) => (
                        <li key={setup.label}>{setup.label} – <strong>{setup.size}</strong></li>
                    ))}
                </ul>
                <p>
                    Pri uporabi osnovnega ozvočenja zadostuje enofazni priključek s 16A varovalko in eno vtičnico.
                    Za močnejše konfiguracije vas povežemo s tonskim mojstrom za natančne specifikacije.
                </p>
            </ContactCard>
        </div>
    );
}

function ContactCard({ title, children }: { title: string; children: ComponentChildren }) {
    return (
        <section class="card contact-card">
            <h3>{title}</h3>
            {children}
        </section>
    );
}
