"use client";

import { useState, useEffect } from 'react';

const DashboardCustomizer = ({ onLayoutChange, currentLayout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [widgets, setWidgets] = useState([
    { id: 'overview', name: 'Overview Stats', enabled: true, icon: '📊' },
    { id: 'notifications', name: 'Smart Alerts', enabled: true, icon: '🔔' },
    { id: 'quickTask', name: 'Quick Task Creator', enabled: true, icon: '⚡' },
    { id: 'performance', name: 'Performance Analytics', enabled: true, icon: '📈' },
    { id: 'activity', name: 'Activity Feed', enabled: true, icon: '🔥' },
    { id: 'quickActions', name: 'Quick Actions', enabled: true, icon: '🚀' },
  ]);

  const [theme, setTheme] = useState('default');
  const [compactMode, setCompactMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved'

  useEffect(() => {
    // Load saved preferences from localStorage (client-side only)
    if (typeof window !== 'undefined') {
      const savedPrefs = localStorage.getItem('dashboardPreferences');
      if (savedPrefs) {
        try {
          const prefs = JSON.parse(savedPrefs);
          
          // Handle widgets - support both old array format and new object format
          if (prefs.widgets) {
            if (Array.isArray(prefs.widgets)) {
              // Old format: array of widget objects
              setWidgets(prefs.widgets);
            } else {
              // New format: object with widget IDs as keys
              const defaultWidgets = [
                { id: 'overview', name: 'Overview Stats', enabled: true, icon: '📊' },
                { id: 'notifications', name: 'Smart Alerts', enabled: true, icon: '🔔' },
                { id: 'quickTask', name: 'Quick Task Creator', enabled: true, icon: '⚡' },
                { id: 'performance', name: 'Performance Analytics', enabled: true, icon: '📈' },
                { id: 'activity', name: 'Activity Feed', enabled: true, icon: '🔥' },
                { id: 'quickActions', name: 'Quick Actions', enabled: true, icon: '🚀' },
              ];
              const updatedWidgets = defaultWidgets.map(widget => ({
                ...widget,
                enabled: prefs.widgets[widget.id] !== false // Default to true if not specified
              }));
              setWidgets(updatedWidgets);
            }
          }
          
          setTheme(prefs.theme || 'default');
          setCompactMode(prefs.compactMode || false);
        } catch (error) {
          console.error('Error loading dashboard preferences:', error);
        }
      }
    }
  }, []);

  const savePreferences = () => {
    if (typeof window !== 'undefined') {
      setSaveStatus('saving');
      
      // Convert widgets array to the expected object format
      const widgetsObject = {};
      widgets.forEach(widget => {
        widgetsObject[widget.id] = widget.enabled;
      });

      const preferences = {
        widgets: widgetsObject,
        theme,
        compactMode,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('dashboardPreferences', JSON.stringify(preferences));
      
      if (onLayoutChange) {
        onLayoutChange(preferences);
      }

      // Provide user feedback
      console.log('Dashboard preferences saved successfully!', preferences);
      setSaveStatus('saved');
      
      // Reset status after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }
  };

  const toggleWidget = (widgetId) => {
    const updatedWidgets = widgets.map(widget =>
      widget.id === widgetId ? { ...widget, enabled: !widget.enabled } : widget
    );
    setWidgets(updatedWidgets);
  };

  const resetToDefault = () => {
    const defaultWidgets = widgets.map(widget => ({ ...widget, enabled: true }));
    setWidgets(defaultWidgets);
    setTheme('default');
    setCompactMode(false);
    setSaveStatus('idle');
    
    // Automatically save the default preferences
    setTimeout(() => {
      savePreferences();
    }, 100);
  };

  const themes = [
    { id: 'default', name: 'Default', colors: 'from-purple-500 to-pink-500' },
    { id: 'blue', name: 'Ocean', colors: 'from-blue-500 to-cyan-500' },
    { id: 'green', name: 'Forest', colors: 'from-green-500 to-teal-500' },
    { id: 'orange', name: 'Sunset', colors: 'from-orange-500 to-red-500' },
    { id: 'indigo', name: 'Night', colors: 'from-indigo-500 to-purple-600' },
  ];

  if (!isOpen) {
    // Get current theme colors for the floating button
    const currentThemeColors = themes.find(t => t.id === theme)?.colors || 'from-purple-500 to-pink-500';
    const currentThemeHover = currentThemeColors.replace('500', '600');
    const currentThemeShadow = currentThemeColors.includes('purple') ? 'shadow-purple-500/25' : 
                              currentThemeColors.includes('blue') ? 'shadow-blue-500/25' :
                              currentThemeColors.includes('green') ? 'shadow-green-500/25' :
                              currentThemeColors.includes('orange') ? 'shadow-orange-500/25' :
                              currentThemeColors.includes('indigo') ? 'shadow-indigo-500/25' :
                              'shadow-purple-500/25';

    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r ${currentThemeColors} hover:${currentThemeHover} text-white rounded-full shadow-2xl hover:${currentThemeShadow} transition-all duration-300 transform hover:scale-110 flex items-center justify-center group`}
        title="Customize Dashboard"
      >
        <svg className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => setIsOpen(false)}
      />

      {/* Customizer Panel */}
      <div className="absolute right-0 top-0 h-full w-96 bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl border-l border-gray-700/50 shadow-2xl transform transition-transform duration-300 overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-xl border-b border-gray-700/50 p-6 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 bg-gradient-to-r ${themes.find(t => t.id === theme)?.colors || 'from-purple-500 to-pink-500'} rounded-xl flex items-center justify-center`}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">Customize Dashboard</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white p-2 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Widget Toggles */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-xl">🧩</span>
              Dashboard Widgets
            </h3>
            <div className="space-y-3">
              {widgets.map((widget) => (
                <div key={widget.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{widget.icon}</span>
                    <span className="text-gray-300">{widget.name}</span>
                  </div>
                  <button
                    onClick={() => toggleWidget(widget.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      widget.enabled ? 'bg-purple-600' : 'bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      widget.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Theme Selection */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-xl">🎨</span>
              Color Theme
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {themes.map((themeOption) => (
                <button
                  key={themeOption.id}
                  onClick={() => setTheme(themeOption.id)}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                    theme === themeOption.id
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                  }`}
                >
                  <div className={`w-full h-8 bg-gradient-to-r ${themeOption.colors} rounded-lg mb-2`}></div>
                  <span className="text-sm text-gray-300">{themeOption.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Display Options */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-xl">⚙️</span>
              Display Options
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-colors">
                <div>
                  <span className="text-gray-300 font-medium">Compact Mode</span>
                  <p className="text-sm text-gray-500">Reduce spacing and padding</p>
                </div>
                <button
                  onClick={() => setCompactMode(!compactMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    compactMode ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    compactMode ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4 border-t border-gray-700/50">
            <button
              onClick={savePreferences}
              disabled={saveStatus === 'saving'}
              className={`w-full font-medium py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2 ${
                saveStatus === 'saved' 
                  ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                  : saveStatus === 'saving'
                  ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
              }`}
            >
              {saveStatus === 'saving' && (
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              {saveStatus === 'saved' && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {saveStatus === 'idle' ? 'Save Preferences' : saveStatus === 'saving' ? 'Saving...' : 'Saved!'}
            </button>
            <button
              onClick={resetToDefault}
              className="w-full bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white font-medium py-3 px-4 rounded-xl transition-all duration-300"
            >
              Reset to Default
            </button>
          </div>

          {/* Info */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-blue-400 text-lg">💡</span>
              <div>
                <h4 className="text-blue-300 font-medium mb-1">Pro Tip</h4>
                <p className="text-sm text-blue-200/80">
                  Your dashboard preferences are saved locally and will persist across sessions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCustomizer; 