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
        'group relative flex min-h-[240px] w-full flex-col justify-between overflow-hidden rounded-[28px] bg-[#2B2930] p-6 transition-all duration-300 hover:bg-[#383540] cursor-pointer border border-[#49454F]/40 hover:border-[#D0BCFF]/50 hover:shadow-lg xl:max-w-[270px]',
        className
      )}
      onClick={handleClick}
    >
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 bg-gradient-to-br from-[#D0BCFF]/10 to-transparent group-hover:opacity-100" />
      
      {/* Icon Container */}
      <div className="relative z-10 inline-flex size-14 items-center justify-center rounded-[20px] bg-[#D0BCFF]/15 transition-all duration-300 group-hover:bg-[#D0BCFF]/25 group-hover:scale-110">
        <Icon className="size-7 text-[#D0BCFF]" strokeWidth={2} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-2">
        <h1 className="text-[22px] font-bold tracking-tight text-[#E6E0E9]">
          {title}
        </h1>
        <p className="text-[15px] font-normal leading-relaxed text-[#CAC4D0]">
          {description}
        </p>
      </div>

      {/* Hover Indicator Line */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-[#D0BCFF] to-[#D0BCFF]/50 transition-transform duration-300 group-hover:scale-x-100" />
    </section>
  );
};

export default HomeCard;
