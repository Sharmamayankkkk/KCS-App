"use client"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { sidebarLinks } from "@/constants"
import { cn } from "@/lib/utils"
import { Instagram, Send } from "lucide-react"

const Sidebar = () => {
  const pathname = usePathname()

  return (
    <section className="sticky left-0 top-0 flex h-screen w-fit flex-col  justify-between  bg-dark-1 p-6 pt-28 text-white max-sm:hidden lg:w-[264px]">
      <div className="flex flex-1 flex-col gap-6">
        {sidebarLinks.map((item) => {
          const isActive = pathname === item.route || pathname.startsWith(`${item.route}/`)

          return (
            <Link
              href={item.route}
              key={item.label}
              className={cn("flex gap-4 items-center p-4 rounded-lg justify-start", {
                "bg-blue-1": isActive,
              })}
            >
              <Image src={item.imgURL || "/placeholder.svg"} alt={item.label} width={24} height={24} />
              <p className="text-lg font-semibold max-lg:hidden">{item.label}</p>
            </Link>
          )
        })}
        {/* Social Media Links */}
        <div className="flex flex-col justify-start gap-6">
          <Link
            href="https://www.instagram.com/kcsociety_india"
            target="_blank"
            className="flex w-full max-w-60 items-center gap-4 rounded-lg p-4 transition-colors hover:bg-blue-1"
          >
            <Instagram size={20} className="text-blue-200" />
            <span
              className="font-semibold text-white
                                                                                                                                                                                                                                                                                                                                         max-lg:hidden"
            >
              Instagram
            </span>
          </Link>

          <Link
            href="https://www.krishnaconsciousnesssociety.com/become-a-volunteer"
            target="_blank"
            className="flex w-full max-w-60 items-center gap-4 rounded-lg p-4 transition-colors hover:bg-blue-1"
          >
            <Send size={20} className="text-blue-200" />
            <span className="font-semibold text-white max-lg:hidden">Join Us</span>
          </Link>
        </div>
        {/* Additional Links */}
        <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 px-2 max-lg:px-1 max-lg:text-[8px]">
          <Link href="/terms-and-conditions" className="text-white transition-colors hover:text-gray-300">
            Terms & Conditions
          </Link>
          <Link href="/refunds-and-cancellations" className="text-white transition-colors hover:text-gray-300">
            Refunds & Cancellations
          </Link>
          <Link href="/services" className="text-white transition-colors hover:text-gray-300">
            Services
          </Link>
          <Link href="/contact-us" className="text-white transition-colors hover:text-gray-300">
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  )
}

export default Sidebar
