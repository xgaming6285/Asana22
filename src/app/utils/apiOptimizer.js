import { NextResponse } from 'next/server';

// Cache headers for different durations
export const CACHE_HEADERS = {
    NO_CACHE: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
    },
    SHORT: {
        'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=300',
    },
    MEDIUM: {
        'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=600',
    },
    LONG: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
};

// Helper function to create optimized API responses
export function createApiResponse(data, options = {}) {
    const {
        status = 200,
        headers = {},
        cachePolicy = 'NO_CACHE'
    } = options;

    const cacheHeaders = CACHE_HEADERS[cachePolicy] || CACHE_HEADERS.NO_CACHE;

    return NextResponse.json(data, {
        status,
        headers: {
            ...cacheHeaders,
            ...headers,
        },
    });
}

// Middleware to handle API errors consistently
export async function withErrorHandling(handler) {
    try {
        return await handler();
    } catch (error) {
        console.error('API Error:', error);

        // Determine appropriate status code based on error
        let status = 500;
        if (error.code === 'P2025') status = 404; // Prisma not found
        if (error.code === 'P2002') status = 409; // Prisma unique constraint
        if (error.code === 'P2003') status = 400; // Prisma foreign key constraint

        return NextResponse.json(
            {
                error: error.message || 'An unexpected error occurred',
                code: error.code
            },
            { status }
        );
    }
} 