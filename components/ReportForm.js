import { useState } from 'react';
import axios from 'axios';

export default function ReportForm() {
  const [formData, setFormData] = useState({ 
    ngoId: '', 
    month: '', 
    peopleHelped: '', 
    eventsConducted: '', 
    fundsUtilized: '' 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/reports', formData);
      alert('Report submitted!');
      setFormData({ ngoId: '', month: '', peopleHelped: '', eventsConducted: '', fundsUtilized: '' });
    } catch (error) {
      console.error(error);
      alert('Error submitting report');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">NGO ID</label>
          <input 
            type="text" 
            className="border p-2 w-full rounded"
            value={formData.ngoId}
            onChange={e => setFormData({...formData, ngoId: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Month (YYYY-MM)</label>
          <input 
            type="month" 
            className="border p-2 w-full rounded"
            value={formData.month}
            onChange={e => setFormData({...formData, month: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">People Helped</label>
          <input 
            type="number" 
            className="border p-2 w-full rounded"
            value={formData.peopleHelped}
            onChange={e => setFormData({...formData, peopleHelped: e.target.value})}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Events Conducted</label>
          <input 
            type="number" 
            className="border p-2 w-full rounded"
            value={formData.eventsConducted}
            onChange={e => setFormData({...formData, eventsConducted: e.target.value})}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Funds Utilized (₹)</label>
          <input 
            type="number" 
            className="border p-2 w-full rounded"
            value={formData.fundsUtilized}
            onChange={e => setFormData({...formData, fundsUtilized: e.target.value})}
          />
        </div>
      </div>
      <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold">
        Submit Report
      </button>
    </form>
  );
}
