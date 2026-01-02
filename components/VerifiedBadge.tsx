import Image from 'next/image';
import { isUserAdmin } from '@/lib/utils';

interface VerifiedBadgeProps {
  userEmail?: string;
  userId?: string;
  size?: number;
  className?: string;
}

export const VerifiedBadge = ({ userEmail, userId, size = 16, className = '' }: VerifiedBadgeProps) => {
  // Check if user is admin by email or userId
  const isAdmin = isUserAdmin(userEmail || userId || '');

  if (!isAdmin) return null;

  return (
    <Image
      src="/images/verified.png"
      alt="Verified Admin"
      width={size}
      height={size}
      className={`inline-block ${className}`}
      style={{ flexShrink: 0 }}
      title="Verified Admin"
    />
  );
};

export default VerifiedBadge;
