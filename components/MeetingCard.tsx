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
      className="bg-surface/80 flex min-h-[258px] w-full flex-col justify-between rounded-[14px] border border-border px-5 py-8 text-text-primary shadow-soft backdrop-blur-lg xl:max-w-[568px]"
    >
      <article className="flex flex-col gap-5">
        <Icon className="size-7 text-accent" />
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
              className="hover:bg-accent/90 rounded bg-accent px-6 text-background"
            >
              {ButtonIcon1 && (
                <ButtonIcon1 className="mr-2 size-5" />
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
              className="border border-border bg-surface px-6 text-text-primary hover:bg-background"
            >
              <Copy className="mr-2 size-5" />
              &nbsp; Copy Link
            </Button>
          </div>
        )}
      </article>
    </section>
  );
};

export default MeetingCard;
