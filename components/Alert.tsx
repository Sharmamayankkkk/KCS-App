import { Card } from './ui/card';
import Image from 'next/image';
import { ReactNode } from 'react';

const Alert = ({ title, subtitle, iconUrl, icon }: { title: string, subtitle?: string, iconUrl?: string, icon?: ReactNode }) => {
  return (
    <Card className="w-full max-w-lg p-6 md:p-8 border-none bg-surface/70 backdrop-blur-lg shadow-xl rounded-xl text-center">
      {icon ? (
        <div className="flex justify-center mb-4 text-accent">{icon}</div>
      ) : iconUrl && (
        <div className="flex justify-center mb-4">
          <Image src={iconUrl} alt="alert icon" width={48} height={48} />
        </div>
      )}
      <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">{title}</h2>
      {subtitle && <p className="text-text-secondary">{subtitle}</p>}
    </Card>
  );
};

export default Alert;
