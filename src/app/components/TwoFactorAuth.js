"use client";

import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const apiFetch = async (url, options) => {
    const response = await fetch(url, options);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.error || errorData.message || 'An error occurred.');
    }
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    }
    return {};
};

const TwoFactorAuth = () => {
  const { user, refetchUser: fetchUser } = useAuth();
  const [is2faEnabled, setIs2faEnabled] = useState(false);
  const [setupInProgress, setSetupInProgress] = useState(false);
  const [otpAuthUrl, setOtpAuthUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user && !is2faEnabled) {
      // We need to fetch the full user object to check for 2FA status
      const loadUser2faStatus = async () => {
        try {
          const fullUserResponse = await apiFetch('/api/me');
          if (fullUserResponse.user) {
            setIs2faEnabled(fullUserResponse.user.isTwoFactorEnabled);
          }
        } catch (e) {
          setError('Could not load user status.');
        } finally {
          setLoading(false);
        }
      };
      loadUser2faStatus();
    } else {
        setLoading(false);
    }
  }, [user, is2faEnabled]);

  const handleEnable2FA = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const response = await apiFetch('/api/auth/2fa/setup', { method: 'POST' });
      setOtpAuthUrl(response.otpauth);
      setSetupInProgress(true);
    } catch (e) {
      setError(e.message || 'Failed to start 2FA setup.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await apiFetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationCode }),
      });
      setMessage('2FA has been enabled successfully!');
      setIs2faEnabled(true);
      setSetupInProgress(false);
      setOtpAuthUrl('');
      // Re-fetch user context if needed, though we set state manually here
      fetchUser();
    } catch (e) {
      setError(e.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await apiFetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: disablePassword }),
      });
      setMessage('2FA has been disabled.');
      setIs2faEnabled(false);
      setDisablePassword('');
      fetchUser();
    } catch (e) {
      setError(e.message || 'Failed to disable 2FA. Check your password.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !setupInProgress) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-4">Two-Factor Authentication</h2>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      {message && <p className="text-green-400 mb-4">{message}</p>}

      {!is2faEnabled && !setupInProgress && (
        <div>
          <p className="text-gray-300 mb-4">
            Protect your account with an extra layer of security.
          </p>
          <button onClick={handleEnable2FA} disabled={loading} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-500">
            {loading ? 'Loading...' : 'Enable 2FA'}
          </button>
        </div>
      )}

      {setupInProgress && (
        <div>
          <p className="text-gray-300 mb-4">1. Scan this QR code with your authenticator app (e.g., Google Authenticator).</p>
          <div className="bg-white p-4 rounded-lg inline-block mb-4">
            {otpAuthUrl && <QRCode value={otpAuthUrl} />}
          </div>
          <p className="text-gray-300 mb-4">2. Enter the 6-digit code from your app to verify.</p>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="bg-gray-700 text-white p-2 rounded w-full mb-4"
            placeholder="123456"
          />
          <button onClick={handleVerify2FA} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-500">
            {loading ? 'Verifying...' : 'Verify & Activate'}
          </button>
        </div>
      )}

      {is2faEnabled && (
        <div>
          <p className="text-green-400 font-semibold mb-4">2FA is currently enabled on your account.</p>
          <p className="text-gray-300 mb-4">To disable it, please enter your password.</p>
          <input
            type="password"
            value={disablePassword}
            onChange={(e) => setDisablePassword(e.target.value)}
            className="bg-gray-700 text-white p-2 rounded w-full mb-4"
            placeholder="Enter your password"
          />
          <button onClick={handleDisable2FA} disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-500">
            {loading ? 'Disabling...' : 'Disable 2FA'}
          </button>
        </div>
      )}
    </div>
  );
};

export default TwoFactorAuth; 