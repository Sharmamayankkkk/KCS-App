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
      className="flex min-h-[258px] w-full flex-col justify-between rounded-[14px] px-5 py-8 xl:max-w-[568px] bg-surface/80 backdrop-blur-lg border border-border shadow-soft text-text-primary"
    >
      <article className="flex flex-col gap-5">
        <Icon className="h-7 w-7 text-accent" />
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
              className="rounded px-6 bg-accent text-background hover:bg-accent/90"
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
              className="px-6 bg-surface border border-border text-text-primary hover:bg-background"
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
