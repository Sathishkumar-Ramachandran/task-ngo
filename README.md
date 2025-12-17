# NGO Impact Tracker

A comprehensive web application designed to help NGOs track, report, and visualize their impact metrics. This project facilitates the collection of data such as people helped, events conducted, and funds utilized, providing both individual submission and bulk upload capabilities.

## Features

- **Impact Report Submission**: Easy-to-use form for submitting individual monthly impact reports.
- **Bulk Data Upload**: Support for uploading CSV files to submit multiple reports at once, processed asynchronously.
- **Admin Dashboard**: A centralized dashboard to view aggregated impact data, with filtering capabilities by month.
- **Real-time Job Tracking**: Monitor the progress of bulk upload jobs.
- **Responsive Design**: Built with Tailwind CSS for a seamless experience across devices.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (React)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: SQLite (via `sqlite3`)
- **File Handling**: Multer & CSV Parser
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd task-ngo
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Initialize the database:**
   The application uses SQLite. The database file `ngo.db` will be created automatically or accessed in the project root. Ensure the initialization scripts run if applicable (usually handled on app start or via a specific script if defined).

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open the application:**
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Submitting a Report
1. Navigate to the home page.
2. Fill in the "Submit Impact Report" form with the NGO ID, Month, and metrics.
3. Click "Submit Report".

### Bulk Upload
1. Click on "Bulk Upload" from the home page.
2. Prepare a CSV file with the following headers:
   - `ngo_id` (Text)
   - `month` (YYYY-MM format, e.g., 2023-10)
   - `people_helped` (Number)
   - `events_conducted` (Number)
   - `funds_utilized` (Number)
3. Select the file and click "Upload".
4. Wait for the processing to complete.

### Admin Dashboard
1. Click on "Admin Dashboard" from the home page.
2. View the summary of all data.
3. Use the month filter to view data for a specific period.

## Project Structure

```
├── components/          # Reusable React components
├── lib/                 # Backend logic and utilities
│   ├── database/        # Database connection and initialization
│   ├── utils/           # Helper functions (e.g., queue)
│   └── worker/          # Background job processors
├── pages/               # Next.js pages and API routes
│   ├── admin/           # Admin dashboard pages
│   ├── api/             # Backend API endpoints
│   └── ...              # Public pages
├── public/              # Static assets
├── styles/              # Global styles
└── ...
```

## License

This project is open source and available under the [MIT License](LICENSE).
