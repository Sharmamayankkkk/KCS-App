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
      <div className="size-10 rounded-full bg-[#49454F]/20 animate-pulse" />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="group relative flex items-center justify-center size-10 rounded-full bg-[#49454F]/20 hover:bg-[#49454F]/40 transition-all duration-300"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="relative z-10 text-[#E6E0E9]">
        {isDark ? (
          <Sun className="size-5 transition-transform duration-500 hover:rotate-90 text-[#E6E0E9]" />
        ) : (
          <Moon className="size-5 transition-transform duration-500 hover:-rotate-12 text-[#381E72]" />
        )}
      </div>
      
      {/* Ripple/Feedback layer */}
      <span className="absolute inset-0 rounded-full scale-0 bg-[#E6E0E9]/10 transition-transform duration-200 group-active:scale-100" />
    </button>
  );
};

export default ThemeToggle;
