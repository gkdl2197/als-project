'use client';

import React from 'react';
import InvoiceList from '../InvoiceList';

export default function UserPage() {
  return (
    <main className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased text-slate-100">
      <div className="max-w-6xl mx-auto mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-emerald-400 tracking-wide mb-3">
          🌐 Global Logistics Live Monitor (Read-Only)
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          ALS 해외 전사 선적 모니터링 허브
        </h1>
        <p className="text-xs text-slate-400 mt-2">
          본 페이지는 실시간 읽기 전용입니다. 현지 프로젝트 담당자들은 선적 일정(ETD/ATD/ETA/ATA) 확인 및 인보이스 PDF 출력이 즉시 가능합니다.
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="rounded-2xl border border-slate-850 bg-slate-900/60 p-6 backdrop-blur-xl shadow-2xl">
          <InvoiceList />
        </div>
      </div>
    </main>
  );
}