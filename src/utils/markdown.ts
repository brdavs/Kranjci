import { marked } from "marked";
import DOMPurify from "dompurify";

// Converts Markdown text to sanitized HTML once per string.
export function markdownToHtml(markdown = ""): string {
    const raw = marked.parse(markdown) as string;
    return DOMPurify.sanitize(raw);
}
