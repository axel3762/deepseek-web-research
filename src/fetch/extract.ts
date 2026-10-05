import { parseHTML } from 'linkedom';

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
 * Configuration for junk removal patterns.
 */
const JUNK_ELEMENTS = new Set([
  'script',
  'style',
  'noscript',
  'iframe',
  'nav',
  'footer',
  'header',
  'aside',
]);

const JUNK_CLASSES = [
  'ad',
  'advertisement',
  'adsbygoogle',
  'sidebar',
  'widget',
  'cookie',
  'tracker',
  'comment',
  'trackback',
  'feed',
  'flash',
];

/**
 * Extract the main content from an HTML document.
 */
export function extractContent(
  html: string,
  url: string,
  options?: ExtractOptions
): ExtractedContent | ExtractFailure {
  try {
    const { document: doc } = parseHTML(html);
    
    // Extract metadata first
    const metadata = extractMetadata(doc);
    
    // Get main content area
    let contentEl = extractMainContent(doc);
    
    if (!contentEl) {
      // Fallback to body
      contentEl = doc.body;
      
      if (!contentEl) {
        return {
          success: false,
          error: 'No content found in the page',
        };
      }
    }
    
    // Remove junk elements
    removeJunkElements(contentEl);
    
    // Clean up whitespace and text
    const cleanText = normalizeText(contentEl.textContent || '');
    
    // Apply character limit if specified
    const maxChars = options?.maxChars || 100000;
    const limitedContent = cleanText.length > maxChars 
      ? cleanText.substring(0, maxChars) + '\n\n[Content truncated]'
      : cleanText;
    
    return {
      success: true,
      title: metadata.title || url.split('/').pop() || 'Untitled',
      content: limitedContent,
      url,
      metadata: metadata.filterable,
    };
  } catch (error) {
  console.error('extractContent ERROR:', error);

  return {
    success: false,
    error: `Failed to extract content: ${
      error instanceof Error ? error.message : String(error)
    }`,
  };
}
}

/**
 * Extract metadata from the HTML document.
 */
function extractMetadata(doc: Document): { title?: string; filterable: Record<string, string>; all: Record<string, string> } {
  const all: Record<string, string> = {};
  const filterable: Record<string, string> = {};
  
  // Title tag
  const titleEl = doc.querySelector('title');
  if (titleEl) {
    const text = titleEl.textContent?.trim();
    if (text) {
      all.title = text;
      filterable.title = text;
    }
  }
  
  // Open Graph / Facebook
  extractMetaTag(doc, 'meta[property="og:title"]', 'title', filterable);
  extractMetaTag(doc, 'meta[property="og:description"]', 'description', filterable);
  extractMetaTag(doc, 'meta[property="og:image"]', 'image', all);
  extractMetaTag(doc, 'meta[property="og:url"]', 'canonicalUrl', all);
  
  // Twitter Card
  extractMetaTag(doc, 'meta[name="twitter:title"]', 'title', filterable);
  extractMetaTag(doc, 'meta[name="twitter:description"]', 'description', filterable);
  extractMetaTag(doc, 'meta[name="twitter:image"]', 'image', all);
  
  // Author (various locations)
  const metaAuthor = doc.querySelector('meta[name="author"]')?.getAttribute('content');
  if (metaAuthor) {
    filterable.author = metaAuthor;
    all.author = metaAuthor;
  }
  
  // Article-specific
  const articleTime = doc.querySelector('time[datetime]')?.getAttribute('datetime');
  if (articleTime) {
    filterable.publishedAt = articleTime;
    all.publishedAt = articleTime;
  }
  
  // Meta tags
  for (const meta of doc.querySelectorAll('meta')) {
    const name = meta.getAttribute('name');
    const property = meta.getAttribute('property');
    const content = meta.getAttribute('content');
    
    if (!content) continue;
    
    if ((name && ['description', 'author'].includes(name.toLowerCase())) || 
        (property && property.startsWith('og:'))) {
      const key = name || property || '';
      all[key] = content;
      filterable[key] = content;
    }
  }
  
  return { title: filterable.title, filterable, all };
}

/**
 * Extract a meta tag value.
 */
function extractMetaTag(doc: Document, selector: string, key: string, target: Record<string, string>) {
  const el = doc.querySelector(selector);
  if (el) {
    const content = el.getAttribute('content');
    if (content) {
      target[key] = content;
    }
  }
}

/**
 * Find and return the main content element.
 */
function extractMainContent(doc: Document): Element | null {
  // Priority order for finding main content
  
  // 1. Article tag
  const article = doc.querySelector('article');
  if (article) return article;
  
  // 2. Main tag
  const main = doc.querySelector('main');
  if (main) return main;
  
  // 3. Div with common content class names
  for (const selector of [
    '.content',
    '.entry-content',
    '.post-content',
    '#content',
    '#main-content',
    '.article',
    '.article-content',
  ]) {
    const el = doc.querySelector(selector);
    if (el) return el;
  }
  
  // 4. Largest block-level element with text content
  let largest: Element | null = null;
  let maxTextLength = 0;
  
  for (const el of doc.querySelectorAll('div, section, p, article')) {
    if (el.classList.contains('skip-link') || el.id === 'bottom-navigation') continue;
    
    const textNodes = Array.from(el.childNodes).filter(n => n.nodeType === 3);
    const textLength = textNodes.reduce((sum, node) => sum + (node.textContent?.length || 0), 0);
    
    if (textLength > maxTextLength && textLength > 100) {
      maxTextLength = textLength;
      largest = el;
    }
  }
  
  return largest;
}

/**
 * Remove junk elements from the document.
 */
function removeJunkElements(element: Element | Document): void {
  const all = Array.from((element as Document).querySelectorAll('*'));
  
  for (const el of all) {
    // Check tag name
    if (JUNK_ELEMENTS.has(el.tagName.toLowerCase())) {
      el.remove();
      continue;
    }
    
    // Check class names
    const className = (el.className || '').toLowerCase().trim();
    if (JUNK_CLASSES.some(c => className.includes(c))) {
      el.remove();
      continue;
    }
    
    // Remove empty elements
    if (!el.textContent?.trim() && !el.children.length) {
      el.remove();
    }
  }
}

/**
 * Normalize text content by removing excessive whitespace and junk.
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  
  // Remove script/style tags that might have leaked in
  const sanitized = text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Normalize whitespace
  return sanitized
    .replace(/\s+/g, ' ')
    .replace(/^\s+|\s+$/g, '');
}

/**
 * Clean up URLs in the content (remove tracking parameters).
 */
export function cleanUrls(content: string): string {
  const urlRegex = /https?:\/\/[^\s'\")]+/g;
  
  return content.replace(urlRegex, (match) => {
    try {
      const urlObj = new URL(match);
      
      // Remove tracking parameters
      for (const param of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid']) {
        if (urlObj.searchParams.has(param)) {
          urlObj.searchParams.delete(param);
        }
      }
      
      return urlObj.toString();
    } catch {
      // If URL is invalid, keep it as-is
      return match;
    }
  });
}
