import { shows } from "../data/shows";
import { useMetaTags } from "../hooks/useMetaTags";

function fmt(d: string): string {
    const x = new Date(d + "T00:00:00");
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${x.getDate()}.${pad(x.getMonth() + 1)}.${x.getFullYear()}`;
}

export default function Shows() {
    useMetaTags({
        title: "Dogodki",
        description: "Preverite prihajajoče dogodke Zasedbe Kranjci.",
        path: "/shows"
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const toDate = (date: string) => {
        const when = new Date(date + "T00:00:00");
        when.setHours(0, 0, 0, 0);
        return when;
    };

    const upcoming = [...shows]
        .filter((s) => toDate(s.date) >= today)
        .sort((a, b) => toDate(a.date).getTime() - toDate(b.date).getTime());

    const past = [...shows]
        .filter((s) => toDate(s.date) < today)
        .sort((a, b) => toDate(b.date).getTime() - toDate(a.date).getTime());

    return (
        <div class="container">
            <h2>Nastopi zasedbe Kranjci</h2>
            <div class="shows-cards">
                <div class="card shows-card">
                    <h3 class="shows-section-title">Prihajajoči dogodki</h3>
                    {upcoming.length === 0 && <p class="muted">Trenutno ni napovedanih koncertov.</p>}
                    {upcoming.map((s) => (
                            <div class="show" key={`upcoming-${s.date}-${s.venue}`} id={`show-${s.date}`}>
                                <div>
                                    <div class="where">{s.city} · {s.venue}</div>
                                    <div class="when">{fmt(s.date)} · {s.time}</div>
                                    <p class="show-more" dangerouslySetInnerHTML={{ __html: s.more }} />
                                </div>
                            <div class="show-actions">
                                {s.link ? (
                                    <a class="btn" href={s.link} target="_blank" rel="noreferrer">Več o dogodku</a>
                                ) : null}
                            </div>
                        </div>
                    ))}
                </div>

                {past.length > 0 && (
                    <div class="card shows-card">
                        <h3 class="shows-section-title">Pretekli dogodki</h3>
                        {past.map((s) => (
                            <div class="show show--past" key={`past-${s.date}-${s.venue}`} id={`show-${s.date}`}>
                                <div>
                                    <div class="where">{s.city} · {s.venue}</div>
                                    <div class="when">{fmt(s.date)} · {s.time}</div>
                                    <p class="show-more" dangerouslySetInnerHTML={{ __html: s.more }} />
                                </div>
                                <div class="show-actions">
                                    {s.link ? (
                                        <a class="btn btn-secondary" href={s.link} target="_blank" rel="noreferrer">Več o dogodku</a>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
