"use client";

import { useState, useEffect } from 'react';

const WelcomeTour = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const tourSteps = [
    {
      title: "Welcome to Your Enhanced Dashboard! 🎉",
      content: "We've added powerful new features to help you manage your projects more effectively. Let's take a quick tour!",
      target: null,
      position: "center"
    },
    {
      title: "Smart Notifications",
      content: "Get intelligent alerts about overdue tasks, upcoming deadlines, and project completions. Never miss important updates again!",
      target: "smart-notifications",
      position: "bottom"
    },
    {
      title: "Quick Task Creation",
      content: "Create tasks instantly without navigating to project pages. Just click, fill, and you're done!",
      target: "quick-task",
      position: "bottom"
    },
    {
      title: "Performance Analytics",
      content: "Track your productivity with detailed metrics including completion rates, weekly progress, and productivity scores.",
      target: "performance-metrics",
      position: "top"
    },
    {
      title: "Activity Feed",
      content: "Stay updated with real-time activity across all your projects. See what's happening at a glance.",
      target: "activity-feed",
      position: "top"
    },
    {
      title: "Dashboard Customization",
      content: "Personalize your dashboard! Click the settings button in the bottom-right to toggle widgets, change themes, and more.",
      target: "dashboard-customizer",
      position: "left"
    },
    {
      title: "You're All Set! 🚀",
      content: "Your enhanced dashboard is ready to boost your productivity. Start exploring and managing your projects like never before!",
      target: null,
      position: "center"
    }
  ];

  useEffect(() => {
    // Check if user has seen the tour before (client-side only)
    if (typeof window !== 'undefined') {
      const hasSeenTour = localStorage.getItem('hasSeenDashboardTour');
      if (!hasSeenTour) {
        setIsVisible(true);
      }
    }
  }, []);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    completeTour();
  };

  const completeTour = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hasSeenDashboardTour', 'true');
    }
    setIsVisible(false);
    if (onComplete) {
      onComplete();
    }
  };

  const getTooltipPosition = (position) => {
    switch (position) {
      case 'top':
        return 'bottom-full mb-2';
      case 'bottom':
        return 'top-full mt-2';
      case 'left':
        return 'right-full mr-2';
      case 'right':
        return 'left-full ml-2';
      default:
        return 'top-full mt-2';
    }
  };

  if (!isVisible) return null;

  const currentTourStep = tourSteps[currentStep];

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300" />

      {/* Tour Content */}
      {currentTourStep.position === 'center' ? (
        // Center modal for intro and outro
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl max-w-lg w-full p-8 animate-scale-in">
            <div className="text-center">
              <div className="text-6xl mb-6">
                {currentStep === 0 ? '🎯' : '🎉'}
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                {currentTourStep.title}
              </h2>
              <p className="text-gray-300 mb-8 leading-relaxed">
                {currentTourStep.content}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  {tourSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentStep ? 'bg-purple-500' : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
                
                <div className="flex gap-3">
                  {currentStep === 0 && (
                    <button
                      onClick={skipTour}
                      className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                      Skip Tour
                    </button>
                  )}
                  <button
                    onClick={nextStep}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium px-6 py-2 rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    {currentStep === tourSteps.length - 1 ? 'Get Started' : 'Next'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Positioned tooltip for specific features
        <div className="absolute inset-0 p-4">
          {/* Highlight target element */}
          <div 
            className="absolute bg-white/10 border-2 border-purple-500 rounded-xl pointer-events-none animate-pulse"
            style={{
              // This would need to be calculated based on the target element's position
              // For now, we'll use a general positioning
            }}
          />
          
          {/* Tooltip */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl rounded-xl border border-gray-700/50 shadow-2xl max-w-sm p-6 animate-scale-in">
              <h3 className="text-lg font-bold text-white mb-3">
                {currentTourStep.title}
              </h3>
              <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                {currentTourStep.content}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex space-x-1">
                  {tourSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        index === currentStep ? 'bg-purple-500' : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
                
                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <button
                      onClick={previousStep}
                      className="px-3 py-1.5 text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      Back
                    </button>
                  )}
                  <button
                    onClick={skipTour}
                    className="px-3 py-1.5 text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Skip
                  </button>
                  <button
                    onClick={nextStep}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium px-4 py-1.5 rounded-lg text-sm transition-all duration-300 transform hover:scale-105"
                  >
                    {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomeTour; 