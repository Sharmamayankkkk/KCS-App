import type { Metadata } from "next"
import type { ReactNode } from "react"

import Navbar from "@/components/Navbar"

export const metadata: Metadata = {
    title: "KCS - Public Pages",
    description: "Public information pages for Krishna Consciousness Society.",
}

const PublicLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
    return (
        <main className="relative">
            <Navbar />

            <section className="flex min-h-screen flex-1 flex-col px-6 pb-6 pt-28 max-md:pb-14 sm:px-14">
                <div className="w-full">{children}</div>
            </section>
        </main>
    )
}

export default PublicLayout
