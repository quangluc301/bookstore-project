import type { Metadata } from 'next';
// @ts-ignore - Next.js global CSS is handled by the framework at build time.
import './globals.css';

export const metadata: Metadata = {
  title: 'Bookly | Nhà sách trực tuyến',
  description: 'Khám phá sách hay và đặt mua trực tuyến tại Bookly.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
