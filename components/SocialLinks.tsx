'use client';

import { socialLinks } from '@/constants/links';
import Link from 'next/link';

const SocialLinks = () => {
  return (
    <div className="flex flex-col gap-3">
      {socialLinks.map((link) => (
        <Link
          href={link.href}
          key={link.label}
          target="_blank"
          className="group relative flex items-center justify-start gap-4 overflow-hidden rounded-2xl bg-secondary/30 p-4 shadow-sm transition-all duration-300 hover:-translate-x-1 hover:bg-secondary/50 hover:shadow-md"
          style={{ color: '#FAF5F1' }}
        >
          {/* Material Design 3 State Layer */}
          <div className="absolute inset-0 bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-10" />
          
          <div className="relative z-10 flex size-10 items-center justify-center rounded-xl bg-white/10 transition-transform duration-300 group-hover:scale-110">
            <link.icon className="size-5" strokeWidth={2} />
          </div>
          <span className="relative z-10 block text-base font-semibold tracking-tight sm:hidden lg:block">
            {link.label}
          </span>
          
          {/* Ripple effect indicator */}
          <div className="absolute bottom-0 left-0 top-0 w-1 origin-top scale-y-0 bg-white/30 transition-transform duration-300 group-hover:scale-y-100" />
        </Link>
      ))}
    </div>
  );
};

export default SocialLinks;
