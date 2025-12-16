module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/sqlite3 [external] (sqlite3, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("sqlite3", () => require("sqlite3"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/lib/database/client.js [api] (ecmascript)", ((__turbopack_context__, module, exports) => {

const sqlite3 = __turbopack_context__.r("[externals]/sqlite3 [external] (sqlite3, cjs)").verbose();
const path = __turbopack_context__.r("[externals]/path [external] (path, cjs)");
// Use process.cwd() to ensure we target the project root in Next.js
const dbPath = path.resolve(process.cwd(), 'ngo.db');
const db = new sqlite3.Database(dbPath, (err)=>{
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database at', dbPath);
    }
});
// Promisify the query function to match the pg interface
module.exports = {
    query: (text, params = [])=>{
        return new Promise((resolve, reject)=>{
            // SQLite doesn't support $1, $2 syntax natively in the same way as PG for all drivers, 
            // but sqlite3 uses ? placeholders. We need to convert or ensure usage matches.
            // Simple regex to replace $1, $2... with ?
            const sql = text.replace(/\$\d+/g, '?');
            if (text.trim().toUpperCase().startsWith('SELECT')) {
                db.all(sql, params, (err, rows)=>{
                    if (err) reject(err);
                    else resolve({
                        rows
                    });
                });
            } else {
                db.run(sql, params, function(err) {
                    if (err) reject(err);
                    else resolve({
                        rows: [],
                        rowCount: this.changes
                    });
                });
            }
        });
    }
};
}),
"[project]/lib/database/init.js [api] (ecmascript)", ((__turbopack_context__, module, exports) => {

const db = __turbopack_context__.r("[project]/lib/database/client.js [api] (ecmascript)");
const initDb = async ()=>{
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
}),
"[project]/pages/api/dashboard.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$client$2e$js__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/database/client.js [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$init$2e$js__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/database/init.js [api] (ecmascript)");
;
;
let initialized = false;
async function handler(req, res) {
    if (!initialized) {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$init$2e$js__$5b$api$5d$__$28$ecmascript$29$__["default"])();
        initialized = true;
    }
    if (req.method !== 'GET') {
        return res.status(405).json({
            error: 'Method not allowed'
        });
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
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$client$2e$js__$5b$api$5d$__$28$ecmascript$29$__["default"].query(query, params);
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
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__c762b5ce._.js.map