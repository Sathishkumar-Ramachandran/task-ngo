const db = require('./client');

const initDb = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ngo_id TEXT NOT NULL,
      month TEXT NOT NULL,
      people_helped INTEGER DEFAULT 0,
      events_conducted INTEGER DEFAULT 0,
      funds_utilized REAL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(ngo_id, month)
    );
  `;

  try {
    await db.query(createTableQuery);
    console.log('Database tables initialized (SQLite)');
  } catch (error) {
    console.error('Error initializing database tables:', error);
  }
};

module.exports = initDb;
