"use client";

import { useState, useEffect, useCallback } from "react";
import GoalsHeader from "../components/GoalsHeader";
import GoalsList from "../components/GoalsList";
import CreateGoalModal from "../components/CreateGoalModal";
import EditGoalModal from "../components/EditGoalModal";
import GoalsRonMotivator from "../components/GoalsRonMotivator";
import Image from "next/image";

export default function GoalsPage() {
    // State for page content
    const [activeTab, setActiveTab] = useState("COMPANY");
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // State for modals' visibility
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentGoalToEdit, setCurrentGoalToEdit] = useState(null);

    // --- ДОБАВЕН ЛОГ ---
    // Този useEffect ще се задейства всеки път, когато isCreateModalOpen се промени,
    // за да можем да видим в конзолата дали състоянието се обновява правилно.
    useEffect(() => {
        console.log(`[goals/page.js] Състоянието isCreateModalOpen се промени на:`, isCreateModalOpen);
    }, [isCreateModalOpen]);


    // Function to fetch goals from the API
    const fetchGoals = useCallback(async () => {
        setLoading(true);
        const apiUrl = `/api/goals?type=${activeTab}`;
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to fetch goals");
            }
            const data = await response.json();
            setGoals(data);
            setError("");
        } catch (err) {
            setError(err.message);
            setGoals([]);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchGoals();
    }, [fetchGoals]);

    // Handler for deleting a goal
    const handleDeleteGoal = async (goalId) => {
        if (!window.confirm("Are you sure you want to delete this goal?")) return;
        try {
            const response = await fetch(`/api/goals/${goalId}`, { method: "DELETE" });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to delete the goal.");
            }
            fetchGoals(); // Refresh the list
        } catch (err) {
            alert(err.message);
        }
    };

    // Handler for opening the edit modal
    const handleEditGoal = (goal) => {
        setCurrentGoalToEdit(goal);
        setIsEditModalOpen(true);
    };

    if (loading) {
        return (
            <div className="bg-gray-900 text-white min-h-screen">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
                            <p className="text-lg text-gray-400">Loading your goals...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-900 text-white min-h-screen">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center">
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md mx-auto">
                                <div className="text-red-400 text-5xl mb-4">⚠️</div>
                                <h3 className="text-xl font-semibold text-red-400 mb-2">Oops! Something went wrong</h3>
                                <p className="text-gray-400 mb-4">{error}</p>
                                <button 
                                    onClick={() => window.location.reload()}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            {/* Enhanced Header Section */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900/20 border-b border-gray-700/50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Page Title */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold curved-header mb-2">
                            🎯 Goals Dashboard
                        </h1>
                        <p className="curved-subtitle text-lg">
                            Track your objectives and achieve greatness
                        </p>
                    </div>

                    {/* Goals Header Component */}
                    <GoalsHeader
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        onOpenCreateModal={() => setIsCreateModalOpen(true)}
                    />
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Goals Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/30 transition-all duration-300 group relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-400 text-sm font-medium">Total Goals</p>
                                <p className="text-2xl font-bold text-white">{goals.length}</p>
                            </div>
                            <div className="bg-purple-500/20 p-3 rounded-full">
                                <span className="text-2xl">🎯</span>
                            </div>
                        </div>
                        {/* Small Ron in corner for high goal count */}
                        {goals.length > 5 && (
                            <div className="absolute -bottom-2 -right-2 opacity-20 group-hover:opacity-60 transition-opacity duration-300">
                                <GoalsRonMotivator 
                                    position="inline" 
                                    size="small" 
                                    trigger="hover"
                                    showMessage={false}
                                />
                            </div>
                        )}
                    </div>

                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6 hover:border-blue-500/30 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-400 text-sm font-medium">Active Goals</p>
                                <p className="text-2xl font-bold text-white">{goals.filter(g => !g.completed).length}</p>
                            </div>
                            <div className="bg-blue-500/20 p-3 rounded-full">
                                <span className="text-2xl">⚡</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6 hover:border-green-500/30 transition-all duration-300 group relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-400 text-sm font-medium">Completed</p>
                                <p className="text-2xl font-bold text-white">{goals.filter(g => g.completed).length}</p>
                            </div>
                            <div className="bg-green-500/20 p-3 rounded-full">
                                <span className="text-2xl">✅</span>
                            </div>
                        </div>
                        {/* Celebration Ron for completed goals */}
                        {goals.filter(g => g.completed).length > 0 && (
                            <div className="absolute -bottom-2 -right-2 opacity-20 group-hover:opacity-60 transition-opacity duration-300">
                                <GoalsRonMotivator 
                                    position="inline" 
                                    size="small" 
                                    trigger="hover"
                                    showMessage={false}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Goals List */}
                <div className="relative">
                    <GoalsList
                        goals={goals}
                        onEdit={handleEditGoal}
                        onDelete={handleDeleteGoal}
                    />
                </div>
            </div>

            {/* Modals */}
            <CreateGoalModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onGoalCreated={fetchGoals}
            />

            <EditGoalModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                goalToEdit={currentGoalToEdit}
                onGoalUpdated={fetchGoals}
            />

            {/* Floating Ron Motivator */}
            <GoalsRonMotivator 
                position="floating" 
                size="medium" 
                trigger="click"
                showMessage={true}
            />
        </div>
    );
}