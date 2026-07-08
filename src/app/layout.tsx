import React from 'react';
// import './globals.css';  <-- 이 줄을 지우거나 이렇게 맨 앞에 //를 붙여서 주석 처리합니다!

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