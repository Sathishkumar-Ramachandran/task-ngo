const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use process.cwd() to ensure we target the project root in Next.js
const dbPath = path.resolve(process.cwd(), 'ngo.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Could not connect to database', err);
  } else {
    console.log('Connected to SQLite database at', dbPath);
  }
});

// Promisify the query function to match the pg interface
module.exports = {
  query: (text, params = []) => {
    return new Promise((resolve, reject) => {
      // SQLite doesn't support $1, $2 syntax natively in the same way as PG for all drivers, 
      // but sqlite3 uses ? placeholders. We need to convert or ensure usage matches.
      
      // Simple regex to replace $1, $2... with ?
      const sql = text.replace(/\$\d+/g, '?');

      if (text.trim().toUpperCase().startsWith('SELECT')) {
        db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve({ rows });
        });
      } else {
        db.run(sql, params, function (err) {
          if (err) reject(err);
          else resolve({ rows: [], rowCount: this.changes });
        });
      }
    });
  }
};
