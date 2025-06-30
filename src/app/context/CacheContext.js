"use client";

import { createContext, useContext, useCallback } from 'react';
import { getFromCache, setInCache, invalidateCache, clearCache } from '../utils/cache';

const CacheContext = createContext({
    getFromCache: () => null,
    setInCache: () => { },
    invalidateCache: () => { },
    clearCache: () => { },
});

export function CacheProvider({ children }) {
    const getCachedData = useCallback((key) => {
        return getFromCache(key);
    }, []);

    const setCachedData = useCallback((key, data, duration) => {
        setInCache(key, data, duration);
    }, []);

    const invalidateCachedData = useCallback((keyPattern) => {
        invalidateCache(keyPattern);
    }, []);

    const clearCachedData = useCallback(() => {
        clearCache();
    }, []);

    return (
        <CacheContext.Provider
            value={{
                getFromCache: getCachedData,
                setInCache: setCachedData,
                invalidateCache: invalidateCachedData,
                clearCache: clearCachedData,
            }}
        >
            {children}
        </CacheContext.Provider>
    );
}

export function useCache() {
    return useContext(CacheContext);
} 