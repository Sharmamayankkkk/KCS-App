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
        'px-4 py-6 flex flex-col justify-between w-full xl:max-w-[270px] min-h-[260px] rounded-[14px] cursor-pointer',
        className
      )}
      style={{
        backgroundColor: 'rgba(224, 219, 216, 0.6)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(250, 245, 241, 0.3)',
        boxShadow: '0 8px 32px 0 rgba(41, 47, 54, 0.37)',
      }}
      onClick={handleClick}
    >
      <div
        className="flex-center size-12 rounded-[10px]"
        style={{
          backgroundColor: 'rgba(250, 245, 241, 0.5)',
          border: '1px solid rgba(250, 245, 241, 0.3)',
        }}
      >
        <Icon className="h-7 w-7" style={{ color: '#A41F13' }} />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold" style={{ color: '#292F36' }}>
          {title}
        </h1>
        <p className="text-lg font-normal" style={{ color: '#292F36' }}>
          {description}
        </p>
      </div>
    </section>
  );
};

export default HomeCard;
