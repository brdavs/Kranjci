export function toErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "Napaka pri pošiljanju.";
}
