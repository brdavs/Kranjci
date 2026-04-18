import { Link } from "wouter-preact";
import { NAV_LINKS, SOCIAL_LINKS, SITE_BRAND } from "../constants/siteNavigation";

type SiteHeaderProps = {
    scrolled: boolean;
    useBurger: boolean;
    menuOpen: boolean;
    onToggleMenu: () => void;
    onCloseMenu: () => void;
};

export function SiteHeader({
    scrolled,
    useBurger,
    menuOpen,
    onToggleMenu,
    onCloseMenu
}: SiteHeaderProps) {
    return (
        <header role="banner">
            <nav class={`nav${scrolled ? " nav--compact" : ""}${useBurger ? " nav--burger" : ""}${menuOpen ? " nav--open" : ""}`}>
                <div class="brand">
                    <Link href="/" onClick={onCloseMenu} aria-label={SITE_BRAND.name} class="brand-link">
                        <span> </span>
                        <img src={SITE_BRAND.imagePath} alt={SITE_BRAND.name} class="brand-logo" />
                    </Link>
                </div>
                <button
                    type="button"
                    class="nav-toggle"
                    aria-expanded={menuOpen}
                    aria-label="Menu"
                    onClick={onToggleMenu}
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
                    {NAV_LINKS.map((item) =>
                        item.external ? (
                            <a
                                key={item.href}
                                href={item.href}
                                target="_blank"
                                rel="noreferrer"
                                onClick={onCloseMenu}
                            >
                                {item.label}
                            </a>
                        ) : (
                            <Link key={item.href} href={item.href} onClick={onCloseMenu}>{item.label}</Link>
                        )
                    )}
                </div>
            </nav>
            {useBurger && menuOpen && <div class="nav-overlay" onClick={onCloseMenu} />}
        </header>
    );
}
