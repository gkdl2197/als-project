'use client';

// @ts-ignore
import './globals.css';
import React from 'react';
import MasterDataForm from './MasterDataForm';
import ShipmentForm from './ShipmentForm';
import InvoiceList from './InvoiceList';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased text-slate-100">
      {/* 🌐 글로벌 물류 오토메이션 프리미엄 헤더 */}
      <div className="max-w-6xl mx-auto mb-12 text-center relative">
        <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full max-w-md mx-auto -top-12"></div>
        
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 backdrop-blur-md mb-4 text-xs font-semibold text-blue-400 tracking-wide shadow-sm uppercase">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Global Logistics Live Enterprise Solution
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-3">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
            Auto Logistics Solution
          </span>
          <span className="text-blue-500 font-black ml-2 font-mono">ALS</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-sm text-slate-400 font-medium leading-relaxed">
          미루시스템즈 물류 전용 시스템[cite: 1]. 실시간 ETD 기반 인보이스 번호 자동 채번 및 전 세계 현지 프로젝트 담당자들을 위한 실시간 선적 스케줄 모니터링 허브입니다.
        </p>
      </div>

      {/* 🏗️ 3단 인프라 카드 레이아웃 배치 */}
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* CARD 1: 마스터 데이터 기지 */}
        <section className="rounded-2xl border border-slate-850 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-2xl transition-all duration-350 hover:border-blue-500/30">
          <MasterDataForm />
        </section>

        {/* CARD 2: 실 선적 정보 입력 & 자동 채번 */}
        <section className="rounded-2xl border border-slate-850 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-2xl transition-all duration-350 hover:border-sky-500/30">
          <ShipmentForm />
        </section>

        {/* CARD 3: 실시간 모니터링 현황판 (해외 공유용) */}
        <section className="rounded-2xl border border-slate-850 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-2xl transition-all duration-350 hover:border-emerald-500/30">
          <InvoiceList />
        </section>
        
      </div>

      {/* 🏢 카피라이트 풋터 */}
      <footer className="max-w-6xl mx-auto mt-16 text-center text-xs text-slate-600 font-medium tracking-wide">
        &copy; {new Date().getFullYear()} MIRU SYSTEMS CO., LTD. All Rights Reserved. Powered by ALS Engine v1.5.
      </footer>
    </main>
  );
}