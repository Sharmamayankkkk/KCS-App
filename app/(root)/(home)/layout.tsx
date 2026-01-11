import { Metadata } from 'next';
import { ReactNode } from 'react';

import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'KCS Meet',
  description: 'Divine Connections Beyond Boundaries',
  icons: {
    icon: '/icons/KCS-Logo.png',
  },
};

const HomeLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="relative bg-[#141218]">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <section className="flex min-h-screen flex-1 flex-col gap-8 px-6 pb-6 pt-28 max-md:pb-14 sm:px-14">
          <div className="w-full">{children}</div>
        </section>
      </div>
    </main>
  );
};

export default HomeLayout;
