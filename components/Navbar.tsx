'use client';

import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';
import MobileNav from './MobileNav';
import { useMemo } from 'react';
import VerifiedBadge from './VerifiedBadge';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { user } = useUser();
  
  const userEmail = useMemo(() => {
    return user?.emailAddresses?.[0]?.emailAddress || '';
  }, [user]);

  return (
    <nav
      className="fixed z-50 flex w-full items-center justify-between bg-primary px-6 py-4 shadow-md backdrop-blur-sm lg:px-10"
    >
      <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-105">
        <div className="flex size-12 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md">
          <Image
            src="/icons/KCS.png"
            width={48}
            height={48}
            alt="KCS logo"
            className="size-full object-cover"
          />
        </div>
        <p className="text-3xl font-bold tracking-tight text-background max-sm:hidden">
          KCS
        </p>
      </Link>

      <div className="flex items-center gap-6">
        <div className="hidden items-center gap-4 sm:flex">
          <ThemeToggle />
          <SignedIn>
            <VerifiedBadge userEmail={userEmail} size={40}>
              <UserButton afterSignOutUrl="/sign-in" />
            </VerifiedBadge>
          </SignedIn>

          <SignedOut>
            <Link href="/sign-in">
              <Button className="rounded-full bg-accent px-6 py-2.5 font-semibold text-background shadow-sm transition-all hover:bg-accent/90 hover:shadow-md">
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
