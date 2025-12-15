import { useEffect, useState } from 'react';
import axios from 'axios';

export default function JobProgress({ jobId }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('active');

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/reports/job-status/${jobId}`);
        setProgress(res.data.progress);
        setStatus(res.data.state);
        
        if (res.data.state === 'completed' || res.data.state === 'failed') {
          clearInterval(interval);
        }
      } catch (error) {
        console.error(error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [jobId]);

  return (
    <div className="mt-4">
      <p>Status: {status}</p>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
      </div>
      <p>{progress}%</p>
    </div>
  );
}
