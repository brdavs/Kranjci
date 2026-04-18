import { useEffect, useState } from "preact/hooks";

export function useSiteNavigation() {
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

    return {
        menuOpen,
        scrolled,
        useBurger,
        toggleMenu,
        closeMenu
    };
}
