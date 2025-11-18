function stripExtension(path: string): string {
    return path.replace(/\.(avif|webp|jpe?g|png)$/i, "");
}

export function getMemberImageSources(photo: string): { avif: string; jpeg: string } {
    const base = stripExtension(photo);
    return {
        avif: `${base}.avif`,
        jpeg: `${base}.jpg`
    };
}
