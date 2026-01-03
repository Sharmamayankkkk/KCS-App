import { Lock, Globe } from 'lucide-react';

interface PrivacyBadgeProps {
  isPrivate: boolean;
  className?: string;
}

export const PrivacyBadge = ({ isPrivate, className = '' }: PrivacyBadgeProps) => {
  if (isPrivate) {
    return (
      <span className={`px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium flex items-center gap-1 ${className}`}>
        <Lock className="h-3 w-3" />
        Private
      </span>
    );
  }
  
  return (
    <span className={`px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium flex items-center gap-1 ${className}`}>
      <Globe className="h-3 w-3" />
      Public
    </span>
  );
};

export default PrivacyBadge;
