"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Captcha state
  const [captcha, setCaptcha] = useState({ question: '', answer: 0 });
  const [captchaInput, setCaptchaInput] = useState('');

  // Generate new captcha
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let answer;
    switch (operator) {
      case '+':
        answer = num1 + num2;
        break;
      case '-':
        answer = num1 - num2;
        break;
      case '*':
        answer = num1 * num2;
        break;
      default:
        answer = num1 + num2;
    }
    
    setCaptcha({
      question: `${num1} ${operator} ${num2} = ?`,
      answer: answer
    });
  };

  // Generate captcha on component mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCaptchaChange = (e) => {
    setCaptchaInput(e.target.value);
  };

  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 6) {
      errors.push('Паролата трябва да бъде поне 6 символа');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Паролата трябва да съдържа поне една главна буква');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Паролата трябва да съдържа поне една малка буква');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Паролата трябва да съдържа поне една цифра');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError('Моля, попълнете имейл и парола.');
      setLoading(false);
      return;
    }

    // Validate captcha
    if (parseInt(captchaInput) !== captcha.answer) {
      setError('Неправилен отговор на математическия въпрос. Моля, опитайте отново.');
      generateCaptcha(); // Generate new captcha
      setCaptchaInput(''); // Clear captcha input
      setLoading(false);
      return;
    }

    // Validate password
    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join('. '));
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Нещо се обърка');
      }

      // Mark user as new for tutorial purposes
      if (typeof window !== 'undefined') {
        localStorage.setItem('isNewUser', 'true');
        sessionStorage.setItem('justRegistered', 'true');
      }

      // Redirect to login page on successful registration
      router.push('/login');

    } catch (err) {
      setError(err.message);
      // Generate new captcha on error
      generateCaptcha();
      setCaptchaInput('');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    const errors = validatePassword(password);
    if (password.length === 0) return { strength: 'none', color: 'gray' };
    if (errors.length === 0) return { strength: 'Силна', color: 'green' };
    if (errors.length <= 2) return { strength: 'Средна', color: 'yellow' };
    return { strength: 'Слаба', color: 'red' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-gradient-flow"></div>
      </div>
      
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float-reverse"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-pink-500/15 rounded-full blur-2xl animate-pulse-slow"></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg animate-slide-in-up">
          {/* Glass morphism card */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white curved-header">
                Създайте акаунт
              </h1>
              <p className="text-gray-300 curved-subtitle">
                Присъединете се към нашата платформа днес
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-200">
                    Име
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                      placeholder="Вашето име"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-200">
                    Фамилия
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                      placeholder="Вашата фамилия"
                    />
                  </div>
                </div>
              </div>

              {/* Email field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                  Имейл адрес
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                  Парола
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                    placeholder="Създайте сигурна парола"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                
                {/* Password strength indicator */}
                {formData.password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Сила на паролата:</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        passwordStrength.color === 'green' ? 'text-green-300 bg-green-500/20' :
                        passwordStrength.color === 'yellow' ? 'text-yellow-300 bg-yellow-500/20' :
                        passwordStrength.color === 'red' ? 'text-red-300 bg-red-500/20' : 'text-gray-400 bg-gray-500/20'
                      }`}>
                        {passwordStrength.strength}
                      </span>
                    </div>
                    <div className="bg-white/10 rounded-full h-2 overflow-hidden">
                      <div className={`h-full transition-all duration-300 ${
                        passwordStrength.color === 'green' ? 'bg-green-500 w-full' :
                        passwordStrength.color === 'yellow' ? 'bg-yellow-500 w-2/3' :
                        passwordStrength.color === 'red' ? 'bg-red-500 w-1/3' : 'bg-gray-500 w-0'
                      }`}></div>
                    </div>
                    <p className="text-xs text-gray-400">
                      Изисквания: минимум 6 символа, главна буква, малка буква, цифра
                    </p>
                  </div>
                )}
              </div>
              
              {/* Captcha Section */}
              <div className="space-y-2">
                <label htmlFor="captcha" className="block text-sm font-medium text-gray-200">
                  Проверка за сигурност
                </label>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/20 rounded-lg px-4 py-2 min-w-[120px]">
                          <span className="text-white font-mono text-lg font-semibold">
                            {captcha.question}
                          </span>
                        </div>
                        <div className="relative">
                          <input
                            id="captcha"
                            name="captcha"
                            type="number"
                            required
                            value={captchaInput}
                            onChange={handleCaptchaChange}
                            placeholder="?"
                            className="w-20 px-3 py-2 text-center text-white bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        generateCaptcha();
                        setCaptchaInput('');
                      }}
                      className="flex items-center justify-center w-10 h-10 text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-400/50 rounded-lg hover:bg-blue-500/10 transition-all duration-200"
                      title="Генерирай нов въпрос"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    Решете математическия въпрос за да продължите
                  </p>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="animate-slide-in-up bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  <div className="flex items-center space-x-2">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading && (
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                )}
                <div className="flex items-center justify-center space-x-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Регистриране...</span>
                    </>
                  ) : (
                    <>
                      <span>Създай акаунт</span>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Footer */}
            <div className="text-center pt-4 border-t border-white/10">
              <p className="text-gray-300">
                Вече имате акаунт?{' '}
                <Link 
                  href="/login" 
                  className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-300 hover:to-purple-300 transition-all duration-200"
                >
                  Влезте тук
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 