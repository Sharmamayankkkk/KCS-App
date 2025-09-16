"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Instagram, Send } from "lucide-react"

import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { sidebarLinks } from "@/constants"
import { cn } from "@/lib/utils"

const MobileNav = () => {
  const pathname = usePathname()

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
        <SheetContent side="left" className="w-[280px] border-none bg-dark-1 sm:w-[300px]">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/icons/KCS.png" width={48} height={48} alt="KCS logo" />
              <p className="text-2xl font-extrabold text-white">KCS</p>
            </Link>
          </div>

          {/* Navigation Content */}
          <div className="flex h-[calc(100vh-120px)] flex-col justify-between overflow-y-auto">
            <div className="flex flex-col gap-4">
              {/* Main Navigation Links */}
              <div className="space-y-2">
                {sidebarLinks.map((item) => {
                  const isActive = pathname === item.route

                  return (
                    <SheetClose asChild key={item.route}>
                      <Link
                        href={item.route}
                        className={cn(
                          "flex items-center gap-4 p-3 rounded-lg w-full transition-all duration-200 hover:bg-blue-1/50",
                          {
                            "bg-blue-1": isActive,
                          }
                        )}
                      >
                        <Image 
                          src={item.imgURL || "/placeholder.svg"} 
                          alt={item.label} 
                          width={20} 
                          height={20}
                          className="shrink-0"
                        />
                        <p className="font-medium text-white">{item.label}</p>
                      </Link>
                    </SheetClose>
                  )
                })}
              </div>

              {/* Social Media Section */}
              <div className="mt-8 border-t border-gray-700 pt-6">
                <h4 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-400">
                  Connect With Us
                </h4>
                <div className="space-y-2">
                  <SheetClose asChild>
                    <Link
                      href="https://www.instagram.com/kcsociety_india"
                      target="_blank"
                      className="flex w-full items-center gap-4 rounded-lg p-3 transition-all duration-200 hover:bg-blue-1/50"
                    >
                      <Instagram size={20} className="shrink-0 text-blue-200" />
                      <span className="font-medium text-white">Instagram</span>
                    </Link>
                  </SheetClose>

                  <SheetClose asChild>
                    <Link
                      href="https://www.krishnaconsciousnesssociety.com/become-a-volunteer"
                      target="_blank"
                      className="flex w-full items-center gap-4 rounded-lg p-3 transition-all duration-200 hover:bg-blue-1/50"
                    >
                      <Send size={20} className="shrink-0 text-blue-200" />
                      <span className="font-medium text-white">Join Us</span>
                    </Link>
                  </SheetClose>
                </div>
              </div>
            </div>

            {/* Footer Links */}
            <div className="mt-auto border-t border-gray-700 pt-6">
              <h4 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-400">
                Legal & Support
              </h4>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <SheetClose asChild>
                  <Link 
                    href="/terms-and-conditions" 
                    className="rounded p-2 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
                  >
                    Terms & Conditions
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link 
                    href="/refunds-and-cancellations" 
                    className="rounded p-2 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
                  >
                    Refunds & Cancellations
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link 
                    href="/services" 
                    className="rounded p-2 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
                  >
                    Services
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link 
                    href="/contact-us" 
                    className="rounded p-2 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
                  >
                    Contact Us
                  </Link>
                </SheetClose>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  )
}

export default MobileNav
