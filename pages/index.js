import ReportForm from '../components/ReportForm';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Submit Impact Report</h1>
        <div className="space-x-4">
          <Link href="/bulk-upload" className="text-blue-600 hover:underline">Bulk Upload</Link>
          <Link href="/admin/dashboard" className="text-blue-600 hover:underline">Admin Dashboard</Link>
        </div>
      </div>
      <ReportForm />
    </div>
  );
}
