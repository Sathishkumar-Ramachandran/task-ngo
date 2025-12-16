import multer from 'multer';
import { reportsQueue } from '../../../lib/utils/queue';
import initDb from '../../../lib/database/init';

// Initialize DB once
let initialized = false;

const upload = multer({ dest: 'uploads/' });

export const config = {
  api: {
    bodyParser: false,
  },
};

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  if (!initialized) {
    await initDb();
    initialized = true;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await runMiddleware(req, res, upload.single('file'));

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const job = await reportsQueue.add('process-csv', {
      filePath: req.file.path,
      originalName: req.file.originalname
    });

    res.json({ message: 'File uploaded and processing started', jobId: job.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Upload failed' });
  }
}
