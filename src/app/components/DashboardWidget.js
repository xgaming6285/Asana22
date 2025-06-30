"use client";

import { useState } from 'react';

const DashboardWidget = ({ 
  title, 
  subtitle, 
  icon, 
  children, 
  actions, 
  className = '', 
  collapsible = false,
  defaultCollapsed = false,
  loading = false,
  error = null,
  refreshable = false,
  onRefresh = null,
  themeColors = null
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [refreshing, setRefreshing] = useState(false);

  // Default theme colors if not provided
  const defaultThemeColors = {
    primary: 'from-purple-500 to-pink-500'
  };
  const currentTheme = themeColors || defaultThemeColors;

  const handleRefresh = async () => {
    if (onRefresh && !refreshing) {
      setRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Error refreshing widget:', error);
      } finally {
        setRefreshing(false);
      }
    }
  };

  return (
    <div className={`bg-gradient-to-r from-gray-800/60 to-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-xl transition-all duration-300 hover:border-gray-600/50 ${className}`}>
      {/* Widget Header */}
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className={`w-8 h-8 bg-gradient-to-r ${currentTheme.primary} rounded-xl flex items-center justify-center`}>
              {typeof icon === 'string' ? (
                <span className="text-lg">{icon}</span>
              ) : (
                icon
              )}
            </div>
          )}
          <div>
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            {subtitle && (
              <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {refreshable && (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200 disabled:opacity-50"
              title="Refresh"
            >
              <svg 
                className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}

          {collapsible && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
              title={collapsed ? 'Expand' : 'Collapse'}
            >
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}

          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Widget Content */}
      <div className={`transition-all duration-300 overflow-hidden ${collapsed ? 'max-h-0' : 'max-h-none'}`}>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-pulse"></div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-red-400 font-medium mb-2">Error loading widget</p>
              <p className="text-sm text-gray-500">{error}</p>
              {refreshable && (
                <button
                  onClick={handleRefresh}
                  className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              )}
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardWidget; 