// Simple in-memory cache implementation
const cache = new Map();

export const CACHE_DURATION = {
    SHORT: 1000 * 60 * 5, // 5 minutes
    MEDIUM: 1000 * 60 * 30, // 30 minutes
    LONG: 1000 * 60 * 60 * 24, // 24 hours
};

export function getFromCache(key) {
    const item = cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
        cache.delete(key);
        return null;
    }

    return item.data;
}

export function setInCache(key, data, duration = CACHE_DURATION.MEDIUM) {
    cache.set(key, {
        data,
        expiry: Date.now() + duration,
    });
}

export function invalidateCache(keyPattern) {
    if (keyPattern instanceof RegExp) {
        for (const key of cache.keys()) {
            if (keyPattern.test(key)) {
                cache.delete(key);
            }
        }
    } else {
        cache.delete(keyPattern);
    }
}

export function clearCache() {
    cache.clear();
} 