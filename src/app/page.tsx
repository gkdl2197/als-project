import MasterDataForm from './MasterDataForm';
import ShipmentForm from './ShipmentForm';
import InvoiceList from './InvoiceList';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto space-y-10 px-4">
        <h1 className="text-3xl font-black text-center text-gray-900 tracking-tight mb-8">
          🌐 MIRU SYSTEMS - ALS (Auto Logistics Solution)
        </h1>
        <MasterDataForm />
        <ShipmentForm />
        <InvoiceList />
      </div>
    </main>
  );
}