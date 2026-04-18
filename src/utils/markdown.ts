import { marked } from "marked";
import DOMPurify from "dompurify";

function sanitizeHtml(html: string): string {
    if (typeof DOMPurify.sanitize === "function") {
        return DOMPurify.sanitize(html);
    }
    return html;
}

// Converts Markdown text to sanitized HTML once per string.
export function markdownToHtml(markdown = ""): string {
    const raw = marked.parse(markdown) as string;
    return sanitizeHtml(raw);
}
