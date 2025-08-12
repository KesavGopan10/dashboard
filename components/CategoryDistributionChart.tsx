import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { getProductCategoryDistribution } from '../api/mockApi';
import LoadingSpinner from './LoadingSpinner';

const COLORS = ['#2D7A79', '#A4F44A', '#3b82f6', '#f97316', '#8b5cf6', '#ec4899', '#10b981', '#6b7280'];

const CategoryDistributionChart: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const distributionData = await getProductCategoryDistribution();
        setData(distributionData);
      } catch (error) {
        console.error("Failed to fetch category distribution", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  return (
    <div className="h-full w-full">
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
              innerRadius={70}
              outerRadius={100}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              nameKey="name"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`${value} Products`, name]}/>
            <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: "14px", paddingLeft: "10px"}}/>
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default CategoryDistributionChart;