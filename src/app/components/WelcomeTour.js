"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const WelcomeTour = ({ onComplete, forceShow = false }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [confirmationStep, setConfirmationStep] = useState(0); // 0: Are you sure, 1: Are you really sure, 2: Are you really really sure, 3: OK
  const [showBackToTutorialConfirmation, setShowBackToTutorialConfirmation] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

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

  const confirmationMessages = [
    {
      emoji: "❓",
      title: "Are you sure?",
      message: "Do you want to continue to the project dashboard?"
    },
    {
      emoji: "🤔",
      title: "Are you really sure?",
      message: "This will complete the tutorial and take you to create your first project."
    },
    {
      emoji: "🧐",
      title: "Are you really, really sure?",
      message: "Once you continue, you'll be able to start creating projects and managing your work."
    },
    {
      emoji: "✅",
      title: "OK",
      message: "Perfect! You're all set to start your project management journey!"
    }
  ];

  useEffect(() => {
    // Add a delay to ensure the dashboard is fully loaded
    const initializeTimer = setTimeout(() => {
      setIsInitialized(true);
    }, 500);

    return () => clearTimeout(initializeTimer);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    // Check if user has seen the tour before (client-side only)
    if (typeof window !== 'undefined') {
      const hasSeenTour = localStorage.getItem('hasSeenDashboardTour');
      const isNewUser = localStorage.getItem('isNewUser') === 'true';
      const justRegistered = sessionStorage.getItem('justRegistered') === 'true';
      
      console.log('WelcomeTour: Checking conditions', {
        forceShow,
        hasSeenTour: hasSeenTour || 'null',
        isNewUser,
        justRegistered,
        shouldShow: forceShow || !hasSeenTour || isNewUser || justRegistered
      });
      
      // Show tour if:
      // 1. Force show is enabled, OR
      // 2. User hasn't seen the tour before, OR
      // 3. User is marked as new, OR
      // 4. User just registered in this session
      if (forceShow || !hasSeenTour || isNewUser || justRegistered) {
        console.log('WelcomeTour: Showing tutorial');
        setIsVisible(true);
        
        // Clear the session flag since we're showing the tour
        if (justRegistered) {
          sessionStorage.removeItem('justRegistered');
        }
      } else {
        console.log('WelcomeTour: Not showing tutorial - user has already seen it');
      }
    }
  }, [isInitialized, forceShow]);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Tutorial completed
      setIsCompleted(true);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleContinueToProject = () => {
    setConfirmationStep(0); // Start with first confirmation
  };

  const handleConfirmationNext = () => {
    if (confirmationStep < confirmationMessages.length - 1) {
      setConfirmationStep(confirmationStep + 1);
    } else {
      // Final confirmation - complete the tutorial
      if (typeof window !== 'undefined') {
        localStorage.setItem('hasSeenDashboardTour', 'true');
        // Remove new user flag since they've completed the tour
        localStorage.removeItem('isNewUser');
      }
      setIsVisible(false);
      if (onComplete) {
        onComplete();
      }
    }
  };

  const handleConfirmationBack = () => {
    if (confirmationStep > 0) {
      setConfirmationStep(confirmationStep - 1);
    } else {
      // Go back to completion screen
      setConfirmationStep(0);
      setIsCompleted(true);
    }
  };

  const handleBackToTutorial = () => {
    setShowBackToTutorialConfirmation(true);
  };

  const confirmBackToTutorial = () => {
    setIsCompleted(false);
    setConfirmationStep(0);
    setShowBackToTutorialConfirmation(false);
    setCurrentStep(0);
  };

  const cancelBackToTutorial = () => {
    setShowBackToTutorialConfirmation(false);
  };

  const skipTour = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hasSeenDashboardTour', 'true');
      localStorage.removeItem('isNewUser');
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

  if (!isInitialized || !isVisible) return null;

  // Show confirmation sequence
  if (isCompleted && confirmationStep < confirmationMessages.length) {
    const currentConfirmation = confirmationMessages[confirmationStep];
    const isLastStep = confirmationStep === confirmationMessages.length - 1;
    
    return (
      <div className="fixed inset-0 z-[100] overflow-hidden">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300" />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl max-w-lg w-full p-8 animate-scale-in">
            <div className="text-center">
              <div className="text-6xl mb-6">{currentConfirmation.emoji}</div>
              <h2 className="text-2xl font-bold text-white mb-4">{currentConfirmation.title}</h2>
              <p className="text-gray-300 mb-8 leading-relaxed">
                {currentConfirmation.message}
              </p>
              <div className="flex gap-3 justify-center">
                {!isLastStep && (
                  <button
                    onClick={handleConfirmationBack}
                    className="px-6 py-2 text-gray-400 hover:text-white transition-colors border border-gray-600 rounded-xl hover:border-gray-500"
                  >
                    {confirmationStep === 0 ? 'Cancel' : 'Back'}
                  </button>
                )}
                <button
                  onClick={handleConfirmationNext}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium px-6 py-2 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  {isLastStep ? 'Start Creating Projects!' : 'Yes, Continue'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showBackToTutorialConfirmation) {
    return (
      <div className="fixed inset-0 z-[100] overflow-hidden">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300" />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl max-w-lg w-full p-8 animate-scale-in">
            <div className="text-center">
              <div className="text-6xl mb-6">🔄</div>
              <h2 className="text-2xl font-bold text-white mb-4">Do you want to go back to the tutorial?</h2>
              <p className="text-gray-300 mb-8 leading-relaxed">
                This will restart the tutorial from the beginning.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={cancelBackToTutorial}
                  className="px-6 py-2 text-gray-400 hover:text-white transition-colors border border-gray-600 rounded-xl hover:border-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBackToTutorial}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium px-6 py-2 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  Yes, Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show completion screen
  if (isCompleted) {
    return (
      <div className="fixed inset-0 z-[100] overflow-hidden">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300" />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl max-w-lg w-full p-8 animate-scale-in">
            <div className="text-center">
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-2xl font-bold text-white mb-4">Successfully passed the tutorial</h2>
              <p className="text-gray-300 mb-8 leading-relaxed">
                Congratulations! You've completed the tutorial and learned about all the key features.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleBackToTutorial}
                  className="px-6 py-2 text-gray-400 hover:text-white transition-colors border border-gray-600 rounded-xl hover:border-gray-500"
                >
                  Back to Tutorial
                </button>
                <button
                  onClick={handleContinueToProject}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium px-6 py-2 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  Continue to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                      className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      Skip Tour
                    </button>
                  )}
                  {currentStep > 0 && (
                    <button
                      onClick={previousStep}
                      className="px-4 py-2 text-gray-400 hover:text-white transition-colors border border-gray-600 rounded-xl hover:border-gray-500"
                    >
                      Previous
                    </button>
                  )}
                  <button
                    onClick={nextStep}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium px-6 py-2 rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    {currentStep === tourSteps.length - 1 ? 'Complete Tutorial' : 'Next'}
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
                  <button
                    onClick={skipTour}
                    className="px-2 py-1 text-gray-400 hover:text-white text-xs transition-colors"
                  >
                    Skip
                  </button>
                  {currentStep > 0 && (
                    <button
                      onClick={previousStep}
                      className="px-3 py-1.5 text-gray-400 hover:text-white text-sm transition-colors border border-gray-600 rounded-lg hover:border-gray-500"
                    >
                      Back
                    </button>
                  )}
                  <button
                    onClick={nextStep}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium px-4 py-1.5 rounded-lg text-sm transition-all duration-300 transform hover:scale-105"
                  >
                    {currentStep === tourSteps.length - 1 ? 'Complete' : 'Next'}
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