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
        id, invoice_no, actual_qty, packing_unit, shipment_type, shipment_no, release_date, etd,
        als_election_projects ( consignee, item_name, unit_price )
      `)
      .order('created_at', { ascending: false });
    if (data) setShipments(data);
  };

  useEffect(() => { 
    fetchShipments(); 
  }, []);

  // 📄 오리지널 서식 모양으로 HTML을 그려 PDF로 다운로드하는 마법의 함수
  const downloadPDF = async (item: any) => {
    const amount = item.actual_qty * (item.als_election_projects?.unit_price || 0);

    // PDF 전용 가상 컨테이너 생성 (미루시스템즈 오리지널 CI 서식 가이드 마크업)
    const element = document.createElement('div');
    element.style.padding = '40px';
    element.style.width = '800px';
    element.style.background = '#fff';
    element.innerHTML = `
      <div style="font-family: Arial, sans-serif; color: #000; line-height: 1.4;">
        <h1 style="text-align: center; font-size: 26px; text-decoration: underline; margin-bottom: 30px; font-weight: bold; letter-spacing: 1px;">COMMERCIAL INVOICE</h1>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;" border="1" borderColor="#000">
          <tr>
            <td style="width: 50%; padding: 12px; vertical-align: top; height: 90px;">
              <strong style="font-size: 11px; display:block; margin-bottom:4px;">Shipper/Exporter</strong>
              <span style="font-weight: bold; font-size: 14px;">MIRU SYSTEMS CO., LTD.</span><br/>
              9, Gasan digital 1-ro, Geumcheon-gu,<br/>Seoul, Republic of Korea
            </td>
            <td style="width: 50%; padding: 12px; vertical-align: top;">
              <strong style="font-size: 11px; display:block; margin-bottom:4px;">No. & date of invoice</strong>
              <span style="font-weight: bold; font-size: 14px; color: #1d4ed8;">${item.invoice_no}</span><br/>
              Date: ${item.release_date}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; vertical-align: top; height: 90px;">
              <strong style="font-size: 11px; display:block; margin-bottom:4px;">To Applicant</strong>
              <span style="font-weight: bold;">${item.als_election_projects?.consignee}</span>
            </td>
            <td style="padding: 12px; vertical-align: top;">
              <strong style="font-size: 11px; display:block; margin-bottom:4px;">Remarks</strong>
              <strong>Departure date:</strong> ${item.etd}<br/>
              <strong>Shipment Type:</strong> ${item.shipment_type}<br/>
              <strong>Carrier / No:</strong> ${item.shipment_no || 'N/A'}
            </td>
          </tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; margin-top: 40px; text-align: center; font-size: 13px;" border="1" borderColor="#000">
          <thead style="background: #f3f4f6;">
            <tr>
              <th style="padding: 10px; width: 45%;">Description of goods</th>
              <th style="padding: 10px; width: 15%;">Quantity</th>
              <th style="padding: 10px; width: 20%;">Unit price</th>
              <th style="padding: 10px; width: 20%;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 20px; text-align: left; font-weight: bold; height: 180px; vertical-align: top;">
                ${item.als_election_projects?.item_name}
              </td>
              <td style="padding: 20px; vertical-align: top; font-weight: bold;">
                ${item.actual_qty.toLocaleString()} SET
              </td>
              <td style="padding: 20px; vertical-align: top;">
                USD ${item.als_election_projects?.unit_price.toLocaleString()}
              </td>
              <td style="padding: 20px; vertical-align: top; font-weight: bold; text-align: right;">
                USD ${amount.toLocaleString()}
              </td>
            </tr>
            <tr style="font-weight: bold; background: #f9fafb;">
              <td style="padding: 12px; text-align: left;">TOTAL: (${item.packing_unit})</td>
              <td></td>
              <td></td>
              <td style="padding: 12px; text-align: right; font-size: 14px; text-decoration: underline;">
                USD ${amount.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
        
        <div style="margin-top: 80px; text-align: right; font-size: 14px;">
          <p style="margin-bottom: 40px;">Yours faithfully,</p>
          <p style="font-weight: bold; text-decoration: underline;">MIRU SYSTEMS CO., LTD.</p>
        </div>
      </div>
    `;

    document.body.appendChild(element);

    // Canvas로 정밀 변환 후 PDF화
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; 
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`Commercial_Invoice_${item.invoice_no}.pdf`);

    document.body.removeChild(element);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800">📋 인보이스 발행 이력 및 서류 출력</h2>
        <button onClick={fetchShipments} className="text-sm bg-gray-100 hover:bg-gray-200 py-1 px-3 rounded border transition">
          🔄 새로고침
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="bg-gray-50 text-gray-700 border-b text-xs uppercase">
            <tr>
              <th className="py-3 px-4">인보이스 번호</th>
              <th className="py-3 px-4">Consignee</th>
              <th className="py-3 px-4">품명/수량</th>
              <th className="py-3 px-4">출고일 (수기)</th>
              <th className="py-3 px-4">서류 출력</th>
            </tr>
          </thead>
          <tbody>
            {shipments.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-400">발행된 인보이스 내역이 없습니다.</td>
              </tr>
            ) : (
              shipments.map((item) => (
                <tr key={item.id} className="border-b text-gray-800 hover:bg-gray-50 transition">
                  <td className="py-3 px-4 font-bold text-blue-600">{item.invoice_no}</td>
                  <td className="py-3 px-4 text-xs">{item.als_election_projects?.consignee}</td>
                  <td className="py-3 px-4 text-xs">
                    {item.als_election_projects?.item_name} ({item.actual_qty} {item.packing_unit})
                  </td>
                  <td className="py-3 px-4 text-sm font-medium">{item.release_date}</td>
                  <td className="py-3 px-4">
                    <button 
                      onClick={() => downloadPDF(item)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-1 px-2.5 rounded border border-red-200 text-xs transition"
                    >
                      📄 PDF 다운로드
                    </button>
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