'use client';

import Link from 'next/link';
import { Eye, GitCompare, Presentation, Clapperboard, ShieldCheck, Home, Menu, X } from 'lucide-react';
import { useState } from 'react';

const publicLinks = [
  { href: '/', icon: <Home className="h-5 w-5" />, text: 'Home' },
  { href: '/vision', icon: <Eye className="h-5 w-5" />, text: 'Vision' },
  { href: '/compare', icon: <GitCompare className="h-5 w-5" />, text: 'Compare' },
  { href: '/deck', icon: <Presentation className="h-5 w-5" />, text: 'Strategy Deck' },
  { href: '/pitch-deck', icon: <Clapperboard className="h-5 w-5" />, text: 'Investor Deck' },
  { href: '/technical-compliance', icon: <ShieldCheck className="h-5 w-5" />, text: 'Technical' },
];

const PublicNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full bg-white bg-opacity-95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        <Link href="/" className="flex items-center gap-2">
          <img src="/icons/KCS-Logo.png" alt="KCS Meet Logo" className="h-10 w-auto" />
          <span className="text-xl font-bold text-gray-800">KCS Meet</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-x-6">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              {link.icon}
              <span>{link.text}</span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
            <Link href="/sign-in" className="hidden md:block rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                Sign In
            </Link>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 hover:text-blue-600 focus:outline-none">
                    {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="flex flex-col space-y-4 px-4 py-4">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 p-2 rounded-md transition-colors"
              >
                {link.icon}
                <span>{link.text}</span>
              </Link>
            ))}
            <Link href="/sign-in" onClick={() => setIsMenuOpen(false)} className="w-full text-center rounded-md bg-blue-600 px-4 py-2.5 text-base font-semibold text-white shadow-sm hover:bg-blue-500">
                Sign In
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default PublicNavbar;
