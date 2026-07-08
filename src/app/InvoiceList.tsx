'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function InvoiceList() {
  const [shipments, setShipments] = useState<any[]>([]);

  const fetchShipments = async () => {
    const { data } = await supabase
      .from('als_shipments')
      .select(`
        id, invoice_no, actual_qty, packing_unit, release_date, etd,
        als_election_projects ( consignee, item_name, unit_price )
      `)
      .order('created_at', { ascending: false });
    if (data) setShipments(data);
  };

  useEffect(() => { 
    fetchShipments(); 
  }, []);

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
            </tr>
          </thead>
          <tbody>
            {shipments.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-gray-400">발행된 인보이스 내역이 없습니다.</td>
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}