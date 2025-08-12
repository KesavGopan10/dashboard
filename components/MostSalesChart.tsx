import React, { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ChevronDownIcon } from './icons';
import { getMostSalesData } from '../api/mockApi';
import { useClickOutside } from '../hooks/useClickOutside';
import LoadingSpinner from './LoadingSpinner';

const COLORS = ['#2D7A79', '#A4F44A', '#3b82f6', '#f97316'];

type TimePeriod = 'Last 7 Days' | 'Last Month' | 'Last Year';

const MostSalesChart: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('Last Month');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timePeriods: TimePeriod[] = ['Last 7 Days', 'Last Month', 'Last Year'];
  
  useClickOutside(dropdownRef, () => setIsDropdownOpen(false));

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const salesData = await getMostSalesData(timePeriod);
      setData(salesData);
      setLoading(false);
    };
    fetchData();
  }, [timePeriod]);


  return (
    <div className="bg-white p-6 rounded-xl shadow-md h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Most Sales</h3>
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2D7A79]"
            >
                {timePeriod}
                <ChevronDownIcon className={`w-4 h-4 ml-2 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl z-10 border">
                    {timePeriods.map(period => (
                        <button
                            key={period}
                            onClick={() => {
                                setTimePeriod(period);
                                setIsDropdownOpen(false);
                            }}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                            {period}
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
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
                labelLine={false}
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value}%`, name]}/>
              <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: "14px", paddingLeft: "10px"}}/>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default MostSalesChart;
