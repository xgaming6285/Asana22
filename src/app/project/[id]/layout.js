"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { TaskModalProvider } from "../../../app/context/TaskModalContext";
import { useAuth } from "../../../app/context/AuthContext";

// Enhanced Mobile Navigation Overlay Component
function MobileProjectNav({ isOpen, onClose, navItems, pathname, projectId }) {
  const { user } = useAuth();
  const groupedNavItems = navItems.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {});

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Enhanced Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      />

      {/* Enhanced Mobile sidebar with glass morphism */}
      <div className="fixed inset-y-0 left-0 w-80 max-w-sm bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl border-r border-white/10 shadow-2xl transform transition-all duration-300 overflow-y-auto custom-scrollbar">
        {/* Enhanced Header with gradient */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-xl"></div>
          <div className="relative flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-gray-800/50 to-gray-900/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">P</span>
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Project Menu
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 rounded-lg transition-all duration-200 hover:bg-white/10 hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Enhanced Navigation with animations */}
        <nav className="p-6 space-y-8">
          {Object.entries(groupedNavItems).map(([section, items], sectionIndex) => (
            <div key={section} className="space-y-3 animate-fade-in" style={{ animationDelay: `${sectionIndex * 100}ms` }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  {section}
                </h3>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-600 to-transparent"></div>
              </div>
              
              {items.map((item, itemIndex) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={`group relative flex items-center gap-4 p-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${
                      isActive
                        ? "bg-gradient-to-r from-purple-600/30 to-blue-600/30 text-white font-semibold shadow-lg shadow-purple-500/20 border border-purple-500/30"
                        : "text-gray-300 hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-gray-800/50 hover:text-white hover:shadow-lg"
                    }`}
                    style={{ animationDelay: `${(sectionIndex * 100) + (itemIndex * 50)}ms` }}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-400 to-blue-400 rounded-r-full"></div>
                    )}
                    
                    {/* Enhanced icon container */}
                    <div className={`relative flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 ${
                      isActive 
                        ? "bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg shadow-purple-500/30 scale-110" 
                        : "bg-gray-700/50 group-hover:bg-gradient-to-r group-hover:from-purple-500/20 group-hover:to-blue-500/20 group-hover:scale-110"
                    }`}>
                      <span className={`text-lg transition-all duration-300 ${
                        isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                      }`}>
                        {item.icon}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <span className="font-medium">{item.name}</span>
                      {isActive && (
                        <div className="w-full h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full mt-1 animate-scale-in"></div>
                      )}
                    </div>
                    
                    {/* Hover arrow */}
                    <svg className={`w-4 h-4 transition-all duration-300 ${
                      isActive ? "text-purple-300 translate-x-0" : "text-gray-500 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                );
              })}
            </div>
          ))}

          {/* Enhanced Account Section */}
          {user && (
            <div className="space-y-3 pt-6 border-t border-white/10 animate-fade-in" style={{ animationDelay: '400ms' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Account
                </h3>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-600 to-transparent"></div>
              </div>
              
              <Link
                href="/dashboard"
                onClick={onClose}
                className="group relative flex items-center gap-4 p-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] text-gray-300 hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-gray-800/50 hover:text-white hover:shadow-lg"
              >
                <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gray-700/50 group-hover:bg-gradient-to-r group-hover:from-emerald-500/20 group-hover:to-teal-500/20 group-hover:scale-110 transition-all duration-300">
                  <span className="text-lg text-gray-400 group-hover:text-white transition-all duration-300">👤</span>
                </div>
                <span className="font-medium">My Profile</span>
                <svg className="w-4 h-4 text-gray-500 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              
              <Link
                href="/pricing"
                onClick={onClose}
                className="group relative flex items-center gap-4 p-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] text-gray-300 hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-gray-800/50 hover:text-white hover:shadow-lg"
              >
                <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gray-700/50 group-hover:bg-gradient-to-r group-hover:from-emerald-500/20 group-hover:to-teal-500/20 group-hover:scale-110 transition-all duration-300">
                  <span className="text-lg text-gray-400 group-hover:text-white transition-all duration-300">💳</span>
                </div>
                <span className="font-medium">Subscriptions</span>
                <svg className="w-4 h-4 text-gray-500 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </div>
  );
}

// Enhanced Desktop Sidebar Component
function DesktopSidebar({ navItems, pathname, isCollapsed, onToggleCollapse }) {
  const { user } = useAuth();
  const groupedNavItems = navItems.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {});

  return (
    <aside
      className={`hidden lg:flex flex-col bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl border-r border-white/10 shadow-2xl transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Enhanced Header with gradient background */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-xl"></div>
        <div className={`relative flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-6 border-b border-white/10 bg-gradient-to-r from-gray-800/50 to-gray-900/50`}>
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">P</span>
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Project Menu
              </h2>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="text-gray-400 hover:text-white focus:outline-none p-2 rounded-lg transition-all duration-200 hover:bg-white/10 hover:scale-110 focus:ring-2 focus:ring-purple-500/50"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Enhanced Navigation with smooth animations */}
      <nav className="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar">
        {Object.entries(groupedNavItems).map(([section, items], sectionIndex) => (
          <div key={section} className="space-y-3 animate-fade-in" style={{ animationDelay: `${sectionIndex * 100}ms` }}>
            {!isCollapsed && (
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  {section}
                </h3>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-600 to-transparent"></div>
              </div>
            )}
            
            {items.map((item, itemIndex) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative flex items-center rounded-xl transition-all duration-300 ease-in-out transform hover:scale-[1.02] ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600/30 to-blue-600/30 text-white font-semibold shadow-lg shadow-purple-500/20 border border-purple-500/30"
                      : "text-gray-300 hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-gray-800/50 hover:text-white hover:shadow-lg"
                  } ${isCollapsed ? "justify-center p-3" : "px-4 py-4"}`}
                  title={isCollapsed ? item.name : undefined}
                  style={{ animationDelay: `${(sectionIndex * 100) + (itemIndex * 50)}ms` }}
                >
                  {/* Active indicator */}
                  {isActive && !isCollapsed && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-400 to-blue-400 rounded-r-full"></div>
                  )}
                  
                  {/* Enhanced icon container */}
                  <div className={`relative flex items-center justify-center ${isCollapsed ? 'w-8 h-8' : 'w-10 h-10'} rounded-lg transition-all duration-300 ${
                    isActive 
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg shadow-purple-500/30 scale-110" 
                      : "bg-gray-700/50 group-hover:bg-gradient-to-r group-hover:from-purple-500/20 group-hover:to-blue-500/20 group-hover:scale-110"
                  } ${!isCollapsed && "mr-4"}`}>
                    <span
                      className={`${isCollapsed ? 'text-base' : 'text-lg'} transition-all duration-300 ${
                        isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                      }`}
                    >
                      {item.icon}
                    </span>
                  </div>
                  
                  {!isCollapsed && (
                    <div className="flex-1">
                      <span className="font-medium">{item.name}</span>
                      {isActive && (
                        <div className="w-full h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full mt-1 animate-scale-in"></div>
                      )}
                    </div>
                  )}
                  
                  {/* Hover arrow for expanded state */}
                  {!isCollapsed && (
                    <svg className={`w-4 h-4 transition-all duration-300 ${
                      isActive ? "text-purple-300 translate-x-0" : "text-gray-500 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 border border-white/10">
                      {item.name}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45 border-l border-b border-white/10"></div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Account Settings at the bottom */}
        {user && (
          <div className="p-6 border-t border-white/10 animate-fade-in" style={{ animationDelay: '500ms' }}></div>
        )}
      </div>
    </aside>
  );
}

// Enhanced Mobile Header Component
function MobileHeader({ onMenuOpen, projectId }) {
  return (
    <header className="lg:hidden relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-800/95 to-gray-900/95 backdrop-blur-xl"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10"></div>
      
      <div className="relative border-b border-white/10 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuOpen}
            className="text-gray-400 hover:text-white p-2 rounded-lg transition-all duration-200 hover:bg-white/10 hover:scale-110"
            aria-label="Open project menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-bold">P</span>
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent truncate">
              Project
            </h1>
          </div>
        </div>

        {/* Enhanced Back to projects link */}
        <Link
          href="/dashboard"
          className="group flex items-center gap-2 text-gray-400 hover:text-white p-2 rounded-lg transition-all duration-200 hover:bg-white/10 hover:scale-110"
          aria-label="Back to projects"
        >
          <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm font-medium hidden sm:inline">Back</span>
        </Link>
      </div>
    </header>
  );
}

export default function ProjectLayout({ children }) {
  const params = useParams();
  const { id: projectId } = params;
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const navItems = [
    // Project Overview Section
    { name: "Overview", href: `/project/${projectId}/overview`, icon: "📋", section: "Project Overview" },
    { name: "Goals", href: `/goals`, icon: "🎯", section: "Project Overview" },
    { name: "Dashboard", href: `/project/${projectId}/stats`, icon: "📊", section: "Project Overview" },

    // Task Management Section
    { name: "Board", href: `/project/${projectId}/board`, icon: "📌", section: "Task Management" },
    { name: "List", href: `/project/${projectId}/list`, icon: "📝", section: "Task Management" },

    // Time Management Section
    { name: "Timeline", href: `/project/${projectId}/timeline`, icon: "📅", section: "Time Management" },
    { name: "Gantt Chart", href: `/project/${projectId}/gantt`, icon: "📈", section: "Time Management" },
    { name: "Calendar", href: `/project/${projectId}/calendar`, icon: "🗓️", section: "Time Management" },

    // Communication & Resources Section
    { name: "Messages", href: `/project/${projectId}/messages`, icon: "💬", section: "Communication & Resources" },
    { name: "Files", href: `/project/${projectId}/files`, icon: "📁", section: "Communication & Resources" },
  ];

  return (
    <TaskModalProvider>
      <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
        {/* Mobile Header */}
        <MobileHeader
          onMenuOpen={() => setIsMobileMenuOpen(true)}
          projectId={projectId}
        />

        {/* Desktop Sidebar */}
        <DesktopSidebar
          navItems={navItems}
          pathname={pathname}
          isCollapsed={isDesktopCollapsed}
          onToggleCollapse={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
        />

        {/* Mobile Navigation Overlay */}
        <MobileProjectNav
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          navItems={navItems}
          pathname={pathname}
          projectId={projectId}
        />

        {/* Enhanced Main Content Area */}
        <main className="flex-1 min-h-0 overflow-auto relative">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
              backgroundSize: '20px 20px'
            }}></div>
          </div>
          
          <div className="relative h-full p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </TaskModalProvider>
  );
}