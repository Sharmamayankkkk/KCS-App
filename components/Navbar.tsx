'use client';

import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';
import MobileNav from './MobileNav';
import { useMemo } from 'react';
import { isUserAdmin } from '@/lib/utils';
import VerifiedBadge from './VerifiedBadge';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { user } = useUser();
  
  const userEmail = useMemo(() => {
    return user?.emailAddresses?.[0]?.emailAddress || '';
  }, [user]);

  return (
    <nav
      className="fixed z-50 w-full px-6 py-4 lg:px-10 flex items-center justify-between bg-primary"
    >
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/icons/KCS.png"
          width={48}
          height={48}
          alt="KCS logo"
          className="max-sm:size-12"
        />
        <p
          className="text-3xl font-extrabold max-sm:hidden text-background"
        >
          KCS
        </p>
      </Link>

      <div className="flex items-center gap-6">
        <div className="hidden sm:flex items-center gap-4">
          <ThemeToggle />
          <SignedIn>
            <div className="flex items-center gap-2">
              <UserButton afterSignOutUrl="/sign-in" />
              <VerifiedBadge userEmail={userEmail} size={18} />
            </div>
          </SignedIn>

          <SignedOut>
            <Link href="/sign-in">
              <Button className="bg-accent text-background hover:bg-accent/90">
                Sign in
              </Button>
            </Link>
          </SignedOut>
        </div>

        <MobileNav />
      </div>
    </nav>
  );
};

export default Navbar;
