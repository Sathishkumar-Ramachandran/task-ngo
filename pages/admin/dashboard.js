import { useEffect, useState } from 'react';
import DashboardSummary from '../../components/DashboardSummary';
import axios from 'axios';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [month, setMonth] = useState('');

  const fetchData = (selectedMonth) => {
    let url = 'http://localhost:3001/api/dashboard';
    if (selectedMonth) {
      url += `?month=${selectedMonth}`;
    }
    axios.get(url)
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchData(month);
  }, [month]);

  if (!data) return <div className="p-4">Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center space-x-2">
          <label className="font-medium">Filter by Month:</label>
          <input 
            type="month" 
            className="border p-2 rounded"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
          {month && (
            <button 
              onClick={() => setMonth('')}
              className="text-sm text-red-500 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      
      <div className="mb-4">
        <h2 className="text-lg text-gray-600">
          Summary for: <span className="font-semibold text-black">{data.month}</span>
        </h2>
      </div>

      <DashboardSummary data={data} />
    </div>
  );
}
