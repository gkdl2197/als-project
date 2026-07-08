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
        id, invoice_no, io_type, is_free, shipment_type, shipment_no, etd, atd, eta, ata,
        als_election_projects ( consignee, country_code ),
        als_shipment_items ( item_name, actual_qty, packing_info, unit_price )
      `)
      .order('created_at', { ascending: false });
    if (data) setShipments(data);
  };

  useEffect(() => { fetchShipments(); }, []);

  const downloadPDF = async (item: any) => {
    const itemsHtml = item.als_shipment_items?.map((pkt: any) => {
      const amt = pkt.actual_qty * pkt.unit_price;
      return `
        <tr>
          <td style="padding:10px; text-align:left;">${pkt.item_name}</td>
          <td style="padding:10px;">${pkt.actual_qty.toLocaleString()} SET</td>
          <td style="padding:10px;">USD ${pkt.unit_price.toLocaleString()}</td>
          <td style="padding:10px; text-align:right;">USD ${amt.toLocaleString()}</td>
        </tr>
      `;
    }).join('');

    const totalAmount = item.als_shipment_items?.reduce((acc: number, cur: any) => acc + (cur.actual_qty * cur.unit_price), 0) || 0;

    const element = document.createElement('div');
    element.style.padding = '40px';
    element.style.width = '800px';
    element.style.background = '#fff';
    element.innerHTML = `
      <div style="font-family: Arial, sans-serif; color: #000; font-size:12px;">
        <h1 style="text-align: center; font-size: 24px; text-decoration: underline; margin-bottom: 25px; font-weight: bold;">COMMERCIAL INVOICE</h1>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;" border="1" borderColor="#000">
          <tr>
            <td style="width: 50%; padding: 10px; vertical-align: top;">
              <strong>Exporter:</strong> MIRU SYSTEMS CO., LTD.<br/>Seoul, South Korea
            </td>
            <td style="width: 50%; padding: 10px; vertical-align: top;">
              <strong>Invoice No:</strong> <span style="color:#2563eb; font-weight:bold;">${item.invoice_no}</span><br/>
              <strong>ETD:</strong> ${item.etd || '-'}<br/><strong>ETA:</strong> ${item.eta || '-'}
            </td>
          </tr>
          <tr>
            <td style="padding: 10px; vertical-align: top;">
              <strong>Consignee:</strong><br/>${item.als_election_projects?.consignee} (${item.als_election_projects?.country_code})
            </td>
            <td style="padding: 10px; vertical-align: top;">
              <strong>Shipment:</strong> ${item.shipment_type} (${item.shipment_no || 'N/A'})
            </td>
          </tr>
        </table>
        <table style="width: 100%; border-collapse: collapse; text-align: center;" border="1" borderColor="#000">
          <tr style="background:#f3f4f6; font-weight:bold;">
            <th style="padding:8px; text-align:left;">Description of Goods</th>
            <th style="padding:8px;">Quantity</th>
            <th style="padding:8px;">Unit Price</th>
            <th style="padding:8px; text-align:right;">Amount</th>
          </tr>
          ${itemsHtml}
          <tr style="font-weight:bold; background:#fafafa;">
            <td colspan="3" style="padding:10px; text-align:right;">TOTAL AMOUNT (USD):</td>
            <td style="padding:10px; text-align:right; color:#1e40af;">$${totalAmount.toLocaleString()}</td>
          </tr>
        </table>
      </div>
    `;
    document.body.appendChild(element);
    const canvas = await html2canvas(element, { scale: 2 });
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width);
    pdf.save(`Invoice_${item.invoice_no}.pdf`);
    document.body.removeChild(element);
  };

  return (
    <div>
      <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">🌐 ALS 실시간 선적 및 인보이스 대시보드</h3>
        <button onClick={fetchShipments} className="text-[11px] bg-slate-800 hover:bg-slate-750 py-1 px-2.5 rounded-md border border-slate-700 transition text-slate-300">🔄 동기화</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-slate-400 text-xs whitespace-nowrap">
          <thead className="bg-slate-950 text-slate-300 font-bold border-b border-slate-800">
            <tr>
              <th className="p-3">인보이스 NO.</th>
              <th className="p-3">도착지</th>
              <th className="p-3">수하인 (Consignee)</th>
              <th className="p-3">선적 화물 품목 요약 (Multi-Items)</th>
              <th className="p-3">선적 구분</th>
              <th className="p-3">ETD</th>
              <th className="p-3">ATD</th>
              <th className="p-3">ETA</th>
              <th className="p-3">ATA</th>
              <th className="p-3 text-center">서류</th>
            </tr>
          </thead>
          <tbody>
            {shipments.length === 0 ? (
              <tr><td colSpan={10} className="p-8 text-center text-slate-600">실시간 적재된 물류 내역이 없습니다.</td></tr>
            ) : (
              shipments.map((item) => {
                const itemSummary = item.als_shipment_items?.map((i: any) => `${i.item_name}(${i.actual_qty})`).join(', ') || '-';
                return (
                  <tr key={item.id} className="border-b border-slate-900 text-slate-300 hover:bg-slate-900/30 font-medium">
                    <td className="p-3 font-bold text-blue-400 font-mono">{item.invoice_no}</td>
                    <td className="p-3 text-purple-400 font-bold">{item.als_election_projects?.country_code}</td>
                    <td className="p-3 max-w-[120px] truncate">{item.als_election_projects?.consignee}</td>
                    <td className="p-3 max-w-[250px] truncate text-slate-400" title={itemSummary}>{itemSummary}</td>
                    <td className="p-3"><span className={`px-1.5 py-0.5 rounded text-[10px] ${item.shipment_type === 'AIR' ? 'bg-sky-500/10 text-sky-400' : 'bg-amber-500/10 text-amber-400'}`}>{item.shipment_type} {item.shipment_no ? `(${item.shipment_no})` : ''}</span></td>
                    <td className="p-3 font-semibold text-blue-500/90 font-mono">{item.etd || '-'}</td>
                    <td className="p-3 font-semibold text-blue-400 font-mono">{item.atd || '-'}</td>
                    <td className="p-3 font-semibold text-teal-500/90 font-mono">{item.eta || '-'}</td>
                    <td className="p-3 font-semibold text-teal-400 font-mono">{item.ata || '-'}</td>
                    <td className="p-3 text-center">
                      <button onClick={() => downloadPDF(item)} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 py-0.5 px-2 rounded border border-red-500/20 text-[10px]">CI/PL</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}