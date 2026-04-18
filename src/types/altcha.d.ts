import "preact";

declare global {
    namespace preact.JSX {
        interface IntrinsicElements {
            "altcha-widget": {
                ref?: unknown;
                challenge?: string;
                name?: string;
                [key: string]: unknown;
            };
        }
    }
}
