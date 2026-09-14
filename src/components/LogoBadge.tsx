import React from 'react';

interface LogoBadgeProps {
  type: 'logo1' | 'logo2';
  customUrl?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LogoBadge: React.FC<LogoBadgeProps> = ({
  type,
  customUrl,
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-8 text-xs',
    md: 'h-11 text-sm',
    lg: 'h-14 text-base'
  };

  const [imgError, setImgError] = React.useState(false);

  React.useEffect(() => {
    setImgError(false);
  }, [customUrl]);

  // Use either customUrl or fallback to the fixed server svg
  const effectiveUrl = (!imgError && customUrl && customUrl.trim().length > 0)
    ? customUrl
    : (type === 'logo1' ? '/logo1.svg' : '/logo2.svg');

  return (
    <img
      src={effectiveUrl}
      alt={type === 'logo1' ? 'Logo The Biz Nation' : 'Emblema The Biz Nation'}
      referrerPolicy="no-referrer"
      onError={() => {
        if (effectiveUrl !== (type === 'logo1' ? '/logo1.svg' : '/logo2.svg')) {
          setImgError(true);
        }
      }}
      className={`object-contain rounded-lg shadow-xs transition shrink-0 ${
        type === 'logo1' ? 'w-auto max-w-[140px] sm:max-w-[160px]' : 'w-auto aspect-[3/4]'
      } ${sizeClasses[size]} ${className}`}
    />
  );
};
