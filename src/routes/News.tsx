import { Link } from "wouter-preact";
import { getAllPosts } from "../news/loader";
import { useMetaTags } from "../hooks/useMetaTags";
import { formatDisplayDateTime } from "../utils/date";

export default function News() {
    const posts = getAllPosts();
    useMetaTags({
        title: "Novice",
        description: "Utrinki, zgodbe in sveže novice Zasedbe Kranjci.",
        path: "/news"
    });
    return (
        <div class="container">
            <h2>Novice</h2>
            {posts.length === 0 && <p>Ni novic.</p>}
            <div class="news-grid">
                {posts.map(p => (
                    <article class="news-card" key={p.slug}>
                        {p.cover && (
                            <div class="news-card__media">
                                <img src={p.cover} alt="" class="news-cover" />
                            </div>
                        )}
                        <div class="news-card__body">
                            <h3><Link href={`/news/${p.slug}`}>{p.title}</Link></h3>
                            <div class="news-date">{formatDisplayDateTime(p.date, p.time)}</div>
                            {p.excerpt && <p>{p.excerpt}</p>}
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
