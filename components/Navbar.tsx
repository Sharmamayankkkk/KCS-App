import Image from 'next/image';
import Link from 'next/link';
import { SignedIn, UserButton } from '@clerk/nextjs';
import { Instagram, Send } from 'lucide-react';

import MobileNav from './MobileNav';

const Navbar = () => {
  return (
    <nav className="flex-between fixed z-50 w-full bg-dark-1 px-6 py-4 lg:px-10">
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/icons/KCS.png"
          width={48}
          height={48}
          alt="KCS logo"
          className="max-sm:size-12"
        />
        <p className="text-3xl font-extrabold text-white max-sm:hidden">
          KCS
        </p>
      </Link>

      <div className="flex-between gap-6">
        {/* Social Media Links */}
        <div className="flex gap-4">
          <Link 
            href="https://instagram.com/your-handle" 
            target="_blank" 
            className="text-white hover:text-gray-300 transition-colors"
          >
            <Instagram size={24} />
          </Link>
          <Link 
            href="https://t.me/your-channel" 
            target="_blank" 
            className="text-white hover:text-gray-300 transition-colors"
          >
            <Send size={24} />
          </Link>
        </div>

        <SignedIn>
          <UserButton afterSignOutUrl="/sign-in" />
        </SignedIn>

        <MobileNav />
      </div>
    </nav>
  );
};

export default Navbar;
