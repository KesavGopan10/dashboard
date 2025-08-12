
import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import SalesReportChart from '../components/SalesReportChart';
import MostSalesChart from '../components/MostSalesChart';
import { ChartIcon, CreditCardIcon, ShoppingBagIcon, WalletIcon } from '../components/icons';
import { getDashboardStats } from '../api/mockApi';

type StatData = {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
};

const iconMap: { [key: string]: React.ReactNode } = {
  "Total Sales": <ShoppingBagIcon className="w-8 h-8 text-[#A4F44A]" />,
  "Purchases": <WalletIcon className="w-8 h-8 text-[#A4F44A]" />,
  "Paid": <CreditCardIcon className="w-8 h-8 text-[#A4F44A]" />,
  "Profits": <ChartIcon className="w-8 h-8 text-[#A4F44A]" />,
};

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<StatData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);


  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <StatCard 
              key={index}
              title="" value="" change="" changeType="increase" icon={<></>}
              isLoading={true} 
            />
          ))
        ) : (
          stats.map(stat => (
            <StatCard 
              key={stat.title}
              title={stat.title} 
              value={stat.value} 
              change={stat.change} 
              changeType={stat.changeType}
              icon={iconMap[stat.title] || <ChartIcon className="w-8 h-8 text-[#A4F44A]" />}
              isLoading={false}
            />
          ))
        )}
      </div>
      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SalesReportChart />
        </div>
        <div>
          <MostSalesChart />
        </div>
      </div>
    </>
  );
};

export default DashboardPage;