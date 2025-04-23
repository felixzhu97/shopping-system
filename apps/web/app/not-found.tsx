'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="max-w-xl w-full text-center">
          <div className="bg-white rounded-3xl shadow-sm p-10 md:p-16">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-500"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>

            <h1 className="text-4xl font-semibold text-gray-900 mb-3">功能即将推出</h1>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              我们正在努力开发此功能，敬请期待。请稍后再访问。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="w-full sm:w-auto rounded-full bg-blue-600 hover:bg-blue-700 transition-colors h-12 px-8"
              >
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  返回首页
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full sm:w-auto rounded-full border-gray-300 hover:bg-gray-100 transition-colors h-12 px-8"
              >
                <Link href="/products">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  浏览产品
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
