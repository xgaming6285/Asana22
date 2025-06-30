"use client";

import React, { useState } from "react";
import { FlagIcon, PencilIcon, TrashIcon, ChevronDownIcon, UsersIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";

const EmptyState = () => (
    <div className="text-center py-20 px-6 bg-gray-800 rounded-lg mt-8 border border-dashed border-gray-700">
        <FlagIcon className="mx-auto h-16 w-16 text-gray-500" />
        <h2 className="mt-4 text-2xl font-semibold text-white">No goals in this category yet</h2>
        <p className="mt-2 text-md text-gray-400">
            Click &quot;Create goal&quot; to add a new objective.
        </p>
    </div>
);

// Компонент за разширения ред с детайли
const GoalDetails = ({ goal }) => (
    <div className="p-4 bg-gray-800/40">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Description */}
            <div className="md:col-span-2">
                <h4 className="font-semibold text-gray-300 mb-2">Description</h4>
                <p className="text-sm text-gray-400 whitespace-pre-wrap">
                    {goal.description || "No description provided."}
                </p>
            </div>
            {/* Members */}
            <div>
                <h4 className="font-semibold text-gray-300 mb-2 flex items-center gap-2">
                    <UsersIcon className="h-5 w-5" /> Members
                </h4>
                <div className="flex flex-col space-y-2">
                    {goal.members && goal.members.length > 0 ? (
                        goal.members.map(member => (
                            <div key={member.userId} className="flex items-center gap-3 bg-gray-700/50 p-2 rounded-md">
                                <Image src={member.user.imageUrl} alt={`${member.user.firstName} ${member.user.lastName}`} width={32} height={32} className="w-8 h-8 rounded-full" />
                                <span className="text-sm text-gray-200">{member.user.firstName} {member.user.lastName}</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 italic">No members assigned.</p>
                    )}
                </div>
            </div>
        </div>
    </div>
);

export default function GoalsList({ goals, onEdit, onDelete }) {
    const [expandedGoalId, setExpandedGoalId] = useState(null);

    const toggleDetails = (goalId) => {
        setExpandedGoalId(currentId => (currentId === goalId ? null : goalId));
    };

    if (!goals || goals.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800/50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[40%]">Name</th>
                        {/* --- НОВО: Добавена колона за Start Date --- */}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Start Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">End Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Owner</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {goals.map((goal) => (
                        <React.Fragment key={goal.id}>
                            <tr className="hover:bg-gray-700/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                    <div className="flex items-center">
                                        <button onClick={() => toggleDetails(goal.id)} className="mr-3 p-1 rounded-full hover:bg-gray-600">
                                            <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${expandedGoalId === goal.id ? 'rotate-180' : ''}`} />
                                        </button>
                                        <Link href={`/goals/${goal.id}`} className="hover:underline">
                                            {goal.title}
                                        </Link>
                                    </div>
                                </td>
                                {/* --- НОВО: Добавена клетка за Start Date --- */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {goal.startDate ? new Date(goal.startDate).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {goal.endDate ? new Date(goal.endDate).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {goal.owner ? (goal.owner.firstName || goal.owner.email) : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end space-x-4">
                                        {goal.canEdit && (
                                            <button onClick={() => onEdit(goal)} className="text-blue-400 hover:text-blue-300" title="Edit Goal">
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                        )}
                                        {goal.canDelete && (
                                            <button onClick={() => onDelete(goal.id)} className="text-red-500 hover:text-red-400" title="Delete Goal">
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        )}
                                        {!goal.canEdit && !goal.canDelete && (
                                            <span className="text-gray-500 text-sm">View only</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                            {expandedGoalId === goal.id && (
                                <tr className="bg-gray-800">
                                    {/* --- КОРЕКЦИЯ: colSpan вече е 6, за да обхване всички колони --- */}
                                    <td colSpan="6" className="p-0">
                                        <GoalDetails goal={goal} />
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
