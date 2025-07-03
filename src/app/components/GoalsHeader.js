"use client";

import { Button } from "@/app/components/MaterialTailwind";
import { PlusIcon, SparklesIcon } from "@heroicons/react/24/solid";

const TABS = [
    { label: "Company goals", value: "COMPANY", icon: "🏢", color: "purple" },
    { label: "Team goals", value: "TEAM", icon: "👥", color: "blue" },
    { label: "My goals", value: "PERSONAL", icon: "⭐", color: "green" }
];

export default function GoalsHeader({ activeTab, setActiveTab, onOpenCreateModal }) {
    return (
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Enhanced Tab Navigation */}
            <div className="flex items-center bg-gray-800/50 rounded-xl p-1 border border-gray-700/50">
                {TABS.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className={`relative px-6 py-3 text-sm font-medium transition-all duration-300 rounded-lg flex items-center gap-2 whitespace-nowrap ${
                            activeTab === tab.value
                                ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg transform scale-105"
                                : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                        }`}
                    >
                        <span className="text-lg">{tab.icon}</span>
                        <span>{tab.label}</span>
                        {activeTab === tab.value && (
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg animate-pulse"></div>
                        )}
                    </button>
                ))}
            </div>

            {/* Enhanced Create Button */}
            <div className="flex items-center gap-4">
                <div className="hidden lg:block text-sm text-gray-400">
                    Ready to achieve something amazing?
                </div>
                <Button 
                    variant="gradient" 
                    color="purple" 
                    className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300" 
                    onClick={onOpenCreateModal}
                >
                    <SparklesIcon className="h-5 w-5" />
                    <span className="font-semibold">Create Goal</span>
                    <PlusIcon className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}