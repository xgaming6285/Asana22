"use client";

import { Button } from "@/app/components/MaterialTailwind";
import { PlusIcon } from "@heroicons/react/24/solid";

const TABS = [
    { label: "Company goals", value: "COMPANY" },
    { label: "Team goals", value: "TEAM" },
    { label: "My goals", value: "PERSONAL" }
];

export default function GoalsHeader({ activeTab, setActiveTab, onOpenCreateModal }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center border-b border-gray-700 mb-4 sm:mb-0">
                {TABS.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className={`px-3 py-4 text-sm font-medium transition-colors whitespace-nowrap
                        ${activeTab === tab.value
                                ? "border-b-2 border-white text-white"
                                : "border-b-2 border-transparent text-gray-400 hover:text-white"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="flex items-center gap-4">
                {/* --- ДОБАВЕН ЛОГ --- */}
                {/* Увиваме извикването на функцията в друга функция, за да добавим console.log */}
                <Button variant="gradient" color="purple" className="flex items-center gap-2" onClick={() => {
                    console.log("[GoalsHeader.js] 'Create Goal' бутонът е кликнат!");
                    onOpenCreateModal();
                }}>
                    <PlusIcon className="h-5 w-5" />
                    Create goal
                </Button>
            </div>
        </div>
    );
}