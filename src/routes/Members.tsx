import { Link } from "wouter-preact";
import { getAllMembers } from "../members/loader";
import { getMemberImageSources } from "../members/images";
import { useMetaTags } from "../hooks/useMetaTags";

const GROUPS = [
    {
        title: "Akustični kvartet in live band",
        slugs: ["igor-orazem", "toni-anzlovar", "mitja-jersic", "martin-orazem"]
    },
    {
        title: "Pevke",
        slugs: ["anea-mlinar", "stefica-grasselli", "tanja-srednik",]
    },
    {
        title: "Tehnična podpora",
        slugs: ["franci-zupancic", "matej-jerele", "nejc-babnik"]
    }
];

function MemberCard({ slug, name, role, photo }: { slug: string; name: string; role: string; photo?: string }) {
    const sources = photo ? getMemberImageSources(photo) : undefined;
    return (
        <article class="card member-card" key={slug}>
            {sources && (
                <Link href={`/member/${slug}`} style="display:block;margin-bottom:10px;">
                    <picture>
                        <source type="image/avif" srcSet={sources.avif} />
                        <source type="image/jpeg" srcSet={sources.jpeg} />
                        <img
                            src={sources.jpeg}
                            alt={name}
                            style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:8px;"
                        />
                    </picture>
                </Link>
            )}
            <h3 style="margin:0 0 6px;">
                <Link href={`/member/${slug}`}>{name}</Link>
            </h3>
            <div style="color:var(--muted);margin-bottom:8px;">{role}</div>
        </article>
    );
}

export default function Members() {
    const members = getAllMembers();
    const memberMap = new Map(members.map((m) => [m.slug, m]));
    useMetaTags({
        title: "Člani zasedbe",
        description: "Spoznajte člane Zasedbe Kranjci.",
        path: "/members"
    });
    if (members.length === 0) {
        return <div class="container"><p>Trenutno ni podatkov o zasedbi.</p></div>;
    }
    const renderedGroups = GROUPS.map((group) => {
        const items = group.slugs.map((slug) => memberMap.get(slug)).filter(Boolean);
        return (
            <section key={group.title} style="margin-bottom:48px;">
                <h3 style="margin-bottom:16px;">{group.title}</h3>
                {items.length === 0 ? (
                    <p style="color:var(--muted);">Več informacij kmalu.</p>
                ) : (
                    <div class="member-grid">
                        {items.map((member) => (
                            <MemberCard key={member!.slug} {...member!} />
                        ))}
                    </div>
                )}
            </section>
        );
    });

    return (
        <div class="container">
            <h2>Člani zasedbe</h2>
            {renderedGroups}
        </div>
    );
}
