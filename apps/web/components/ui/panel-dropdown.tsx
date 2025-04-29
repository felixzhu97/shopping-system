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
  isLoading?: boolean;
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
  isLoading = false,
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

  // 键盘事件支持
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
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
          'transform transition-transform duration-300',
          open ? 'translate-y-0' : '-translate-y-2',
          isLoading ? 'pointer-events-none opacity-70' : '',
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
