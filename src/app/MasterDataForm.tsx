'use client';

import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient'; // 상위로 두 번 나가서 lib을 찾습니다.

export default function MasterDataForm() {
  const [year, setYear] = useState<number>(2026); // 현재 시점 기준 기본값 설정
  const [consignee, setConsignee] = useState<string>('');
  const [countryCode, setCountryCode] = useState<string>('');
  const [itemName, setItemName] = useState<string>('');
  const [qty, setQty] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('als_election_projects')
      .insert([
        {
          contract_year: year,
          consignee: consignee.trim(),
          country_code: countryCode.toUpperCase().trim(),
          item_name: itemName.trim(),
          contract_qty: parseInt(qty),
          unit_price: parseFloat(price),
        },
      ]);

    setLoading(false);

    if (error) {
      alert('계약 마스터 등록 실패: ' + error.message);
    } else {
      alert('🎉 당해 연도 선거 계약 정보가 성공적으로 Supabase에 등록되었습니다!');
      setConsignee(''); setCountryCode(''); setItemName(''); setQty(''); setPrice('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800">📋 ALS 연도별 선거 계약 마스터 등록</h2>
        <p className="text-sm text-gray-500 mt-1">매해 입찰 계약 확정 시 나오는 정보를 초기 1회 등록합니다.[cite: 1, 2, 3]</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">계약 연도</label>
            <input type="number" value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="mt-1 block w-full rounded-md border p-2 border-gray-300" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">도착국가 코드 (2자리)</label>
            <input type="text" maxLength={2} placeholder="예: IQ, PH, KG" value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="mt-1 block w-full rounded-md border p-2 border-gray-300 uppercase" required />[cite: 1, 2, 3]
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">Consignee (수하인 기관명)</label>
          <input type="text" placeholder="예: THE INDEPENDENT HIGH ELECTORAL COMMISSION" value={consignee} onChange={(e) => setConsignee(e.target.value)} className="mt-1 block w-full rounded-md border p-2 border-gray-300" required />[cite: 1]
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">ITEM (해당 계약 확정 품명)</label>
          <input type="text" placeholder="예: PCOS motherboard" value={itemName} onChange={(e) => setItemName(e.target.value)} className="mt-1 block w-full rounded-md border p-2 border-gray-300" required />[cite: 1, 2]
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">계약 총 수량 (QTY)</label>
            <input type="number" placeholder="0" value={qty} onChange={(e) => setQty(e.target.value)} className="mt-1 block w-full rounded-md border p-2 border-gray-300" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">계약 단가 (Unit Price USD)</label>
            <input type="number" step="0.01" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 block w-full rounded-md border p-2 border-gray-300" required />[cite: 1, 2, 3]
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-2.5 px-4 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400">
          {loading ? 'Supabase DB 저장 중...' : '계약 마스터 데이터 저장'}
        </button>
      </form>
    </div>
  );
}