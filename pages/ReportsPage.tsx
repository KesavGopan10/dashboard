
import React, { useContext } from 'react';
import SalesReportChart from '../components/SalesReportChart';
import MostSalesChart from '../components/MostSalesChart';
import CategoryDistributionChart from '../components/CategoryDistributionChart';
import { AppContext } from '../contexts/AppContext';
import { PieChartIcon } from '../components/icons';

const ReportsPage: React.FC = () => {
  const { showToast } = useContext(AppContext);
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <SalesReportChart />
        </div>
        <div className="lg:col-span-2">
          <MostSalesChart />
        </div>
      </div>
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-md">
        <div className="flex items-center gap-4">
            <div className="bg-[#2D7A79] p-3 rounded-full">
                <PieChartIcon className="w-8 h-8 text-[#A4F44A]" />
            </div>
            <div>
                <h3 className="text-xl font-bold text-gray-800">Product Category Distribution</h3>
                <p className="text-gray-500 mt-1">A visual breakdown of all products by their assigned category.</p>
            </div>
        </div>
        <div className="mt-4 h-80">
          <CategoryDistributionChart />
        </div>
      </div>
       <div className="bg-white p-8 rounded-xl shadow-md">
        <h3 className="text-xl font-bold text-gray-800">Download Reports</h3>
        <p className="text-gray-500 mt-2">Export your data in various formats for offline analysis.</p>
        <div className="mt-6 flex flex-wrap gap-4">
            <button onClick={() => showToast('CSV export functionality coming soon!')} className="px-5 py-2 bg-[#2D7A79] text-white rounded-lg font-semibold hover:bg-opacity-90 shadow-sm transition-all">Export as CSV</button>
            <button onClick={() => showToast('PDF export functionality coming soon!')} className="px-5 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 shadow-sm transition-all">Export as PDF</button>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;