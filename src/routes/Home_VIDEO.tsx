import { useEffect, useRef, useState } from "preact/hooks";
import { Link } from "wouter-preact";
import { shows, type Show } from "../data/shows";
import { getAllPosts } from "../news/loader";
import { formatDisplayDate } from "../utils/date";

const HERO_VIDEO_SOURCES = [
    { src: "/media/bg_720.mp4", type: "video/mp4" },
    { src: "/media/bg_720.webm", type: "video/mp4" }
] as const;
const HERO_POSTER_SMALL = "/media/poster-small.webp";
const HERO_POSTER_FULL = "/media/poster.webp";

function getUpcomingShows(): Show[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return [...shows]
        .filter((show) => {
            const when = new Date(show.date);
            when.setHours(0, 0, 0, 0);
            return show.type === "open" && when >= today;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3);
}

export default function Home() {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const posterRef = useRef<HTMLImageElement | null>(null);
    const [videoActive, setVideoActive] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);

    const upcoming = getUpcomingShows();
    const sortedShows = [...shows].sort((a, b) => a.date.localeCompare(b.date));
    const fallbackShow = sortedShows.length > 0 ? sortedShows[sortedShows.length - 1] : undefined;
    const highlight = upcoming[0] ?? fallbackShow;
    const highlightAnchor = highlight ? `show-${highlight.date}` : undefined;
    const highlightLinkTarget = highlight?.link ?? (highlightAnchor ? `/shows#${highlightAnchor}` : "/shows");
    const posts = getAllPosts().slice(0, 2);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const timer = window.setTimeout(() => setVideoActive(true), 400);
        return () => window.clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const img = new Image();
        img.src = HERO_POSTER_FULL;
        img.onload = () => {
            if (posterRef.current) posterRef.current.src = HERO_POSTER_FULL;
            if (videoRef.current) videoRef.current.poster = HERO_POSTER_FULL;
        };
        return () => {
            img.onload = null;
        };
    }, []);

    useEffect(() => {
        if (!videoActive) return;
        const video = videoRef.current;
        if (!video) return;
        const tryPlay = () => video.play().catch(() => undefined);
        if (video.readyState >= 2) {
            tryPlay();
            return;
        }
        video.addEventListener("canplay", tryPlay, { once: true });
        return () => video.removeEventListener("canplay", tryPlay);
    }, [videoActive]);

    const handleLoadedData = () => setVideoLoaded(true);

    return (
        <div class="home">
            <section class="home-hero">
                <div class="hero-media">
                    <img
                        ref={posterRef}
                        class="hero-poster"
                        src={HERO_POSTER_SMALL}
                        alt=""
                        aria-hidden="true"
                        loading="eager"
                    />
                    <video
                        ref={videoRef}
                        class={`hero-video${videoLoaded ? " is-loaded" : ""}`}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="none"
                        poster={HERO_POSTER_SMALL}
                        onLoadedData={handleLoadedData}
                    >
                        {videoActive && HERO_VIDEO_SOURCES.map((source) => (
                            <source key={source.src} src={source.src} type={source.type} />
                        ))}
                        Your browser does not support the video tag.
                    </video>
                </div>
                <div class="container hero-grid">
                    <div class="hero-content">
                        <header class="hero-heading">
                            <img class="hero-logo" src="/logos/logo_white.svg" alt="Zasedba Kranjci" />
                        </header>
                        {highlight && (
                            <aside class="hero-card">
                                <p class="hero-card__label">Naslednja prireditev</p>
                                <h3>{highlight.city} · {highlight.venue}</h3>
                                <p class="hero-card__date">{formatDisplayDate(highlight.date)} ob {highlight.time}</p>
                                <p class="hero-card__meta" dangerouslySetInnerHTML={{ __html: highlight.more }} />
                                <div class="hero-card__actions">
                                    {highlight.link ? (
                                        <a class="btn" href={highlight.link} target="_blank" rel="noreferrer">Več o dogodku</a>
                                    ) : (
                                        <Link class="btn btn-secondary" href={highlightLinkTarget}>Vsi dogodki</Link>
                                    )}
                                </div>
                            </aside>
                        )}
                        <p class="hero-lead">
                            Zasedba Kranjci prinaša energijo, ki napolni vsak oder in plesišče od intimnih porok ali poslovnih zabav do velikih gala prireditev.<br/>Neverjeten repertoar znanih ter popularnih skladb vseh žanrov v akustični ali plesno / pevski izvedbi.
                        </p>
                        <div class="hero-cta">
                            <a class="btn" href="/contact">
                                Stopi v stik
                            </a>
                            <a class="btn btn-secondary" href="/music">Poslušaj nas</a>
                        </div>
                        <dl class="hero-stats">
                            <div>
                                <dt>20+</dt>
                                <dd>let delovanja</dd>
                            </div>
                            <div>
                                <dt>1500+</dt>
                                <dd>Nastopov</dd>
                            </div>
                            <div>
                                <dt>750+</dt>
                                <dd>poročnih zabav</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </section>

            <section class="home-section">
                <div class="container">
                    <header class="section-header">
                        <p class="section-eyebrow">Zasedba Kranjci</p>
                        <h2>Glasba vsega sveta v vsako srce</h2>
                        <p>Kranjci z izkušnjami in repertoarjem ki sega skozi vsa glasbena obdobja in sloge popestrimo vsak dogodek in razveselimo vsak okus.</p>
                    </header>
                    <div class="feature-grid">
                        <article class="feature-card">
                            <h3>Proke in obletnice</h3>
                            <p>Z več kot sedemsto uspešnimi poročnimi slavji smo Kranjci prava izbira tako za tiho, nevsiljivo glasbeno spremljavo kot za vesel, plesno obarvan večer.</p>
                        </article>
                        <article class="feature-card">
                            <h3>Poslovni dogodki in zabave</h3>
                            <p>Od intimnih akustičnih spremljav do velikih "sindikalnih žurov" z več tisoč gosti. Kranjci smo pripravljeni in opremljeni za vse.</p>
                        </article>
                        <article class="feature-card">
                            <h3>Koncerti, festivali, klubi</h3>
                            <p>Povezava z občinstvom in glasbena popotovanja po času in svetu. Tematski dogodki in zabave. Vse in še več.</p>
                        </article>
                    </div>
                </div>
            </section>

            <section class="parallax-block parallax-block--one">
                <div class="container parallax-inner">
                    <p class="section-eyebrow">Violina, harmonika, kontrabas, cajon</p>
                    <h2>Akustični kvartet</h2>
                    <p class="parallax-text">
                        Akustični kvartet Zasedbe Kranjci prinaša drugačno doživetje glasbe z intimno in prefinjeno zvočno sliko. Znane melodije v novi, nepričakovanih izvedbah.<br/><br/>
                        Kranjci lahko v kvartetu za manjše družbe in koncerte nastopamo neozvočeni, akustične inštrumente pa lahko seveda tudi ozvočimo.<br/><br/>
                        Popolna izbira za sprejeme na porokah, gala večerje, vinske degustacije in druge posebne priložnosti.
                    </p>
                    <p class="parallax-text"></p>
                    <div class="parallax-actions">
                        <Link class="btn btn-secondary" href="/music">Poslušaj nas</Link>
                    </div>
                </div>
            </section>

            <section class="home-section home-section--alt">
                <div class="container">
                    <header class="section-header">
                        <div>
                            <p class="section-eyebrow">Naslednji termini</p>
                            <h2>Dogodki, ki jih nočete zamuditi</h2>
                        </div>
                        <Link class="section-link" href="/shows">Vsi dogodki</Link>
                    </header>
                    <div class="upcoming-grid">
                        {upcoming.length === 0 && (
                            <p class="muted">Trenutno ni napovedanih koncertov. Ostanite na vezi!</p>
                        )}
                        {upcoming.map((show) => (
                            <article class="upcoming-card" key={show.date + show.venue}>
                                <p class="upcoming-date">{fmtDate(show.date)}</p>
                                <h3>{show.city}</h3>
                                <p class="upcoming-venue">{show.venue}</p>
                                <div class="upcoming-actions">
                                    {show.link ? (
                                        <a class="btn" href={show.link} target="_blank" rel="noreferrer">Vstopnice</a>
                                    ) : (
                                        <Link class="btn btn-secondary" href="/contact">Povpraševanje</Link>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section class="parallax-block parallax-block--two">
                <div class="container parallax-inner">
                    <p class="section-eyebrow">Vokali, kitara, klaviature, bobni in bas kitara</p>
                    <h2>Pevsko plesna zasedba</h2>
                    <p class="parallax-text">
                        V tej zasedbi Kranjci zamenjamo akustične inštrumente za električne, pridruži pa se name še ena od pevk - pevka Anea Mlinar, Tanja Srednik, Štefica Grasselli ali Maša Cilenšek.<br/><br/>
                        Z vrhunskim ozvočenjem, svetlobno tehniko ter tonskim in svetlobnim inženirjem lahko dvignemo na noge vsako občinstvo.<br/><br/>
                        Popolna izbira za poročne žure, manjše in večje koncerte, zabave, ali plesne dogodke.
                    </p>
                    <div class="parallax-actions">
                        <Link class="btn btn-secondary" href="/news">Oglej si utrinke</Link>
                    </div>
                </div>
            </section>

            <section class="home-section">
                <div class="container">
                    <header class="section-header">
                        <div>
                            <p class="section-eyebrow">Sveže z odra in iz ozadja</p>
                            <h2>Novice</h2>
                        </div>
                        <Link class="section-link" href="/news">Vse novice</Link>
                    </header>
                    <div class="news-grid">
                        {posts.length === 0 && (
                            <p class="muted">Trenutno ni novic. Pripravljamo nekaj posebnega.</p>
                        )}
                        {posts.map((post) => (
                            <article class="news-card" key={post.slug}>
                                <p class="news-date">{post.date}</p>
                                <h3>
                                    <Link href={`/news/${post.slug}`}>{post.title}</Link>
                                </h3>
                                {post.excerpt && <p>{post.excerpt}</p>}
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section class="home-section home-cta">
                <div class="container cta-inner">
                    <div>
                        <p class="section-eyebrow">Kontakt in povpraševanje</p>
                        <h2>Potrebujete glasbeno skupino, ki dvigne vzdušje in navduši goste?</h2>
                        <p>Pripravimo načrt za vaš dogodek, uskladimo tehniko glede na potrebe, in pustimo nepozaben vtis.</p>
                    </div>
                    <div class="cta-actions">
                        <a class="btn" href="/contact">Stopite v stik</a>
                        <Link class="btn btn-secondary" href="/members">Spoznajte zasedbo</Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
