import React from 'react';
// Vercel 빌드 에러 방지를 위해 css 임포트 주석 처리
// import './globals.css'; 

export const metadata = {
  title: 'Miru Systems ALS',
  description: 'Auto Logistics Solution',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body style={{ backgroundColor: '#f9fafb', margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}