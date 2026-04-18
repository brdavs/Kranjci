export type DirectContact = {
    name: string;
    phone: string;
};

export type CompanyInfo = {
    name: string;
    address: string[];
    tax: string;
    iban: string;
    swift: string;
};

export type StageSetup = {
    label: string;
    size: string;
};

export const DIRECT_CONTACTS: DirectContact[] = [
    { name: "Igor Oražem", phone: "+386 41 577 893" },
    { name: "Martin Oražem", phone: "+386 31 635 987" },
    { name: "Toni Anžlovar", phone: "+386 41 900 855" },
    { name: "Mitja Jeršič", phone: "+386 40 540 852" }
];

export const COMPANIES: CompanyInfo[] = [
    {
        name: "Artisan, umetniško ustvarjanje, Igor Oražem s.p.",
        address: ["Albrehtova ulica 88a, 1291 Škofljica", "1291 Škofljica"],
        tax: "SI46666974",
        iban: "SI56 6100 0001 1797 196 · Delavska hranilnica d.d.",
        swift: "HDELSI22"
    },
    {
        name: "Formalibre d.o.o.",
        address: ["Brodarjev trg 7", "1000 Ljubljana"],
        tax: "SI21653917",
        iban: "LT57 3250 0081 0606 2936 · Revolut Business",
        swift: "RETBLT21XXX"
    },
    {
        name: "Martin Oražem s.p.",
        address: ["Prigorica 97a", "1331 Dolenja vas"],
        tax: "89112130 (ni davčni zavezanec)",
        iban: "SI56 6100 0000 5742 068 · Delavska hranilnica d.d.",
        swift: "HDELSI22"
    },
    {
        name: "Umetniško uprizarjanje, Mitja Jeršič s.p.",
        address: ["Ulica Mirkota Roglja 3", "4270 Jesenice"],
        tax: "71851569 (ni davčni zavezanec)",
        iban: "SI56 6100 0001 1339 647 · Delavska hranilnica d.d.",
        swift: "HDELSI22"
    }
];

export const STAGE_SETUPS: StageSetup[] = [
    { label: "Inštrumentalna zasedba Kranjci", size: "8 m²" },
    { label: "Koncertna »Cross-over« zasedba Kranjci", size: "14 m²" },
    { label: "Pevsko plesna »live band« zasedba Kranjci", size: "20 m²" }
];
