"use client";

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = {
    'Incomplete': '#f59e0b',
    'Completed': '#10b981',
};

const GRADIENTS = {
    'Incomplete': 'from-amber-500 to-orange-500',
    'Completed': 'from-green-500 to-emerald-500',
};

export default function UpcomingTasksChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="glass-morphism rounded-2xl border border-gray-700/50 h-96 flex flex-col items-center justify-center p-6 animate-scale-in">
                <div className="relative mb-6">
                    <div className="text-6xl text-gray-600 animate-pulse">📅</div>
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-green-500/20 rounded-full blur-xl"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-200 mb-3 text-center">
                    Upcoming Tasks
                </h3>
                <p className="text-gray-400 text-center text-sm leading-relaxed max-w-sm">
                    Tasks with due dates within the next 30 days will appear here once you set due dates.
                </p>
                <div className="mt-6 flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span>Incomplete</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Completed</span>
                    </div>
                </div>
            </div>
        );
    }

    const total = data.reduce((sum, entry) => sum + entry.value, 0);
    const completedPercentage = data.find(item => item.name === 'Completed')?.value || 0;
    const completionRate = total > 0 ? Math.round((completedPercentage / total) * 100) : 0;

    return (
        <div className="glass-morphism rounded-2xl border border-gray-700/50 h-96 flex flex-col animate-scale-in overflow-hidden">
            {/* Enhanced Header */}
            <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-700/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-gradient-to-r from-amber-500 to-green-500 rounded-full"></div>
                        <h3 className="text-xl font-semibold text-gray-100">
                            Upcoming Tasks
                        </h3>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-white">{total}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Next 30 Days</div>
                    </div>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                    Tasks due within the next month • {completionRate}% completed
                </p>
            </div>

            {/* Chart Container */}
            <div className="flex-1 p-6 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <defs>
                            <linearGradient id="incompleteGradient" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9}/>
                                <stop offset="100%" stopColor="#d97706" stopOpacity={0.8}/>
                            </linearGradient>
                            <linearGradient id="completedGradient" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#10b981" stopOpacity={0.9}/>
                                <stop offset="100%" stopColor="#059669" stopOpacity={0.8}/>
                            </linearGradient>
                        </defs>
                        
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius="45%"
                            outerRadius="75%"
                            paddingAngle={3}
                            dataKey="value"
                            nameKey="name"
                            labelLine={false}
                            strokeWidth={2}
                            stroke="rgba(31, 41, 55, 0.8)"
                        >
                            {data.map((entry, index) => {
                                const fillGradient = entry.name === 'Completed' 
                                    ? 'url(#completedGradient)' 
                                    : 'url(#incompleteGradient)';
                                return (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={fillGradient}
                                    />
                                );
                            })}
                        </Pie>
                        
                        <Tooltip 
                            contentStyle={{
                                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                                borderColor: '#374151',
                                borderRadius: '12px',
                                fontSize: '14px',
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                                backdropFilter: 'blur(10px)',
                            }}
                            itemStyle={{ 
                                color: '#f3f4f6',
                                fontWeight: '500'
                            }}
                            formatter={(value, name) => [
                                `${value} task${value !== 1 ? 's' : ''}`,
                                name
                            ]}
                        />
                        
                        {/* Center text */}
                        <text 
                            x="50%" 
                            y="48%" 
                            textAnchor="middle" 
                            dominantBaseline="middle" 
                            fill="#fff" 
                            fontSize="24" 
                            fontWeight="bold"
                            className="drop-shadow-lg"
                        >
                            {total}
                        </text>
                        <text 
                            x="50%" 
                            y="55%" 
                            textAnchor="middle" 
                            dominantBaseline="middle" 
                            fill="#9ca3af" 
                            fontSize="12" 
                            fontWeight="500"
                        >
                            TASKS
                        </text>
                    </PieChart>
                </ResponsiveContainer>

                {/* Completion Rate Indicator */}
                <div className="absolute top-4 right-4">
                    <div className="glass-morphism px-3 py-2 rounded-lg border border-gray-600/50">
                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Completion</div>
                        <div className="text-lg font-bold text-white">{completionRate}%</div>
                    </div>
                </div>
            </div>

            {/* Enhanced Footer with Legend */}
            <div className="px-6 pb-4">
                <div className="flex items-center justify-center gap-6 text-sm">
                    {data.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: COLORS[item.name] }}
                            ></div>
                            <span className="text-gray-300 font-medium">
                                {item.name}: {item.value}
                            </span>
                        </div>
                    ))}
                </div>
                
                {/* Progress bar */}
                <div className="mt-3 w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000 ease-out"
                        style={{ width: `${completionRate}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
}