'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function InvoiceList() {
  const [shipments, setShipments] = useState<any[]>([]);

  const fetchShipments = async () => {
    const { data } = await supabase
      .from('als_shipments')
      .select(`
        id, invoice_no, io_type, is_free, actual_qty, packing_unit, shipment_type, shipment_no, etd, atd, eta, ata,
        als_election_projects ( consignee, item_name, unit_price, country_code )
      `)
      .order('created_at', { ascending: false });
    if (data) setShipments(data);
  };

  useEffect(() => { 
    fetchShipments(); 
  }, []);

  const downloadPDF = async (item: any) => {
    const amount = item.actual_qty * (item.als_election_projects?.unit_price || 0);
    const element = document.createElement('div');
    element.style.padding = '40px';
    element.style.width = '800px';
    element.style.background = '#fff';
    element.innerHTML = `
      <div style="font-family: Arial, sans-serif; color: #000; line-height: 1.4;">
        <h1 style="text-align: center; font-size: 26px; text-decoration: underline; margin-bottom: 30px; font-weight: bold;">COMMERCIAL INVOICE</h1>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;" border="1" borderColor="#000">
          <tr>
            <td style="width: 50%; padding: 12px; vertical-align: top;">
              <strong>Shipper/Exporter</strong><br/>
              <b>MIRU SYSTEMS CO., LTD.</b><br/>Seoul, Korea
            </td>
            <td style="width: 50%; padding: 12px; vertical-align: top;">
              <strong>Invoice No & Date</strong><br/>
              <span style="color:#1d4ed8; font-weight:bold;">${item.invoice_no}</span><br/>
              ETD: ${item.etd || 'N/A'}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; vertical-align: top;">
              <strong>To Applicant</strong><br/>
              <b>${item.als_election_projects?.consignee}</b>
            </td>
            <td style="padding: 12px; vertical-align: top;">
              <strong>Shipment Details</strong><br/>
              Type: ${item.shipment_type} / No: ${item.shipment_no || 'N/A'}<br/>
              ETA: ${item.eta || 'N/A'}
            </td>
          </tr>
        </table>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;" border="1" borderColor="#000 text-align: center;">
          <tr style="background:#f3f4f6;">
            <th style="padding:8px;">Description</th>
            <th style="padding:8px;">Qty</th>
            <th style="padding:8px;">Price</th>
            <th style="padding:8px;">Amount</th>
          </tr>
          <tr>
            <td style="padding:15px; text-align:left; height:120px; vertical-align:top;">${item.als_election_projects?.item_name}</td>
            <td style="padding:15px; vertical-align:top;">${item.actual_qty} SET</td>
            <td style="padding:15px; vertical-align:top;">USD ${item.als_election_projects?.unit_price}</td>
            <td style="padding:15px; vertical-align:top; text-align:right;">USD ${amount.toLocaleString()}</td>
          </tr>
        </table>
      </div>
    `;
    document.body.appendChild(element);
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(imgData, 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width);
    pdf.save(`Invoice_${item.invoice_no}.pdf`);
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800">🌐 ALS 실시간 선적 모니터링 현황 (해외 전사 공유용)</h2>
        <button onClick={fetchShipments} className="text-sm bg-gray-100 hover:bg-gray-200 py-1 px-3 rounded border transition">🔄 동기화 새로고침</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left text-gray-500 whitespace-nowrap">
          <thead className="bg-gray-800 text-white uppercase text-[11px]">
            <tr>
              <th className="py-3 px-3">인보이스 번호</th>
              <th className="py-3 px-3">구분</th>
              <th className="py-3 px-3">유/무상</th>
              <th className="py-3 px-3">도착지</th>
              <th className="py-3 px-3">Consignee</th>
              <th className="py-3 px-3">품명/수량</th>
              <th className="py-3 px-3">패킹 수량</th>
              <th className="py-3 px-3">선적 구분</th>
              <th className="py-3 px-3">선적명</th>
              <th className="py-3 px-3 bg-blue-900">ETD</th>
              <th className="py-3 px-3 bg-blue-900">ATD</th>
              <th className="py-3 px-3 bg-teal-900">ETA</th>
              <th className="py-3 px-3 bg-teal-900">ATA</th>
              <th className="py-3 px-3 text-center">서류</th>
            </tr>
          </thead>
          <tbody>
            {shipments.length === 0 ? (
              <tr><td colSpan={14} className="py-6 text-center text-gray-400">실시간 적재된 선적 내역이 없습니다.</td></tr>
            ) : (
              shipments.map((item) => (
                <tr key={item.id} className="border-b text-gray-800 hover:bg-gray-50 font-medium">
                  <td className="py-3 px-3 font-bold text-blue-600">{item.invoice_no}</td>
                  <td className="py-3 px-3">{item.io_type}</td>
                  <td className="py-3 px-3"><span className={`px-1.5 py-0.5 rounded text-[10px] ${item.is_free === '무상' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{item.is_free}</span></td>
                  <td className="py-3 px-3 font-bold text-purple-700">{item.als_election_projects?.country_code}</td>
                  <td className="py-3 px-3 max-w-[120px] truncate">{item.als_election_projects?.consignee}</td>
                  <td className="py-3 px-3 text-gray-600">{item.als_election_projects?.item_name} ({item.actual_qty.toLocaleString()} SET)</td>
                  <td className="py-3 px-3 text-orange-700 font-bold">{item.packing_unit}</td>
                  <td className="py-3 px-3"><span className={`px-1.5 py-0.5 rounded text-[10px] ${item.shipment_type === 'AIR' ? 'bg-sky-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{item.shipment_type}</span></td>
                  <td className="py-3 px-3 font-semibold">{item.shipment_no || '-'}</td>
                  <td className="py-3 px-3 bg-blue-50 font-bold">{item.etd || '-'}</td>
                  <td className="py-3 px-3 bg-blue-50 font-bold text-blue-700">{item.atd || '-'}</td>
                  <td className="py-3 px-3 bg-teal-50 font-bold">{item.eta || '-'}</td>
                  <td className="py-3 px-3 bg-teal-50 font-bold text-teal-700">{item.ata || '-'}</td>
                  <td className="py-3 px-3 text-center">
                    <button onClick={() => downloadPDF(item)} className="bg-red-50 hover:bg-red-100 text-red-600 py-0.5 px-2 rounded border border-red-200 text-[10px]">PDF</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}