import { useMetaTags } from "../hooks/useMetaTags";

const HISTORY_ENTRIES = [
    {
        year: "2025",
        events: ["Prenovljena spletna stran z novim oblikovanjem in vsebinami"]
    },
    {
        year: "2024",
        events: ["Zasedbi se pridruži odlična pevka Anea Mlinar"]
    },
    {
        year: "2023",
        events: ["Kranjci dobijo novo celostno podobo in logotip"]
    },
    {
        year: "2022",
        events: [
            "Zasedbi se pridruži odlična pevka Tanja Srednik",
            "Zasedbi se za krajši čas pridruži pevka Nina Virant",
            "Kranjci posnamejo priredbo in videospot skladbo Zaupanje"
        ]
    },
    {
        year: "2021",
        events: [
            "Zasedbi se pridruži multiinštrumentalist in vokalist Mitja Jeršič",
            "V začetku leta zaključijo dolgoletno sodelovanje z harmonikašem Rokom Kranjcem in razpišejo avdicijo za novega člana"
        ]
    },
    {
        year: "2020",
        events: [
            "Decembra za znano slovensko podjetje izvedejo streaming koncert",
            "Maja se jim pridruži pevka Maša Cilenšek",
            "Aprila v času prve karantene posnamejo video Dan najlepših sanj",
            "V Beartracks studiu posnamejo inštrumentalni album Izbrani slovenski inštrumentali"
        ]
    },
    {
        year: "2019",
        events: [
            "S pevko Neisho posnamejo skladbo in videospot Poročna",
            "Nastopijo na 25. gala koncertu Radia Ognjišče"
        ]
    },
    {
        year: "2018",
        events: ["Marec: turneja po Nemčiji", "Presežen mejnik 1600 nastopov in 600 porok"]
    },
    {
        year: "2017",
        events: [
            "Razširjeni zasedbi se pridruži pevka Barbara Grabar",
            "Presežen mejnik 1500 nastopov"
        ]
    },
    {
        year: "2016",
        events: [
            "Izdan CD Naša Slovenija (v živo iz Cankarjevega doma)",
            "Nastop na Filmskem večeru v Medvodah",
            "Zasedbi se pridružita tonski mojster Matej Jerele in pevka Lea Likar",
            "Presežen mejnik 1400 nastopov, 590 porok"
        ]
    },
    {
        year: "2015",
        events: [
            "Marec: turneja po Nemčiji",
            "Nastop v oddaji Slovenija ima talent (polfinale)",
            "Avtorstvo in izvedba koncerta Radio Ognjišče Gala 2015"
        ]
    },
    {
        year: "2014",
        events: [
            "Trio Kranjc se preimenuje v Zasedbo Kranjci",
            "Začne se cross-over zgodba s pevko",
            "Številni nastopi za poslovne naročnike, med odmevnejšimi IBM v GH Bernardin",
            "Zaposlijo stalnega tonskega mojstra Francija Zupančiča"
        ]
    },
    {
        year: "2013",
        events: [
            "Presežen mejnik 1000 nastopov",
            "Izid CD-ja DEMO, MI GA ŽGEMO inštrumentalnih skladb"
        ]
    },
    {
        year: "2012",
        events: [
            "Violinist Toni Anžlovar postane redni član in prevzame bas",
            "Intenzivna snemanja predstavitvenega CD-ja DEMO, MI GA ŽGEMO",
            "Zasedba live band obogati z vokalistko Štefico Stipančevič"
        ]
    },
    {
        year: "2010",
        events: [
            "Tolkalec Martin Oražem se pridruži zasedbi",
            "Ustanovitev Krantz Live benda z živim ritmom",
            "Miloš Simič se priključi kot violinist in kitarist"
        ]
    },
    {
        year: "2009",
        events: ["Martin Oražem prvič sodeluje s skupino kot ozvočevalec"]
    },
    {
        year: "2008",
        events: ["Pevki Mojca Sajovic in občasno Urška Brank obogatita vokalni del"]
    },
    {
        year: "2007",
        events: ["Marka Kranjca zaradi odhoda v tujino nadomestita Judita Karba in nato Andrej Eržen"]
    },
    {
        year: "2006",
        events: [
            "Igor Oražem se pridruži skupini, prevzame kontrabas in glavni vokal",
            "Pri plesni glasbi igra tudi solo kitaro"
        ]
    },
    {
        year: "2002",
        events: [
            "Nastanek Trio Kranjc – Marko in Rok Kranjc s kontrabasistom Sašom Debelcem",
            "Prvi nastop na poroki"
        ]
    }
];

export default function History() {
    useMetaTags({
        title: "Zgodovina",
        description: "Kronologija razvoja Zasedbe Kranjci od prvih nastopov do sodobne zasedbe.",
        path: "/history"
    });
    return (
        <div class="container">
            <h1>Zgodovina Kranjcev</h1>
            <p>
                Danes štiričlanska zasedba Kranjci je logična posledica rasti, ki se je začela leta 2002 z nastankom Tria Kranjc. Kronologija v nadaljevanju
                prikazuje ključne mejnike, ki so oblikovali našo zgodbo.
            </p>
            <div class="timeline">
                {HISTORY_ENTRIES.map((entry) => (
                    <section class="timeline-year" key={entry.year}>
                        <h2>{entry.year}</h2>
                        <ul>
                            {entry.events.map((evt) => (
                                <li key={evt}>{evt}</li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>
        </div>
    );
}
