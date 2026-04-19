import { useEffect, useRef, useState } from "preact/hooks";
import type { JSX } from "preact";
import "altcha";
import { toErrorMessage } from "./altcha";

type ContactApiResponse = {
    ok: boolean;
    error?: string;
};

type NewsletterApiResponse = {
    ok: boolean;
    error?: string;
};

export function UnifiedContactForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [website, setWebsite] = useState("");
    const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err" | "partial">("idle");
    const [error, setError] = useState<string>("");

    const [contactNewsletterOptIn, setContactNewsletterOptIn] = useState(false);
    const [contactNewsletterConsent, setContactNewsletterConsent] = useState(false);

    const altchaChallengeUrl = import.meta.env.VITE_ALTCHA_CHALLENGE_URL || "";
    const altchaWidgetRef = useRef<HTMLElement & { reset?: () => void }>(null);
    const [altchaPayload, setAltchaPayload] = useState("");
    const [captchaReady, setCaptchaReady] = useState(!altchaChallengeUrl);
    const [captchaLoadError, setCaptchaLoadError] = useState<string>("");

    const isContactFormReady =
        name.trim() && email.trim() && (contactNewsletterOptIn ? contactNewsletterConsent : message.trim()) &&
        (!altchaChallengeUrl || Boolean(altchaPayload));
    const isContactMessageRequired = !contactNewsletterOptIn;

    const onNameInput = (e: JSX.TargetedEvent<HTMLInputElement, Event>) => setName(e.currentTarget.value);
    const onEmailInput = (e: JSX.TargetedEvent<HTMLInputElement, Event>) => setEmail(e.currentTarget.value);
    const onWebsiteInput = (e: JSX.TargetedEvent<HTMLInputElement, Event>) => setWebsite(e.currentTarget.value);
    const onMessageInput = (e: JSX.TargetedEvent<HTMLTextAreaElement, Event>) => setMessage(e.currentTarget.value);

    const onContactNewsletterOptInInput = (e: JSX.TargetedEvent<HTMLInputElement, Event>) => {
        const isChecked = e.currentTarget.checked;
        setContactNewsletterOptIn(isChecked);
        if (!isChecked) {
            setContactNewsletterConsent(false);
        }
    };

    const onContactNewsletterConsentInput = (e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
        setContactNewsletterConsent(e.currentTarget.checked);

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

    async function signupForNewsletter(): Promise<NewsletterApiResponse> {
        const res = await fetch("/api/newsletter-signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                email,
                gdprConsent: contactNewsletterConsent
            })
        });

        return (await res.json()) as NewsletterApiResponse;
    }

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

            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    message,
                    website,
                    altchaPayload: altchaPayloadValue,
                    newsletterOptIn: contactNewsletterOptIn,
                    newsletterConsent: contactNewsletterConsent
                })
            });

            const json = (await res.json()) as ContactApiResponse;

            if (json.ok) {
                const shouldSubscribeNewsletter = contactNewsletterOptIn && contactNewsletterConsent;

                setName("");
                setEmail("");
                setMessage("");
                setWebsite("");
                setContactNewsletterOptIn(false);
                setContactNewsletterConsent(false);

                if (altchaChallengeUrl) {
                    setAltchaPayload("");
                    altchaWidgetRef.current?.reset?.();
                }

                if (shouldSubscribeNewsletter) {
                    try {
                        const newsletterResult = await signupForNewsletter();
                        if (newsletterResult.ok) {
                            setStatus("ok");
                        } else {
                            setStatus("partial");
                            setError(newsletterResult.error || "Prijava na novice ni uspela.");
                        }
                    } catch (newsletterError: unknown) {
                        setStatus("partial");
                        setError(toErrorMessage(newsletterError));
                    }
                } else {
                    setStatus("ok");
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

    return (
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
                <textarea value={message} onInput={onMessageInput} required={isContactMessageRequired} rows={6}></textarea>
                {!isContactMessageRequired ? (
                    <small class="contact-status">
                        Sporočilo lahko ostane prazno, če se želite hkrati prijaviti na e-novice.
                    </small>
                ) : null}
            </label>
            <label class="contact-consent">
                <input
                    type="checkbox"
                    checked={contactNewsletterOptIn}
                    onInput={onContactNewsletterOptInInput}
                />
                <span>Želim se prijaviti na e-novice Zasedbe Kranjci.</span>
            </label>
            {contactNewsletterOptIn && (
                <label class="contact-consent">
                    <input
                        type="checkbox"
                        checked={contactNewsletterConsent}
                        onInput={onContactNewsletterConsentInput}
                    />
                    <span>
                        Strinjam se z obdelavo osebnih podatkov za namen prejemanja e-novic Zasedbe Kranjci.
                        Svoje privolitev lahko kadarkoli prekličete.
                    </span>
                </label>
            )}
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
            <div class="contact-actions">
                <button class="btn" disabled={status === "sending" || !isContactFormReady} type="submit">
                    {status === "sending" ? "Pošiljanje…" : "Pošlji"}
                </button>
                {status === "ok" && <span class="contact-status contact-status--ok">Poslano. Hvala!</span>}
                {status === "partial" && (
                    <span class="contact-status contact-status--err">
                        Sporočilo je bilo poslano, vendar je prijava na e-novice spodletela: {error}
                    </span>
                )}
                {status === "err" && <span class="contact-status contact-status--err">{error}</span>}
            </div>
        </form>
    );
}
