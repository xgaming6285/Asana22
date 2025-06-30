"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/app/components/MaterialTailwind";
import { UserPlusIcon } from "@heroicons/react/24/solid";

export default function CreateGoalModal({ isOpen, onClose, onGoalCreated }) {
    // Основни полета
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedOwnerId, setSelectedOwnerId] = useState("");
    const [type, setType] = useState("PERSONAL");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    // --- КОРЕКЦИЯ: Връщаме състоянието за privacy ---
    const [privacy, setPrivacy] = useState("public");

    // Състояния за управление на членове
    const [allUsers, setAllUsers] = useState([]);
    const [members, setMembers] = useState([]);
    const [isAddingMember, setIsAddingMember] = useState(false);

    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Извличане на потребителите
    useEffect(() => {
        if (isOpen && allUsers.length === 0) {
            const fetchUsers = async () => {
                try {
                    const response = await fetch('/api/users');
                    if (!response.ok) throw new Error('Could not fetch users');
                    const data = await response.json();
                    setAllUsers(data);
                    if (data.length > 0 && !selectedOwnerId) {
                        setSelectedOwnerId(data[0].id);
                    }
                } catch (err) {
                    console.error("Failed to fetch users:", err);
                    setError("Could not load user list.");
                }
            };
            fetchUsers();
        }
    }, [isOpen, allUsers, selectedOwnerId]);

    // Нулиране на формата при затваряне
    useEffect(() => {
        if (!isOpen) {
            setTitle("");
            setDescription("");
            setType("PERSONAL");
            setMembers([]);
            setIsAddingMember(false);
            setError("");
            setStartDate("");
            setEndDate("");
            // --- КОРЕКЦИЯ: Нулираме и privacy ---
            setPrivacy("public");
        }
    }, [isOpen]);

    const handleAddMember = (userToAdd) => {
        if (!members.some(m => m.id === userToAdd.id)) {
            setMembers(currentMembers => [...currentMembers, userToAdd]);
        }
        setIsAddingMember(false);
    };

    const handleRemoveMember = (userIdToRemove) => {
        setMembers(currentMembers => currentMembers.filter(m => m.id !== userIdToRemove));
    };

    const availableUsers = useMemo(() => {
        const memberIds = new Set(members.map(m => m.id));
        memberIds.add(parseInt(selectedOwnerId));
        return allUsers.filter(user => !memberIds.has(user.id));
    }, [allUsers, members, selectedOwnerId]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const memberIds = members.map(member => member.id);

            const response = await fetch(`/api/goals`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    ownerId: parseInt(selectedOwnerId),
                    type,
                    memberIds,
                    startDate: startDate || null,
                    endDate: endDate || null,
                    // --- КОРЕКЦИЯ: Добавяме privacy към заявката ---
                    privacy,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to create goal");

            onGoalCreated();
            onClose();

        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
            <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Create New Goal</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-1">
                    <div>
                        <label htmlFor="create-title" className="block text-sm font-medium text-gray-300 mb-1">Goal title *</label>
                        <input id="create-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-3 border border-gray-600" required />
                    </div>

                    {/* UI за управление на членове */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Members</label>
                        <div className="flex items-center flex-wrap gap-2 p-2 bg-gray-700 rounded-md min-h-[48px]">
                            {members.map(member => (
                                <div key={member.id} className="group relative bg-gray-600 pl-2 pr-1 py-1 rounded-full flex items-center text-sm">
                                    <img src={member.imageUrl || '/default-avatar.png'} alt={member.firstName} className="w-6 h-6 rounded-full mr-2" />
                                    <span className="text-white">{member.firstName} {member.lastName}</span>
                                    <button type="button" onClick={() => handleRemoveMember(member.id)} className="ml-2 w-5 h-5 rounded-full bg-gray-500 group-hover:bg-red-500 flex items-center justify-center text-white transition-colors" title={`Remove ${member.firstName}`}>
                                        &times;
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={() => setIsAddingMember(!isAddingMember)} className="w-8 h-8 rounded-full bg-gray-600 hover:bg-purple-500 flex items-center justify-center text-gray-300 hover:text-white transition-colors" title="Add member">
                                <UserPlusIcon className="h-5 w-5" />
                            </button>
                        </div>
                        {isAddingMember && (
                            <div className="absolute w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                                <p className="p-2 text-xs text-gray-400">Select users to add as members:</p>
                                {availableUsers.length > 0 ? availableUsers.map(user => (
                                    <div key={user.id} onClick={() => handleAddMember(user)} className="flex items-center p-2 rounded-md hover:bg-purple-500/20 cursor-pointer">
                                        <img src={user.imageUrl || '/default-avatar.png'} alt="" className="w-6 h-6 rounded-full mr-3" />
                                        <span className="text-white text-sm">{user.firstName} {user.lastName}</span>
                                    </div>
                                )) : <p className="p-2 text-sm text-gray-500">All other users have been added.</p>}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="create-owner" className="block text-sm font-medium text-gray-300 mb-1">Goal owner</label>
                            <select id="create-owner" value={selectedOwnerId} onChange={(e) => setSelectedOwnerId(e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-3 border border-gray-600">
                                {allUsers.map(u => (<option key={u.id} value={u.id}>{u.firstName || ''} {u.lastName || ''} ({u.email})</option>))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="create-type" className="block text-sm font-medium text-gray-300 mb-1">Goal Type</label>
                            <select id="create-type" value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-3 border border-gray-600">
                                <option value="PERSONAL">Personal</option>
                                <option value="TEAM">Team</option>
                                <option value="COMPANY">Company</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="create-start-date" className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                            <input id="create-start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-3 border border-gray-600" />
                        </div>
                        <div>
                            <label htmlFor="create-end-date" className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                            <input id="create-end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-3 border border-gray-600" />
                        </div>
                    </div>

                    {/* --- КОРЕКЦИЯ: Връщаме полето за Privacy --- */}
                    <div>
                        <label htmlFor="create-privacy" className="block text-sm font-medium text-gray-300 mb-1">Privacy</label>
                        <select id="create-privacy" value={privacy} onChange={(e) => setPrivacy(e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-3 border border-gray-600">
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="create-description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                        <textarea id="create-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full bg-gray-700 text-white rounded-md p-3 border border-gray-600" />
                    </div>

                    {error && <p className="text-red-400 text-sm text-center pt-2">{error}</p>}

                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
                        <Button variant="text" color="gray" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                        <Button type="submit" variant="gradient" color="purple" loading={isSubmitting} disabled={!title.trim()}>Create Goal</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
