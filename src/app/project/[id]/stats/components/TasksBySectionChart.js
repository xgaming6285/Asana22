"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const SECTION_COLORS = {
    'todo': '#3b82f6',
    'in-progress': '#f59e0b',
    'done': '#10b981',
};

const SECTION_GRADIENTS = {
    'todo': 'from-blue-500 to-blue-600',
    'in-progress': 'from-amber-500 to-orange-500',
    'done': 'from-green-500 to-emerald-500',
};

const SECTION_DISPLAY_NAMES = {
    'todo': "To Do",
    'in-progress': "In Progress",
    'done': "Done"
};

export default function TasksBySectionChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="glass-morphism rounded-2xl border border-gray-700/50 h-96 flex flex-col items-center justify-center p-6 animate-scale-in">
                <div className="relative mb-6">
                    <div className="text-6xl text-gray-600 animate-pulse">📊</div>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-xl"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-200 mb-3 text-center">
                    Tasks Distribution
                </h3>
                <p className="text-gray-400 text-center text-sm leading-relaxed max-w-sm">
                    Task distribution across project sections will appear here once you have created some tasks.
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>To Do</span>
                    <div className="w-2 h-2 bg-orange-500 rounded-full ml-3"></div>
                    <span>In Progress</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full ml-3"></div>
                    <span>Done</span>
                </div>
            </div>
        );
    }

    const totalTasks = data.reduce((sum, section) => sum + section.count, 0);

    return (
        <div className="glass-morphism rounded-2xl border border-gray-700/50 h-96 flex flex-col animate-scale-in overflow-hidden">
            {/* Enhanced Header */}
            <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-700/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"></div>
                        <h3 className="text-xl font-semibold text-gray-100">
                            Task Distribution
                        </h3>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-white">{totalTasks}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Total Tasks</div>
                    </div>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                    Overview of tasks across all project sections
                </p>
            </div>

            {/* Chart Container */}
            <div className="flex-1 p-6">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 10,
                            bottom: 20,
                        }}
                        barSize={50}
                        maxBarSize={70}
                    >
                        <defs>
                            <linearGradient id="todoGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                                <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.7}/>
                            </linearGradient>
                            <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9}/>
                                <stop offset="95%" stopColor="#d97706" stopOpacity={0.7}/>
                            </linearGradient>
                            <linearGradient id="doneGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                                <stop offset="95%" stopColor="#059669" stopOpacity={0.7}/>
                            </linearGradient>
                        </defs>
                        
                        <CartesianGrid 
                            strokeDasharray="3 3" 
                            stroke="#374151" 
                            strokeOpacity={0.3}
                        />
                        <XAxis
                            dataKey="name"
                            stroke="#9ca3af"
                            tick={{ fontSize: 12, fill: '#d1d5db' }}
                            tickLine={{ stroke: '#6b7280' }}
                            axisLine={{ stroke: '#6b7280' }}
                        />
                        <YAxis
                            stroke="#9ca3af"
                            allowDecimals={false}
                            tick={{ fontSize: 12, fill: '#d1d5db' }}
                            tickLine={{ stroke: '#6b7280' }}
                            axisLine={{ stroke: '#6b7280' }}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(59, 130, 246, 0.1)', radius: 8 }}
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
                            labelStyle={{ 
                                color: '#f9fafb', 
                                fontWeight: 'bold',
                                marginBottom: '4px'
                            }}
                            formatter={(value, name) => [
                                `${value} task${value !== 1 ? 's' : ''}`,
                                'Count'
                            ]}
                        />

                        <Bar 
                            dataKey="count" 
                            name="Tasks"
                            radius={[6, 6, 0, 0]}
                        >
                            {data.map((entry, index) => {
                                let fillGradient = 'url(#todoGradient)';
                                if (entry.id === 'in-progress') fillGradient = 'url(#progressGradient)';
                                if (entry.id === 'done') fillGradient = 'url(#doneGradient)';
                                
                                return (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={fillGradient}
                                    />
                                );
                            })}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Enhanced Footer with Legend */}
            <div className="px-6 pb-4">
                <div className="flex items-center justify-center gap-6 text-sm">
                    {data.map((section, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: SECTION_COLORS[section.id] }}
                            ></div>
                            <span className="text-gray-300 font-medium">
                                {section.name}: {section.count}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}