"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/app/components/MaterialTailwind";
import { UserPlusIcon } from "@heroicons/react/24/solid";

export default function EditGoalModal({ isOpen, onClose, goalToEdit, onGoalUpdated }) {
    // State for form fields
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedOwnerId, setSelectedOwnerId] = useState("");
    const [privacy, setPrivacy] = useState("public");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    // --- НОВО: Добавяме състояние за тип ---
    const [type, setType] = useState("PERSONAL");

    // State for lists of users and members
    const [allUsers, setAllUsers] = useState([]);
    const [members, setMembers] = useState([]);
    const [isAddingMember, setIsAddingMember] = useState(false);

    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toISOString().split('T')[0];
    };

    const availableUsers = useMemo(() => {
        const memberIds = new Set(members.map(m => m.userId));
        return allUsers.filter(user => !memberIds.has(user.id));
    }, [allUsers, members]);

    // Попълваме формата с данни, когато модалът се отвори
    useEffect(() => {
        if (goalToEdit) {
            setTitle(goalToEdit.title || "");
            setDescription(goalToEdit.description || "");
            setSelectedOwnerId(goalToEdit.ownerId || "");
            setPrivacy(goalToEdit.privacy || "public");
            setMembers(goalToEdit.members || []);
            setStartDate(formatDateForInput(goalToEdit.startDate));
            setEndDate(formatDateForInput(goalToEdit.endDate));
            // --- НОВО: Попълваме и типа ---
            setType(goalToEdit.type || "PERSONAL");
        }
    }, [goalToEdit]);

    // Извличаме потребителите, когато модалът стане видим
    useEffect(() => {
        if (isOpen) {
            const fetchUsers = async () => {
                try {
                    const response = await fetch('/api/users');
                    if (!response.ok) throw new Error('Could not fetch users');
                    const data = await response.json();
                    setAllUsers(data);
                } catch (err) {
                    console.error(err);
                    setError("Could not load user list.");
                }
            };
            fetchUsers();
        }
    }, [isOpen]);

    if (!isOpen || !goalToEdit) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const response = await fetch(`/api/goals/${goalToEdit.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    ownerId: parseInt(selectedOwnerId),
                    privacy,
                    startDate: startDate || null,
                    endDate: endDate || null,
                    // --- НОВО: Добавяме типа към заявката за обновяване ---
                    type,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to update goal");
            }

            onGoalUpdated();
            onClose();

        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveMember = async (userIdToRemove) => {
        setError('');
        try {
            const apiUrl = `/api/goals/${goalToEdit.id}/members?userIdToRemove=${userIdToRemove}`;
            const response = await fetch(apiUrl, { method: 'DELETE' });
            if (!response.ok) {
                const errorData = response.status !== 204 ? await response.json() : {};
                throw new Error(errorData.error || "Failed to remove member");
            }
            setMembers(currentMembers => currentMembers.filter(m => m.userId !== userIdToRemove));
        } catch (err) {
            setError(`Error: ${err.message}`);
        }
    }

    const handleAddMember = async (userToAdd) => {
        setError('');
        try {
            const response = await fetch(`/api/goals/${goalToEdit.id}/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userIdToAdd: userToAdd.id })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to add member");
            }

            const newMembership = await response.json();
            setMembers(currentMembers => [...currentMembers, newMembership]);
            setIsAddingMember(false);
        } catch (err) {
            setError(`Error: ${err.message}`);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
            <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl transform transition-all" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Edit Goal</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-1">

                    <div>
                        <label htmlFor="edit-title" className="block text-sm font-medium text-gray-300 mb-1">Goal title *</label>
                        <input id="edit-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-3 border border-gray-600" required />
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Members</label>
                        <div className="flex items-center flex-wrap gap-2 p-2 bg-gray-700 rounded-md min-h-[48px]">
                            {members.map(member => (
                                <div key={member.userId} className="group relative bg-gray-600 pl-2 pr-1 py-1 rounded-full flex items-center text-sm">
                                    <img src={member.user.imageUrl} alt={member.user.firstName} className="w-6 h-6 rounded-full mr-2" />
                                    <span className="text-white">{member.user.firstName}</span>
                                    <button type="button" onClick={() => handleRemoveMember(member.userId)} className="ml-2 w-5 h-5 rounded-full bg-gray-500 group-hover:bg-red-500 flex items-center justify-center text-white transition-colors" title={`Remove ${member.user.firstName}`}>&times;</button>
                                </div>
                            ))}
                            <button type="button" onClick={() => setIsAddingMember(!isAddingMember)} className="w-8 h-8 rounded-full bg-gray-600 hover:bg-purple-500 flex items-center justify-center text-gray-300 hover:text-white transition-colors" title="Add member"><UserPlusIcon className="h-5 w-5" /></button>
                        </div>

                        {isAddingMember && (
                            <div className="absolute w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                                <p className="p-2 text-sm text-gray-400">Select a user to add:</p>
                                {availableUsers.length > 0 ? availableUsers.map(user => (
                                    <div key={user.id} onClick={() => handleAddMember(user)} className="flex items-center p-2 rounded-md hover:bg-purple-500/20 cursor-pointer">
                                        <img src={user.imageUrl || '/default-avatar.png'} alt="" className="w-6 h-6 rounded-full mr-3" />
                                        <span className="text-white text-sm">{user.firstName} {user.lastName}</span>
                                    </div>
                                )) : <p className="p-2 text-sm text-gray-500">All users are already members.</p>}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="edit-owner" className="block text-sm font-medium text-gray-300 mb-1">Goal owner</label>
                            <select id="edit-owner" value={selectedOwnerId} onChange={(e) => setSelectedOwnerId(e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-3 border border-gray-600">
                                {allUsers.map(u => (<option key={u.id} value={u.id}>{u.firstName || ''} {u.lastName || ''} ({u.email})</option>))}
                            </select>
                        </div>
                        {/* --- НОВО: Добавяме полето за Goal Type --- */}
                        <div>
                            <label htmlFor="edit-type" className="block text-sm font-medium text-gray-300 mb-1">Goal Type</label>
                            <select id="edit-type" value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-3 border border-gray-600">
                                <option value="PERSONAL">Personal</option>
                                <option value="TEAM">Team</option>
                                <option value="COMPANY">Company</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="edit-start-date" className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                            <input id="edit-start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-3 border border-gray-600" />
                        </div>
                        <div>
                            <label htmlFor="edit-end-date" className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                            <input id="edit-end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-3 border border-gray-600" />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="edit-privacy" className="block text-sm font-medium text-gray-300 mb-1">Privacy</label>
                        <select id="edit-privacy" value={privacy} onChange={(e) => setPrivacy(e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-3 border border-gray-600">
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="edit-description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                        <textarea id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full bg-gray-700 text-white rounded-md p-3 border border-gray-600" />
                    </div>

                    {error && <p className="text-red-400 text-sm pt-2">{error}</p>}

                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
                        <Button variant="text" color="gray" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                        <Button type="submit" variant="gradient" color="purple" loading={isSubmitting} disabled={!title.trim()}>Save Changes</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}