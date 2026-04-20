import { useMetaTags } from "../hooks/useMetaTags";

export default function Privacy() {
    useMetaTags({
        title: "Politika zasebnosti",
        description: "Kako Zasedba Kranjci obdeluje osebne podatke pri kontaktnem obrazcu in prijavi na e-novice.",
        path: "/privacy"
    });

    return (
        <div class="container privacy-page">
            <h1>Politika zasebnosti</h1>
            <p>
                V Zasedbi Kranjci osebne podatke obdelujemo skrbno, zakonito in samo v obsegu, ki je potreben za komunikacijo,
                pripravo ponudb, izvedbo nastopov ter pošiljanje e-novic ob veljavni privolitvi.
            </p>

            <section>
                <h2>1. Upravljavec in kontakt</h2>
                <p>
                    Za vprašanja glede obdelave osebnih podatkov nas lahko kontaktirate na
                    {" "}<a href="mailto:booking@kranjci.si">booking@kranjci.si</a>.
                </p>
            </section>

            <section>
                <h2>2. Katere podatke zbiramo</h2>
                <ul>
                    <li>prek obrazca »PIŠITE NAM«: ime, e-poštni naslov in vsebino sporočila,</li>
                    <li>prek prijave na e-novice: ime, e-poštni naslov in podatek o podani privolitvi,</li>
                    <li>tehnične podatke, ki nastajajo ob uporabi spletne strani (npr. strežniški dnevniki).</li>
                </ul>
            </section>

            <section>
                <h2>3. Nameni in pravne podlage obdelave</h2>
                <ul>
                    <li>
                        <strong>Odgovor na povpraševanje in komunikacija:</strong> zakoniti interes za učinkovito poslovno komunikacijo
                        ter ukrepi pred sklenitvijo pogodbe.
                    </li>
                    <li>
                        <strong>Pošiljanje e-novic:</strong> privolitev posameznika (prijava je mogoča le ob izrecni privolitvi,
                        ki jo lahko kadarkoli prekličete).
                    </li>
                    <li>
                        <strong>Varnost in preprečevanje zlorab:</strong> zakoniti interes za zaščito spletne strani, obrazcev in
                        infrastrukture (vključno z zaščito proti neželeni pošti, npr. ALTCHA).
                    </li>
                </ul>
            </section>

            <section>
                <h2>4. Uporabniki podatkov in obdelovalci</h2>
                <p>
                    Podatke obdelujejo pooblaščene osebe Zasedbe Kranjci. Za tehnično delovanje lahko sodelujemo z zunanjimi
                    ponudniki gostovanja, e-poštne dostave (SMTP) in varnostnih rešitev. Podatke delimo samo v obsegu, ki je
                    nujen za izvedbo posameznega namena.
                </p>
            </section>

            <section>
                <h2>5. Hramba podatkov</h2>
                <p>
                    Podatke hranimo toliko časa, kot je potrebno za namen, zaradi katerega so bili zbrani, oziroma do preklica
                    privolitve (za e-novice), nato pa jih izbrišemo ali ustrezno anonimiziramo, razen če daljšo hrambo zahtevajo
                    veljavni predpisi.
                </p>
            </section>

            <section>
                <h2>6. Vaše pravice</h2>
                <p>
                    Imate pravico do dostopa do osebnih podatkov, popravka, izbrisa, omejitve obdelave, ugovora ter prenosljivosti
                    podatkov, kadar so za to izpolnjeni zakonski pogoji. Privolitev lahko kadarkoli prekličete brez vpliva na
                    zakonitost obdelave pred preklicem.
                </p>
                <p>
                    Če menite, da se vaši podatki obdelujejo v nasprotju s predpisi, lahko vložite pritožbo pri Informacijskem
                    pooblaščencu Republike Slovenije.
                </p>
            </section>

            <section>
                <h2>7. Posodobitve politike</h2>
                <p>
                    To politiko lahko občasno posodobimo zaradi sprememb zakonodaje ali načina delovanja spletne strani.
                    Na tej strani je vedno objavljena veljavna različica.
                </p>
            </section>
        </div>
    );
}
