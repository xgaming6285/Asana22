"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import FieldAwareRonImage from '../components/FieldAwareRonImage';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');

  // --- 2FA State ---
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  // --- End 2FA State ---

  useEffect(() => {
    const savedEmail = localStorage.getItem('lastLoggedInEmail');
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
    }

    if (searchParams.get('verified') === 'true') {
      setSuccess('Your email has been verified successfully! You can now log in.');
      router.replace('/login', undefined, { shallow: true });
    }
  }, [router, searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const fieldMap = {
      'field_x1': 'email',
      'field_y2': 'password'
    };
    const actualFieldName = fieldMap[name] || name;
    setFormData((prev) => ({ ...prev, [actualFieldName]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setNeedsVerification(false);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.action === 'resend_verification') {
            setNeedsVerification(true);
        }
        throw new Error(data.error || 'Неуспешен вход');
      }

      if (data.twoFactorRequired) {
        setRequires2FA(true);
        setLoading(false);
        return; 
      }

      localStorage.setItem('lastLoggedInEmail', formData.email);

      if (data.user) {
        setUser(data.user);
      }
      
      router.push('/dashboard');
      router.refresh();

    } catch (err) {
      setError(err.message);
    } finally {
      if (!requires2FA) {
          setLoading(false);
      }
    }
  };

  const handle2FAVerification = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, token: twoFactorToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid 2FA code.');
      }
      if (data.user) {
        setUser(data.user);
      }
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendVerification = async () => {
    setResendLoading(true);
    setError('');
    setResendSuccess('');
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend email.');
      setResendSuccess(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setResendLoading(false);
    }
  };

  const TwoFactorForm = (
    <form onSubmit={handle2FAVerification} className="space-y-4 sm:space-y-6">
        <p className="text-center text-gray-300">Enter the code from your authenticator app.</p>
        <div className="space-y-2">
            <label htmlFor="2fa-token" className="block text-sm font-medium text-gray-200">6-Digit Code</label>
            <div className="relative group">
                <input 
                  id="2fa-token" 
                  type="text" 
                  required 
                  value={twoFactorToken} 
                  onChange={(e) => setTwoFactorToken(e.target.value)} 
                  maxLength="6" 
                  className="w-full text-center tracking-[1em] py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm" 
                  placeholder="123456" 
                />
            </div>
        </div>
        <button type="submit" disabled={loading} className="w-full relative overflow-hidden bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200">
            {loading ? 'Verifying...' : 'Verify'}
        </button>
        <div className="text-center"><button type="button" onClick={() => setRequires2FA(false)} className="text-sm text-gray-400 hover:underline">Back to login</button></div>
    </form>
  );

  const LoginForm = (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-200">
          Имейл адрес
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 018 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          </div>
          <input id="email" name="field_x1" type="text" required value={formData.email} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm" placeholder="your@email.com" />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-200">
          Парола
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <input id="password" name="field_y2" type={showPassword ? "text" : "password"} required value={formData.password} onChange={handleChange} className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm" placeholder="Въведете паролата си" />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors">
            {showPassword ? <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg> : <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
          </button>
        </div>
      </div>
      <div className="flex items-center justify-end"><div className="text-sm"><Link href="/forgot-password" className="font-medium text-purple-400 hover:text-purple-300">Забравена парола?</Link></div></div>
      <button type="submit" disabled={loading} className="w-full relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
        {loading && (<div className="absolute inset-0 bg-white/20 animate-pulse"></div>)}
        <div className="flex items-center justify-center space-x-2">
          {loading ? (<><svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Влизане...</span></>) : (<><span>Вход</span><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg></>)}
        </div>
      </button>
    </form>
  );

  return (
    <div className="fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 animate-storm-background">
        <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/10 via-purple-500/10 to-cyan-500/10 animate-gradient-flow"></div>
      </div>
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          <FieldAwareRonImage fieldXName="field_x1" fieldYName="field_y2" />
          <div className="relative bg-black/40 border border-white/20 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 sm:p-10">
              <div className="text-center mb-6">
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                  {requires2FA ? 'Verification Required' : 'Добре дошли отново'}
                </h1>
                <p className="text-gray-300">
                  {requires2FA ? `Въведете кода за ${formData.email}` : 'Влезте, за да продължите'}
                </p>
              </div>

              {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg mb-4 text-center text-sm">{error}</div>}
              {success && <div className="bg-green-500/20 border border-green-500 text-green-300 p-3 rounded-lg mb-4 text-center text-sm">{success}</div>}
              
              {needsVerification && (
                <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-300 p-3 rounded-lg mb-4 text-center text-sm">
                  <p>{error}</p>
                  <button onClick={handleResendVerification} disabled={resendLoading} className="mt-2 text-yellow-200 font-bold hover:underline">
                    {resendLoading ? 'Изпращане...' : 'Изпрати отново линк за верификация'}
                  </button>
                  {resendSuccess && <p className="mt-2">{resendSuccess}</p>}
                </div>
              )}
              
              {requires2FA ? TwoFactorForm : LoginForm}

              <div className="mt-6 text-center">
                <p className="text-gray-400">
                  Нямате акаунт?{' '}
                  <Link href="/register" className="font-medium text-purple-400 hover:text-purple-300">
                    Регистрация
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}