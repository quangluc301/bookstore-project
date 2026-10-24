import type { Metadata } from 'next';
// @ts-ignore - Next.js global CSS is handled by the framework at build time.
import './globals.css';

export const metadata: Metadata = {
  title: 'Bookstore',
  description: 'Bookstore frontend',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
