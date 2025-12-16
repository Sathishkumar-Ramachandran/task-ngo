module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/csv-parser [external] (csv-parser, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("csv-parser", () => require("csv-parser"));

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
"[project]/lib/worker/jobProcessor.js [api] (ecmascript)", ((__turbopack_context__, module, exports) => {

const fs = __turbopack_context__.r("[externals]/fs [external] (fs, cjs)");
const csv = __turbopack_context__.r("[externals]/csv-parser [external] (csv-parser, cjs)");
const db = __turbopack_context__.r("[project]/lib/database/client.js [api] (ecmascript)");
module.exports = async (job)=>{
    console.log(`Processing job ${job.id} with file:`, job.data.filePath);
    const { filePath } = job.data;
    const results = [];
    const errors = [];
    let processedCount = 0;
    // 1. Parse CSV
    await new Promise((resolve, reject)=>{
        fs.createReadStream(filePath).pipe(csv()).on('data', (data)=>results.push(data)).on('end', resolve).on('error', reject);
    });
    const totalRows = results.length;
    console.log(`Parsed ${totalRows} rows from CSV.`);
    // 2. Process each row
    for(let i = 0; i < totalRows; i++){
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
            errors.push({
                row: i + 1,
                error: err.message,
                data: row
            });
        }
        // Update progress
        await job.updateProgress(Math.round((i + 1) / totalRows * 100));
    }
    // Cleanup file
    fs.unlink(filePath, (err)=>{
        if (err) console.error('Error deleting uploaded file:', err);
    });
    console.log(`Job ${job.id} completed. Processed: ${processedCount}, Failed: ${errors.length}`);
    return {
        processed: processedCount,
        failed: errors.length,
        errors: errors.slice(0, 10) // Return first 10 errors for brevity
    };
};
}),
"[project]/lib/utils/queue.js [api] (ecmascript)", ((__turbopack_context__, module, exports) => {

// Mock Queue for local development without Redis
const EventEmitter = __turbopack_context__.r("[externals]/events [external] (events, cjs)");
const jobProcessor = __turbopack_context__.r("[project]/lib/worker/jobProcessor.js [api] (ecmascript)");
class MockQueue extends EventEmitter {
    constructor(){
        super();
        this.jobs = new Map();
        this.currentId = 1;
    }
    async add(name, data) {
        const id = this.currentId++;
        const job = {
            id,
            data,
            progress: 0,
            state: 'active',
            updateProgress: async (val)=>{
                job.progress = val;
            },
            getState: async ()=>job.state
        };
        this.jobs.set(id.toString(), job);
        // Process asynchronously
        setTimeout(async ()=>{
            try {
                await jobProcessor(job);
                job.state = 'completed';
                job.progress = 100;
            } catch (err) {
                console.error(err);
                job.state = 'failed';
            }
        }, 100);
        return job;
    }
    async getJob(id) {
        return this.jobs.get(id.toString());
    }
}
const reportsQueue = new MockQueue();
module.exports = {
    reportsQueue
};
}),
"[project]/pages/api/reports/job-status/[id].js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$queue$2e$js__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils/queue.js [api] (ecmascript)");
;
async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({
            error: 'Method not allowed'
        });
    }
    try {
        const { id } = req.query;
        const job = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$queue$2e$js__$5b$api$5d$__$28$ecmascript$29$__["reportsQueue"].getJob(id);
        if (!job) {
            return res.status(404).json({
                error: 'Job not found'
            });
        }
        const state = await job.getState();
        const progress = job.progress;
        res.json({
            id: job.id,
            state,
            progress
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error fetching job status'
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f8bd3977._.js.map