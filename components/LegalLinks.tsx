'use client';

import { legalLinks } from '@/constants/links';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const LegalLinks = () => {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-1 w-full px-2">
      {legalLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            href={link.href}
            key={link.label}
            className={cn(
              'flex items-center gap-4 px-4 py-3 rounded-full transition-all duration-200 group w-full',
              {
                // Active: Tonal Red (Error Container)
                'bg-[#93000A] text-[#FFDAD6]': isActive,
                // Inactive: Transparent text with hover
                'text-[#CAC4D0] hover:bg-[#49454F]/30 hover:text-[#E6E0E9]': !isActive,
              }
            )}
          >
            <div className={cn("relative shrink-0", { "text-[#FFDAD6]": isActive, "text-[#CAC4D0] group-hover:text-[#E6E0E9]": !isActive })}>
              <link.icon className="size-5" />
            </div>
            
            <span className="text-sm font-medium leading-none hidden lg:block tracking-wide">
              {link.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
};

export default LegalLinks;
