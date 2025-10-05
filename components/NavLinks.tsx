'use client';

import { sidebarLinks } from '@/constants/links';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NavLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {sidebarLinks.map((item) => {
        const isActive =
          pathname === item.route || pathname.startsWith(`${item.route}/`);

        return (
          <Link
            href={item.route}
            key={item.label}
            className={cn(
              'flex gap-4 items-center p-4 rounded-lg justify-start',
              { 'bg-red-500': isActive } // Placeholder, will be replaced by inline style
            )}
            style={{
              color: '#FAF5F1',
              backgroundColor: isActive ? '#A41F13' : 'transparent',
            }}
          >
            <item.icon />
            <p className="text-lg font-semibold block sm:hidden lg:block">{item.label}</p>
          </Link>
        );
      })}
    </>
  );
};

export default NavLinks;
