'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function ShipmentForm() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [invoiceNo, setInvoiceNo] = useState<string>('자동 생성 예정');
  
  // 8대 필수값 및 날짜 4종 상태 관리
  const [ioType, setIoType] = useState<string>('EX');
  const [isFree, setIsFree] = useState<string>('유상');
  const [shipmentType, setShipmentType] = useState<string>('AIR');
  const [shipmentNo, setShipmentNo] = useState<string>('');
  const [actualQty, setActualQty] = useState<string>('');
  const [packingUnit, setPackingUnit] = useState<string>('PLT');
  const [packingQty, setPackingQty] = useState<string>('');

  // 날짜 4종 수기 입력 필드
  const [etd, setEtd] = useState<string>('');
  const [atd, setAtd] = useState<string>('');
  const [eta, setEta] = useState<string>('');
  const [ata, setAta] = useState<string>('');

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase.from('als_election_projects').select('*');
      if (data) setProjects(data);
    };
    fetchProjects();
  }, []);

  // 인보이스 넘버 실시간 자동 채번 엔진 (기준: ETD 연월 활용)
  useEffect(() => {
    if (!selectedProjectId || !etd) {
      setInvoiceNo('출발예정일(ETD)과 프로젝트를 선택하면 자동 생성됩니다.');
      return;
    }

    const generateInvoiceNo = async () => {
      const selectedProject = projects.find(p => p.id.toString() === selectedProjectId);
      if (!selectedProject) return;

      const countryCode = selectedProject.country_code.toUpperCase();
      const dateObj = new Date(etd);
      const yy = dateObj.getFullYear().toString().slice(-2);
      const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
      const prefix = `MS-${yy}${mm}-${countryCode}`;

      const { count } = await supabase
        .from('als_shipments')
        .select('*', { count: 'exact', head: true })
        .like('invoice_no', `${prefix}%`);

      const sequence = String((count || 0) + 1).padStart(2, '0');
      setInvoiceNo(`${prefix}-${sequence}`);
    };

    generateInvoiceNo();
  }, [selectedProjectId, etd, projects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProjectId || !etd || !actualQty) {
      alert('⚠️ 프로젝트, 출발예정일, 수량은 필수 입력 항목입니다.');
      return;
    }

    const { error } = await supabase.from('als_shipments').insert([
      {
        invoice_no: invoiceNo,
        project_id: parseInt(selectedProjectId),
        io_type: ioType,
        is_free: isFree,
        actual_qty: parseInt(actualQty),
        packing_unit: `${packingQty} ${packingUnit}`,
        shipment_type: shipmentType,
        shipment_no: shipmentNo || null,
        etd: etd || null,
        atd: atd || null,
        eta: eta || null,
        ata: ata || null,
      }
    ]);

    if (error) {
      alert(`❌ 선적 저장 실패: ${error.message}`);
    } else {
      alert(`🎉 인보이스 [${invoiceNo}] 발행 및 ALS 모니터링 적재 성공!`);
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-2">🚢 ALS 실 선적 정보 입력 & 인보이스 발행</h2>
      <p className="text-xs text-gray-500 mb-6">수출입 구분 및 변동성이 큰 날짜 4종을 수기 관리하여 현지 담당자에게 실시간 공유합니다.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <span className="text-xs font-semibold text-blue-700 block mb-1">발행 예정 인보이스 넘버</span>
          <span className="text-xl font-black text-blue-900 tracking-wide">{invoiceNo}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">연동할 선거 계약 프로젝트 선택 *</label>
            <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} className="w-full p-2 border rounded text-sm bg-gray-50">
              <option value="">-- 프로젝트 계약 선택 --</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>[{p.contract_year}] {p.consignee} ({p.country_code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">1) 수출/입 구분</label>
            <select value={ioType} onChange={(e) => setIoType(e.target.value)} className="w-full p-2 border rounded text-sm bg-gray-50">
              <option value="EX">EX (수출)</option>
              <option value="IM">IM (수입)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">2) 유/무상 여부</label>
            <select value={isFree} onChange={(e) => setIsFree(e.target.value)} className="w-full p-2 border rounded text-sm bg-gray-50">
              <option value="유상">유상</option>
              <option value="무상">무상</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">6) 선적 구분</label>
            <select value={shipmentType} onChange={(e) => setShipmentType(e.target.value)} className="w-full p-2 border rounded text-sm bg-gray-50">
              <option value="AIR">AIR (항공)</option>
              <option value="OCEAN">OCEAN (해상)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">8) 선적명 (Shipment No. / 편명)</label>
            <input type="text" placeholder="예: EK311" value={shipmentNo} onChange={(e) => setShipmentNo(e.target.value)} className="w-full p-2 border rounded text-sm"/>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">4) 품목별 출고 수량 (UN / SET) *</label>
            <input type="number" placeholder="출고 수량 입력" value={actualQty} onChange={(e) => setActualQty(e.target.value)} className="w-full p-2 border rounded text-sm"/>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">7) 패킹 단위</label>
              <select value={packingUnit} onChange={(e) => setPackingUnit(e.target.value)} className="w-full p-2 border rounded text-sm bg-gray-50">
                <option value="PLT">PLT (팔레트)</option>
                <option value="CTN">CTN (카톤)</option>
                <option value="PKG">PKG (패키지)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">7) 패킹 수량</label>
              <input type="number" placeholder="수량" value={packingQty} onChange={(e) => setPackingQty(e.target.value)} className="w-full p-2 border rounded text-sm"/>
            </div>
          </div>
        </div>

        {/* 파트너님 오더 사항: 변동성 대응 날짜 4종 수기 섹션 */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mt-4">
          <span className="text-xs font-bold text-gray-800 block mb-3">📅 선적 및 스케줄 일정 관리 (수기 입력)</span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block style style-none text-[11px] font-medium text-gray-500 mb-0.5">5) 출발예정일 (ETD) *</label>
              <input type="date" value={etd} onChange={(e) => setEtd(e.target.value)} className="w-full p-1.5 border rounded text-xs"/>
            </div>
            <div>
              <label className="block style style-none text-[11px] font-medium text-gray-500 mb-0.5">실제 출발일 (ATD)</label>
              <input type="date" value={atd} onChange={(e) => setAtd(e.target.value)} className="w-full p-1.5 border rounded text-xs"/>
            </div>
            <div>
              <label className="block style style-none text-[11px] font-medium text-gray-500 mb-0.5">도착 예정일 (ETA)</label>
              <input type="date" value={eta} onChange={(e) => setEta(e.target.value)} className="w-full p-1.5 border rounded text-xs"/>
            </div>
            <div>
              <label className="block style style-none text-[11px] font-medium text-gray-500 mb-0.5">실제 도착일 (ATA)</label>
              <input type="date" value={ata} onChange={(e) => setAta(e.target.value)} className="w-full p-1.5 border rounded text-xs"/>
            </div>
          </div>
        </div>

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded shadow transition text-sm">
          ✅ 선적 확정 및 인보이스 발행
        </button>
      </form>
    </div>
  );
}