'use client';

import { ElementType } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';
import { Copy } from 'lucide-react';

interface MeetingCardProps {
  title: string;
  date: string;
  icon: ElementType;
  isPreviousMeeting?: boolean;
  buttonIcon1?: ElementType;
  buttonText?: string;
  handleClick: () => void;
  link: string;
}

const MeetingCard = ({
  icon: Icon,
  title,
  date,
  isPreviousMeeting,
  buttonIcon1: ButtonIcon1,
  handleClick,
  link,
  buttonText,
}: MeetingCardProps) => {
  const { toast } = useToast();

  return (
    <section
      className="flex min-h-[258px] w-full flex-col justify-between rounded-[14px] px-5 py-8 xl:max-w-[568px]"
      style={{
        backgroundColor: 'rgba(224, 219, 216, 0.6)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(250, 245, 241, 0.3)',
        boxShadow: '0 8px 32px 0 rgba(41, 47, 54, 0.37)',
        color: '#292F36',
      }}
    >
      <article className="flex flex-col gap-5">
        <Icon className="h-7 w-7" style={{ color: '#A41F13' }} />
        <div className="flex justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-base font-normal">{date}</p>
          </div>
        </div>
      </article>
      <article className={cn("flex justify-center relative", {})}>
        {!isPreviousMeeting && (
          <div className="flex gap-2">
            <Button
              onClick={handleClick}
              className="rounded px-6"
              style={{ backgroundColor: '#A41F13', color: '#FAF5F1' }}
            >
              {ButtonIcon1 && (
                <ButtonIcon1 className="h-5 w-5 mr-2" />
              )}
              &nbsp; {buttonText}
            </Button>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(link);
                toast({
                  title: "Link Copied",
                });
              }}
              className="px-6"
              style={{
                backgroundColor: 'rgba(41, 47, 54, 0.6)',
                color: '#FAF5F1',
                border: '1px solid rgba(250, 245, 241, 0.3)',
              }}
            >
              <Copy className="h-5 w-5 mr-2" />
              &nbsp; Copy Link
            </Button>
          </div>
        )}
      </article>
    </section>
  );
};

export default MeetingCard;
