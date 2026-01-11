'use client';

import { useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { sidebarLinks, adminSidebarLinks } from '@/constants/links';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLinksProps {
  onLinkClick?: () => void;
}

const NavLinks = ({ onLinkClick }: NavLinksProps = {}) => {
  const pathname = usePathname();
  const { user } = useUser();

  const isAdmin = useMemo(() => {
    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim());
    const userEmail = user?.emailAddresses?.[0]?.emailAddress || '';
    return adminEmails.includes(userEmail);
  }, [user]);

  const renderLinks = (links: typeof sidebarLinks) => {
    return links.map((item) => {
      const isActive = pathname === item.route || pathname.startsWith(`${item.route}/`);

      return (
        <Link
          href={item.route}
          key={item.label}
          onClick={onLinkClick}
          className={cn(
            'flex items-center gap-4 p-4 rounded-full transition-all duration-200 group',
            {
              // Active State: MD3 Secondary Container
              'bg-[#D0BCFF] text-[#381E72] font-semibold': isActive,
              // Inactive State: Transparent
              'text-[#E6E0E9] hover:bg-[#49454F]/30': !isActive,
            }
          )}
        >
          <div className={cn("relative", { "text-[#381E72]": isActive, "text-[#CAC4D0] group-hover:text-[#E6E0E9]": !isActive })}>
             <item.icon className="size-6" />
          </div>
          
          <p className="text-base font-medium leading-none">
            {item.label}
          </p>
        </Link>
      );
    });
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {renderLinks(sidebarLinks)}
      
      {isAdmin && (
        <>
          <div className="my-2 border-t border-[#49454F]/50 mx-4" />
          <p className="px-4 text-xs font-bold text-[#CAC4D0] uppercase tracking-wider mb-1">Admin</p>
          {renderLinks(adminSidebarLinks)}
        </>
      )}
    </div>
  );
};

export default NavLinks;
