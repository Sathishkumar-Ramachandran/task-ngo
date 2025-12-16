import db from '../../lib/database/client';
import initDb from '../../lib/database/init';

let initialized = false;

export default async function handler(req, res) {
  if (!initialized) {
    await initDb();
    initialized = true;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { month } = req.query;
    let query = `
      SELECT 
        COUNT(DISTINCT ngo_id) as total_ngos,
        SUM(people_helped) as total_people_helped,
        SUM(events_conducted) as total_events_conducted,
        SUM(funds_utilized) as total_funds_utilized
      FROM reports
    `;
    
    const params = [];
    if (month) {
      query += ` WHERE month = $1`;
      params.push(month);
    }

    const result = await db.query(query, params);
    const stats = result.rows[0] || {};

    res.json({
      totalReports: parseInt(stats.total_ngos || 0),
      totalPeopleHelped: parseInt(stats.total_people_helped || 0),
      totalEventsConducted: parseInt(stats.total_events_conducted || 0),
      totalFundsUtilized: parseFloat(stats.total_funds_utilized || 0),
      month: month || 'All Time'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
