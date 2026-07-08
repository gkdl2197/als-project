'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface MultiItem {
  item_name: string;
  actual_qty: string;
  packing_qty: string;
  packing_unit: string;
  unit_price: string;
}

export default function ShipmentForm() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [invoiceNo, setInvoiceNo] = useState<string>('자동 생성 예정');
  
  const [ioType, setIoType] = useState<string>('EX');
  const [isFree, setIsFree] = useState<string>('유상');
  const [shipmentType, setShipmentType] = useState<string>('AIR');
  const [shipmentNo, setShipmentNo] = useState<string>('');
  
  const [etd, setEtd] = useState<string>('');
  const [atd, setAtd] = useState<string>('');
  const [eta, setEta] = useState<string>('');
  const [ata, setAta] = useState<string>('');

  // ★ 수십 개 아이템 동시 등록을 위한 동적 배열 상태 관리
  const [itemList, setItemList] = useState<MultiItem[]>([
    { item_name: '', actual_qty: '', packing_qty: '', packing_unit: 'PLT', unit_price: '0' }
  ]);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase.from('als_election_projects').select('*');
      if (data) setProjects(data);
    };
    fetchProjects();
  }, []);

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

  // 아이템 행 추가 함수
  const handleAddItem = () => {
    setItemList([...itemList, { item_name: '', actual_qty: '', packing_qty: '', packing_unit: 'PLT', unit_price: '0' }]);
  };

  // 아이템 행 삭제 함수
  const handleRemoveItem = (index: number) => {
    if (itemList.length === 1) return;
    setItemList(itemList.filter((_, i) => i !== index));
  };

  // 입력값 변동 핸들러
  const handleItemChange = (index: number, field: keyof MultiItem, value: string) => {
    const updated = [...itemList];
    updated[index][field] = value;
    setItemList(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !etd) {
      alert('⚠️ 프로젝트와 출발예정일은 필수입니다.');
      return;
    }

    // 1. 선적 마스터 우선 인서트
    const { data: shipmentData, error: smError } = await supabase
      .from('als_shipments')
      .insert([
        {
          invoice_no: invoiceNo,
          project_id: parseInt(selectedProjectId),
          io_type: ioType,
          is_free: isFree,
          shipment_type: shipmentType,
          shipment_no: shipmentNo || null,
          etd: etd || null,
          atd: atd || null,
          eta: eta || null,
          ata: ata || null,
        }
      ])
      .select();

    if (smError || !shipmentData) {
      alert(`❌ 마스터 저장 실패: ${smError?.message}`);
      return;
    }

    const createdShipmentId = shipmentData[0].id;

    // 2. 수십 개의 상세 품목군 데이터 일괄 트랜잭션 적재
    const itemsToInsert = itemList.map(item => ({
      shipment_id: createdShipmentId,
      item_name: item.item_name,
      actual_qty: parseInt(item.actual_qty) || 0,
      packing_info: `${item.packing_qty || 0} ${item.packing_unit}`,
      unit_price: parseFloat(item.unit_price) || 0.00
    }));

    const { error: itemsError } = await supabase.from('als_shipment_items').insert(itemsToInsert);

    if (itemsError) {
      alert(`❌ 품목 상세 적재 실패: ${itemsError.message}`);
    } else {
      alert(`🎉 [${invoiceNo}] 총 ${itemList.length}개 품목군 연동 및 발행 성공!`);
      window.location.reload();
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
        <span className="text-xl">🚢</span>
        <h3 className="text-lg font-bold text-white">ALS 실 선적 정보 입력 & 인보이스 마스터 발행 (Admin)</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 bg-blue-950/40 border border-blue-900/50 rounded-xl">
          <span className="text-[10px] font-bold text-blue-400 block mb-1 uppercase tracking-wider">실시간 자동 채번 결과</span>
          <span className="text-xl font-black text-blue-200 tracking-wide font-mono">{invoiceNo}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">선거 계약 프로젝트 선택 *</label>
            <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} className="w-full bg-slate-900 border border-slate-750 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500">
              <option value="">-- 프로젝트 계약 선택 --</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>[{p.contract_year}] {p.consignee} ({p.country_code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">수출/입 구분</label>
            <select value={ioType} onChange={(e) => setIoType(e.target.value)} className="w-full bg-slate-900 border border-slate-750 rounded-lg p-2 text-xs text-white">
              <option value="EX">EX (수출)</option>
              <option value="IM">IM (수입)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">유/무상 여부</label>
            <select value={isFree} onChange={(e) => setIsFree(e.target.value)} className="w-full bg-slate-900 border border-slate-750 rounded-lg p-2 text-xs text-white">
              <option value="유상">유상</option>
              <option value="무상">무상</option>
            </select>
          </div>
        </div>

        {/* 📦 동적 멀티 아이템 품목 추가 섹션 */}
        <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/40">
          <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-sky-400">📦 선적 화물 상세 품목 리스트 (Multi-Item Engine)</span>
            <button type="button" onClick={handleAddItem} className="bg-sky-600/20 hover:bg-sky-600/40 text-sky-400 text-[11px] font-bold py-1 px-2.5 rounded-md border border-sky-500/30 transition">
              + 품목 행 추가
            </button>
          </div>

          <div className="space-y-3">
            {itemList.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60 relative group">
                <div className="md:col-span-4">
                  <label className="block text-[10px] text-slate-500 mb-1">품명(Item Description) *</label>
                  <input type="text" placeholder="예: PCOS Motherboard" value={item.item_name} onChange={(e) => handleItemChange(index, 'item_name', e.target.value)} className="w-full bg-slate-950 border border-slate-750 rounded-md p-1.5 text-xs text-white"/>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] text-slate-500 mb-1">출고 수량 *</label>
                  <input type="number" placeholder="수량" value={item.actual_qty} onChange={(e) => handleItemChange(index, 'actual_qty', e.target.value)} className="w-full bg-slate-950 border border-slate-750 rounded-md p-1.5 text-xs text-white"/>
                </div>
                <div className="md:col-span-2 flex gap-1">
                  <div className="w-1/2">
                    <label className="block text-[10px] text-slate-500 mb-1">패킹수</label>
                    <input type="number" placeholder="값" value={item.packing_qty} onChange={(e) => handleItemChange(index, 'packing_qty', e.target.value)} className="w-full bg-slate-950 border border-slate-750 rounded-md p-1.5 text-xs text-white"/>
                  </div>
                  <div className="w-1/2">
                    <label className="block text-[10px] text-slate-500 mb-1">단위</label>
                    <select value={item.packing_unit} onChange={(e) => handleItemChange(index, 'packing_unit', e.target.value)} className="w-full bg-slate-950 border border-slate-750 rounded-md p-1.5 text-xs text-white">
                      <option value="PLT">PLT</option>
                      <option value="CTN">CTN</option>
                      <option value="PKG">PKG</option>
                    </select>
                  </div>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-[10px] text-slate-500 mb-1">품목 단가 (USD) *</label>
                  <input type="number" step="0.01" placeholder="단가 입력" value={item.unit_price} onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)} className="w-full bg-slate-950 border border-slate-750 rounded-md p-1.5 text-xs text-white"/>
                </div>
                <div className="md:col-span-1 text-center">
                  <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-400 text-xs font-bold p-1">삭제</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 📅 스케줄 수기 관리 레이아웃 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-slate-950/20 border border-slate-850 p-4 rounded-xl">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">선적 구분</label>
            <select value={shipmentType} onChange={(e) => setShipmentType(e.target.value)} className="w-full bg-slate-900 border border-slate-750 rounded-lg p-2 text-xs text-white">
              <option value="AIR">AIR (항공)</option>
              <option value="OCEAN">OCEAN (해상)</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">선적명(Shipment No.)</label>
            <input type="text" placeholder="예: EK311" value={shipmentNo} onChange={(e) => setShipmentNo(e.target.value)} className="w-full bg-slate-900 border border-slate-750 rounded-lg p-2 text-xs text-white"/>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">ETD (출발예정일) *</label>
            <input type="date" value={etd} onChange={(e) => setEtd(e.target.value)} className="w-full bg-slate-900 border border-slate-750 rounded-lg p-2 text-xs text-white"/>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">ATD (실제출발일)</label>
            <input type="date" value={atd} onChange={(e) => setAtd(e.target.value)} className="w-full bg-slate-900 border border-slate-750 rounded-lg p-2 text-xs text-white"/>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">ETA/ATA (도착예정/실제)</label>
            <div className="flex gap-1">
              <input type="date" value={eta} onChange={(e) => setEta(e.target.value)} className="w-full bg-slate-900 border border-slate-750 rounded-lg p-1.5 text-xs text-white"/>
              <input type="date" value={ata} onChange={(e) => setAta(e.target.value)} className="w-full bg-slate-900 border border-slate-750 rounded-lg p-1.5 text-xs text-white"/>
            </div>
          </div>
        </div>

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm py-2.5 px-4 rounded-xl shadow-lg shadow-blue-600/10 transition-all duration-200 active:scale-[0.99]">
          ✅ 선적 확정 및 멀티 인보이스 일괄 발행
        </button>
      </form>
    </div>
  );
}