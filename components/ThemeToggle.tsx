'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="relative flex-center size-12 rounded-full bg-gradient-to-br from-surface to-background border-2 border-border transition-all"
        disabled
        aria-label="Loading theme toggle"
      >
        <div className="h-5 w-5" />
      </button>
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative flex-center size-12 rounded-full bg-gradient-to-br from-surface to-background border-2 border-border hover:border-accent hover:scale-110 hover:shadow-lg active:scale-95 transition-all duration-300 ease-in-out group overflow-hidden"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Background glow effect */}
      <div className={`absolute inset-0 rounded-full transition-opacity duration-500 ${isDark ? 'opacity-100 bg-gradient-to-br from-indigo-500/20 to-purple-500/20' : 'opacity-100 bg-gradient-to-br from-amber-500/20 to-orange-500/20'}`} />
      
      {/* Icon container with animation */}
      <div className="relative z-10 flex-center">
        {isDark ? (
          <Sun className="h-5 w-5 text-amber-400 animate-in spin-in-180 zoom-in-75 duration-500 group-hover:text-amber-300 transition-colors" />
        ) : (
          <Moon className="h-5 w-5 text-indigo-600 animate-in spin-in-180 zoom-in-75 duration-500 group-hover:text-indigo-500 transition-colors" />
        )}
      </div>
      
      {/* Ripple effect on hover */}
      <div className="absolute inset-0 rounded-full bg-accent/10 opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity" />
    </button>
  );
};

export default ThemeToggle;
