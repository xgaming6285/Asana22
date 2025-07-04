"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import FieldAwareRonImage from '../components/FieldAwareRonImage';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState(null);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError('Липсва токен за нулиране на парола.');
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Паролите не съвпадат');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, token }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Възникна грешка при нулирането на паролата');
      }

      setSuccess(data.message + '. Ще бъдете пренасочени към страницата за вход след 3 секунди...');
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Animated gradient background with storm effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 animate-storm-background">
        <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/10 via-purple-500/10 to-cyan-500/10 animate-gradient-flow"></div>
      </div>
      
      {/* Lightning effects with branching */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Lightning bolt 1 - Left side with branches */}
        <div className="absolute top-0 left-[8%] animate-lightning-strike-1">
          <svg width="120" height="100vh" viewBox="0 0 120 800" className="text-white h-screen">
            {/* Main lightning bolt */}
            <path d="M60 0 L55 80 L75 75 L45 160 L85 155 L35 240 L70 235 L25 320 L65 315 L15 400 L55 395 L10 480 L50 475 L5 560 L45 555 L20 640 L40 635 L30 720 L35 800" 
                  stroke="currentColor" strokeWidth="3" fill="none" 
                  className="drop-shadow-[0_0_12px_rgba(139,92,246,0.9)]"/>
            <path d="M60 0 L55 80 L75 75 L45 160 L85 155 L35 240 L70 235 L25 320 L65 315 L15 400 L55 395 L10 480 L50 475 L5 560 L45 555 L20 640 L40 635 L30 720 L35 800" 
                  stroke="rgba(255,255,255,0.95)" strokeWidth="1.5" fill="none"/>
            
            {/* Branch 1 - from first zigzag */}
            <path d="M75 75 L95 90 L85 110 L105 125" 
                  stroke="currentColor" strokeWidth="2" fill="none" opacity="0.8"
                  className="drop-shadow-[0_0_8px_rgba(139,92,246,0.7)]"/>
            <path d="M75 75 L95 90 L85 110 L105 125" 
                  stroke="rgba(255,255,255,0.8)" strokeWidth="1" fill="none"/>
            
            {/* Branch 2 - from second zigzag */}
            <path d="M45 160 L25 180 L35 200 L15 220 L25 240" 
                  stroke="currentColor" strokeWidth="2" fill="none" opacity="0.7"
                  className="drop-shadow-[0_0_6px_rgba(139,92,246,0.6)]"/>
            <path d="M45 160 L25 180 L35 200 L15 220 L25 240" 
                  stroke="rgba(255,255,255,0.7)" strokeWidth="1" fill="none"/>
            
            {/* Branch 3 - from middle section */}
            <path d="M70 235 L90 250 L80 270 L100 285 L90 305" 
                  stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6"
                  className="drop-shadow-[0_0_5px_rgba(139,92,246,0.5)]"/>
            <path d="M70 235 L90 250 L80 270 L100 285 L90 305" 
                  stroke="rgba(255,255,255,0.6)" strokeWidth="0.8" fill="none"/>
            
            {/* Mini branches */}
            <path d="M85 155 L100 170 L95 185" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5"/>
            <path d="M65 315 L80 330 L75 345" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5"/>
            <path d="M55 395 L70 410 L65 425" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4"/>
            <path d="M50 475 L35 490 L40 505" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4"/>
            <path d="M45 555 L60 570 L55 585" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3"/>
          </svg>
        </div>
        
        {/* Lightning bolt 2 - Center left with branches */}
        <div className="absolute top-0 left-[35%] animate-lightning-strike-2">
          <svg width="100" height="100vh" viewBox="0 0 100 800" className="text-blue-300 h-screen">
            {/* Main lightning bolt */}
            <path d="M50 0 L60 90 L35 85 L70 170 L30 165 L75 250 L40 245 L80 330 L25 325 L85 410 L35 405 L90 490 L20 485 L85 570 L40 565 L75 650 L50 645 L60 730 L45 800" 
                  stroke="currentColor" strokeWidth="3" fill="none"
                  className="drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]"/>
            <path d="M50 0 L60 90 L35 85 L70 170 L30 165 L75 250 L40 245 L80 330 L25 325 L85 410 L35 405 L90 490 L20 485 L85 570 L40 565 L75 650 L50 645 L60 730 L45 800" 
                  stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" fill="none"/>
            
            {/* Branches */}
            <path d="M35 85 L15 100 L25 120 L5 135" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.8"/>
            <path d="M70 170 L90 185 L80 205 L95 220" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.7"/>
            <path d="M30 165 L10 180 L20 200 L5 215" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6"/>
            <path d="M75 250 L95 265 L85 285" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6"/>
            <path d="M40 245 L20 260 L30 280" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5"/>
            
            {/* Mini branches */}
            <path d="M80 330 L95 345 L90 360" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5"/>
            <path d="M25 325 L10 340 L15 355" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4"/>
            <path d="M85 410 L70 425 L75 440" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4"/>
            <path d="M35 405 L20 420 L25 435" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3"/>
            <path d="M90 490 L75 505 L80 520" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3"/>
          </svg>
        </div>
        
        {/* Lightning bolt 3 - Center right with branches */}
        <div className="absolute top-0 right-[25%] animate-lightning-strike-3">
          <svg width="110" height="100vh" viewBox="0 0 110 800" className="text-pink-300 h-screen">
            {/* Main lightning bolt */}
            <path d="M55 0 L45 70 L70 65 L35 150 L80 145 L25 230 L75 225 L15 310 L85 305 L10 390 L90 385 L20 470 L95 465 L5 550 L85 545 L25 630 L70 625 L40 710 L55 800" 
                  stroke="currentColor" strokeWidth="3" fill="none"
                  className="drop-shadow-[0_0_14px_rgba(236,72,153,0.7)]"/>
            <path d="M55 0 L45 70 L70 65 L35 150 L80 145 L25 230 L75 225 L15 310 L85 305 L10 390 L90 385 L20 470 L95 465 L5 550 L85 545 L25 630 L70 625 L40 710 L55 800" 
                  stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" fill="none"/>
            
            {/* Branches */}
            <path d="M70 65 L90 80 L80 100 L100 115" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.8"/>
            <path d="M35 150 L15 165 L25 185 L5 200" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.7"/>
            <path d="M80 145 L100 160 L90 180 L105 195" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6"/>
            <path d="M25 230 L5 245 L15 265" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6"/>
            <path d="M75 225 L95 240 L85 260 L100 275" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5"/>
            <path d="M15 310 L0 325 L10 345" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5"/>
            
            {/* Mini branches */}
            <path d="M85 305 L70 320 L75 335" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5"/>
            <path d="M10 390 L25 405 L20 420" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4"/>
            <path d="M90 385 L105 400 L100 415" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4"/>
            <path d="M20 470 L5 485 L10 500" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3"/>
            <path d="M95 465 L80 480 L85 495" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3"/>
            <path d="M5 550 L20 565 L15 580" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3"/>
          </svg>
        </div>
        
        {/* Lightning bolt 4 - Far right with branches */}
        <div className="absolute top-0 right-[5%] animate-lightning-strike-4">
          <svg width="90" height="100vh" viewBox="0 0 90 800" className="text-cyan-300 h-screen">
            {/* Main lightning bolt */}
            <path d="M45 0 L50 85 L25 80 L60 165 L20 160 L70 245 L15 240 L75 325 L30 320 L80 405 L10 400 L85 485 L25 480 L80 565 L35 560 L70 645 L45 640 L55 725 L40 800" 
                  stroke="currentColor" strokeWidth="3" fill="none"
                  className="drop-shadow-[0_0_9px_rgba(59,130,246,0.7)]"/>
            <path d="M45 0 L50 85 L25 80 L60 165 L20 160 L70 245 L15 240 L75 325 L30 320 L80 405 L10 400 L85 485 L25 480 L80 565 L35 560 L70 645 L45 640 L55 725 L40 800" 
                  stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" fill="none"/>
            
            {/* Branches */}
            <path d="M25 80 L5 95 L15 115" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.8"/>
            <path d="M60 165 L80 180 L70 200 L85 215" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.7"/>
            <path d="M20 160 L0 175 L10 195" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6"/>
            <path d="M70 245 L85 260 L75 280" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6"/>
            <path d="M15 240 L0 255 L10 275" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5"/>
            
            {/* Mini branches */}
            <path d="M75 325 L60 340 L65 355" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5"/>
            <path d="M30 320 L15 335 L20 350" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4"/>
            <path d="M80 405 L65 420 L70 435" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4"/>
            <path d="M10 400 L25 415 L20 430" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3"/>
            <path d="M85 485 L70 500 L75 515" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3"/>
            <path d="M25 480 L10 495 L15 510" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3"/>
          </svg>
        </div>
      </div>
      
      {/* Floating orbs */}
      <div className="absolute inset-0">
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className="absolute animate-float-orb"
            style={{
              left: `${(i * 8.33) % 100}%`,
              top: `${(i * 13.7) % 100}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${4 + (i % 2) * 0.4}s`
            }}
          >
            <div className="w-10 h-10 border border-indigo-300/20 rounded-full"></div>
          </div>
        ))}
      </div>
      
      {/* Floating water bubbles */}
      <div className="absolute inset-0">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={`bubble-${i}`}
            className="absolute animate-water-bubble-float"
            style={{
              left: `${(i * 12 + 8) % 95}%`,
              animationDelay: `${i * 1.5}s`,
              animationDuration: `${8 + (i % 3) * 2}s`
            }}
          >
            <div 
              className="bg-blue-300/20 rounded-full border border-blue-300/30"
              style={{
                width: `${4 + (i % 3) * 2}px`,
                height: `${4 + (i % 3) * 2}px`
              }}
            ></div>
          </div>
        ))}
        
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={`bubble-2-${i}`}
            className="absolute animate-water-bubble-float"
            style={{
              left: `${(i * 18 + 12) % 90}%`,
              animationDelay: `${i * 2.2}s`,
              animationDuration: `${10 + (i % 2) * 1.5}s`
            }}
          >
            <div 
              className="bg-cyan-300/15 rounded-full border border-cyan-300/25"
              style={{
                width: `${3 + (i % 4) * 1.5}px`,
                height: `${3 + (i % 4) * 1.5}px`
              }}
            ></div>
          </div>
        ))}
      </div>
      
      {/* Water shimmer overlay */}
      <div className="absolute inset-0 water-gradient opacity-30"></div>
      
      {/* Rain overlay for atmospheric effect */}
      <div className="absolute inset-0 rain-overlay"></div>
      
      {/* Floating background elements with thunder effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float animate-thunder-rumble"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-float-reverse animate-thunder-rumble"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-500/15 rounded-full blur-2xl animate-pulse-slow animate-thunder-rumble"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        {/* Ron's companion */}
        <div className="absolute left-4 bottom-4 md:left-8 md:bottom-8 w-32 h-32 md:w-48 md:h-48 z-20">
          <FieldAwareRonImage />
        </div>
        
        <div className="w-full max-w-md p-6 sm:p-8 space-y-4 sm:space-y-6 bg-slate-900/50 backdrop-blur-md rounded-2xl shadow-2xl shadow-black/30 border border-slate-700/50 transition-all duration-300 hover:border-slate-600/80">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
              Нулиране на парола
            </h1>
            <p className="mt-2 text-slate-300">Въведете новата си парола</p>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-900/20 border border-green-500/50 text-green-400 px-4 py-3 rounded-xl">
              {success}
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Password field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                  Нова парола
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                    placeholder="Въведете новата парола"
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
              </div>

              {/* Confirm Password field */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200">
                  Потвърди парола
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                    placeholder="Потвърдете новата парола"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? (
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
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading || !token}
                className="w-full relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                      <span>Нулиране...</span>
                    </>
                  ) : (
                    <>
                      <span>Нулиране на парола</span>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </>
                  )}
                </div>
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="text-center pt-4 border-t border-white/10">
            <p className="text-gray-300">
              Спомнихте си паролата?{' '}
              <Link 
                href="/login" 
                className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-300 hover:to-pink-300 transition-all duration-200"
              >
                Влезте тук
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Field-aware Ron Images */}
      <FieldAwareRonImage formType="resetPassword" />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
} 