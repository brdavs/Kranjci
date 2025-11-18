import { useEffect, useState } from "preact/hooks";
import { Route, Link, Switch } from "wouter-preact";
import Home from "./routes/Home";
import Shows from "./routes/Shows";
import Music from "./routes/Music";
import Contact from "./routes/Contact";
import News from "./routes/News";
import NewsPost from "./routes/NewsPost";
import Members from "./routes/Members";
import Member from "./routes/Member";
import History from "./routes/History";
import Clients from "./routes/Clients";
import NotFound from "./routes/NotFound";

const NAV_LINKS = [
    { href: "/news", label: "Novice" },
    { href: "/shows", label: "Dogodki" },
    { href: "/music", label: "Glasba" },
    { href: "/history", label: "Zgodovina" },
    { href: "/clients", label: "Reference" },
    { href: "/members", label: "Zasedba" },
    { href: "https://www.dropbox.com/scl/fi/z5xcb5zgyr9vm9v1js3e3/Repertoar-pub-od-2021.xlsx?dl=0&rlkey=ogc21615mybaomp72rg9ln61k", label: "Repertoar", external: true },
    { href: "/contact", label: "Kontakt" },
];

const SOCIAL_LINKS = [
    { href: "https://www.instagram.com/zasedbakranjci/", label: "Instagram", icon: "fa-brands fa-instagram" },
    { href: "https://www.facebook.com/kranjci.music/", label: "Facebook", icon: "fa-brands fa-facebook-f" },
    { href: "https://www.youtube.com/c/ZasedbaKranjci/", label: "YouTube", icon: "fa-brands fa-youtube" }
];

export function App() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isSmall, setIsSmall] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const update = () => {
            const width = window.innerWidth;
            const small = width < 900;
            const pastHero = window.scrollY > 120;
            setIsSmall((prev) => (prev === small ? prev : small));
            setScrolled((prev) => (prev === pastHero ? prev : pastHero));
        };
        update();
        window.addEventListener("resize", update);
        window.addEventListener("scroll", update, { passive: true });
        return () => {
            window.removeEventListener("resize", update);
            window.removeEventListener("scroll", update);
        };
    }, []);

    const useBurger = isSmall || scrolled;

    useEffect(() => {
        if (!useBurger) setMenuOpen(false);
    }, [useBurger]);

    useEffect(() => {
        if (typeof document === "undefined") return;
        if (useBurger) {
            document.body.style.overflow = menuOpen ? "hidden" : "";
            return () => {
                document.body.style.overflow = "";
            };
        }
        document.body.style.overflow = "";
        return undefined;
    }, [menuOpen, useBurger]);

    const toggleMenu = () => setMenuOpen((open) => !open);
    const closeMenu = () => setMenuOpen(false);

    return (
        <>
            <header role="banner">
                <nav class={`nav${scrolled ? " nav--compact" : ""}${useBurger ? " nav--burger" : ""}${menuOpen ? " nav--open" : ""}`}>
                    <div class="brand">
                        <Link href="/" onClick={closeMenu} aria-label="Zasedba Kranjci" class="brand-link"><span> </span>
                            <img src="/logos/logo_white.svg" alt="Zasedba Kranjci" class="brand-logo" />
                        </Link>
                    </div>
                    <button
                        type="button"
                        class="nav-toggle"
                        aria-expanded={menuOpen}
                        aria-label="Menu"
                        onClick={toggleMenu}
                    >
                        <span />
                    </button>
                    <div class={`nav-links${useBurger ? " nav-links--drawer" : ""}${menuOpen ? " is-open" : ""}`}>
                        <div class="nav-social">
                            {SOCIAL_LINKS.map((social) => (
                                <a key={social.href} href={social.href} target="_blank" rel="noreferrer" aria-label={social.label}>
                                    <i class={social.icon} aria-hidden="true" />
                                </a>
                            ))}
                        </div>
                        {NAV_LINKS.map((item) => (
                            item.external ? (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={closeMenu}
                                >
                                    {item.label}
                                </a>
                            ) : (
                                <Link key={item.href} href={item.href} onClick={closeMenu}>{item.label}</Link>
                            )
                        ))}
                    </div>
                </nav>
                {useBurger && menuOpen && <div class="nav-overlay" onClick={closeMenu} />}
            </header>

            <main id="main-content" role="main">
                <Switch>
                    <Route path="/" component={Home} />
                    <Route path="/shows" component={Shows} />
                    <Route path="/music" component={Music} />
                    <Route path="/contact" component={Contact} />
                    <Route path="/news" component={News} />
                    <Route path="/news/:slug" component={NewsPost} />
                    <Route path="/history" component={History} />
                    <Route path="/clients" component={Clients} />
                    <Route path="/members" component={Members} />
                    <Route path="/member/:slug" component={Member} />
                    <Route component={NotFound} />
                </Switch>
            </main>

            <footer role="contentinfo">
                <Link href="/" aria-label="Zasedba Kranjci" class="footer-brand">
                    <img src="/logos/logo_white.svg" alt="Zasedba Kranjci" class="brand-logo footer-logo" />
                </Link>
                <div>© {new Date().getFullYear()} Zasedba Kranjci · <a href="/contact">Kontakt</a></div>
            </footer>
        </>
    );
}
