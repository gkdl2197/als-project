'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function ShipmentForm() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [invoiceNo, setInvoiceNo] = useState<string>('자동 생성 예정');
  
  // 8대 필수값 및 선적 정보 상태 관리
  const [shipmentType, setShipmentType] = useState<string>('AIR');
  const [isFree, setIsFree] = useState<string>('유상');
  const [ioType, setIoType] = useState<string>('EX');
  const [shipmentNo, setShipmentNo] = useState<string>('');
  const [releaseDate, setReleaseDate] = useState<string>('');
  const [etd, setEtd] = useState<string>('');
  const [actualQty, setActualQty] = useState<string>('');
  const [packingUnit, setPackingUnit] = useState<string>('PLT');
  const [packingQty, setPackingQty] = useState<string>('');

  // 1. Supabase에서 등록된 마스터 프로젝트 목록 가져오기
  const fetchProjects = async () => {
    const { data } = await supabase.from('als_election_projects').select('*');
    if (data) setProjects(data);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // 2. 프로젝트 선택 및 날짜 변경 시 인보이스 넘버 실시간 자동 채번 (MS-YYMM-국가코드-순번)
  useEffect(() => {
    if (!selectedProjectId || !releaseDate) {
      setInvoiceNo('출고일과 프로젝트를 선택하면 자동 생성됩니다.');
      return;
    }

    const generateInvoiceNo = async () => {
      const selectedProject = projects.find(p => p.id.toString() === selectedProjectId);
      if (!selectedProject) return;

      const countryCode = selectedProject.country_code.toUpperCase();
      // 출고일 기준 연월 추출 (예: 2026-07-15 -> 2607)
      const dateObj = new Date(releaseDate);
      const yy = dateObj.getFullYear().toString().slice(-2);
      const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
      const prefix = `MS-${yy}${mm}-${countryCode}`;

      // DB에서 동일한 프리픽스를 가진 기존 인보이스 개수 조회하여 순번 확정
      const { count } = await supabase
        .from('als_shipments')
        .select('*', { count: 'exact', head: true })
        .like('invoice_no', `${prefix}%`);

      const sequence = String((count || 0) + 1).padStart(2, '0');
      setInvoiceNo(`${prefix}-${sequence}`);
    };

    generateInvoiceNo();
  }, [selectedProjectId, releaseDate, projects]);

  // 3. [선적 확정] 버튼 클릭 시 Supabase DB에 최종 적재
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProjectId || !releaseDate || !etd || !actualQty) {
      alert('⚠️ 모든 필수 항목을 입력해 주세요.');
      return;
    }

    const { error } = await supabase.from('als_shipments').insert([
      {
        invoice_no: invoiceNo,
        project_id: parseInt(selectedProjectId),
        actual_qty: parseInt(actualQty),
        packing_unit: `${packingQty} ${packingUnit}`,
        shipment_type: shipmentType,
        shipment_no: shipmentNo || null,
        release_date: releaseDate,
        etd: etd,
      }
    ]);

    if (error) {
      alert(`❌ 선적 저장 실패: ${error.message}`);
    } else {
      alert(`🎉 인보이스 [${invoiceNo}] 발행 및 선적 데이터 적재 성공!`);
      // 입력 폼 초기화 및 새로고침
      setShipmentNo('');
      setActualQty('');
      setPackingQty('');
      window.location.reload(); // 하단 리스트 실시간 동기화를 위해 화면 새로고침
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-2">🚢 ALS 실 선적 정보 입력 & 인보이스 발행</h2>
      <p className="text-xs text-gray-500 mb-6">당해 연도 입찰 계약 데이터를 기반으로 일렌번호 및 인보이스를 자동 추출합니다.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 채번 결과 노출 영역 */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <span className="text-xs font-semibold text-blue-700 block mb-1">발행 예정 인보이스 넘버</span>
          <span className="text-xl font-black text-blue-900 tracking-wide">{invoiceNo}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">연동할 선거 계약 프로젝트 선택 *</label>
            <select 
              value={selectedProjectId} 
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full p-2 border rounded text-sm bg-gray-50"
            >
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
            <label className="block text-xs font-bold text-gray-700 mb-1">⚠️ 출고일 (수기 입력) *</label>
            <input type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} className="w-full p-2 border rounded text-sm"/>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">5) 출발예정일 (ETD) *</label>
            <input type="date" value={etd} onChange={(e) => setEtd(e.target.value)} className="w-full p-2 border rounded text-sm"/>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">4) 수량 (UN / SET) *</label>
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

        <button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded shadow transition text-sm">
          ✅ 선적 확정 및 인보이스 발행
        </button>
      </form>
    </div>
  );
}