import React from 'react';
import './globals.css'; // 만약 globals.css가 없다면 이 줄을 지워주세요.

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