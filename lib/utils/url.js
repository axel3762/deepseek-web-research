/** URL validation and normalization utilities. */
import { isIP } from 'node:net';
function isPrivateIpv4(h) {
    const p = h.split('.').map(Number);
    if (p.length !== 4 ||
        p.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
        return false;
    }
    return (p[0] === 10 ||
        p[0] === 127 ||
        (p[0] === 172 && p[1] >= 16 && p[1] <= 31) ||
        (p[0] === 192 && p[1] === 168) ||
        (p[0] === 169 && p[1] === 254) ||
        p[0] === 0 ||
        (p[0] === 100 && p[1] >= 64 && p[1] <= 127) ||
        (p[0] === 192 && p[1] === 0 && p[2] === 2) ||
        (p[0] === 198 && p[1] === 51 && p[2] === 100) ||
        (p[0] === 203 && p[1] === 0 && p[2] === 113) ||
        p[0] >= 224);
}
function isPrivateIpv6(h) {
    const x = h.toLowerCase();
    return (x === '::1' ||
        x === '::' ||
        x.startsWith('fc') ||
        x.startsWith('fd') ||
        x.startsWith('fe8') ||
        x.startsWith('fe9') ||
        x.startsWith('fea') ||
        x.startsWith('feb') ||
        x.startsWith('ff') ||
        x.startsWith('::ffff:127.') ||
        x.startsWith('::ffff:10.') ||
        x.startsWith('::ffff:192.168.'));
}
function isMetadataEndpoint(hostname) {
    const host = hostname.toLowerCase();
    return (host === '169.254.169.254' ||
        host === 'metadata.google.internal' ||
        host === 'instance-data.internal');
}
export function validateUrl(url, _maxRedirects = 5) {
    const urlString = url.trim();
    if (!urlString) {
        return {
            valid: false,
            error: 'INVALID_SCHEME',
        };
    }
    if (urlString.includes('@') && !urlString.startsWith('mailto:')) {
        return {
            valid: false,
            error: 'CREDENTIALS_IN_URL',
        };
    }
    try {
        const parsed = new URL(urlString);
        if (parsed.protocol !== 'http:' &&
            parsed.protocol !== 'https:') {
            return {
                valid: false,
                error: 'INVALID_SCHEME',
            };
        }
        const host = parsed.hostname.toLowerCase();
        if (!host) {
            return {
                valid: false,
                error: 'INVALID_SCHEME',
            };
        }
        return normalizeHostname(host).valid
            ? {
                valid: true,
                url: urlString,
            }
            : normalizeHostname(host);
    }
    catch {
        return {
            valid: false,
            error: 'INVALID_SCHEME',
        };
    }
}
export function normalizeHostname(hostname) {
    const lower = hostname
        .toLowerCase()
        .replace(/^\[|\]$/g, '');
    // Metadata endpoints must be checked before generic private-IP
    // detection so callers receive the more specific error.
    if (isMetadataEndpoint(lower)) {
        return {
            valid: false,
            error: 'METADATA_ENDPOINT',
        };
    }
    if (lower === 'localhost' ||
        lower === 'local' ||
        lower.endsWith('.localhost') ||
        lower.endsWith('.local')) {
        return {
            valid: false,
            error: 'LOCALHOST',
        };
    }
    const ip = isIP(lower);
    if (ip === 4 && isPrivateIpv4(lower)) {
        return {
            valid: false,
            error: 'PRIVATE_IP',
        };
    }
    if (ip === 6 && isPrivateIpv6(lower)) {
        return {
            valid: false,
            error: 'PRIVATE_IP',
        };
    }
    return {
        valid: true,
        url: hostname,
    };
}
export function normalizeUrl(url) {
    try {
        const parsed = new URL(url);
        const tracking = [
            'utm_source',
            'utm_medium',
            'utm_campaign',
            'utm_content',
            'utm_term',
            'gclid',
            'fbclid',
            'ref',
            'source',
        ];
        for (const key of tracking) {
            parsed.searchParams.delete(key);
        }
        if (parsed.pathname !== '/' &&
            parsed.pathname.endsWith('/')) {
            parsed.pathname = parsed.pathname.slice(0, -1);
        }
        return parsed.toString();
    }
    catch {
        return url;
    }
}
export function extractDomain(url) {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    }
    catch {
        return url;
    }
}
export function urlsAreEqual(a, b) {
    return normalizeUrl(a) === normalizeUrl(b);
}
//# sourceMappingURL=url.js.map