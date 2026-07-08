import React from 'react';

export const metadata = {
  title: 'Miru Systems ALS',
  description: 'Auto Logistics Solution',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}