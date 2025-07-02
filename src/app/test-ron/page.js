"use client";

import Image from 'next/image';

export default function TestRonPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Testing Ron Image Loading</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Using Next.js Image component:</h2>
          <Image
            src="/ron.png"
            alt="Ron with Next.js Image"
            width={200}
            height={200}
            className="border-2 border-gray-300"
            onError={(e) => {
              console.error('Next.js Image failed to load:', e);
            }}
            onLoad={() => {
              console.log('Next.js Image loaded successfully');
            }}
          />
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">Using regular img tag:</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ron.png"
            alt="Ron with img tag"
            width="200"
            height="200"
            className="border-2 border-gray-300"
            onError={(e) => {
              console.error('Regular img failed to load:', e);
            }}
            onLoad={() => {
              console.log('Regular img loaded successfully');
            }}
          />
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">Direct link test:</h2>
          <a href="/ron.png" target="_blank" className="text-blue-500 underline">
            Click here to open ron.png directly
          </a>
        </div>
      </div>
    </div>
  );
} 