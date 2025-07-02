"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function RandomRonImage() {
  const [ronImages, setRonImages] = useState([]);
  const [nextId, setNextId] = useState(0);
  const [useNextImage, setUseNextImage] = useState(true);

  useEffect(() => {
    const createRandomRon = () => {
      const id = nextId;
      setNextId(prev => prev + 1);

      // Random position (avoiding edges to keep image fully visible)
      const x = Math.random() * (window.innerWidth - 200); // 200px for image width
      const y = Math.random() * (window.innerHeight - 200); // 200px for image height
      
      // Random size between 80px and 150px
      const size = Math.random() * 70 + 80;
      
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

      // Fade in
      setTimeout(() => {
        setRonImages(prev => 
          prev.map(ron => 
            ron.id === id ? { ...ron, opacity: 1 } : ron
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
          {useNextImage ? (
            <Image
              src="/ron.png"
              alt="Ron"
              width={Math.round(ron.size)}
              height={Math.round(ron.size)}
              className="object-contain drop-shadow-lg"
              priority={false}
              unoptimized={true}
              onError={(e) => {
                console.error('Failed to load ron.png with Next.js Image:', e);
                setUseNextImage(false);
              }}
              onLoad={() => {
                console.log('Ron image loaded successfully with Next.js Image');
              }}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/ron.png"
              alt="Ron"
              className="object-contain drop-shadow-lg"
              style={{
                width: `${ron.size}px`,
                height: `${ron.size}px`,
              }}
              onError={(e) => {
                console.error('Failed to load ron.png with img tag:', e);
              }}
              onLoad={() => {
                console.log('Ron image loaded successfully with img tag');
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
} 