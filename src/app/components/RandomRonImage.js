"use client";

import { useState, useEffect } from 'react';

export default function RandomRonImage() {
  const [ronImages, setRonImages] = useState([]);
  const [nextId, setNextId] = useState(0);

  useEffect(() => {
    const createRandomRon = () => {
      const id = nextId;
      setNextId(prev => prev + 1);

      // Random position (avoiding edges to keep image fully visible)
      const x = Math.random() * (window.innerWidth - 200); // 200px for image width
      const y = Math.random() * (window.innerHeight - 200); // 200px for image height
      
      // Random size between 80px and 150px - using integers to avoid fractional sizes
      const size = Math.floor(Math.random() * 70 + 80);
      
      // Random rotation
      const rotation = Math.random() * 360;
      
      // Random duration for how long it stays visible (2-6 seconds)
      const duration = Math.random() * 4000 + 2000;

      const newRon = {
        id,
        x,
        y,
        size,
        rotation,
        opacity: 0
      };

      setRonImages(prev => [...prev, newRon]);

      // Fade in with reduced opacity for transparency effect
      setTimeout(() => {
        setRonImages(prev => 
          prev.map(ron => 
            ron.id === id ? { ...ron, opacity: 0.3 + Math.random() * 0.4 } : ron // Random opacity between 0.3-0.7
          )
        );
      }, 100);

      // Fade out and remove
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

    // Create first Ron after initial delay
    const initialDelay = Math.random() * 3000 + 1000; // 1-4 seconds
    const initialTimeout = setTimeout(createRandomRon, initialDelay);

    // Set up interval for subsequent Rons
    const interval = setInterval(() => {
      createRandomRon();
    }, Math.random() * 8000 + 3000); // Random interval between 3-11 seconds

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [nextId]);

  const handleImageError = (e) => {
    console.error('Failed to load ron.png:', e.target.src);
  };

  const handleImageLoad = () => {
    console.log('Ron image loaded successfully');
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {ronImages.map((ron) => (
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
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
            onLoad={handleImageLoad}
          />
        </div>
      ))}
    </div>
  );
} 