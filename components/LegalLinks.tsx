'use client';

import { legalLinks } from '@/constants/links';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const LegalLinks = () => {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-3">
      {legalLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            href={link.href}
            key={link.label}
            className={cn(
              'group relative flex items-center justify-start gap-4 overflow-hidden rounded-2xl p-4 transition-all duration-300',
              {
                'bg-accent shadow-md hover:shadow-lg': isActive,
                'bg-secondary/30 shadow-sm hover:bg-secondary/50 hover:shadow-md': !isActive,
              }
            )}
            style={{ color: '#FAF5F1' }}
          >
            {/* Material Design 3 State Layer */}
            <div className={cn(
              'absolute inset-0 bg-white transition-opacity duration-300',
              {
                'opacity-0 group-hover:opacity-10': isActive,
                'opacity-0 group-hover:opacity-5': !isActive,
              }
            )} />
            
            <div className={cn(
              'relative z-10 flex size-10 items-center justify-center rounded-xl transition-all duration-300',
              {
                'bg-white/20': isActive,
                'bg-white/10 group-hover:scale-110': !isActive,
              }
            )}>
              <link.icon className="size-5" strokeWidth={2} />
            </div>
            <span className="relative z-10 block text-base font-semibold tracking-tight sm:hidden lg:block">
              {link.label}
            </span>
            
            {/* Active indicator */}
            {isActive && (
              <div className="absolute inset-y-0 left-0 w-1 bg-white/40" />
            )}
          </Link>
        );
      })}
    </div>
  );
};

export default LegalLinks;
