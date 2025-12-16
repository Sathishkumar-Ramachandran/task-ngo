const fs = require('fs');
const csv = require('csv-parser');
const db = require('../database/client');

module.exports = async (job) => {
  console.log(`Processing job ${job.id} with file:`, job.data.filePath);
  const { filePath } = job.data;
  
  const results = [];
  const errors = [];
  let processedCount = 0;

  // 1. Parse CSV
  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', resolve)
      .on('error', reject);
  });

  const totalRows = results.length;
  console.log(`Parsed ${totalRows} rows from CSV.`);

  // 2. Process each row
  for (let i = 0; i < totalRows; i++) {
    const row = results[i];
    try {
      // Validate row data (basic check)
      if (!row.ngo_id || !row.month) {
        throw new Error('Missing ngo_id or month');
      }

      // Insert into DB
      const query = `
        INSERT INTO reports (ngo_id, month, people_helped, events_conducted, funds_utilized)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (ngo_id, month) 
        DO UPDATE SET 
          people_helped = EXCLUDED.people_helped,
          events_conducted = EXCLUDED.events_conducted,
          funds_utilized = EXCLUDED.funds_utilized;
      `;
      
      const values = [
        row.ngo_id, 
        row.month, 
        parseInt(row.people_helped || 0), 
        parseInt(row.events_conducted || 0), 
        parseFloat(row.funds_utilized || 0)
      ];

      await db.query(query, values);
      processedCount++;

    } catch (err) {
      console.error(`Error processing row ${i + 1}:`, err.message);
      errors.push({ row: i + 1, error: err.message, data: row });
    }

    // Update progress
    await job.updateProgress(Math.round(((i + 1) / totalRows) * 100));
  }

  // Cleanup file
  fs.unlink(filePath, (err) => {
    if (err) console.error('Error deleting uploaded file:', err);
  });

  console.log(`Job ${job.id} completed. Processed: ${processedCount}, Failed: ${errors.length}`);
  
  return { 
    processed: processedCount, 
    failed: errors.length, 
    errors: errors.slice(0, 10) // Return first 10 errors for brevity
  };
};
