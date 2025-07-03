"use client";

import { useState } from 'react';
import TwoFactorAuth from '../components/TwoFactorAuth';
import ClientOnly from '../components/ClientOnly';

// Mock components for other settings for future use
const ProfileSettings = () => <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-white">Profile Settings Coming Soon...</div>;
const NotificationSettings = () => <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-white">Notification Settings Coming Soon...</div>;

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('security');

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'security':
        return <ClientOnly><TwoFactorAuth /></ClientOnly>;
      case 'notifications':
        return <NotificationSettings />;
      default:
        return null;
    }
  };

  const TabButton = ({ tabName, label }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        activeTab === tabName
          ? 'bg-purple-600 text-white'
          : 'text-gray-300 hover:bg-gray-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
          <p className="text-gray-400 mt-2">Manage your account settings and preferences.</p>
        </header>

        <div className="flex space-x-2 border-b border-gray-700 mb-8">
          <TabButton tabName="profile" label="Profile" />
          <TabButton tabName="security" label="Security" />
          <TabButton tabName="notifications" label="Notifications" />
        </div>

        <main>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default SettingsPage; 