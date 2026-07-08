'use client';

import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function MasterDataForm() {
  const [contractYear, setContractYear] = useState<number>(2026);
  const [countryCode, setCountryCode] = useState<string>('');
  const [consignee, setConsignee] = useState<string>('');
  const [itemName, setItemName] = useState<string>('');
  const [contractQty, setContractQty] = useState<number>(0);
  const [unitPrice, setUnitPrice] = useState<number>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!countryCode || !consignee || !itemName) {
      alert('⚠️ 필수 텍스트 항목을 입력해 주세요.');
      return;
    }

    const { error } = await supabase.from('als_election_projects').insert([
      {
        contract_year: contractYear,
        country_code: countryCode.toUpperCase(),
        consignee: consignee,
        item_name: itemName,
        contract_qty: contractQty,
        unit_price: unitPrice,
      },
    ]);

    if (error) {
      alert(`❌ 마스터 등록 실패: ${error.message}`);
    } else {
      alert('🎉 당해 연도 선거 계약 정보가 성공적으로 등록되었습니다!');
      setCountryCode('');
      setConsignee('');
      setItemName('');
      setContractQty(0);
      setUnitPrice(0);
      window.location.reload();
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
        <span className="text-xl">📋</span>
        <h3 className="text-lg font-bold text-white">ALS 연도별 선거 계약 마스터 등록</h3>
      </div>
      <p className="text-xs text-slate-400 mb-6 leading-relaxed">
        매해 입찰 계약 확정 시 나오는 고유 정보를 초기 1회 등록합니다. 등록된 정보는 실시간 인보이스 채번 및 단가 매핑의 기준점이 됩니다.
      </p>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">계약 연도</label>
          <input type="number" value={contractYear} onChange={(e) => setContractYear(parseInt(e.target.value))} className="w-full bg-slate-900 border border-slate-750 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"/>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">도착국가 코드 (2자리) *</label>
          <input type="text" placeholder="예: IQ, PH, KG" value={countryCode} onChange={(e) => setCountryCode(e.target.value)} maxLength={2} className="w-full bg-slate-900 border border-slate-750 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600 transition uppercase"/>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Consignee (수하인 기관명) *</label>
          <input type="text" placeholder="예: IHEC, COMELEC" value={consignee} onChange={(e) => setConsignee(e.target.value)} className="w-full bg-slate-900 border border-slate-750 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600 transition"/>
        </div>
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">ITEM (해당 계약 확정 품명) *</label>
          <input type="text" placeholder="예: PCOS motherboard, IDP Устройство" value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full bg-slate-900 border border-slate-750 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600 transition"/>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">계약 총 수량 (QTY)</label>
          <input type="number" value={contractQty} onChange={(e) => setContractQty(parseInt(e.target.value))} className="w-full bg-slate-900 border border-slate-750 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"/>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">계약 단가 (Unit Price USD)</label>
          <input type="number" step="0.01" value={unitPrice} onChange={(e) => setUnitPrice(parseFloat(e.target.value))} className="w-full bg-slate-900 border border-slate-750 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"/>
        </div>
        <div className="flex items-end">
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm py-2.5 px-4 rounded-lg shadow-lg shadow-blue-600/10 transition-all duration-200 active:scale-[0.99]">
            💾 계약 마스터 데이터 저장
          </button>
        </div>
      </form>
    </div>
  );
}