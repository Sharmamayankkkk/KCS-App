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
        className="flex w-full max-w-[520px] flex-col gap-6 border border-border bg-surface px-6 py-9 text-text-primary shadow-lg"
      >
        <div className="flex flex-col gap-6">
          {Icon && (
            <div className="flex justify-center">
              <Icon className="size-16 text-text-primary" />
            </div>
          )}
          <h1 className={cn("text-3xl font-bold leading-[42px]", className)}>
            {title}
          </h1>
          {children}
          <Button
            className="hover:bg-accent/90 bg-accent text-background focus-visible:ring-1 focus-visible:ring-accent focus-visible:ring-offset-0"
            onClick={handleClick}
          >
            {ButtonIcon && (
              <ButtonIcon className="mr-2 size-4" />
            )}
            {buttonText || 'Schedule Meeting'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MeetingModal;
