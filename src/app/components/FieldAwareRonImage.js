"use client";

import { useState, useEffect, useRef } from 'react';

export default function FieldAwareRonImage({ formType = 'login' }) {
  const [activeField, setActiveField] = useState(null);
  const [ronPosition, setRonPosition] = useState({ x: 0, y: 0, visible: false });
  const [ronImages, setRonImages] = useState([]);
  const [nextId, setNextId] = useState(0);
  const observerRef = useRef(null);

  // Field configurations for different form types
  const fieldConfigs = {
    login: [
      { id: 'email', selector: '#email', label: 'Пиши нещо с @' },
      { id: 'password', selector: '#password', label: 'Тука внимавай' }
    ],
    register: [
      { id: 'firstName', selector: '#firstName', label: 'Е тука си пишеш името, баце' },
      { id: 'lastName', selector: '#lastName', label: 'А е тука - фамилията' },
      { id: 'email', selector: '#email', label: 'Пиши нещо с @' },
      { id: 'password', selector: '#password', label: 'Тука внимавай' },
      { id: 'captcha', selector: '#captcha', label: 'Айде са да те видиме' }
    ]
  };

  const currentFields = fieldConfigs[formType] || fieldConfigs.login;

  useEffect(() => {
    const setupFieldObservers = () => {
      currentFields.forEach(field => {
        const element = document.querySelector(field.selector);
        if (element) {
          // Focus event
          const handleFocus = () => {
            setActiveField(field.id);
            positionRonNearField(element, field.id);
          };

          // Blur event
          const handleBlur = () => {
            // Small delay to allow for field switching
            setTimeout(() => {
              const focusedElement = document.activeElement;
              const isFocusedFieldTracked = currentFields.some(f => 
                document.querySelector(f.selector) === focusedElement
              );
              
              if (!isFocusedFieldTracked) {
                setActiveField(null);
                setRonPosition(prev => ({ ...prev, visible: false }));
              }
            }, 100);
          };

          element.addEventListener('focus', handleFocus);
          element.addEventListener('blur', handleBlur);

          // Store cleanup functions
          if (!observerRef.current) {
            observerRef.current = [];
          }
          observerRef.current.push(() => {
            element.removeEventListener('focus', handleFocus);
            element.removeEventListener('blur', handleBlur);
          });
        }
      });
    };

    // Setup observers after a small delay to ensure DOM is ready
    const timer = setTimeout(setupFieldObservers, 100);

    return () => {
      clearTimeout(timer);
      if (observerRef.current) {
        observerRef.current.forEach(cleanup => cleanup());
        observerRef.current = [];
      }
    };
  }, [formType]);

  const positionRonNearField = (fieldElement, fieldId) => {
    if (!fieldElement) return;

    const rect = fieldElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Ron image size
    const ronSize = 120;
    
    // Position Ron directly over the field - centered horizontally and vertically
    let x = rect.left + (rect.width / 2) - (ronSize / 2); // Center horizontally over the field
    let y = rect.top + (rect.height / 2) - (ronSize / 2) + 20; // Center vertically over the field + move down 20px
    
    // Ensure Ron stays within viewport bounds
    if (x < 10) x = 10;
    if (x + ronSize > viewportWidth - 10) x = viewportWidth - ronSize - 10;
    if (y < 10) y = 10;
    if (y + ronSize > viewportHeight - 10) y = viewportHeight - ronSize - 10;

    setRonPosition({
      x,
      y,
      visible: true,
      fieldId
    });
  };

  // Create random Ron images for background effect when no field is focused
  useEffect(() => {
    if (activeField) return; // Don't create random images when field is focused

    const createRandomRon = () => {
      const id = nextId;
      setNextId(prev => prev + 1);

      const x = Math.random() * (window.innerWidth - 150);
      const y = Math.random() * (window.innerHeight - 150);
      const size = Math.floor(Math.random() * 40 + 60); // Smaller than original
      const rotation = Math.random() * 360;
      const duration = Math.random() * 3000 + 1500;

      const newRon = {
        id,
        x,
        y,
        size,
        rotation,
        opacity: 0
      };

      setRonImages(prev => [...prev, newRon]);

      setTimeout(() => {
        setRonImages(prev => 
          prev.map(ron => 
            ron.id === id ? { ...ron, opacity: 0.2 + Math.random() * 0.3 } : ron
          )
        );
      }, 100);

      setTimeout(() => {
        setRonImages(prev => 
          prev.map(ron => 
            ron.id === id ? { ...ron, opacity: 0 } : ron
          )
        );
        
        setTimeout(() => {
          setRonImages(prev => prev.filter(ron => ron.id !== id));
        }, 500);
      }, duration);
    };

    const initialDelay = Math.random() * 2000 + 1000;
    const initialTimeout = setTimeout(createRandomRon, initialDelay);

    const interval = setInterval(() => {
      createRandomRon();
    }, Math.random() * 6000 + 4000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [nextId, activeField]);

  const handleImageError = (e) => {
    console.error('Failed to load ron image:', e.target.src);
    // Try alternative images
    if (e.target.src.includes('ron-moving-unscreen.gif')) {
      e.target.src = '/ron2.png'; // Fallback to static image if GIF fails
    } else if (e.target.src.includes('ron.png')) {
      e.target.src = '/ron2.png';
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Field-focused Ron */}
      {ronPosition.visible && (
        <div
          className="absolute transition-all duration-300 ease-out"
          style={{
            left: `${ronPosition.x}px`,
            top: `${ronPosition.y}px`,
            opacity: 1,
          }}
        >
          {/* Ron animated GIF with enhanced styling for focus state */}
          <img
            src="/ron-moving-unscreen.gif"
            alt="Ron pointing to field"
            className="object-contain drop-shadow-2xl filter brightness-110 saturate-110 animate-gentle-float"
            style={{
              width: '120px',
              height: '120px',
              filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.3)) sepia(10%) hue-rotate(15deg) saturate(1.1) brightness(1.1) contrast(1.1)',
            }}
            onError={handleImageError}
          />
          
          {/* Speech bubble with field name */}
          <div className={`absolute left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 text-sm font-medium shadow-lg border border-white/50 animate-fade-in ${
            activeField === 'firstName' ? '-top-24 text-center leading-tight rounded-lg' : 
            activeField === 'captcha' ? '-top-24 rounded-full' : '-top-12 rounded-full'
          }`}>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white/90 rotate-45"></div>
            {activeField === 'firstName' ? (
              <div className="whitespace-pre-line">
                {'Е тука си пишеш\nимето,\nбаце'}
              </div>
            ) : (
              currentFields.find(f => f.id === activeField)?.label || 'Focus here!'
            )}
          </div>
        </div>
      )}

      {/* Random background Ron images when no field is focused */}
      {!activeField && ronImages.map((ron) => (
        <div
          key={ron.id}
          className="absolute transition-opacity duration-500 ease-in-out"
          style={{
            left: `${ron.x}px`,
            top: `${ron.y}px`,
            opacity: ron.opacity,
            transform: `rotate(${ron.rotation}deg)`,
          }}
        >
          <img
            src="/ron.png"
            alt="Ron"
            className="object-contain drop-shadow-lg filter blur-[0.5px] mix-blend-soft-light"
            style={{
              width: `${ron.size}px`,
              height: `${ron.size}px`,
              filter: 'sepia(20%) hue-rotate(220deg) saturate(0.8) brightness(0.9) contrast(1.1)',
            }}
            onError={handleImageError}
          />
        </div>
      ))}
    </div>
  );
} 