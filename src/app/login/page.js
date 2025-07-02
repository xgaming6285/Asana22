"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('lastLoggedInEmail');
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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
        throw new Error(data.error || 'Неуспешен вход');
      }

      // Save email to localStorage for future use
      localStorage.setItem('lastLoggedInEmail', formData.email);

      // Set user in the auth context
      if (data.user) {
        setUser(data.user);
      }
      
      // Redirect to dashboard on successful login
      router.push('/dashboard');
      router.refresh(); // Refresh to update server-side state if needed

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
        
        {/* Additional small branching lightning elements scattered around - more frequent and subtle */}
        <div className="absolute top-[15%] left-[20%] animate-lightning-branch-1">
          <svg width="25" height="35" viewBox="0 0 25 35" className="text-purple-400 opacity-60">
            <path d="M12 0 L9 12 L15 10 L6 22 L18 20 L9 35" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4"/>
            <path d="M15 10 L20 15 L18 20" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3"/>
            <path d="M6 22 L2 26 L4 30" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3"/>
            <path d="M18 20 L22 24 L20 28" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.25"/>
          </svg>
        </div>
        
        <div className="absolute top-[45%] left-[60%] animate-lightning-branch-2">
          <svg width="20" height="30" viewBox="0 0 20 30" className="text-blue-400 opacity-50">
            <path d="M10 0 L7 9 L13 8 L4 18 L16 16 L7 30" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4"/>
            <path d="M13 8 L18 12 L16 16" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3"/>
            <path d="M4 18 L1 22 L3 26" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3"/>
          </svg>
        </div>
        
        <div className="absolute top-[70%] right-[40%] animate-lightning-branch-3">
          <svg width="18" height="28" viewBox="0 0 18 28" className="text-pink-400 opacity-45">
            <path d="M9 0 L6 8 L12 7 L3 16 L15 14 L6 28" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4"/>
            <path d="M12 7 L16 11 L14 15" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3"/>
            <path d="M3 16 L0 20 L2 24" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3"/>
          </svg>
        </div>
        
        <div className="absolute top-[25%] right-[15%] animate-lightning-branch-4">
          <svg width="15" height="25" viewBox="0 0 15 25" className="text-cyan-400 opacity-40">
            <path d="M7 0 L5 7 L10 6 L2 13 L13 11 L4 25" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4"/>
            <path d="M10 6 L14 9 L12 13" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3"/>
            <path d="M2 13 L0 17 L2 21" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3"/>
          </svg>
        </div>

        {/* Micro lightning branches - very subtle and frequent */}
        <div className="absolute top-[8%] left-[45%] animate-lightning-micro-1">
          <svg width="12" height="18" viewBox="0 0 12 18" className="text-purple-300 opacity-30">
            <path d="M6 0 L4 6 L8 5 L2 12 L10 10 L3 18" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3"/>
            <path d="M8 5 L11 7 L9 10" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.2"/>
          </svg>
        </div>
        
        <div className="absolute top-[35%] right-[8%] animate-lightning-micro-2">
          <svg width="10" height="15" viewBox="0 0 10 15" className="text-blue-300 opacity-25">
            <path d="M5 0 L3 5 L7 4 L1 10 L9 8 L2 15" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3"/>
            <path d="M7 4 L9 6 L8 9" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.2"/>
          </svg>
        </div>
        
        <div className="absolute top-[55%] left-[12%] animate-lightning-micro-3">
          <svg width="14" height="20" viewBox="0 0 14 20" className="text-pink-300 opacity-35">
            <path d="M7 0 L5 7 L9 6 L3 13 L11 11 L4 20" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3"/>
            <path d="M9 6 L12 8 L10 12" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.2"/>
            <path d="M3 13 L1 16 L3 19" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.2"/>
          </svg>
        </div>
        
        <div className="absolute top-[80%] right-[25%] animate-lightning-micro-4">
          <svg width="8" height="12" viewBox="0 0 8 12" className="text-cyan-300 opacity-20">
            <path d="M4 0 L2 4 L6 3 L1 8 L7 6 L2 12" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3"/>
            <path d="M6 3 L7 5 L6 7" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.2"/>
          </svg>
        </div>
        
        <div className="absolute top-[18%] left-[75%] animate-lightning-micro-5">
          <svg width="11" height="16" viewBox="0 0 11 16" className="text-indigo-300 opacity-28">
            <path d="M5 0 L3 5 L7 4 L2 10 L9 8 L3 16" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3"/>
            <path d="M7 4 L10 6 L8 9" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.2"/>
          </svg>
        </div>
        
        <div className="absolute top-[62%] left-[85%] animate-lightning-micro-6">
          <svg width="9" height="14" viewBox="0 0 9 14" className="text-purple-300 opacity-22">
            <path d="M4 0 L2 4 L6 3 L1 9 L7 7 L2 14" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3"/>
            <path d="M6 3 L8 5 L7 8" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.2"/>
          </svg>
        </div>
        
        <div className="absolute top-[42%] left-[3%] animate-lightning-micro-1">
          <svg width="13" height="19" viewBox="0 0 13 19" className="text-blue-300 opacity-26">
            <path d="M6 0 L4 6 L8 5 L2 12 L10 10 L3 19" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3"/>
            <path d="M8 5 L11 7 L9 11" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.2"/>
          </svg>
        </div>
        
        <div className="absolute top-[88%] left-[55%] animate-lightning-micro-2">
          <svg width="7" height="11" viewBox="0 0 7 11" className="text-pink-300 opacity-18">
            <path d="M3 0 L2 3 L5 2 L1 7 L6 5 L2 11" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3"/>
            <path d="M5 2 L6 4 L5 6" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.2"/>
          </svg>
        </div>
        
        {/* Lightning flash overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/10 to-pink-500/5 animate-lightning-flash"></div>
      </div>
      
      {/* Floating background elements with thunder effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float animate-thunder-rumble"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-float-reverse animate-thunder-rumble"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-500/15 rounded-full blur-2xl animate-pulse-slow animate-thunder-rumble"></div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center p-4 translate-y-4">
        <div className="w-full max-w-md animate-slide-in-up">
          {/* Glass morphism card with electric glow */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 space-y-8 animate-electric-glow">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white curved-header">
                Добре дошли отново
              </h1>
              <p className="text-gray-300 curved-subtitle">
                Влезте в своя акаунт за да продължите
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                  Имейл адрес
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
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
                    placeholder="Въведете паролата си"
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
                      <span>Влизане...</span>
                    </>
                  ) : (
                    <>
                      <span>Вход</span>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Footer */}
            <div className="text-center pt-4 border-t border-white/10">
              <p className="text-gray-300">
                Нямате акаунт?{' '}
                <Link 
                  href="/register" 
                  className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-300 hover:to-pink-300 transition-all duration-200"
                >
                  Регистрирайте се тук
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 