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
        className="flex-center relative size-12 rounded-full border-2 border-border bg-gradient-to-br from-surface to-background transition-all"
        disabled
        aria-label="Loading theme toggle"
      >
        <div className="size-5" />
      </button>
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex-center group relative size-12 overflow-hidden rounded-full border-2 border-border bg-gradient-to-br from-surface to-background transition-all duration-300 ease-in-out hover:scale-110 hover:border-accent hover:shadow-lg active:scale-95"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Background glow effect */}
      <div className={`absolute inset-0 rounded-full opacity-100 transition-opacity duration-500 ${isDark ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20' : 'bg-gradient-to-br from-amber-500/20 to-orange-500/20'}`} />
      
      {/* Icon container with animation */}
      <div className="flex-center relative z-10">
        {isDark ? (
          <Sun className="size-5 text-amber-400 transition-colors duration-500 animate-in zoom-in-75 spin-in-180 group-hover:text-amber-300" />
        ) : (
          <Moon className="size-5 text-indigo-600 transition-colors duration-500 animate-in zoom-in-75 spin-in-180 group-hover:text-indigo-500" />
        )}
      </div>
      
      {/* Ripple effect on hover */}
      <div className="bg-accent/10 absolute inset-0 rounded-full opacity-0 transition-opacity group-hover:animate-ping group-hover:opacity-100" />
    </button>
  );
};

export default ThemeToggle;
