import { useState } from 'react';
import axios from 'axios';
import JobProgress from '../components/JobProgress';
import Link from 'next/link';

export default function BulkUpload() {
  const [file, setFile] = useState(null);
  const [jobId, setJobId] = useState(null);

  const handleUpload = async () => {
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:3001/api/reports/upload', formData);
      setJobId(res.data.jobId);
    } catch (error) {
      console.error('Upload failed', error);
      alert('Upload failed');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bulk Upload Reports</h1>
        <Link href="/" className="text-blue-600 hover:underline">Back to Home</Link>
      </div>
      
      <div className="bg-white p-6 rounded shadow-md">
        <p className="mb-4 text-gray-600">Upload a CSV file with columns: <code>ngo_id, month, people_helped, events_conducted, funds_utilized</code></p>
        
        <input 
          type="file" 
          accept=".csv"
          onChange={e => setFile(e.target.files[0])} 
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        
        <button 
          className={`bg-blue-600 text-white px-6 py-2 rounded mt-4 font-semibold ${!file ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
          onClick={handleUpload}
          disabled={!file}
        >
          Upload CSV
        </button>

        {jobId && (
          <div className="mt-6 border-t pt-4">
            <h3 className="font-semibold mb-2">Processing Status</h3>
            <JobProgress jobId={jobId} />
          </div>
        )}
      </div>
    </div>
  );
}
