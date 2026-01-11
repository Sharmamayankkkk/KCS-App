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
              'group relative flex items-center gap-4 overflow-hidden rounded-2xl p-4 text-background transition-all duration-300',
              {
                'bg-accent shadow-md hover:shadow-lg': isActive,
                'bg-secondary/30 shadow-sm hover:bg-secondary/50 hover:shadow-md': !isActive,
              }
            )}
          >
            {/* MD3 State Layer */}
            <div className={cn(
              'absolute inset-0 transition-opacity duration-300',
              {
                'bg-white opacity-0 group-hover:opacity-10': isActive,
                'bg-white opacity-0 group-hover:opacity-10': !isActive,
              }
            )} />
            
            <div className={cn(
              'relative z-10 flex size-10 items-center justify-center rounded-xl transition-all duration-300',
              {
                'bg-white/20': isActive,
                'bg-white/10 group-hover:scale-110': !isActive,
              }
            )}>
              <item.icon className="size-5" strokeWidth={2} />
            </div>
            <p className="relative z-10 block text-lg font-semibold tracking-tight sm:hidden lg:block">
              {item.label}
            </p>
            
            {/* Active indicator */}
            {isActive && (
              <div className="absolute bottom-0 left-0 top-0 w-1 bg-white/40" />
            )}
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
              'group relative flex items-center gap-4 overflow-hidden rounded-2xl p-4 text-background transition-all duration-300',
              {
                'bg-accent shadow-md hover:shadow-lg': isActive,
                'bg-secondary/30 shadow-sm hover:bg-secondary/50 hover:shadow-md': !isActive,
              }
            )}
          >
            {/* MD3 State Layer */}
            <div className={cn(
              'absolute inset-0 transition-opacity duration-300',
              {
                'bg-white opacity-0 group-hover:opacity-10': isActive,
                'bg-white opacity-0 group-hover:opacity-10': !isActive,
              }
            )} />
            
            <div className={cn(
              'relative z-10 flex size-10 items-center justify-center rounded-xl transition-all duration-300',
              {
                'bg-white/20': isActive,
                'bg-white/10 group-hover:scale-110': !isActive,
              }
            )}>
              <item.icon className="size-5" strokeWidth={2} />
            </div>
            <p className="relative z-10 block text-lg font-semibold tracking-tight sm:hidden lg:block">
              {item.label}
            </p>
            
            {/* Active indicator */}
            {isActive && (
              <div className="absolute bottom-0 left-0 top-0 w-1 bg-white/40" />
            )}
          </Link>
        );
      })}
    </>
  );
};

export default NavLinks;
