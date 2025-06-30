"use client";

import { useState } from "react";
import Link from "next/link";
import {
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
} from "@clerk/nextjs";

// Enhanced Mobile Navigation Component
function MobileMenu({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            {/* Enhanced Backdrop with blur */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300"
                onClick={onClose}
            />

            {/* Enhanced Mobile menu panel with glass morphism */}
            <div className="fixed top-0 right-0 w-80 h-full bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl transform transition-all duration-300 overflow-y-auto custom-scrollbar">
                {/* Enhanced Header */}
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-xl"></div>
                    <div className="relative flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-gray-800/50 to-gray-900/50">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                                <span className="text-white text-sm font-bold">M</span>
                            </div>
                            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                Menu
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white p-2 rounded-lg transition-all duration-200 hover:bg-white/10 hover:scale-110"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Enhanced Navigation */}
                <nav className="p-6 space-y-4">
                    <SignedIn>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-1 h-4 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
                                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                                    Navigation
                                </h3>
                                <div className="flex-1 h-px bg-gradient-to-r from-gray-600 to-transparent"></div>
                            </div>

                            <Link
                                href="/dashboard"
                                onClick={onClose}
                                className="group relative flex items-center gap-4 p-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] text-gray-300 hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-gray-800/50 hover:text-white hover:shadow-lg"
                            >
                                <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gray-700/50 group-hover:bg-gradient-to-r group-hover:from-purple-500/20 group-hover:to-blue-500/20 group-hover:scale-110 transition-all duration-300">
                                    <svg
                                        className="w-5 h-5 text-gray-400 group-hover:text-white transition-all duration-300"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 5a2 2 0 012-2h4a2 2 0 012 2v4H8V5z"
                                        />
                                    </svg>
                                </div>
                                <span className="font-medium">My Projects</span>
                                <svg className="w-4 h-4 text-gray-500 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                            
                            <Link
                                href="/dashboard"
                                onClick={onClose}
                                className="group relative flex items-center gap-4 p-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] text-gray-300 hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-gray-800/50 hover:text-white hover:shadow-lg"
                            >
                                <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gray-700/50 group-hover:bg-gradient-to-r group-hover:from-purple-500/20 group-hover:to-blue-500/20 group-hover:scale-110 transition-all duration-300">
                                    <svg
                                        className="w-5 h-5 text-gray-400 group-hover:text-white transition-all duration-300"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                    </svg>
                                </div>
                                <span className="font-medium">My Profile</span>
                                <svg className="w-4 h-4 text-gray-500 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                            
                            <Link
                                href="/pricing"
                                onClick={onClose}
                                className="group relative flex items-center gap-4 p-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] text-gray-300 hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-gray-800/50 hover:text-white hover:shadow-lg"
                            >
                                <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gray-700/50 group-hover:bg-gradient-to-r group-hover:from-purple-500/20 group-hover:to-blue-500/20 group-hover:scale-110 transition-all duration-300">
                                    <svg
                                        className="w-5 h-5 text-gray-400 group-hover:text-white transition-all duration-300"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                        />
                                    </svg>
                                </div>
                                <span className="font-medium">Subscriptions</span>
                                <svg className="w-4 h-4 text-gray-500 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </SignedIn>
                </nav>
            </div>
        </div>
    );
}

// Enhanced Main Navigation Component
export default function Navigation() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="relative bg-gradient-to-r from-gray-800/95 to-gray-900/95 backdrop-blur-xl shadow-2xl border-b border-white/10 w-full sticky top-0 z-40">
            {/* Subtle background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-blue-600/5"></div>
            
            <div className="relative flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
                {/* Enhanced Logo and brand */}
                <div className="flex items-center min-w-0 flex-1">
                    <Link
                        href="/dashboard"
                        className="group text-lg sm:text-xl font-bold text-white hover:text-gray-300 transition-all duration-200 flex items-center gap-3 truncate"
                    >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                            <span className="text-white text-sm font-bold">🎯</span>
                        </div>
                        <div className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                            <span className="hidden sm:inline">Project Management Hub</span>
                            <span className="sm:hidden">Project Hub</span>
                        </div>
                    </Link>

                    <SignedIn>
                        {/* Enhanced Desktop Navigation */}
                        <nav className="ml-8 hidden lg:flex space-x-2">
                            <Link
                                href="/dashboard"
                                className="group px-4 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-gray-800/50 transition-all duration-200 flex items-center gap-2 hover:scale-105"
                            >
                                <div className="w-5 h-5 rounded bg-gray-700/50 group-hover:bg-gradient-to-r group-hover:from-purple-500/20 group-hover:to-blue-500/20 group-hover:scale-110 transition-all duration-200 flex items-center justify-center">
                                    <svg
                                        className="w-3 h-3 group-hover:text-white transition-colors"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                    </svg>
                                </div>
                                My Profile
                            </Link>
                            
                            <Link
                                href="/pricing"
                                className="group px-4 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-gray-800/50 transition-all duration-200 flex items-center gap-2 hover:scale-105"
                            >
                                <div className="w-5 h-5 rounded bg-gray-700/50 group-hover:bg-gradient-to-r group-hover:from-purple-500/20 group-hover:to-blue-500/20 group-hover:scale-110 transition-all duration-200 flex items-center justify-center">
                                    <svg
                                        className="w-3 h-3 group-hover:text-white transition-colors"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                        />
                                    </svg>
                                </div>
                                Subscriptions
                            </Link>
                        </nav>
                    </SignedIn>
                </div>

                <div className="flex items-center space-x-4">
                    <SignedOut>
                        <div className="flex gap-3">
                            <SignInButton mode="modal">
                                <button className="group relative px-4 sm:px-6 py-2.5 text-sm font-semibold text-gray-200 bg-gradient-to-r from-gray-700/80 to-gray-800/80 hover:from-gray-600 hover:to-gray-700 border border-gray-600/50 hover:border-gray-500/50 rounded-lg transition-all duration-200 ease-in-out flex items-center gap-2 shadow-lg hover:shadow-xl backdrop-blur-sm hover:scale-105">
                                    <svg
                                        className="w-4 h-4 transition-transform group-hover:scale-110"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                                        />
                                    </svg>
                                    <span className="hidden xs:inline group-hover:text-white transition-colors">
                                        Sign In
                                    </span>
                                </button>
                            </SignInButton>
                            
                            <SignUpButton mode="modal">
                                <button className="group relative px-4 sm:px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg transition-all duration-200 ease-in-out flex items-center gap-2 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105">
                                    <svg
                                        className="w-4 h-4 transition-transform group-hover:scale-110"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                        />
                                    </svg>
                                    <span className="hidden xs:inline">Get Started</span>
                                </button>
                            </SignUpButton>
                        </div>
                    </SignedOut>

                    <SignedIn>
                        {/* Enhanced Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="lg:hidden text-gray-400 hover:text-white p-2 rounded-lg transition-all duration-200 hover:bg-white/10 hover:scale-110"
                            aria-label="Open menu"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>

                        {/* Enhanced User Button */}
                        <UserButton
                            afterSignOutUrl="/"
                            appearance={{
                                elements: {
                                    userButtonAvatarBox: "w-9 h-9 rounded-lg shadow-lg hover:scale-110 transition-transform duration-200",
                                    userButtonPopoverCard: "bg-gray-800 border-gray-700",
                                    userButtonPopoverText: "text-gray-300",
                                },
                            }}
                        />
                    </SignedIn>
                </div>
            </div>

            {/* Enhanced Mobile Menu */}
            <MobileMenu
                isOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
            />
        </header>
    );
}