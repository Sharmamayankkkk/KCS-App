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
        'group relative flex min-h-[260px] w-full flex-col justify-between overflow-hidden rounded-3xl bg-surface p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl xl:max-w-[270px]',
        'cursor-pointer border border-border/50',
        className
      )}
      onClick={handleClick}
    >
      {/* Material Design 3 State Layer */}
      <div className="absolute inset-0 bg-accent opacity-0 transition-opacity duration-300 group-hover:opacity-5" />
      
      {/* Icon Container with MD3 Surface */}
      <div className="relative z-10 inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
        <Icon className="size-7 text-accent" strokeWidth={2} />
      </div>

      <div className="relative z-10 flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          {title}
        </h1>
        <p className="text-base font-normal leading-relaxed text-text-secondary">
          {description}
        </p>
      </div>

      {/* Ripple effect hint */}
      <div className="absolute bottom-0 left-0 right-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-accent to-accent/50 transition-transform duration-300 group-hover:scale-x-100" />
    </section>
  );
};

export default HomeCard;
