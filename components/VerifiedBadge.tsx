'use client';

import { isUserAdmin } from '@/lib/utils';
import { ReactNode } from 'react';

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
          width: size * 0.35,
          height: size * 0.35,
          padding: '2px'
        }}
      >
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%' }}
        >
          <path 
            d="M9 12l2 2 4-4m6 2c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" 
            fill="#1D9BF0"
            stroke="#1D9BF0" 
            strokeWidth="1.5"
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M9 12l2 2 4-4" 
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
