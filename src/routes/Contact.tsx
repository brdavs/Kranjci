import { useEffect, useRef, useState } from "preact/hooks";
import type { JSX } from "preact";
import { useMetaTags } from "../hooks/useMetaTags";
import { ContactCard } from "./contact/ContactCard";
import { COMPANIES, DIRECT_CONTACTS, STAGE_SETUPS } from "./contact/contactData";
import "altcha";
import { toErrorMessage } from "./contact/altcha";

type ContactApiResponse = {
    ok: boolean;
    error?: string;
};

type NewsletterApiResponse = {
    ok: boolean;
    error?: string;
};

export default function Contact() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [website, setWebsite] = useState("");
    const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
    const [error, setError] = useState<string>("");

    const [newsletterName, setNewsletterName] = useState("");
    const [newsletterEmail, setNewsletterEmail] = useState("");
    const [newsletterConsent, setNewsletterConsent] = useState(false);
    const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
    const [newsletterError, setNewsletterError] = useState<string>("");
    const altchaChallengeUrl = import.meta.env.VITE_ALTCHA_CHALLENGE_URL || "";
    const altchaWidgetRef = useRef<HTMLElement & { reset?: () => void }>(null);
    const [altchaPayload, setAltchaPayload] = useState("");
    const [captchaReady, setCaptchaReady] = useState(!altchaChallengeUrl);
    const [captchaLoadError, setCaptchaLoadError] = useState<string>("");

    const isContactFormReady = name.trim() && email.trim() && message.trim() && (!altchaChallengeUrl || Boolean(altchaPayload));
    const isNewsletterFormReady = newsletterName.trim() && newsletterEmail.trim() && newsletterConsent;

    // ----- HCAPTCHA FALLBACK (disabled) -------------------------------------
    // Uncomment this block and the disabled call/site in `onSubmit` + render block
    // below to restore the previous hCaptcha client flow.
    // const hCaptchaSiteKey = import.meta.env.VITE_HCAPTCHA_SITEKEY || "";
    // const [hCaptchaToken, setHCaptchaToken] = useState("");
    // const [hCaptchaReady, setHCaptchaReady] = useState(!hCaptchaSiteKey);

    useMetaTags({
        title: "Kontakt",
        description: "Stopite v stik z Zasedbo Kranjci za poroke, poslovne dogodke ali posebne priložnosti.",
        path: "/contact"
    });

    const onNameInput = (e: JSX.TargetedEvent<HTMLInputElement, Event>) => setName(e.currentTarget.value);
    const onEmailInput = (e: JSX.TargetedEvent<HTMLInputElement, Event>) => setEmail(e.currentTarget.value);
    const onWebsiteInput = (e: JSX.TargetedEvent<HTMLInputElement, Event>) => setWebsite(e.currentTarget.value);
    const onMessageInput = (e: JSX.TargetedEvent<HTMLTextAreaElement, Event>) => setMessage(e.currentTarget.value);
    const onNewsletterNameInput = (e: JSX.TargetedEvent<HTMLInputElement, Event>) => setNewsletterName(e.currentTarget.value);
    const onNewsletterEmailInput = (e: JSX.TargetedEvent<HTMLInputElement, Event>) => setNewsletterEmail(e.currentTarget.value);
    const onNewsletterConsentInput = (e: JSX.TargetedEvent<HTMLInputElement, Event>) => setNewsletterConsent(e.currentTarget.checked);

    useEffect(() => {
        setAltchaPayload("");

        if (!altchaChallengeUrl) {
            setCaptchaReady(true);
            setCaptchaLoadError("");
            return;
        }

        setCaptchaReady(false);
        setCaptchaLoadError("");

        const widget = altchaWidgetRef.current;
        if (!widget) return;

        const handleLoad = () => setCaptchaReady(true);
        const handleStateChange = (ev: Event) => {
            const detail = (ev as CustomEvent<{ payload?: string | null }>).detail;
            const nextPayload = detail?.payload;
            setAltchaPayload(typeof nextPayload === "string" ? nextPayload : "");
        };

        widget.addEventListener("load", handleLoad);
        widget.addEventListener("statechange", handleStateChange);
        return () => {
            widget.removeEventListener("load", handleLoad);
            widget.removeEventListener("statechange", handleStateChange);
        };
    }, [altchaChallengeUrl]);

    // useEffect(() => {
    //     setHCaptchaToken("");
    //
    //     if (!hCaptchaSiteKey) {
    //         setHCaptchaReady(true);
    //         return;
    //     }
    //
    //     const scriptId = "hcaptcha-script";
    //     if (!document.getElementById(scriptId)) {
    //         const script = document.createElement("script");
    //         script.id = scriptId;
    //         script.src = "https://js.hcaptcha.com/1/api.js?render=explicit&onload=hcaptchaReady";
    //         script.async = true;
    //         script.defer = true;
    //         document.body.appendChild(script);
    //     }
    //
    //     const renderWidget = () => {
    //         const widget = document.querySelector(".h-captcha") as HTMLElement | null;
    //         if (window.hcaptcha && widget && typeof window.hcaptcha.render === "function") {
    //             window.hcaptcha.render(widget, {
    //                 sitekey: hCaptchaSiteKey,
    //                 callback: (token: string) => setHCaptchaToken(token),
    //                 "error-callback": () => setHCaptchaToken("")
    //             });
    //             setHCaptchaReady(true);
    //         }
    //     };
    //
    //     const timer = window.setInterval(() => {
    //         if (window.hcaptcha) {
    //             window.clearInterval(timer);
    //             renderWidget();
    //         }
    //     }, 100);
    //
    //     return () => window.clearInterval(timer);
    // }, [hCaptchaSiteKey]);
    async function onSubmit(e: Event) {
        e.preventDefault();
        setStatus("sending");
        setError("");
        try {
            let altchaPayloadValue: string | undefined;
            if (altchaChallengeUrl) {
                if (!captchaReady) {
                    setStatus("err");
                    setError("ALTCHA ni pripravljena. Poskusite znova.");
                    return;
                }
                altchaPayloadValue = altchaPayload.trim();
                if (!altchaPayloadValue) {
                    setStatus("err");
                    setError("Prosimo, potrdite preverjanje pred oddajo.");
                    return;
                }
            }

            // ----- HCAPTCHA FALLBACK (disabled) ---------------------------------
            // if (!altchaChallengeUrl) {
            //     if (!hCaptchaReady) {
            //         setStatus("err");
            //         setError("hCaptcha ni pripravljen. Poskusite znova.");
            //         return;
            //     }
            //     if (!hCaptchaToken) {
            //         setStatus("err");
            //         setError("Prosimo, opravite preverjanje pred oddajo.");
            //         return;
            //     }
            // }

            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // body: JSON.stringify({ name, email, message, website, hCaptchaToken })
                body: JSON.stringify({ name, email, message, website, altchaPayload: altchaPayloadValue })
            });
            const json = (await res.json()) as ContactApiResponse;
            if (json.ok) {
                setStatus("ok");
                setName(""); setEmail(""); setMessage(""); setWebsite("");
                if (altchaChallengeUrl) {
                    setAltchaPayload("");
                    altchaWidgetRef.current?.reset?.();

                    // } else {
                    //     setHCaptchaToken("");
                }
            } else {
                setStatus("err");
                setError(json.error || "Napaka pri pošiljanju.");
            }
        } catch (err: unknown) {
            setStatus("err");
            setError(toErrorMessage(err));
        }
    }

    async function onSubmitNewsletter(e: Event) {
        e.preventDefault();
        if (!newsletterConsent) {
            setNewsletterStatus("err");
            setNewsletterError("Za prijavo je potrebna izjava o privolitvi za varstvo podatkov.");
            return;
        }

        setNewsletterStatus("sending");
        setNewsletterError("");

        try {
            const res = await fetch("/api/newsletter-signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newsletterName,
                    email: newsletterEmail,
                    gdprConsent: newsletterConsent
                })
            });

            const json = (await res.json()) as NewsletterApiResponse;
            if (json.ok) {
                setNewsletterStatus("ok");
                setNewsletterName("");
                setNewsletterEmail("");
                setNewsletterConsent(false);
            } else {
                setNewsletterStatus("err");
                setNewsletterError(json.error || "Napaka pri prijavi na novice.");
            }
        } catch (err: unknown) {
            setNewsletterStatus("err");
            setNewsletterError(toErrorMessage(err));
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
                            <input value={name} onInput={onNameInput} required />
                        </label>
                        <label>E-pošta
                            <input type="email" value={email} onInput={onEmailInput} required />
                        </label>
                        <label class="contact-honeypot">
                            Website
                            <input value={website} onInput={onWebsiteInput} tabIndex={-1} autoComplete="off" />
                        </label>
                        <label>Sporočilo
                            <textarea value={message} onInput={onMessageInput} required rows={6}></textarea>
                        </label>
                        {altchaChallengeUrl && (
                            <div class="contact-captcha">
                                <altcha-widget
                                    ref={altchaWidgetRef}
                                    challenge={altchaChallengeUrl}
                                    name="altcha"
                                />
                                {captchaLoadError && <span class="contact-status contact-status--err">{captchaLoadError}</span>}
                            </div>
                        )}
                        {/* ----- HCAPTCHA FALLBACK (disabled) ------------------------------ */}
                        {/* <div class="contact-captcha">
                            <div class="h-captcha" data-sitekey={hCaptchaSiteKey}></div>
                        </div>
                        <small class="contact-status">Ali potrdite: hCaptcha.</small> */}
                        <div class="contact-actions">
                            <button class="btn" disabled={status === "sending" || !isContactFormReady} type="submit">
                                {status === "sending" ? "Pošiljanje…" : "Pošlji"}
                            </button>
                            {status === "ok" && <span class="contact-status contact-status--ok">Poslano. Hvala!</span>}
                            {status === "err" && <span class="contact-status contact-status--err">{error}</span>}
                        </div>
                    </form>
                </ContactCard>

                <div class="contact-vertical-stack">
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

                    <ContactCard title="Prijava na e-novice">
                        <form onSubmit={onSubmitNewsletter} class="contact-form">
                            <label>
                                Ime
                                <input value={newsletterName} onInput={onNewsletterNameInput} required />
                            </label>
                            <label>
                                E-pošta
                                <input type="email" value={newsletterEmail} onInput={onNewsletterEmailInput} required />
                            </label>
                            <label class="contact-consent">
                                <input type="checkbox" checked={newsletterConsent} onInput={onNewsletterConsentInput} required />
                                <span>
                                    Strinjam se z obdelavo osebnih podatkov za namen prejemanja e-novic Zasedbe Kranjci.
                                    Svoje privolitev lahko kadarkoli prekličete.
                                </span>
                            </label>

                            <div class="contact-actions">
                                <button class="btn" disabled={newsletterStatus === "sending" || !isNewsletterFormReady} type="submit">
                                    {newsletterStatus === "sending" ? "Prijava…" : "Prijava na novice"}
                                </button>
                                {newsletterStatus === "ok" && <span class="contact-status contact-status--ok">Prijava je bila uspešna.</span>}
                                {newsletterStatus === "err" && <span class="contact-status contact-status--err">{newsletterError}</span>}
                            </div>
                        </form>
                    </ContactCard>
                </div>
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
