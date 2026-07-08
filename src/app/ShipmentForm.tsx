'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface MasterProject {
  id: number;
  contract_year: number;
  consignee: string;
  country_code: string;
  item_name: string;
}

export default function ShipmentForm() {
  const [projects, setProjects] = useState<MasterProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [tradeType, setShipmentType] = useState<string>('EX'); 
  const [isPaid, setIsPaid] = useState<string>('유상'); 
  const [actualQty, setActualQty] = useState<string>(''); 
  const [packingUnit, setPackingUnit] = useState<string>('PLT'); 
  const [packingQty, setPackingQty] = useState<string>(''); 
  const [shipmentMethod, setShipmentMethod] = useState<string>('AIR'); 
  const [shipmentNo, setShipmentNo] = useState<string>(''); 
  const [releaseDate, setReleaseDate] = useState<string>(''); 
  const [etd, setEtd] = useState<string>(''); 
  const [invoiceNo, setInvoiceNo] = useState<string>('자동 생성 예정');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function fetchMasterProjects() {
      const { data } = await supabase.from('als_election_projects').select('*');
      if (data) setProjects(data as MasterProject[]);
    }
    fetchMasterProjects();
  }, []);

  useEffect(() => {
    if (!selectedProjectId || !etd) {
      setInvoiceNo('자동 생성 예정');
      return;
    }
    
    async function generateInvoiceNumber() {
      const selectedProj = projects.find(p => p.id === parseInt(selectedProjectId));
      if (!selectedProj) return;

      const dateObj = new Date(etd);
      const yy = dateObj.getFullYear().toString().slice(-2);
      const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
      const yymm = `${yy}${mm}`;
      const country = selectedProj.country_code;

      const { count } = await supabase
        .from('als_shipments')
        .select('*', { count: 'exact', head: true })
        .like('invoice_no', `MS-${yymm}-${country}-%`);

      const nextSequence = String((count || 0) + 1).padStart(2, '0');
      setInvoiceNo(`MS-${yymm}-${country}-${nextSequence}`);
    }
    generateInvoiceNumber();
  }, [selectedProjectId, etd, projects]);

  const handleShipmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || invoiceNo === '자동 생성 예정') {
      alert('프로젝트와 출발예정일(ETD)을 정확히 입력해 주세요.');
      return;
    }
    setLoading(true);

    const { error } = await supabase
      .from('als_shipments')
      .insert([
        {
          invoice_no: invoiceNo,
          project_id: parseInt(selectedProjectId),
          actual_qty: parseInt(actualQty),
          packing_unit: packingUnit,
          shipment_type: shipmentMethod,
          shipment_no: shipmentNo || null,
          release_date: releaseDate,
          etd: etd
        }
      ]);

    setLoading(false);

    if (error) {
      alert('선적 정보 등록 실패: ' + error.message);
    } else {
      alert(`🎉 인보이스 발행 완료! 번호: ${invoiceNo}`);
      setActualQty(''); setPackingQty(''); setShipmentNo(''); setReleaseDate(''); setEtd(''); setInvoiceNo('자동 생성 예정');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800">🚢 ALS 실 선적 정보 입력 & 인보이스 발행</h2>
        <p className="text-sm text-gray-500 mt-1 font-medium">당해 연도 입찰 계약 데이터를 기반으로 일련번호를 자동 추출합니다.</p>
      </div>
      <form onSubmit={handleShipmentSubmit} className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <span className="text-sm font-semibold text-blue-700 block">발행 예정 인보이스 넘버</span>
          <span className="text-2xl font-black text-blue-900 tracking-wider mt-1 block">{invoiceNo}</span>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">연동할 선거 계약 프로젝트 선택</label>
          <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} className="mt-1 block w-full rounded-md border p-2 border-gray-300 bg-white" required>
            <option value="">-- 프로젝트 계약 선택 --</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>[{p.contract_year}] {p.consignee} ({p.country_code})</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">1) 수출/입 구분</label>
            <select value={tradeType} onChange={(e) => setShipmentType(e.target.value)} className="mt-1 block w-full rounded-md border p-2 border-gray-300">
              <option value="EX">EX (수출)</option>
              <option value="IM">IM (수입)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">2) 유/무상 여부</label>
            <select value={isPaid} onChange={(e) => setIsPaid(e.target.value)} className="mt-1 block w-full rounded-md border p-2 border-gray-300">
              <option value="유상">유상</option>
              <option value="무상">무상</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">6) 선적 구분</label>
            <select value={shipmentMethod} onChange={(e) => setShipmentMethod(e.target.value)} className="mt-1 block w-full rounded-md border p-2 border-gray-300">
              <option value="AIR">AIR (항공)</option>
              <option value="OCEAN">OCEAN (해상)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">8) 선적명 (Shipment No.)</label>
            <input type="text" placeholder="예: EK311" value={shipmentNo} onChange={(e) => setShipmentNo(e.target.value)} className="mt-1 block w-full rounded-md border p-2 border-gray-300" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-blue-700">⚠️ 출고일 (수기 입력)</label>
            <input type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} className="mt-1 block w-full rounded-md border p-2 border-blue-300 bg-blue-50/50" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">5) 출발예정일 (ETD)</label>
            <input type="date" value={etd} onChange={(e) => setEtd(e.target.value)} className="mt-1 block w-full rounded-md border p-2 border-gray-300" required />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">4) 수량(UN)</label>
            <input type="number" value={actualQty} onChange={(e) => setActualQty(e.target.value)} className="mt-1 block w-full rounded-md border p-2 border-gray-300" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">7) 패킹 단위</label>
            <select value={packingUnit} onChange={(e) => setPackingUnit(e.target.value)} className="mt-1 block w-full rounded-md border p-2 border-gray-300">
              <option value="PLT">PLT</option>
              <option value="CTN">CTN</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">7) 패킹 수량</label>
            <input type="number" value={packingQty} onChange={(e) => setPackingQty(e.target.value)} className="mt-1 block w-full rounded-md border p-2 border-gray-300" required />
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-green-600 text-white font-bold py-2.5 px-4 rounded-md hover:bg-green-700 transition">
          {loading ? '인보이스 저장 중...' : '선적 확정 및 인보이스 발행'}
        </button>
      </form>
    </div>
  );
}