/**
 * HTML content extraction utilities.
 * Removes junk and extracts the main article content.
 */
export interface ExtractOptions {
    /** Maximum characters to extract. */
    maxChars?: number;
    /** Keep internal links. */
    keepInternalLinks?: boolean;
}
export interface ExtractedContent {
    success: true;
    title: string;
    content: string;
    url: string;
    metadata?: {
        author?: string;
        publishedAt?: string;
        description?: string;
        image?: string;
        [key: string]: string | undefined;
    };
}
export interface ExtractFailure {
    success: false;
    error: string;
}
/**
 * Extract the main content from an HTML document.
 */
export declare function extractContent(html: string, url: string, options?: ExtractOptions): ExtractedContent | ExtractFailure;
/**
 * Normalize text content by removing excessive whitespace and junk.
 */
export declare function normalizeText(text: string): string;
/**
 * Clean up URLs in the content (remove tracking parameters).
 */
export declare function cleanUrls(content: string): string;
//# sourceMappingURL=extract.d.ts.map