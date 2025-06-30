"use client";

import { useState, useEffect, useCallback } from "react";
import GoalsHeader from "../components/GoalsHeader";
import GoalsList from "../components/GoalsList";
import CreateGoalModal from "../components/CreateGoalModal";
import EditGoalModal from "../components/EditGoalModal";

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

    if (loading) return <div className="text-center p-10 text-gray-400">Loading goals...</div>;
    if (error) return <div className="text-center p-10 text-red-400">Error: {error}</div>;

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <GoalsHeader
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    // --- ДОБАВЕН ЛОГ ---
                    // Добавяме console.log, за да видим кога се задейства тази функция
                    onOpenCreateModal={() => {
                        console.log("[goals/page.js] onOpenCreateModal се задейства. Променям състоянието...");
                        setIsCreateModalOpen(true);
                    }}
                />
                <div className="mt-8">
                    <GoalsList
                        goals={goals}
                        onEdit={handleEditGoal}
                        onDelete={handleDeleteGoal}
                    />
                </div>
            </div>

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
        </div>
    );
}