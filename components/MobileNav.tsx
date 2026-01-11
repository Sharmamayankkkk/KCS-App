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
import { Menu } from 'lucide-react';
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
          <button className="sm:hidden p-2 rounded-full hover:bg-[#49454F]/30 transition-colors">
             <Menu className="size-6 text-[#E6E0E9]" />
          </button>
        </SheetTrigger>
        
        <SheetContent side="left" className="border-r border-[#49454F]/30 bg-[#141218] p-0 w-[300px] flex flex-col h-full">
            
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-6 border-b border-[#49454F]/30 shrink-0">
                <SheetClose asChild>
                    <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                    <Image
                        src="/icons/KCS.png"
                        width={36}
                        height={36}
                        alt="KCS logo"
                    />
                    <p className="text-2xl font-bold text-[#E6E0E9]">KCS</p>
                    </Link>
                </SheetClose>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar flex flex-col gap-6">
                
                {/* User Profile Section (Mobile) */}
                <SignedIn>
                    <div className="flex items-center gap-4 bg-[#2B2930] p-4 rounded-[20px] shadow-sm ring-1 ring-[#49454F]/30">
                        {/* Profile Image with Badge */}
                        <div className="relative shrink-0">
                            <UserButton 
                                afterSignOutUrl="/sign-in" 
                                appearance={{ elements: { avatarBox: "h-12 w-12" } }}
                            />
                            {/* Badge overlap */}
                            <div className="absolute -bottom-1 -right-1 z-20 bg-[#2B2930] rounded-full p-[2px]">
                                <VerifiedBadge userEmail={userEmail} size={16} />
                            </div>
                        </div>
                        
                        {/* User Details */}
                        <div className="flex flex-col overflow-hidden">
                            <p className="text-sm font-bold text-[#E6E0E9] truncate">
                                {user?.fullName || 'User'}
                            </p>
                            <p className="text-xs text-[#CAC4D0] truncate">
                                {user?.primaryEmailAddress?.emailAddress}
                            </p>
                        </div>
                    </div>
                </SignedIn>

                {/* Main Navigation */}
                <NavLinks />

                {/* Theme Toggle */}
                <div className="flex items-center justify-between px-4 py-3 rounded-full bg-[#2B2930]/40 border border-[#49454F]/20">
                    <span className="text-sm font-medium text-[#CAC4D0]">App Theme</span>
                    <ThemeToggle />
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[#49454F]/30 bg-[#1D1B20] shrink-0 flex flex-col gap-6">
                <SocialLinks />
                <LegalLinks />
                
                <p className="text-[10px] text-center text-[#938F99]">
                    © 2024 Krishna Consciousness Society
                </p>
            </div>

        </SheetContent>
      </Sheet>
    </section>
  );
};

export default MobileNav;
