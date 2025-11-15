import { useMetaTags } from "../hooks/useMetaTags";

export default function Music() {
    useMetaTags({
        title: "Glasba",
        description: "Oglejte si videe, koncertne posnetke in seznam skladb Zasedbe Kranjci.",
        path: "/music"
    });
    return (
        <div class="container">
            <h2>Glasba</h2>
            <div class="grid">
                <div class="card" style="grid-column: span 12;">
                    <h3>Video</h3>
                    <div class="music-embeds">
                        <iframe
                            src="https://www.youtube.com/embed/IQePgtxzGpI?list=RDIQePgtxzGpI&start_radio=1"
                            title="Kranjci – live nastop"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                        ></iframe>
                        <iframe
                            src="https://www.youtube.com/embed/rHeUhOjI01M?list=RDrHeUhOjI01M&start_radio=1"
                            title="Kranjci – koncert"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                        ></iframe>
                        <iframe
                            src="https://www.youtube.com/embed/NwP3pmBeX8g?list=RDNwP3pmBeX8g&start_radio=1"
                            title="Kranjci – sodelovanje z Neisho"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                        ></iframe>
                        <iframe
                            src="https://www.youtube.com/embed/gLVPEYvDylY?list=RDgLVPEYvDylY&start_radio=1"
                            title="Kranjci – dodatni miks"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                        ></iframe>
                        <iframe
                            src="https://www.youtube.com/embed/-hGYLaLqdXc"
                            title="Kranjci – dodatni video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                        ></iframe>
                        <iframe
                            src="https://www.youtube.com/embed/8Vu5Vqqra6w?list=RD8Vu5Vqqra6w&start_radio=1"
                            title="Kranjci – dodatni miks 2"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                        ></iframe>
                    </div>
                </div>

                <div class="card" style="grid-column: span 12;">
                    <h3>Akustika</h3>
                    <div class="music-embeds">
                        <iframe
                            src="https://www.youtube.com/embed/2fu9So4WVyY?list=RD2fu9So4WVyY&start_radio=1"
                            title="Akustika – 2fu9So4WVyY"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                        ></iframe>
                        <iframe
                            src="https://www.youtube.com/embed/GciCHh8oe7c"
                            title="Akustika – GciCHh8oe7c"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                        ></iframe>
                        <iframe
                            src="https://www.youtube.com/embed/eeoz5_edrMc"
                            title="Akustika – eeoz5_edrMc"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                        ></iframe>
                        <iframe
                            src="https://www.youtube.com/embed/m3RANP-RhBg"
                            title="Akustika – m3RANP-RhBg"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                        ></iframe>
                    </div>
                </div>
                <div class="card" style="grid-column: span 12;">
                    <h3>V živo</h3>
                    <div class="music-embeds">
                        <iframe
                            src="https://www.youtube.com/embed/BrqWJs_IKmc"
                            title="V živo – BrqWJs_IKmc"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                        ></iframe>
                        <iframe
                            src="https://www.youtube.com/embed/3KImbHBltbo"
                            title="V živo – 3KImbHBltbo"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                        ></iframe>
                        <iframe
                            src="https://www.youtube.com/embed/ckD9Xo-m0eg"
                            title="V živo – ckD9Xo-m0eg"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                        ></iframe>
                        <iframe
                            src="https://www.youtube.com/embed/yItTRNhwpbE"
                            title="V živo – yItTRNhwpbE"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                        ></iframe>
                    </div>
                </div>
                <div class="card" style="grid-column: span 12;">
                    <h3>SoundCloud</h3>
                    <iframe
                        class="embed embed--list"
                        title="Zasedba Kranjci – Gala koncert 2016"
                        src="https://w.soundcloud.com/player/?visual=true&url=https%3A%2F%2Fapi.soundcloud.com%2Fplaylists%2F224355296&show_artwork=true&maxheight=640&maxwidth=640"
                        allow="autoplay"
                        loading="lazy"
                    ></iframe>
                    <iframe
                        class="embed embed--list"
                        title="Zasedba Kranjci – Instrumental"
                        src="https://w.soundcloud.com/player/?visual=true&url=https%3A%2F%2Fapi.soundcloud.com%2Fplaylists%2F19318810&show_artwork=true&maxheight=960&maxwidth=640"
                        allow="autoplay"
                        loading="lazy"
                    ></iframe>
                </div>
            </div>
        </div>
    );
}
