// Mock Queue for local development without Redis
const EventEmitter = require('events');
const jobProcessor = require('../worker/jobProcessor');

class MockQueue extends EventEmitter {
  constructor() {
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
      updateProgress: async (val) => {
        job.progress = val;
      },
      getState: async () => job.state
    };

    this.jobs.set(id.toString(), job);

    // Process asynchronously
    setTimeout(async () => {
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

module.exports = { reportsQueue };
