"use client";

import TwoFactorAuth from '../components/TwoFactorAuth';
import ClientOnly from '../components/ClientOnly';

const SettingsPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
          <p className="text-gray-400 mt-2">Manage your security settings.</p>
        </header>

        <main>
          <ClientOnly><TwoFactorAuth /></ClientOnly>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage; 