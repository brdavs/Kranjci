import { useState } from "preact/hooks";
import type { JSX } from "preact";
import { useMetaTags } from "../hooks/useMetaTags";
import { ContactCard } from "./contact/ContactCard";
import { COMPANIES, DIRECT_CONTACTS, STAGE_SETUPS } from "./contact/contactData";
import { UnifiedContactForm } from "./contact/UnifiedContactForm";
import { toErrorMessage } from "./contact/altcha";

type NewsletterApiResponse = {
    ok: boolean;
    error?: string;
};

export default function Contact() {
    const [newsletterName, setNewsletterName] = useState("");
    const [newsletterEmail, setNewsletterEmail] = useState("");
    const [newsletterConsent, setNewsletterConsent] = useState(false);
    const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
    const [newsletterError, setNewsletterError] = useState<string>("");

    const isNewsletterFormReady = newsletterName.trim() && newsletterEmail.trim() && newsletterConsent;

    useMetaTags({
        title: "Kontakt",
        description: "Stopite v stik z Zasedbo Kranjci za poroke, poslovne dogodke ali posebne priložnosti.",
        path: "/contact"
    });

    const onNewsletterNameInput = (e: JSX.TargetedEvent<HTMLInputElement, Event>) => setNewsletterName(e.currentTarget.value);
    const onNewsletterEmailInput = (e: JSX.TargetedEvent<HTMLInputElement, Event>) => setNewsletterEmail(e.currentTarget.value);
    const onNewsletterConsentInput = (e: JSX.TargetedEvent<HTMLInputElement, Event>) => setNewsletterConsent(e.currentTarget.checked);

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
                    <UnifiedContactForm />
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
