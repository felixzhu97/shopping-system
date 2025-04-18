import type { Metadata } from 'next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/lib/cart-context';

export const metadata: Metadata = {
  title: '购物系统',
  description: '一个现代的在线购物系统',
  generator: 'v0.dev',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body>
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
