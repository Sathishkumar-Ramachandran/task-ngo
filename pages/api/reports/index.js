import db from '../../../lib/database/client';
import initDb from '../../../lib/database/init';

let initialized = false;

export default async function handler(req, res) {
  if (!initialized) {
    await initDb();
    initialized = true;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { ngoId, month, peopleHelped, eventsConducted, fundsUtilized } = req.body;

    // Basic validation
    if (!ngoId || !month) {
      return res.status(400).json({ error: 'NGO ID and Month are required' });
    }

    // Upsert logic (Insert or Update if exists)
    const query = `
      INSERT INTO reports (ngo_id, month, people_helped, events_conducted, funds_utilized)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (ngo_id, month) 
      DO UPDATE SET 
        people_helped = EXCLUDED.people_helped,
        events_conducted = EXCLUDED.events_conducted,
        funds_utilized = EXCLUDED.funds_utilized;
    `;

    const values = [ngoId, month, peopleHelped || 0, eventsConducted || 0, fundsUtilized || 0];
    
    await db.query(query, values);

    res.status(201).json({ message: 'Report submitted successfully', data: req.body });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
}
