"use client";

import { PricingTable } from "@clerk/nextjs";
import { useRouter } from "next/navigation";


function BackButtonHeader() {
    const router = useRouter();
    return (
        <header className="lg:hidden bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center">
            <button
                onClick={() => router.back()}
                className="text-gray-400 hover:text-white p-2 rounded-md transition-colors mr-2"
                aria-label="Go back"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <h1 className="text-lg font-semibold text-white truncate">Subscriptions</h1>
        </header>
    );
}


export default function PricingPage() {
    return (
        <div className="bg-gray-900 text-white min-h-screen">

            <BackButtonHeader />

            <div className="p-4 sm:p-6 lg:p-8 space-y-8">
                <header className="mb-4 text-center">
                    <h1 className="text-4xl font-bold text-gray-100">Choose Your Plan</h1>
                    <p className="mt-2 text-lg text-gray-400">
                        Select the plan that best fits your needs.
                    </p>
                </header>

                <div className="max-w-5xl mx-auto">
                    {typeof PricingTable === "function" ? (
                        <PricingTable />
                    ) : (
                        <div className="bg-gray-800 p-10 rounded-xl shadow-lg text-center">
                            <p className="text-red-400 text-xl">
                                PricingTable component not loaded correctly.
                            </p>
                            <p className="text-gray-300 mt-2">
                                Please check the import path for PricingTable from Clerk&apos;s
                                documentation.
                            </p>
                            <p className="text-gray-500 text-sm mt-1">
                                It might be from &ldquo;@clerk/nextjs&rdquo; or a subpath of
                                &ldquo;@clerk/elements&rdquo;.
                            </p>
                        </div>
                    )}
                </div>

                <p className="text-center mt-8 text-sm text-gray-400">
                    You can manage your subscription anytime from your user profile.
                </p>
            </div>
        </div>
    );
}