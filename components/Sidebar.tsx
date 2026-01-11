'use client';

import LegalLinks from './LegalLinks';
import NavLinks from './NavLinks';
import SocialLinks from './SocialLinks';

const Sidebar = () => {
  return (
    <section
      className="sticky left-0 top-0 flex h-screen w-fit flex-col justify-between bg-[#141218] p-6 pt-28 text-[#E6E0E9] max-sm:hidden lg:w-[264px] border-r border-[#49454F]/30"
    >
      <div className="flex flex-1 flex-col gap-6">
        <NavLinks />
        <div className="mt-6 flex-1 border-t border-[#49454F]/30 pt-6">
          <SocialLinks />
        </div>
      </div>
      <div className="pb-4">
        <div className="border-t border-[#49454F]/30 pt-4">
          <LegalLinks />
        </div>
      </div>
    </section>
  );
};

export default Sidebar;
