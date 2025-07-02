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
    <div className="fixed inset-0 overflow-hidden">
      {/* Animated gradient background with storm effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 animate-storm-background">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-gradient-flow"></div>
      </div>
      
      {/* Lightning effects with branching */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Lightning bolt 1 - Left side with branches */}
        <div className="absolute top-0 left-[12%] animate-lightning-strike-1">
          <svg width="110" height="100vh" viewBox="0 0 110 800" className="text-blue-300 h-screen">
            {/* Main lightning bolt */}
            <path d="M55 0 L50 75 L70 70 L40 155 L80 150 L30 235 L75 230 L20 315 L85 310 L15 395 L90 390 L10 475 L85 470 L25 555 L70 550 L35 635 L60 630 L45 715 L50 800" 
                  stroke="currentColor" strokeWidth="3" fill="none" 
                  className="drop-shadow-[0_0_11px_rgba(59,130,246,0.9)]"/>
            <path d="M55 0 L50 75 L70 70 L40 155 L80 150 L30 235 L75 230 L20 315 L85 310 L15 395 L90 390 L10 475 L85 470 L25 555 L70 550 L35 635 L60 630 L45 715 L50 800" 
                  stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" fill="none"/>
            
            {/* Branch 1 - from first zigzag */}
            <path d="M70 70 L90 85 L80 105 L100 120" 
                  stroke="currentColor" strokeWidth="2" fill="none" opacity="0.8"
                  className="drop-shadow-[0_0_8px_rgba(59,130,246,0.7)]"/>
            <path d="M70 70 L90 85 L80 105 L100 120" 
                  stroke="rgba(255,255,255,0.8)" strokeWidth="1" fill="none"/>
            
            {/* Branch 2 - from second zigzag */}
            <path d="M40 155 L20 175 L30 195 L10 215 L20 235" 
                  stroke="currentColor" strokeWidth="2" fill="none" opacity="0.7"
                  className="drop-shadow-[0_0_6px_rgba(59,130,246,0.6)]"/>
            <path d="M40 155 L20 175 L30 195 L10 215 L20 235" 
                  stroke="rgba(255,255,255,0.7)" strokeWidth="1" fill="none"/>
            
            {/* Branch 3 - from middle section */}
            <path d="M75 230 L95 245 L85 265 L105 280 L95 300" 
                  stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6"
                  className="drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]"/>
            <path d="M75 230 L95 245 L85 265 L105 280 L95 300" 
                  stroke="rgba(255,255,255,0.6)" strokeWidth="0.8" fill="none"/>
            
            {/* Mini branches */}
            <path d="M80 150 L95 165 L90 180" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5"/>
            <path d="M85 310 L100 325 L95 340" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5"/>
            <path d="M90 390 L75 405 L80 420" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4"/>
            <path d="M85 470 L70 485 L75 500" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4"/>
            <path d="M70 550 L85 565 L80 580" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3"/>
          </svg>
        </div>
        
        {/* Lightning bolt 2 - Center left with branches */}
        <div className="absolute top-0 left-[42%] animate-lightning-strike-2">
          <svg width="95" height="100vh" viewBox="0 0 95 800" className="text-purple-300 h-screen">
            {/* Main lightning bolt */}
            <path d="M45 0 L55 85 L30 80 L65 165 L25 160 L75 245 L20 240 L80 325 L15 320 L85 405 L30 400 L90 485 L10 480 L80 565 L35 560 L70 645 L40 640 L60 725 L45 800" 
                  stroke="currentColor" strokeWidth="3" fill="none"
                  className="drop-shadow-[0_0_9px_rgba(168,85,247,0.8)]"/>
            <path d="M45 0 L55 85 L30 80 L65 165 L25 160 L75 245 L20 240 L80 325 L15 320 L85 405 L30 400 L90 485 L10 480 L80 565 L35 560 L70 645 L40 640 L60 725 L45 800" 
                  stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" fill="none"/>
            
            {/* Branches */}
            <path d="M30 80 L10 95 L20 115 L0 130" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.8"/>
            <path d="M65 165 L85 180 L75 200 L90 215" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.7"/>
            <path d="M25 160 L5 175 L15 195 L0 210" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6"/>
            <path d="M75 245 L95 260 L85 280" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6"/>
            <path d="M20 240 L0 255 L10 275" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5"/>
            
            {/* Mini branches */}
            <path d="M80 325 L95 340 L90 355" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5"/>
            <path d="M15 320 L0 335 L5 350" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4"/>
            <path d="M85 405 L70 420 L75 435" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4"/>
            <path d="M30 400 L15 415 L20 430" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3"/>
            <path d="M90 485 L75 500 L80 515" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3"/>
          </svg>
        </div>
        
        {/* Lightning bolt 3 - Center right with branches */}
        <div className="absolute top-0 right-[18%] animate-lightning-strike-3">
          <svg width="100" height="100vh" viewBox="0 0 100 800" className="text-pink-300 h-screen">
            {/* Main lightning bolt */}
            <path d="M50 0 L40 70 L65 65 L30 150 L75 145 L20 230 L80 225 L10 310 L85 305 L5 390 L90 385 L15 470 L85 465 L25 550 L75 545 L35 630 L65 625 L45 710 L50 800" 
                  stroke="currentColor" strokeWidth="3" fill="none"
                  className="drop-shadow-[0_0_13px_rgba(236,72,153,0.7)]"/>
            <path d="M50 0 L40 70 L65 65 L30 150 L75 145 L20 230 L80 225 L10 310 L85 305 L5 390 L90 385 L15 470 L85 465 L25 550 L75 545 L35 630 L65 625 L45 710 L50 800" 
                  stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" fill="none"/>
            
            {/* Branches */}
            <path d="M65 65 L85 80 L75 100 L95 115" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.8"/>
            <path d="M30 150 L10 165 L20 185 L0 200" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.7"/>
            <path d="M75 145 L95 160 L85 180 L100 195" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6"/>
            <path d="M20 230 L0 245 L10 265" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6"/>
            <path d="M80 225 L100 240 L90 260 L95 275" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5"/>
            <path d="M10 310 L0 325 L10 345" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5"/>
            
            {/* Mini branches */}
            <path d="M85 305 L70 320 L75 335" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5"/>
            <path d="M5 390 L20 405 L15 420" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4"/>
            <path d="M90 385 L100 400 L95 415" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4"/>
            <path d="M15 470 L0 485 L5 500" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3"/>
            <path d="M85 465 L70 480 L75 495" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3"/>
            <path d="M25 550 L10 565 L15 580" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3"/>
          </svg>
        </div>
        
        {/* Lightning bolt 4 - Far right with branches */}
        <div className="absolute top-0 right-[3%] animate-lightning-strike-4">
          <svg width="85" height="100vh" viewBox="0 0 85 800" className="text-indigo-300 h-screen">
            {/* Main lightning bolt */}
            <path d="M40 0 L45 80 L20 75 L55 160 L15 155 L65 240 L10 235 L70 320 L25 315 L75 400 L5 395 L80 480 L20 475 L75 560 L30 555 L65 640 L40 635 L50 720 L35 800" 
                  stroke="currentColor" strokeWidth="3" fill="none"
                  className="drop-shadow-[0_0_8px_rgba(99,102,241,0.7)]"/>
            <path d="M40 0 L45 80 L20 75 L55 160 L15 155 L65 240 L10 235 L70 320 L25 315 L75 400 L5 395 L80 480 L20 475 L75 560 L30 555 L65 640 L40 635 L50 720 L35 800" 
                  stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" fill="none"/>
            
            {/* Branches */}
            <path d="M20 75 L0 90 L10 110" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.8"/>
            <path d="M55 160 L75 175 L65 195 L80 210" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.7"/>
            <path d="M15 155 L0 170 L10 190" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6"/>
            <path d="M65 240 L80 255 L70 275" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6"/>
            <path d="M10 235 L0 250 L10 270" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5"/>
            
            {/* Mini branches */}
            <path d="M70 320 L55 335 L60 350" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5"/>
            <path d="M25 315 L10 330 L15 345" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4"/>
            <path d="M75 400 L60 415 L65 430" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4"/>
            <path d="M5 395 L20 410 L15 425" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3"/>
            <path d="M80 480 L65 495 L70 510" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3"/>
            <path d="M20 475 L5 490 L10 505" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3"/>
          </svg>
        </div>
        
        {/* Additional small branching lightning elements scattered around - more frequent and subtle */}
        <div className="absolute top-[20%] left-[25%] animate-lightning-branch-1">
          <svg width="22" height="32" viewBox="0 0 22 32" className="text-blue-400 opacity-55">
            <path d="M11 0 L8 11 L14 9 L5 20 L17 18 L8 32" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4"/>
            <path d="M14 9 L18 13 L16 17" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3"/>
            <path d="M5 20 L2 24 L4 28" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3"/>
            <path d="M17 18 L20 22 L18 26" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.25"/>
          </svg>
        </div>
        
        <div className="absolute top-[50%] left-[65%] animate-lightning-branch-2">
          <svg width="18" height="27" viewBox="0 0 18 27" className="text-purple-400 opacity-48">
            <path d="M9 0 L6 8 L12 7 L3 16 L15 14 L6 27" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4"/>
            <path d="M12 7 L16 10 L14 14" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3"/>
            <path d="M3 16 L0 20 L2 24" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3"/>
          </svg>
        </div>
        
        <div className="absolute top-[75%] right-[35%] animate-lightning-branch-3">
          <svg width="16" height="25" viewBox="0 0 16 25" className="text-pink-400 opacity-42">
            <path d="M8 0 L5 7 L11 6 L2 14 L14 12 L5 25" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4"/>
            <path d="M11 6 L15 9 L13 13" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3"/>
            <path d="M2 14 L0 18 L2 22" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3"/>
          </svg>
        </div>
        
        <div className="absolute top-[30%] right-[10%] animate-lightning-branch-4">
          <svg width="14" height="22" viewBox="0 0 14 22" className="text-indigo-400 opacity-38">
            <path d="M7 0 L4 6 L10 5 L1 12 L13 10 L4 22" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4"/>
            <path d="M10 5 L13 7 L11 11" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3"/>
            <path d="M1 12 L0 16 L2 20" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3"/>
          </svg>
        </div>

        {/* Micro lightning branches - very subtle and frequent */}
        <div className="absolute top-[12%] left-[48%] animate-lightning-micro-1">
          <svg width="11" height="16" viewBox="0 0 11 16" className="text-blue-300 opacity-32">
            <path d="M5 0 L3 5 L7 4 L1 10 L9 8 L2 16" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3"/>
            <path d="M7 4 L10 6 L8 9" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.2"/>
          </svg>
        </div>
        
        <div className="absolute top-[38%] right-[6%] animate-lightning-micro-2">
          <svg width="9" height="13" viewBox="0 0 9 13" className="text-purple-300 opacity-27">
            <path d="M4 0 L2 4 L6 3 L1 8 L7 6 L2 13" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3"/>
            <path d="M6 3 L8 5 L7 8" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.2"/>
          </svg>
        </div>
        
        <div className="absolute top-[58%] left-[8%] animate-lightning-micro-3">
          <svg width="13" height="18" viewBox="0 0 13 18" className="text-pink-300 opacity-36">
            <path d="M6 0 L4 6 L8 5 L2 11 L10 9 L3 18" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3"/>
            <path d="M8 5 L11 7 L9 10" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.2"/>
            <path d="M2 11 L0 14 L2 17" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.2"/>
          </svg>
        </div>
        
        <div className="absolute top-[82%] right-[22%] animate-lightning-micro-4">
          <svg width="7" height="10" viewBox="0 0 7 10" className="text-indigo-300 opacity-21">
            <path d="M3 0 L2 3 L5 2 L1 6 L6 4 L2 10" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3"/>
            <path d="M5 2 L6 4 L5 6" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.2"/>
          </svg>
        </div>
        
        <div className="absolute top-[22%] left-[78%] animate-lightning-micro-5">
          <svg width="10" height="14" viewBox="0 0 10 14" className="text-cyan-300 opacity-29">
            <path d="M5 0 L3 4 L7 3 L2 8 L8 6 L3 14" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3"/>
            <path d="M7 3 L9 5 L8 8" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.2"/>
          </svg>
        </div>
        
        <div className="absolute top-[65%] left-[88%] animate-lightning-micro-6">
          <svg width="8" height="12" viewBox="0 0 8 12" className="text-blue-300 opacity-24">
            <path d="M4 0 L2 3 L6 2 L1 7 L7 5 L2 12" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3"/>
            <path d="M6 2 L7 4 L6 6" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.2"/>
          </svg>
        </div>
        
        <div className="absolute top-[45%] left-[2%] animate-lightning-micro-1">
          <svg width="12" height="17" viewBox="0 0 12 17" className="text-purple-300 opacity-28">
            <path d="M6 0 L4 5 L8 4 L2 10 L10 8 L3 17" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3"/>
            <path d="M8 4 L10 6 L9 9" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.2"/>
          </svg>
        </div>
        
        <div className="absolute top-[85%] left-[52%] animate-lightning-micro-2">
          <svg width="6" height="9" viewBox="0 0 6 9" className="text-pink-300 opacity-19">
            <path d="M3 0 L2 2 L4 1 L1 5 L5 3 L2 9" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3"/>
            <path d="M4 1 L5 3 L4 5" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.2"/>
          </svg>
        </div>
        
        <div className="absolute top-[5%] left-[32%] animate-lightning-micro-3">
          <svg width="15" height="21" viewBox="0 0 15 21" className="text-indigo-300 opacity-33">
            <path d="M7 0 L5 7 L9 6 L3 13 L11 11 L4 21" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3"/>
            <path d="M9 6 L12 8 L10 12" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.2"/>
            <path d="M3 13 L1 16 L3 20" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.2"/>
          </svg>
        </div>
        
        {/* Lightning flash overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/10 to-pink-500/5 animate-lightning-flash"></div>
      </div>
      
      {/* Floating background elements with thunder effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float animate-thunder-rumble"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float-reverse animate-thunder-rumble"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-pink-500/15 rounded-full blur-2xl animate-pulse-slow animate-thunder-rumble"></div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center p-4 translate-y-6">
        <div className="w-full max-w-lg animate-slide-in-up">
          {/* Glass morphism card with electric glow */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6 space-y-6 animate-electric-glow">
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
            <form onSubmit={handleSubmit} className="space-y-4">
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