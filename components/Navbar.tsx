'use client';

import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';
import MobileNav from './MobileNav';

const Navbar = () => {
  return (
    <nav
      className="fixed z-50 w-full px-6 py-4 lg:px-10 flex items-center justify-between"
      style={{ backgroundColor: '#292F36' }}
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
          className="text-3xl font-extrabold max-sm:hidden"
          style={{ color: '#FAF5F1' }}
        >
          KCS
        </p>
      </Link>

      <div className="flex items-center gap-6">
        <div className="hidden sm:flex items-center gap-4">
          <SignedIn>
            <UserButton afterSignOutUrl="/sign-in" />
          </SignedIn>

          <SignedOut>
            <Link href="/sign-in">
              <Button style={{ backgroundColor: '#A41F13', color: '#FAF5F1' }}>
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
