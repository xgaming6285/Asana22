"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const MOTIVATIONAL_MESSAGES = [
    "🎯 Every goal is a step towards greatness!",
    "⚡ You've got this! Keep pushing forward!",
    "🌟 Success is built one goal at a time!",
    "🚀 Dream big, achieve bigger!",
    "💪 Your determination will pay off!",
    "🏆 Champions are made through consistent effort!",
    "✨ Believe in yourself and magic happens!",
    "🎪 Every expert was once a beginner!",
    "🌈 Your goals are waiting to be conquered!",
    "🔥 Turn your dreams into plans, and plans into reality!"
];

export default function GoalsRonMotivator({ 
    showMessage = true, 
    position = "floating", 
    size = "medium",
    trigger = "hover" 
}) {
    const [currentMessage, setCurrentMessage] = useState("");
    const [showTooltip, setShowTooltip] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Set a random motivational message
        const randomMessage = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
        setCurrentMessage(randomMessage);

        // Show Ron after a short delay for better user experience
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    const handleInteraction = () => {
        if (trigger === "hover") {
            setShowTooltip(true);
        } else if (trigger === "click") {
            setShowTooltip(!showTooltip);
            // Change message on click
            const randomMessage = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
            setCurrentMessage(randomMessage);
        }
    };

    const handleLeave = () => {
        if (trigger === "hover") {
            setShowTooltip(false);
        }
    };

    const sizeClasses = {
        small: "w-16 h-16",
        medium: "w-24 h-24",
        large: "w-32 h-32"
    };

    const positionClasses = {
        floating: "fixed bottom-8 right-8 z-50",
        inline: "relative",
        corner: "absolute bottom-4 right-4"
    };

    if (!isVisible) return null;

    return (
        <div className={`${positionClasses[position]} group`}>
            <div 
                className="relative cursor-pointer"
                onMouseEnter={handleInteraction}
                onMouseLeave={handleLeave}
                onClick={trigger === "click" ? handleInteraction : undefined}
            >
                {/* Ron Image */}
                <div className={`${sizeClasses[size]} relative animate-gentle-float hover:scale-110 transition-transform duration-300`}>
                    <Image
                        src="/ron_animated2.png"
                        alt="Ron the motivator"
                        width={size === "large" ? 128 : size === "medium" ? 96 : 64}
                        height={size === "large" ? 128 : size === "medium" ? 96 : 64}
                        className="object-contain drop-shadow-2xl filter brightness-110 saturate-110"
                        style={{
                            filter: 'drop-shadow(0 0 15px rgba(168, 85, 247, 0.4)) sepia(10%) hue-rotate(15deg) saturate(1.1) brightness(1.1) contrast(1.1)',
                        }}
                    />
                    
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-xl animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Motivational Message Tooltip */}
                {showMessage && showTooltip && (
                    <div className="absolute bottom-full right-0 mb-4 transform translate-x-1/2">
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-lg shadow-2xl border border-purple-500/30 max-w-xs">
                            <p className="text-sm font-medium text-center">{currentMessage}</p>
                            <div className="absolute top-full right-1/2 transform translate-x-1/2 -mt-1">
                                <div className="w-3 h-3 bg-gradient-to-r from-purple-600 to-blue-600 rotate-45 border-r border-b border-purple-500/30"></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Floating hearts animation */}
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className={`absolute w-2 h-2 text-red-400 opacity-0 group-hover:opacity-100 animate-float-heart-${i + 1}`}
                            style={{
                                left: `${20 + i * 25}%`,
                                top: `${10 + i * 15}%`,
                                animationDelay: `${i * 0.5}s`
                            }}
                        >
                            ❤️
                        </div>
                    ))}
                </div>
            </div>

            {/* Click instruction for mobile */}
            {trigger === "click" && position === "floating" && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    Click for motivation!
                </div>
            )}
        </div>
    );
}

// Heart animation keyframes are defined in globals.css 