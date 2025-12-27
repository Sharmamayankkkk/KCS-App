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
    <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white bg-opacity-95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/icons/KCS-Logo.png"
            alt="KCS Meet Logo"
            className="h-10 w-auto"
          />
          <span className="text-xl font-bold text-gray-800">KCS Meet</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-x-6 md:flex">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-[#A41F13]"
              style={{ color: '#8F7A6E' }}
            >
              {link.icon}
              <span>{link.text}</span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="hidden rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm md:block"
            style={{ backgroundColor: '#A41F13' }}
          >
            Sign In
          </Link>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="focus:outline-none"
              style={{ color: '#8F7A6E' }}
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
        <div className="border-t border-gray-200 bg-white md:hidden">
          <div className="flex flex-col space-y-4 p-4">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 rounded-md p-2 text-base font-medium transition-colors"
                style={{ color: '#8F7A6E' }}
              >
                {link.icon}
                <span>{link.text}</span>
              </Link>
            ))}
            <Link
              href="/sign-in"
              onClick={() => setIsMenuOpen(false)}
              className="w-full rounded-md px-4 py-2.5 text-center text-base font-semibold text-white shadow-sm"
              style={{ backgroundColor: '#A41F13' }}
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
