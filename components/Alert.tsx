import { Card } from './ui/card';
import Image from 'next/image';
import { ReactNode } from 'react';

const Alert = ({ title, subtitle, iconUrl, icon }: { title: string, subtitle?: string, iconUrl?: string, icon?: ReactNode }) => {
  return (
    <Card className="bg-surface/70 w-full max-w-lg rounded-xl border-none p-6 text-center shadow-xl backdrop-blur-lg md:p-8">
      {icon ? (
        <div className="mb-4 flex justify-center text-accent">{icon}</div>
      ) : iconUrl && (
        <div className="mb-4 flex justify-center">
          <Image src={iconUrl} alt="alert icon" width={48} height={48} />
        </div>
      )}
      <h2 className="mb-2 text-2xl font-bold text-text-primary md:text-3xl">{title}</h2>
      {subtitle && <p className="text-text-secondary">{subtitle}</p>}
    </Card>
  );
};

export default Alert;
