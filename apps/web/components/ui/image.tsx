'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/utils';

export interface ImageProps extends React.ComponentPropsWithoutRef<'img'> {
  fallbackSrc?: string;
  fallbackAlt?: string;
  wrapperClassName?: string;
}

const getDefaultImageForAlt = (alt: string): string => {
  const normalizedAlt = alt.toLowerCase();
  if (
    normalizedAlt.includes('electronics') ||
    normalizedAlt.includes('phone') ||
    normalizedAlt.includes('watch') ||
    normalizedAlt.includes('headphone')
  ) {
    return '/electronics.jpg';
  }
  if (
    normalizedAlt.includes('clothing') ||
    normalizedAlt.includes('shirt') ||
    normalizedAlt.includes('jean') ||
    normalizedAlt.includes('jacket')
  ) {
    return '/tshirt.jpg';
  }
  if (normalizedAlt.includes('kitchen') || normalizedAlt.includes('cook') || normalizedAlt.includes('home')) {
    return '/cookware.jpg';
  }
  if (normalizedAlt.includes('book') || normalizedAlt.includes('novel')) {
    return '/books.jpg';
  }
  return '/electronics.jpg';
};

export const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ className, src, alt = '', fallbackSrc, fallbackAlt, wrapperClassName, ...props }, ref) => {
    const [error, setError] = React.useState(false);

    const handleError = () => {
      setError(true);
    };

    return (
      <div className={cn('relative overflow-hidden', wrapperClassName)}>
        {error || !src ? (
          <img
            className={cn('object-cover transition-opacity', className)}
            src={fallbackSrc || getDefaultImageForAlt(fallbackAlt || alt)}
            alt={fallbackAlt || alt}
            ref={ref}
            {...props}
            loading="lazy"
          />
        ) : (
          <img
            className={cn('object-cover transition-opacity', className)}
            src={src}
            alt={alt}
            onError={handleError}
            ref={ref}
            {...props}
            loading="lazy"
          />
        )}
      </div>
    );
  }
);

Image.displayName = 'Image';

export default Image;
