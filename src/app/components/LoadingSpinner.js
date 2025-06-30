"use client";

export default function LoadingSpinner({ size = "md", className = "" }) {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-8 h-8",
        lg: "w-12 h-12",
    };

    return (
        <div className={`flex justify-center items-center ${className}`}>
            <div
                className={`${sizeClasses[size] || sizeClasses.md
                    } animate-spin rounded-full border-4 border-gray-300 border-t-purple-600`}
            ></div>
        </div>
    );
}

export function SkeletonLoader({ type = "card", count = 1 }) {
    const renderSkeleton = () => {
        switch (type) {
            case "card":
                return (
                    <div className="bg-gray-800 p-4 rounded-lg animate-pulse">
                        <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                    </div>
                );
            case "text":
                return (
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                    </div>
                );
            case "avatar":
                return (
                    <div className="animate-pulse">
                        <div className="rounded-full bg-gray-700 h-10 w-10"></div>
                    </div>
                );
            default:
                return (
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                    </div>
                );
        }
    };

    return (
        <>
            {Array(count)
                .fill(0)
                .map((_, index) => (
                    <div key={index} className="mb-4">
                        {renderSkeleton()}
                    </div>
                ))}
        </>
    );
} 