import { Link } from "wouter-preact";
import { useMetaTags } from "../hooks/useMetaTags";

export default function NotFound() {
    useMetaTags({
        title: "Stran ni najdena",
        description: "Stran, ki jo iščete, ni na voljo. Vrnite se na prvo stran Zasedbe Kranjci."
    });
    return (
        <div class="container">
            <h2>404</h2>
            Strani ni mogoče najti.{" "}
            <Link href="/">Nazaj na prvo stran</Link>
        </div>
    );
}
