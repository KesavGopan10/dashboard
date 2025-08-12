import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChevronDownIcon } from './icons';
import { getSalesData } from '../api/mockApi';
import { useClickOutside } from '../hooks/useClickOutside';
import LoadingSpinner from './LoadingSpinner';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-bold text-gray-700">{`${label}`}</p>
        <p className="text-sm text-[#2D7A79]">{`Sales: $${payload[0].value.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

type TimeRange = 'Monthly' | 'Quarterly' | 'Yearly';

const SalesReportChart: React.FC = () => {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('Monthly');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeRanges: TimeRange[] = ['Monthly', 'Quarterly', 'Yearly'];

  useClickOutside(dropdownRef, () => setIsDropdownOpen(false));

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getSalesData(timeRange);
      setSalesData(data);
      setLoading(false);
    };
    fetchData();
  }, [timeRange]);


  return (
    <div className="bg-white p-6 rounded-xl shadow-md h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Sales Report</h3>
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2D7A79]"
          >
            {timeRange}
            <ChevronDownIcon className={`w-4 h-4 ml-2 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl z-10 border">
              {timeRanges.map(range => (
                <button
                  key={range}
                  onClick={() => {
                    setTimeRange(range);
                    setIsDropdownOpen(false);
                  }}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  {range}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="h-80 w-full">
        {loading ? (
           <div className="flex items-center justify-center h-full text-gray-500">
             <LoadingSpinner />
           </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis tickFormatter={(value) => `$${Number(value) / 1000}k`} tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(45, 122, 121, 0.1)' }}/>
              <Legend wrapperStyle={{fontSize: "14px"}}/>
              <Line type="monotone" dataKey="sales" stroke="#2D7A79" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8, stroke: '#A4F44A', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default SalesReportChart;
