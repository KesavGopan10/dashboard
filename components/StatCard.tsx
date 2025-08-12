
import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from './icons';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ReactNode;
  isLoading: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeType, icon, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md animate-pulse">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-300 rounded w-32 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-40"></div>
          </div>
          <div className="bg-gray-200 p-3 rounded-full h-14 w-14"></div>
        </div>
      </div>
    );
  }
  
  const isIncrease = changeType === 'increase';
  const changeColor = isIncrease ? 'text-green-500' : 'text-orange-500';
  const ChangeIcon = isIncrease ? ArrowUpIcon : ArrowDownIcon;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        <div className={`flex items-center mt-2 text-xs font-semibold ${changeColor}`}>
          <ChangeIcon className="w-4 h-4 mr-1" />
          <span>{change} vs last month</span>
        </div>
      </div>
      <div className="bg-[#2D7A79] p-3 rounded-full">
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
