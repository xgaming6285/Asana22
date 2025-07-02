"use client";

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

function CustomPricingTable() {
    return (
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
                <h3 className="text-2xl font-bold text-white mb-4">Basic</h3>
                <div className="text-4xl font-bold text-white mb-6">
                    $9<span className="text-lg text-gray-400">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                    <li className="flex items-center text-gray-300">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Up to 3 projects
                    </li>
                    <li className="flex items-center text-gray-300">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        10 team members
                    </li>
                    <li className="flex items-center text-gray-300">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Basic support
                    </li>
                </ul>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                    Choose Basic
                </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-gray-800 rounded-xl p-8 border-2 border-blue-500 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">Most Popular</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Pro</h3>
                <div className="text-4xl font-bold text-white mb-6">
                    $29<span className="text-lg text-gray-400">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                    <li className="flex items-center text-gray-300">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Unlimited projects
                    </li>
                    <li className="flex items-center text-gray-300">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        50 team members
                    </li>
                    <li className="flex items-center text-gray-300">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Priority support
                    </li>
                    <li className="flex items-center text-gray-300">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Advanced analytics
                    </li>
                </ul>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                    Choose Pro
                </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
                <h3 className="text-2xl font-bold text-white mb-4">Enterprise</h3>
                <div className="text-4xl font-bold text-white mb-6">
                    $99<span className="text-lg text-gray-400">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                    <li className="flex items-center text-gray-300">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Unlimited everything
                    </li>
                    <li className="flex items-center text-gray-300">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Unlimited team members
                    </li>
                    <li className="flex items-center text-gray-300">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        24/7 dedicated support
                    </li>
                    <li className="flex items-center text-gray-300">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Custom integrations
                    </li>
                </ul>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                    Contact Sales
                </button>
            </div>
        </div>
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

                <CustomPricingTable />

                <p className="text-center mt-8 text-sm text-gray-400">
                    You can manage your subscription anytime from your user profile.
                </p>
            </div>
        </div>
    );
}