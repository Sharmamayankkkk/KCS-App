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
          <button className="sm:hidden">
            {isOpen ? (
              <X className="h-8 w-8 text-[#F8FAFC]" />
            ) : (
              <Menu className="h-8 w-8 text-[#F8FAFC]" />
            )}
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="border-none bg-[#1E293B]">
          <SheetClose asChild>
            <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
              <Image
                src="/icons/KCS.png"
                width={48}
                height={48}
                alt="KCS logo"
              />
              <p className="text-3xl font-extrabold text-[#F8FAFC]">KCS</p>
            </Link>
          </SheetClose>
          <div className="flex h-[calc(100vh-72px)] flex-col justify-between overflow-y-auto pt-8">
            <div className="flex flex-col gap-6">
              <SignedIn>
                <div className="flex justify-center items-center gap-2">
                  <UserButton afterSignOutUrl="/sign-in" />
                  <VerifiedBadge userEmail={userEmail} size={18} />
                </div>
              </SignedIn>
              <NavLinks />
              <div className="mt-6 flex-1 border-t border-[#334155] pt-6">
                <SocialLinks />
              </div>
            </div>
            <div className="pb-4">
              <div className="border-t border-[#334155] pt-4">
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
