'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import NextImage from 'next/image';

export interface ImageProps extends React.ComponentPropsWithoutRef<'img'> {
  fallbackSrc?: string;
  fallbackAlt?: string;
  wrapperClassName?: string;
}

// 根据类别名称获取合适的图片路径
const getCategoryImage = (alt: string): string => {
  const altLower = alt.toLowerCase();
  if (
    altLower.includes('electronics') ||
    altLower.includes('phone') ||
    altLower.includes('watch') ||
    altLower.includes('headphone')
  ) {
    return '/electronics.jpg';
  }
  if (
    altLower.includes('clothing') ||
    altLower.includes('shirt') ||
    altLower.includes('jean') ||
    altLower.includes('jacket')
  ) {
    return '/tshirt.jpg';
  }
  if (altLower.includes('kitchen') || altLower.includes('cook') || altLower.includes('home')) {
    return '/cookware.jpg';
  }
  if (altLower.includes('book') || altLower.includes('novel')) {
    return '/books.jpg';
  }
  // 默认返回电子产品图片
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
            src={fallbackSrc || getCategoryImage(fallbackAlt || alt)}
            alt={fallbackAlt || alt}
            ref={ref}
            {...props}
          />
        ) : (
          <img
            className={cn('object-cover transition-opacity', className)}
            src={src}
            alt={alt}
            onError={handleError}
            ref={ref}
            {...props}
          />
        )}
      </div>
    );
  }
);

Image.displayName = 'Image';

export default Image;
