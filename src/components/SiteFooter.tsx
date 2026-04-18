import { Link } from "wouter-preact";
import { SITE_BRAND } from "../constants/siteNavigation";

export function SiteFooter() {
    return (
        <footer role="contentinfo">
            <Link href="/" aria-label={SITE_BRAND.name} class="footer-brand">
                <img src={SITE_BRAND.imagePath} alt={SITE_BRAND.name} class="brand-logo footer-logo" />
            </Link>
            <div>© {new Date().getFullYear()} {SITE_BRAND.name} · <a href={SITE_BRAND.contactPath}>Kontakt</a></div>
        </footer>
    );
}
