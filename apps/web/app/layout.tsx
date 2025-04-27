import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { PageTransition } from '@/components/page-transition';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '购物系统',
  description: '一个简单的购物系统演示',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className={inter.className} suppressHydrationWarning>
        <PageTransition>{children}</PageTransition>
        <Toaster />
      </body>
    </html>
  );
}
