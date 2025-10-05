'use client';

import { legalLinks } from '@/constants/links';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const LegalLinks = () => {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-2">
      {legalLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            href={link.href}
            key={link.label}
            className={cn(
              'flex gap-4 items-center p-4 rounded-lg justify-start',
              { 'bg-red-500': isActive } // Placeholder, will be replaced by inline style
            )}
            style={{
              color: '#FAF5F1',
              backgroundColor: isActive ? '#A41F13' : 'transparent',
            }}
          >
            <link.icon />
            <span className="font-semibold block sm:hidden lg:block">{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default LegalLinks;
