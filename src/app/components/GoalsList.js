"use client";

import React, { useState } from "react";
import { FlagIcon, PencilIcon, TrashIcon, ChevronDownIcon, UsersIcon, CalendarIcon, UserIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";

const EmptyState = () => (
    <div className="text-center py-20 px-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl mt-8 border border-dashed border-gray-700/50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5"></div>
        
        {/* Ron animated image */}
        <div className="relative z-10 mb-6">
            <div className="mx-auto w-32 h-32 relative animate-gentle-float">
                <Image
                    src="/ron_animated2.png"
                    alt="Ron encouraging you to create goals"
                    width={128}
                    height={128}
                    className="object-contain drop-shadow-2xl filter brightness-110 saturate-110"
                    style={{
                        filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.3)) sepia(10%) hue-rotate(15deg) saturate(1.1) brightness(1.1) contrast(1.1)',
                    }}
                />
            </div>
        </div>

        {/* Empty state content */}
        <div className="relative z-10">
            <FlagIcon className="mx-auto h-12 w-12 text-gray-500 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No goals in this category yet</h2>
            <p className="text-lg text-gray-400 mb-6">
                Ready to set some ambitious objectives? Ron believes in you!
            </p>
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-purple-300 italic">
                    "Every great achievement starts with a single goal. Let's create your first one!" - Ron
                </p>
            </div>
        </div>
    </div>
);

// Enhanced Goal Details Component
const GoalDetails = ({ goal }) => (
    <div className="p-6 bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-t border-gray-700/50">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Description */}
            <div className="lg:col-span-2">
                <h4 className="font-semibold text-gray-300 mb-3 flex items-center gap-2">
                    <span className="text-purple-400">📝</span> Description
                </h4>
                <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                    <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {goal.description || "No description provided."}
                    </p>
                </div>
            </div>

            {/* Members & Dates */}
            <div className="space-y-6">
                {/* Members */}
                <div>
                    <h4 className="font-semibold text-gray-300 mb-3 flex items-center gap-2">
                        <UsersIcon className="h-5 w-5 text-blue-400" /> Members
                    </h4>
                    <div className="space-y-2">
                        {goal.members && goal.members.length > 0 ? (
                            goal.members.map(member => (
                                <div key={member.userId} className="flex items-center gap-3 bg-gray-700/40 p-3 rounded-lg border border-gray-600/30 hover:bg-gray-700/60 transition-colors">
                                    {member.user.imageUrl ? (
                                        <Image
                                            src={member.user.imageUrl}
                                            alt={`${member.user.firstName} ${member.user.lastName}`}
                                            width={36}
                                            height={36}
                                            className="w-9 h-9 rounded-full border-2 border-purple-500/30"
                                        />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center border-2 border-purple-500/30">
                                            <span className="text-sm font-bold text-white">
                                                {member.user.firstName?.[0]}
                                                {member.user.lastName?.[0]}
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm font-medium text-gray-200">{member.user.firstName} {member.user.lastName}</p>
                                        <p className="text-xs text-gray-400">{member.role || 'Member'}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 bg-gray-700/20 rounded-lg border border-dashed border-gray-600/30">
                                <UserIcon className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                                <p className="text-sm text-gray-500 italic">No members assigned</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Dates */}
                <div>
                    <h4 className="font-semibold text-gray-300 mb-3 flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-green-400" /> Timeline
                    </h4>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between bg-gray-700/40 p-3 rounded-lg border border-gray-600/30">
                            <span className="text-sm text-gray-400">Start Date</span>
                            <span className="text-sm font-medium text-gray-200">
                                {goal.startDate ? new Date(goal.startDate).toLocaleDateString() : 'Not set'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between bg-gray-700/40 p-3 rounded-lg border border-gray-600/30">
                            <span className="text-sm text-gray-400">End Date</span>
                            <span className="text-sm font-medium text-gray-200">
                                {goal.endDate ? new Date(goal.endDate).toLocaleDateString() : 'Not set'}
                            </span>
                        </div>
                    </div>
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
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl overflow-hidden border border-gray-700/50 shadow-2xl">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-gray-800/90 to-gray-900/90 border-b border-gray-700/50">
                <div className="grid grid-cols-12 gap-4 px-6 py-4">
                    <div className="col-span-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Goal Name
                    </div>
                    <div className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Start Date
                    </div>
                    <div className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        End Date
                    </div>
                    <div className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Owner
                    </div>
                    <div className="col-span-1 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">
                        Actions
                    </div>
                </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-700/50">
                {goals.map((goal, index) => (
                    <React.Fragment key={goal.id}>
                        <div className={`grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-700/30 transition-all duration-300 ${expandedGoalId === goal.id ? 'bg-gray-700/20' : ''}`}>
                            {/* Goal Name */}
                            <div className="col-span-5 flex items-center">
                                <button 
                                    onClick={() => toggleDetails(goal.id)} 
                                    className="mr-3 p-2 rounded-full hover:bg-gray-600/50 transition-colors"
                                >
                                    <ChevronDownIcon 
                                        className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                                            expandedGoalId === goal.id ? 'rotate-180 text-purple-400' : ''
                                        }`} 
                                    />
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse"></div>
                                    <Link 
                                        href={`/goals/${goal.id}`} 
                                        className="text-sm font-medium text-white hover:text-purple-400 transition-colors hover:underline"
                                    >
                                        {goal.title}
                                    </Link>
                                </div>
                            </div>

                            {/* Start Date */}
                            <div className="col-span-2 flex items-center">
                                <span className="text-sm text-gray-300">
                                    {goal.startDate ? new Date(goal.startDate).toLocaleDateString() : 'Not set'}
                                </span>
                            </div>

                            {/* End Date */}
                            <div className="col-span-2 flex items-center">
                                <span className="text-sm text-gray-300">
                                    {goal.endDate ? new Date(goal.endDate).toLocaleDateString() : 'Not set'}
                                </span>
                            </div>

                            {/* Owner */}
                            <div className="col-span-2 flex items-center">
                                <div className="flex items-center gap-2">
                                    {goal.owner?.imageUrl ? (
                                        <Image
                                            src={goal.owner.imageUrl}
                                            alt={goal.owner.firstName}
                                            width={24}
                                            height={24}
                                            className="w-6 h-6 rounded-full border border-gray-600"
                                        />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                            <span className="text-xs font-bold text-white">
                                                {goal.owner?.firstName?.[0] || '?'}
                                            </span>
                                        </div>
                                    )}
                                    <span className="text-sm text-gray-300">
                                        {goal.owner?.firstName || goal.owner?.email || 'Unassigned'}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="col-span-1 flex items-center justify-end">
                                <div className="flex items-center space-x-2">
                                    {goal.canEdit && (
                                        <button 
                                            onClick={() => onEdit(goal)} 
                                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-full transition-all duration-200" 
                                            title="Edit Goal"
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </button>
                                    )}
                                    {goal.canDelete && (
                                        <button 
                                            onClick={() => onDelete(goal.id)} 
                                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full transition-all duration-200" 
                                            title="Delete Goal"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    )}
                                    {!goal.canEdit && !goal.canDelete && (
                                        <span className="text-xs text-gray-500 px-2 py-1 bg-gray-700/30 rounded-full">
                                            View only
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedGoalId === goal.id && (
                            <div className="bg-gray-800/40">
                                <GoalDetails goal={goal} />
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}
