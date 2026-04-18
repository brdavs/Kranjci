import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [
        preact({
            prerender: {
                enabled: true,
                renderTarget: "#app",
                prerenderScript: path.resolve(rootDir, "src/prerender.tsx"),
                additionalPrerenderRoutes: [
                    "/",
                    "/shows",
                    "/music",
                    "/history",
                    "/clients",
                    "/members",
                    "/contact"
                ]
            }
        })
    ],
    server: {
        allowedHosts: ["mufassa"],
    },
});
