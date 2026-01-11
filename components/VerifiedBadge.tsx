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
    <div 
      className={`inline-flex items-center justify-center select-none ${className}`}
      title="Verified Admin"
    >
      <Image
        src="/images/verified.png"
        alt="Verified Badge"
        width={size}
        height={size}
        className="object-contain drop-shadow-md"
        style={{ width: size, height: size }}
      />
    </div>
  );
};

export default VerifiedBadge;
