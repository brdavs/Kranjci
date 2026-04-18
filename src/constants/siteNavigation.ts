export type NavItem = {
    href: string;
    label: string;
    external?: boolean;
};

export type SocialLink = {
    href: string;
    label: string;
    icon: string;
};

export const NAV_LINKS: NavItem[] = [
    { href: "/news", label: "Novice" },
    { href: "/shows", label: "Dogodki" },
    { href: "/music", label: "Glasba" },
    { href: "/history", label: "Zgodovina" },
    { href: "/clients", label: "Reference" },
    { href: "/members", label: "Zasedba" },
    {
        href: "https://www.dropbox.com/scl/fi/z5xcb5zgyr9vm9v1js3e3/Repertoar-pub-od-2021.xlsx?dl=0&rlkey=ogc21615mybaomp72rg9ln61k",
        label: "Repertoar",
        external: true
    },
    { href: "/contact", label: "Kontakt" }
];

export const SOCIAL_LINKS: SocialLink[] = [
    { href: "https://www.instagram.com/zasedbakranjci/", label: "Instagram", icon: "fa-brands fa-instagram" },
    { href: "https://www.facebook.com/kranjci.music/", label: "Facebook", icon: "fa-brands fa-facebook-f" },
    { href: "https://www.youtube.com/c/ZasedbaKranjci/", label: "YouTube", icon: "fa-brands fa-youtube" }
];

export const SITE_BRAND = {
    imagePath: "/logos/logo_white.svg",
    name: "Zasedba Kranjci",
    contactPath: "/contact"
};
