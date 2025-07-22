import React from 'react';

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Separator: React.FC<SeparatorProps> = ({ 
  orientation = 'horizontal', 
  className = '' 
}) => {
  const baseClasses = 'shrink-0 bg-gray-200';
  const orientationClasses = orientation === 'horizontal' 
    ? 'h-[1px] w-full' 
    : 'h-full w-[1px]';

  return (
    <div className={`${baseClasses} ${orientationClasses} ${className}`} />
  );
};