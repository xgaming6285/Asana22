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
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-white">Създаване на акаунт</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-300">
                Име
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="w-1/2">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-300">
                Фамилия
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Имейл
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Парола
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Сила на паролата:</span>
                  <span className={`text-xs font-medium ${
                    passwordStrength.color === 'green' ? 'text-green-400' :
                    passwordStrength.color === 'yellow' ? 'text-yellow-400' :
                    passwordStrength.color === 'red' ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {passwordStrength.strength}
                  </span>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Изисквания: минимум 6 символа, главна буква, малка буква, цифра
                </div>
              </div>
            )}
          </div>
          
          {/* Captcha Section */}
          <div>
            <label htmlFor="captcha" className="block text-sm font-medium text-gray-300">
              Проверка за сигурност
            </label>
            <div className="mt-1 flex items-center space-x-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-white font-mono text-lg bg-gray-700 px-3 py-2 rounded border border-gray-600">
                    {captcha.question}
                  </span>
                  <input
                    id="captcha"
                    name="captcha"
                    type="number"
                    required
                    value={captchaInput}
                    onChange={handleCaptchaChange}
                    placeholder="Отговор"
                    className="w-20 px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  generateCaptcha();
                  setCaptchaInput('');
                }}
                className="px-3 py-2 text-sm text-purple-400 hover:text-purple-300 border border-purple-500 rounded-md hover:bg-purple-500 hover:bg-opacity-10 transition-colors"
                title="Генерирай нов въпрос"
              >
                ↻
              </button>
            </div>
            <div className="mt-1 text-xs text-gray-500">
              Решете математическия въпрос за да продължите
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 font-bold text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {loading ? 'Регистриране...' : 'Регистрация'}
            </button>
          </div>
        </form>
         <p className="text-sm text-center text-gray-400">
          Вече имате акаунт?{' '}
          <Link href="/login" className="font-medium text-purple-500 hover:text-purple-400">
            Вход
          </Link>
        </p>
      </div>
    </div>
  );
} 