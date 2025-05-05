'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Instagram, Send } from 'lucide-react';

import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { sidebarLinks } from '@/constants';
import { cn } from '@/lib/utils';

const MobileNav = () => {
  const pathname = usePathname();

  return (
    <section className="w-full max-w-[264px]">
      <Sheet>
        <SheetTrigger asChild>
          <Image
            src="/icons/hamburger.svg"
            width={36}
            height={36}
            alt="hamburger icon"
            className="cursor-pointer sm:hidden"
          />
        </SheetTrigger>
        <SheetContent side="left" className="border-none bg-dark-1">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/icons/KCS.png"
              width={48}
              height={48}
              alt="KCS logo"
            />
            <p className="text-3xl font-extrabold text-white">KCS</p>
          </Link>
          <div className="flex h-[calc(100vh-72px)] flex-col justify-between overflow-y-auto">
            <SheetClose asChild>
              <section className="flex h-full flex-col gap-6 pt-16 text-white">
                
                {/* Navigation Links */}
                {sidebarLinks.map((item) => {
                  const isActive = pathname === item.route;
                
                  return (
                    <SheetClose asChild key={item.route}>
                      <Link
                        href={item.route}
                        key={item.label}
                        className={cn(
                          'flex gap-4 items-center p-4 rounded-lg w-full max-w-60',
                          {
                            'bg-blue-1': isActive,
                          }
                        )}
                      >
                        <Image
                          src={item.imgURL}
                          alt={item.label}
                          width={20}
                          height={20}
                        />
                        <p className="font-semibold">{item.label}</p>
                      </Link>
                    </SheetClose>
                  );
                })}
                {/* Social Media Links */}
                  <div className="flex flex-col gap-6 justify-start">
                    <Link 
                      href="https://www.instagram.com/kcsociety_india" 
                      target="_blank" 
                      className="flex items-center gap-4 p-4 rounded-lg w-full max-w-60 hover:bg-blue-1 transition-colors"
                    >
                      <Instagram size={20} className="text-blue-200" />
                      <span className="font-semibold text-white">Instagram</span>
                    </Link>
                    
                    <Link 
                      href="https://www.krishnaconsciousnesssociety.com/become-a-volunteer" 
                      target="_blank" 
                      className="flex items-center gap-4 p-4 rounded-lg w-full max-w-60 hover:bg-blue-1 transition-colors"
                    >
                      <Send size={20} className="text-blue-200" />
                      <span className="font-semibold text-white">Join Us</span>
                    </Link>
                  </div>
                {/* Fixed Bottom Links */}
                <div className="fixed bottom-4 left-4 px-1 flex flex-col gap-2 z-50">
                  <Link href="/terms-and-conditions" className="text-white hover:text-gray-300 transition-colors">
                    Terms & Conditions
                  </Link>
                  <Link href="/privacy-policy" className="text-white hover:text-gray-300 transition-colors">
                    Privacy Policy
                  </Link>
                  <Link href="/about-us" className="text-white hover:text-gray-300 transition-colors">
                    About Us
                  </Link>
                  <Link href="/contact-us" className="text-white hover:text-gray-300 transition-colors">
                    Contact Us
                  </Link>
                </div>
              </section>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
};

export default MobileNav;
