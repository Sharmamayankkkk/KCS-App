import { Lock, Globe } from 'lucide-react';

interface PrivacyBadgeProps {
  isPrivate: boolean;
  className?: string;
}

export const PrivacyBadge = ({ isPrivate, className = '' }: PrivacyBadgeProps) => {
  if (isPrivate) {
    return (
      <span className={`flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 ${className}`}>
        <Lock className="size-3" />
        Private
      </span>
    );
  }
  
  return (
    <span className={`flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 ${className}`}>
      <Globe className="size-3" />
      Public
    </span>
  );
};

export default PrivacyBadge;
