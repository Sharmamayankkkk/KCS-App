'use client';

import Link from 'next/link';
import {
  Eye,
  GitCompare,
  Presentation,
  Clapperboard,
  ShieldCheck,
  Home,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';

const publicLinks = [
  { href: '/', icon: <Home className="size-5" />, text: 'Home' },
  { href: '/vision', icon: <Eye className="size-5" />, text: 'Vision' },
  {
    href: '/compare',
    icon: <GitCompare className="size-5" />,
    text: 'Compare',
  },
  {
    href: '/deck',
    icon: <Presentation className="size-5" />,
    text: 'Strategy Deck',
  },
  {
    href: '/pitch-deck',
    icon: <Clapperboard className="size-5" />,
    text: 'Investor Deck',
  },
  {
    href: '/technical-compliance',
    icon: <ShieldCheck className="size-5" />,
    text: 'Technical',
  },
];

const PublicNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-surface/95 fixed top-0 z-50 w-full border-b border-border shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/icons/KCS-Logo.png"
            alt="KCS Meet Logo"
            className="h-10 w-auto"
          />
          <span className="text-xl font-bold text-text-primary">KCS Meet</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-x-6 md:flex">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-accent"
            >
              {link.icon}
              <span>{link.text}</span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/sign-in"
            className="hover:bg-accent/90 hidden rounded-md bg-accent px-4 py-2 text-sm font-semibold text-background shadow-sm md:block"
          >
            Sign In
          </Link>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-text-secondary focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="size-6" />
              ) : (
                <Menu className="size-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="border-t border-border bg-surface md:hidden">
          <div className="flex flex-col space-y-4 p-4">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 rounded-md p-2 text-base font-medium text-text-secondary transition-colors hover:text-accent"
              >
                {link.icon}
                <span>{link.text}</span>
              </Link>
            ))}
            <Link
              href="/sign-in"
              onClick={() => setIsMenuOpen(false)}
              className="hover:bg-accent/90 w-full rounded-md bg-accent px-4 py-2.5 text-center text-base font-semibold text-background shadow-sm"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default PublicNavbar;
