import { useRoute, Link } from "wouter-preact";
import { getMember } from "../members/loader";
import { useMetaTags } from "../hooks/useMetaTags";
import { getMemberImageSources } from "../members/images";

function formatLabel(type: string, label?: string): string {
    if (label) return label;
    return type.charAt(0).toUpperCase() + type.slice(1);
}

export default function Member() {
    const [, params] = useRoute("/member/:slug");
    const slug = params?.slug || "";
    const member = slug ? getMember(slug) : undefined;
    const pageTitle = member ? member.name : "Člana ni mogoče najti";
    const description = member
        ? `${member.name}${member.role ? ` – ${member.role}` : ""} v Zasedbi Kranjci.`
        : "Člana, ki ga iščete, ni v naši zasedbi.";
    const path = slug ? `/member/${slug}` : "/member";

    useMetaTags({
        title: pageTitle,
        description,
        path,
        type: "profile"
    });

    if (!member) {
        return (
            <div class="container">
                <h2>404</h2>
                Člana ni mogoče najti.
            </div>
        );
    }

    const { name, role, photo, socials, html } = member;
    const sources = photo ? getMemberImageSources(photo) : undefined;

    return (
        <div class="container">
            <p style="margin:0 0 12px;"><Link href="/members">← Nazaj na zasedbo</Link></p>
            <div class="grid">
                <div class="card" style="grid-column: span 12;">
                    <div style="display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:16px;align-items:start;">
                        <div style="grid-column: span 4;">
                            {sources && (
                                <picture>
                                    <source type="image/avif" srcSet={sources.avif} />
                                    <source type="image/jpeg" srcSet={sources.jpeg} />
                                    <img
                                        src={sources.jpeg}
                                        alt={name}
                                        style="width:100%;border-radius:12px;object-fit:cover;aspect-ratio:4/5;"
                                    />
                                </picture>
                            )}
                        </div>
                        <div style="grid-column: span 8;">
                            <h1 style="margin:0 0 6px;">{name}</h1>
                            <div style="color:var(--muted);margin-bottom:12px;">{role}</div>
                            <div dangerouslySetInnerHTML={{ __html: html }} />
                            {socials && socials.length > 0 && (
                                <p style="margin-top:10px;display:flex;gap:12px;flex-wrap:wrap;">
                                    {socials.map((s) => (
                                        <a key={s.url} href={s.url} target="_blank" rel="noreferrer">
                                            {formatLabel(s.type, s.label)}
                                        </a>
                                    ))}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
