import {
  Briefcase,
  CircleDollarSign,
  FileText,
  Home,
  Instagram,
  Mail,
  Send,
  Video,
} from 'lucide-react';

export const sidebarLinks = [
  {
    icon: Home,
    route: '/',
    label: 'Home',
  },
  {
    icon: Video,
    route: '/recordings',
    label: 'Recordings',
  },
];

export const socialLinks = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/kcsociety_india',
    icon: Instagram,
  },
  {
    label: 'Join Us',
    href: 'https://www.krishnaconsciousnesssociety.com/become-a-volunteer',
    icon: Send,
  },
];

export const legalLinks = [
  {
    label: 'Terms & Conditions',
    href: '/terms-and-conditions',
    icon: FileText,
  },
  {
    label: 'Refunds & Cancellations',
    href: '/refunds-and-cancellations',
    icon: CircleDollarSign,
  },
  {
    label: 'Services',
    href: '/services',
    icon: Briefcase,
  },
  {
    label: 'Contact Us',
    href: '/contact-us',
    icon: Mail,
  },
];
