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
      className="fixed z-50 flex w-full items-center justify-between bg-[#141218] px-6 py-4 lg:px-10 border-b border-[#49454F]/30 shadow-sm"
    >
      <Link href="/" className="flex items-center gap-2 group">
        <div className="relative">
             <Image
              src="/icons/KCS.png"
              width={40}
              height={40}
              alt="KCS logo"
              className="max-sm:size-10 transition-transform group-hover:scale-105"
            />
        </div>
        <p className="text-[22px] font-bold text-[#E6E0E9] max-sm:hidden tracking-tight ml-1">
          KCS
        </p>
      </Link>

      <div className="flex items-center gap-6">
        <div className="hidden items-center gap-4 sm:flex">
          <ThemeToggle />

          <SignedIn>
            {/* User Profile Container */}
            <div className="relative flex items-center justify-center">
              <UserButton 
                afterSignOutUrl="/sign-in"
                appearance={{
                    elements: {
                        avatarBox: "h-10 w-10 ring-2 ring-[#49454F] hover:ring-[#D0BCFF] transition-all duration-300",
                        userButtonTrigger: "focus:shadow-none"
                    }
                }}
              />
              
              {/* Verified Badge - Overlapping Bottom Right */}
              <div className="absolute -bottom-1 -right-1 z-20 pointer-events-none">
                 <div className="bg-[#141218] rounded-full p-[2px] shadow-sm">
                    <VerifiedBadge userEmail={userEmail} size={14} />
                 </div>
              </div>
            </div>
          </SignedIn>

          <SignedOut>
            <Link href="/sign-in">
              <Button className="rounded-full bg-[#D0BCFF] text-[#381E72] hover:bg-[#E8DEF8] px-6 h-10 font-medium transition-all hover:shadow-md hover:scale-[1.02]">
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
