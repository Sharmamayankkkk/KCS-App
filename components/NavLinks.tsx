'use client';

import { useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { sidebarLinks, adminSidebarLinks } from '@/constants/links';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NavLinks = () => {
  const pathname = usePathname();
  const { user } = useUser();

  const isAdmin = useMemo(() => {
    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim());
    const userEmail = user?.emailAddresses?.[0]?.emailAddress || '';
    return adminEmails.includes(userEmail);
  }, [user]);

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
              'flex gap-4 items-center p-4 rounded-lg justify-start text-background transition-colors',
              {
                'bg-accent hover:bg-accent/90': isActive,
                'hover:bg-secondary': !isActive,
              }
            )}
          >
            <item.icon />
            <p className="text-lg font-semibold block sm:hidden lg:block">{item.label}</p>
          </Link>
        );
      })}
      
      {isAdmin && adminSidebarLinks.map((item) => {
        const isActive =
          pathname === item.route || pathname.startsWith(`${item.route}/`);

        return (
          <Link
            href={item.route}
            key={item.label}
            className={cn(
              'flex gap-4 items-center p-4 rounded-lg justify-start text-background transition-colors',
              {
                'bg-accent hover:bg-accent/90': isActive,
                'hover:bg-secondary': !isActive,
              }
            )}
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
