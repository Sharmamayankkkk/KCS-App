import Image from 'next/image';
import Link from 'next/link';
import { SignedIn, UserButton } from '@clerk/nextjs';
import { Instagram, Send } from 'lucide-react';

import MobileNav from './MobileNav';

const Navbar = () => {
  return (
    <nav className="flex-between fixed z-50 w-full bg-dark-1 px-4 py-3 md:px-6 md:py-4 lg:px-10">
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/icons/KCS.png"
          width={48}
          height={48}
          alt="KCS logo"
          className="size-10 md:size-12"
        />
        <p className="text-2xl font-extrabold text-white max-sm:hidden md:text-3xl">
          KCS
        </p>
      </Link>

      <div className="flex items-center gap-3 md:gap-6">
        {/* Social Media Links - Hidden on small screens */}
        <div className="hidden items-center gap-3 md:flex lg:gap-4">
          <Link 
            href="https://www.instagram.com/kcsociety_india" 
            target="_blank" 
            rel="noopener noreferrer"
            className="rounded-lg p-2 text-white transition-colors duration-200 hover:bg-gray-800/50 hover:text-gray-300"
            aria-label="Follow us on Instagram"
          >
            <Instagram size={22} />
          </Link>
          <Link 
            href="https://www.krishnaconsciousnesssociety.com/become-a-volunteer" 
            target="_blank" 
            rel="noopener noreferrer"
            className="rounded-lg p-2 text-white transition-colors duration-200 hover:bg-gray-800/50 hover:text-gray-300"
            aria-label="Join as volunteer"
          >
            <Send size={22} />
          </Link>
        </div>

        {/* Vertical separator - Hidden on small screens */}
        <div className="hidden h-6 w-px bg-gray-600 md:block"></div>

        {/* User Profile */}
        <SignedIn>
          <div className="flex items-center">
            <UserButton 
              afterSignOutUrl="/sign-in"
              appearance={{
                elements: {
                  avatarBox: "size-8 md:size-10",
                  userButtonPopoverCard: "bg-dark-1 border-gray-700",
                  userButtonPopoverActionButton: "text-white hover:bg-gray-700",
                }
              }}
            />
          </div>
        </SignedIn>

        {/* Mobile Navigation */}
        <MobileNav />
      </div>
    </nav>
  );
};

export default Navbar;
