import { reportsQueue } from '../../../../lib/utils/queue';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const job = await reportsQueue.getJob(id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    const state = await job.getState();
    const progress = job.progress;
    res.json({ id: job.id, state, progress });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching job status' });
  }
}
