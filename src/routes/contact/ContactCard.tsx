import type { ComponentChildren } from "preact";

type ContactCardProps = {
    title: string;
    children: ComponentChildren;
};

export function ContactCard({ title, children }: ContactCardProps) {
    return (
        <section class="card contact-card">
            <h3>{title}</h3>
            {children}
        </section>
    );
}
