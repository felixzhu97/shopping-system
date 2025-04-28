import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/utils';

interface PanelDropdownProps {
  open: boolean;
  onClose: () => void;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  containerClassName?: string;
  heightClassName?: string;
}

/**
 * 通用下拉面板组件，支持吸顶、动画、点击外部关闭。
 * 用于搜索栏、购物车等下拉弹窗。
 */
export default function PanelDropdown({
  open,
  onClose,
  className = '',
  style = {},
  children,
  containerClassName = '',
  heightClassName = '',
}: PanelDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, onClose]);

  return (
    <div
      className={cn(
        'fixed inset-x-0 top-12 z-40 overflow-hidden transition-all duration-300 ease-in-out',
        open ? `opacity-100 ${heightClassName}` : 'h-0 opacity-0',
        containerClassName
      )}
      style={style}
    >
      <div
        ref={ref}
        className={cn(
          'bg-[rgba(251,251,253,0.95)] backdrop-blur-md border-b border-gray-200 shadow-sm h-full',
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
