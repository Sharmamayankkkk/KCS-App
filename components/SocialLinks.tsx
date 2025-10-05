'use client';

import { socialLinks } from '@/constants/links';
import Link from 'next/link';

const SocialLinks = () => {
  return (
    <div className="flex flex-col gap-2">
      {socialLinks.map((link) => (
        <Link
          href={link.href}
          key={link.label}
          target="_blank"
          className="flex gap-4 items-center p-4 rounded-lg justify-start"
          style={{ color: '#FAF5F1' }}
        >
          <link.icon />
          <span className="font-semibold block sm:hidden lg:block">{link.label}</span>
        </Link>
      ))}
    </div>
  );
};

export default SocialLinks;
