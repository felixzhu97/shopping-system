import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: '购物系统',
  description: '一个现代化的购物系统',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
