import React, { useEffect, useState } from 'react';
import { HelpDeskLogoIcon } from './icons';

const SplashScreen: React.FC = () => {
  const [animationStep, setAnimationStep] = useState(0); // 0: initial, 1: logo, 2: text, 3: subtitle

  useEffect(() => {
    const timers: number[] = []; // Changed NodeJS.Timeout[] to number[]
    // Staggered animation
    timers.push(window.setTimeout(() => setAnimationStep(1), 200));    // Logo fades in
    timers.push(window.setTimeout(() => setAnimationStep(2), 700));   // Text fades in
    timers.push(window.setTimeout(() => setAnimationStep(3), 1300));  // Subtitle fades in
    
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[100] p-4 select-none" 
      aria-busy="true" 
      aria-live="polite"
      aria-label="Carregando aplicativo HelpDesk TI"
    >
      <div
        className={`transition-all duration-700 ease-out mb-6 md:mb-8 ${
          animationStep >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}
      >
        <HelpDeskLogoIcon className="h-16 w-16 md:h-20 md:w-20 text-orange-500" aria-hidden="true" />
      </div>

      <div className="text-center">
        <h1
          className={`font-extrabold text-white transition-all duration-1000 ease-out transform ${
            animationStep >= 2
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-90 -translate-y-5'
          }`}
          style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)' }} // Responsive font size
          aria-hidden={animationStep < 2} 
        >
          <span className="text-orange-500">Suporte</span> Chemisch
        </h1>
        <p
          className={`text-gray-400 mt-3 md:mt-4 transition-opacity duration-700 ease-out ${
            animationStep >= 3 ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)' }} // Responsive font size
          aria-hidden={animationStep < 3}
        >
          Organizando suas solicitações...
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;