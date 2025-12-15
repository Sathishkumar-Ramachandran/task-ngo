export default function DashboardSummary({ data }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-6 border rounded-lg shadow-sm bg-white">
        <h3 className="text-sm font-medium text-gray-500 uppercase">Total NGOs Reporting</h3>
        <p className="text-3xl font-bold text-gray-800 mt-2">{data.totalReports}</p>
      </div>
      <div className="p-6 border rounded-lg shadow-sm bg-white">
        <h3 className="text-sm font-medium text-gray-500 uppercase">People Helped</h3>
        <p className="text-3xl font-bold text-blue-600 mt-2">{data.totalPeopleHelped.toLocaleString()}</p>
      </div>
      <div className="p-6 border rounded-lg shadow-sm bg-white">
        <h3 className="text-sm font-medium text-gray-500 uppercase">Events Conducted</h3>
        <p className="text-3xl font-bold text-green-600 mt-2">{data.totalEventsConducted.toLocaleString()}</p>
      </div>
      <div className="p-6 border rounded-lg shadow-sm bg-white">
        <h3 className="text-sm font-medium text-gray-500 uppercase">Funds Utilized</h3>
        <p className="text-3xl font-bold text-purple-600 mt-2">₹{data.totalFundsUtilized.toLocaleString()}</p>
      </div>
    </div>
  );
}
