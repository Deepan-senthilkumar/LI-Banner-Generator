import React, { useState, useEffect } from 'react';
import { X, ChevronRight } from 'lucide-react';

const Tour = ({ steps, tourKey, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const hasSeenTour = localStorage.getItem(`tour_${tourKey}`);
    if (!hasSeenTour) {
        // Small delay to allow UI to render
        setTimeout(() => setIsVisible(true), 1000);
    }
  }, [tourKey]);

  useEffect(() => {
    if (isVisible && steps[currentStep]) {
        const targetId = steps[currentStep].target;
        const target = document.getElementById(targetId);
        
        if (target) {
            const rect = target.getBoundingClientRect();
            // Simple positioning logic (centered below or safely on screen)
            setPosition({
                top: rect.bottom + window.scrollY + 10,
                left: Math.max(10, Math.min(rect.left + window.scrollX, window.innerWidth - 320))
            });
            
            // Highlight effect
            target.style.zIndex = '51';
            target.style.position = 'relative'; // Ensure z-index works
            target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.5)';
        }
    }

    return () => {
        // Cleanup highlight
        if (steps[currentStep]) {
            const targetId = steps[currentStep].target;
            const target = document.getElementById(targetId);
            if(target) {
                target.style.zIndex = '';
                target.style.position = '';
                target.style.boxShadow = '';
            }
        }
    }
  }, [isVisible, currentStep, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
    } else {
        finishTour();
    }
  };

  const finishTour = () => {
    setIsVisible(false);
    localStorage.setItem(`tour_${tourKey}`, 'true');
    if (onComplete) onComplete();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 pointer-events-auto" />

        {/* Tooltip Card */}
        <div 
            className="absolute bg-white dark:bg-slate-900 w-80 p-5 rounded-2xl shadow-2xl pointer-events-auto border border-slate-200 dark:border-slate-800 transition-all duration-300"
            style={{ top: position.top, left: position.left }}
        >
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    Step {currentStep + 1}/{steps.length}
                </span>
                <button onClick={finishTour} className="text-slate-400 hover:text-slate-600">
                    <X size={16} />
                </button>
            </div>
            
            <h3 className="font-bold text-lg mb-2 dark:text-white">{steps[currentStep].title}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 leading-relaxed">
                {steps[currentStep].content}
            </p>

            <div className="flex justify-end">
                <button 
                    onClick={handleNext}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                    {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                    <ChevronRight size={16} />
                </button>
            </div>
            
            {/* Arrow (Visual only, simplified) */}
            <div className="absolute -top-2 left-6 w-4 h-4 bg-white dark:bg-slate-900 rotate-45 border-t border-l border-slate-200 dark:border-slate-800" />
        </div>
    </div>
  );
};

export default Tour;
