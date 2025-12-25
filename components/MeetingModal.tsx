'use client';

import { ReactNode, ElementType } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  className?: string;
  children?: ReactNode;
  handleClick?: () => void;
  buttonText?: string;
  instantMeeting?: boolean;
  icon?: ElementType; 
  buttonClassName?: string;
  buttonIcon?: ElementType;
}

const MeetingModal = ({
  isOpen,
  onClose,
  title,
  className,
  children,
  handleClick,
  buttonText,
  icon: Icon,
  buttonIcon: ButtonIcon,
}: MeetingModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="flex w-full max-w-[520px] flex-col gap-6 border border-[#E2E8F0] px-6 py-9 bg-white text-[#0F172A] shadow-lg"
      >
        <div className="flex flex-col gap-6">
          {Icon && (
            <div className="flex justify-center">
              <Icon className="h-16 w-16 text-[#0F172A]" />
            </div>
          )}
          <h1 className={cn("text-3xl font-bold leading-[42px]", className)}>
            {title}
          </h1>
          {children}
          <Button
            className="bg-[#B91C1C] text-white hover:bg-[#991B1B] focus-visible:ring-1 focus-visible:ring-[#B91C1C] focus-visible:ring-offset-0"
            onClick={handleClick}
          >
            {ButtonIcon && (
              <ButtonIcon className="h-4 w-4 mr-2" />
            )}
            {buttonText || 'Schedule Meeting'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MeetingModal;
