'use client';

import { ElementType } from 'react';
import { cn } from '@/lib/utils';

interface HomeCardProps {
  className?: string;
  icon: ElementType;
  title: string;
  description: string;
  handleClick?: () => void;
}

const HomeCard = ({ className, icon: Icon, title, description, handleClick }: HomeCardProps) => {
  return (
    <section
      className={cn(
        'px-4 py-6 flex flex-col justify-between w-full xl:max-w-[270px] min-h-[260px] rounded-xl cursor-pointer bg-white border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all',
        className
      )}
      onClick={handleClick}
    >
      <div
        className="flex-center size-12 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0]"
      >
        <Icon className="h-7 w-7 text-[#B91C1C]" />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-[#0F172A]">
          {title}
        </h1>
        <p className="text-lg font-normal text-[#64748B]">
          {description}
        </p>
      </div>
    </section>
  );
};

export default HomeCard;
