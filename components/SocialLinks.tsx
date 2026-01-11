'use client';

import { socialLinks } from '@/constants/links';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const SocialLinks = () => {
  return (
    <div className="flex flex-col w-full gap-3 px-2">
      {/* Section Header */}
      <p className="px-2 text-xs font-bold text-[#CAC4D0] uppercase tracking-wider">
        Social
      </p>
      
      {/* Horizontal Icon Grid */}
      <div className="flex flex-wrap gap-2 px-2">
        {socialLinks.map((link) => (
          <Link
            href={link.href}
            key={link.label}
            target="_blank"
            className={cn(
              'flex items-center justify-center p-3 rounded-full transition-all duration-300 group relative',
              'bg-[#2B2930] hover:bg-[#49454F] border border-[#49454F]/30 hover:border-[#D0BCFF]/50 hover:shadow-md'
            )}
            title={link.label}
          >
            {/* Icon Wrapper with Hover Glow */}
            <div className="relative z-10 text-[#E6E0E9] group-hover:text-white transition-colors group-hover:scale-110">
              <link.icon className="size-5" />
            </div>
            
            {/* Subtle glow effect */}
            <div className="absolute inset-0 rounded-full bg-[#D0BCFF] opacity-0 blur-md group-hover:opacity-20 transition-opacity" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SocialLinks;
