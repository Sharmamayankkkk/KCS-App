'use client';

import LegalLinks from './LegalLinks';
import NavLinks from './NavLinks';
import SocialLinks from './SocialLinks';

const Sidebar = () => {
  return (
    <section
      className="sticky left-0 top-0 flex h-screen w-fit flex-col justify-between p-6 pt-28 max-sm:hidden lg:w-[264px]"
      style={{ backgroundColor: '#292F36', color: '#FAF5F1' }}
    >
      <div className="flex flex-1 flex-col gap-6">
        <NavLinks />
        <div className="mt-6 flex-1 border-t pt-6" style={{ borderColor: '#8F7A6E' }}>
          <SocialLinks />
        </div>
      </div>
      <div className="pb-4">
        <div className="border-t pt-4" style={{ borderColor: '#8F7A6E' }}>
          <LegalLinks />
        </div>
      </div>
    </section>
  );
};

export default Sidebar;
