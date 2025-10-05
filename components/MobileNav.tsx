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
import { SignedIn, UserButton } from '@clerk/nextjs';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="w-full max-w-[264px]">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <button className="sm:hidden">
            {isOpen ? (
              <X className="h-8 w-8" style={{ color: '#FAF5F1' }} />
            ) : (
              <Menu className="h-8 w-8" style={{ color: '#FAF5F1' }} />
            )}
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="border-none" style={{ backgroundColor: '#292F36' }}>
          <SheetClose asChild>
            <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
              <Image
                src="/icons/KCS.png"
                width={48}
                height={48}
                alt="KCS logo"
              />
              <p className="text-3xl font-extrabold" style={{ color: '#FAF5F1' }}>KCS</p>
            </Link>
          </SheetClose>
          <div className="flex h-[calc(100vh-72px)] flex-col justify-between overflow-y-auto pt-8">
            <div className="flex flex-col gap-6">
              <SignedIn>
                <div className="flex justify-center">
                  <UserButton afterSignOutUrl="/sign-in" />
                </div>
              </SignedIn>
              <NavLinks />
              <div className="mt-6 flex-1 border-t pt-6" style={{ borderColor: '#8F7A6E' }}>
                <SocialLinks />
              </div>
            </div>
            <div className="pb-4">
              <div className="border-t pt-4" style={{ borderColor: '#8F7A6E' }}>
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
