'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { sidebarLinks } from '@/constants';
import { cn } from '@/lib/utils';
import { Instagram, Send } from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <section className="sticky left-0 top-0 flex h-screen w-fit flex-col  justify-between  bg-dark-1 p-6 pt-28 text-white max-sm:hidden lg:w-[264px]">
      <div className="flex flex-1 flex-col gap-6">
        {sidebarLinks.map((item) => {
          const isActive = pathname === item.route || pathname.startsWith(`${item.route}/`);
          
          return (
            <Link
              href={item.route}
              key={item.label}
              className={cn(
                'flex gap-4 items-center p-4 rounded-lg justify-start',
                {
                  'bg-blue-1': isActive,
                }
              )}
            >
              <Image
                src={item.imgURL}
                alt={item.label}
                width={24}
                height={24}
              />
              <p className="text-lg font-semibold max-lg:hidden">
                {item.label}
              </p>
            </Link>
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
                      <span className="font-semibold max-lg:hidden
                       text-white">Instagram</span>
                    </Link>
                    
                    <Link 
                      href="https://www.krishnaconsciousnesssociety.com/become-a-volunteer" 
                      target="_blank" 
                      className="flex items-center gap-4 p-4 rounded-lg w-full max-w-60 hover:bg-blue-1 transition-colors"
                    >
                      <Send size={20} className="text-blue-200" />
                      <span className="font-semibold max-lg:hidden text-white">Join Us</span>
                    </Link>
                  </div>
        {/* Additional Links */}
       <div className="fixed bottom-4 left-4 flex flex-col px-2 gap-2 z-50 max-lg:text-[8px] max-lg:px-1">
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
      </div>
    </section>
  );
};

export default Sidebar;
