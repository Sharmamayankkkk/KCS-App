import { isUserAdmin } from '@/lib/utils';
import { ReactNode } from 'react';

// Constants for badge sizing
const BADGE_SIZE_RATIO = 0.35;
const BADGE_PADDING = '2px';
const BADGE_COLOR = '#1D9BF0'; // Twitter blue
const CHECKMARK_PATH = 'M9 12l2 2 4-4m6 2c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z';
const CHECKMARK_STROKE_PATH = 'M9 12l2 2 4-4';

interface VerifiedBadgeProps {
  userEmail?: string;
  userId?: string;
  size?: number;
  className?: string;
  children?: ReactNode;
}

export const VerifiedBadge = ({ userEmail, userId, size = 40, className = '', children }: VerifiedBadgeProps) => {
  // Check if user is admin by email or userId
  const isAdmin = isUserAdmin(userEmail || userId || '');

  if (!isAdmin && !children) return null;
  if (!isAdmin && children) return <>{children}</>;

  // If admin, wrap children with verified badge
  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
      {children}
      <div 
        className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full bg-white dark:bg-gray-900"
        style={{ 
          width: size * BADGE_SIZE_RATIO,
          height: size * BADGE_SIZE_RATIO,
          padding: BADGE_PADDING
        }}
      >
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%' }}
          aria-label="Verified Admin"
        >
          <path 
            d={CHECKMARK_PATH}
            fill={BADGE_COLOR}
            stroke={BADGE_COLOR}
            strokeWidth="1.5"
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d={CHECKMARK_STROKE_PATH}
            stroke="white" 
            strokeWidth="2"
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

export default VerifiedBadge;
