'use client';

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import Image from 'next/image';
import Link from 'next/link';
import NavLinks from './NavLinks';
import SocialLinks from './SocialLinks';
import LegalLinks from './LegalLinks';
import { SignedIn, UserButton, useUser } from '@clerk/nextjs';
import { Menu, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import VerifiedBadge from './VerifiedBadge';
import ThemeToggle from './ThemeToggle';

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  
  const userEmail = useMemo(() => {
    return user?.emailAddresses?.[0]?.emailAddress || '';
  }, [user]);

  return (
    <section className="w-full max-w-[264px]">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <button className="rounded-xl p-2 transition-all hover:bg-secondary/30 sm:hidden">
            {isOpen ? (
              <X className="size-7 text-background" strokeWidth={2.5} />
            ) : (
              <Menu className="size-7 text-background" strokeWidth={2.5} />
            )}
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="border-none bg-primary shadow-2xl">
          <SheetClose asChild>
            <Link href="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
              <div className="flex size-12 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm">
                <Image
                  src="/icons/KCS.png"
                  width={48}
                  height={48}
                  alt="KCS logo"
                  className="size-full object-cover"
                />
              </div>
              <p className="text-3xl font-bold tracking-tight text-background">KCS</p>
            </Link>
          </SheetClose>
          <div className="flex h-[calc(100vh-72px)] flex-col justify-between overflow-y-auto pt-8">
            <div className="flex flex-col gap-6">
              <SignedIn>
                <div className="flex items-center justify-center">
                  <VerifiedBadge userEmail={userEmail} size={48}>
                    <UserButton afterSignOutUrl="/sign-in" />
                  </VerifiedBadge>
                </div>
              </SignedIn>
              <div className="flex justify-center">
                <ThemeToggle />
              </div>
              <NavLinks />
              <div className="mt-6 flex-1 border-t border-secondary/50 pt-6">
                <SocialLinks />
              </div>
            </div>
            <div className="pb-4">
              <div className="border-t border-secondary/50 pt-4">
                <LegalLinks />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
};

export default MobileNav;
