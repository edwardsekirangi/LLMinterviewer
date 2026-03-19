import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PitWall v2 — Interview Co-Pilot',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
