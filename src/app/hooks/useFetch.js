import { useState, useEffect } from 'react';
import { getFromCache, setInCache, CACHE_DURATION } from '../utils/cache';

// Custom hook for data fetching with caching
export function useFetch(url, options = {}) {
    const {
        initialData = null,
        cacheDuration = CACHE_DURATION.MEDIUM,
        revalidateOnFocus = false,
        dedupingInterval = 2000,
        onSuccess,
        onError,
    } = options;

    const [data, setData] = useState(initialData);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!url) return;

        let isMounted = true;
        const controller = new AbortController();
        const { signal } = controller;

        const fetchData = async () => {
            setIsLoading(true);

            try {
                // Check cache first
                const cacheKey = `${url}`;
                const cachedData = getFromCache(cacheKey);

                if (cachedData) {
                    if (isMounted) {
                        setData(cachedData);
                        setIsLoading(false);
                        onSuccess?.(cachedData);
                    }
                    return;
                }

                // Fetch fresh data
                const response = await fetch(url, { signal });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const result = await response.json();

                if (isMounted) {
                    setData(result);
                    setInCache(cacheKey, result, cacheDuration);
                    onSuccess?.(result);
                }
            } catch (err) {
                if (err.name !== 'AbortError' && isMounted) {
                    console.error('Fetch error:', err);
                    setError(err.message);
                    onError?.(err);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchData();

        // Set up focus revalidation if enabled
        let focusHandler;
        if (revalidateOnFocus) {
            focusHandler = () => fetchData();
            window.addEventListener('focus', focusHandler);
        }

        return () => {
            isMounted = false;
            controller.abort();
            if (revalidateOnFocus && focusHandler) {
                window.removeEventListener('focus', focusHandler);
            }
        };
    }, [url, cacheDuration, revalidateOnFocus, dedupingInterval, onSuccess, onError]);

    return { data, error, isLoading };
}

export default useFetch; 