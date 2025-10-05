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
        className="flex w-full max-w-[520px] flex-col gap-6 border-none px-6 py-9"
        style={{
          backgroundColor: 'rgba(224, 219, 216, 0.8)', 
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(250, 245, 241, 0.3)',
          boxShadow: '0 8px 32px 0 rgba(41, 47, 54, 0.37)',
          color: '#292F36', 
        }}
      >
        <div className="flex flex-col gap-6">
          {Icon && (
            <div className="flex justify-center">
              <Icon className="h-16 w-16" style={{ color: '#292F36' }} />
            </div>
          )}
          <h1 className={cn("text-3xl font-bold leading-[42px]", className)}>
            {title}
          </h1>
          {children}
          <Button
            className="focus-visible:ring-0 focus-visible:ring-offset-0"
            style={{ backgroundColor: '#A41F13', color: '#FAF5F1' }}
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
