

import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import SalesReportChart from '../components/SalesReportChart';
import MostSalesChart from '../components/MostSalesChart';
import { ChartIcon, CreditCardIcon, ShoppingBagIcon, WalletIcon, Squares2X2Icon, OrderIcon } from '../components/icons';
import { getDashboardStats } from '../api/mockApi';
import { DashboardStats } from '../types';

type StatData = {
  title: string;
  value: string;
};

const iconMap: { [key: string]: React.ReactNode } = {
  "Total Sales": <ShoppingBagIcon className="w-8 h-8 text-[#A4F44A]" />,
  "Total Orders": <OrderIcon className="w-8 h-8 text-[#A4F44A]" />,
  "Total Products": <WalletIcon className="w-8 h-8 text-[#A4F44A]" />,
  "Total Categories": <Squares2X2Icon className="w-8 h-8 text-[#A4F44A]" />,
};

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<StatData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await getDashboardStats();
        const formattedStats: StatData[] = [
            { title: "Total Sales", value: `$${(data.totalSales.value || 0).toLocaleString()}`},
            { title: "Total Orders", value: (data.totalOrders.value || 0).toLocaleString() },
            { title: "Total Products", value: (data.totalProducts.value || 0).toLocaleString() },
            { title: "Total Categories", value: (data.totalCategories.value || 0).toLocaleString() },
        ];
        setStats(formattedStats);
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
              title="" value="" icon={<></>}
              isLoading={true} 
            />
          ))
        ) : (
          stats.map(stat => (
            <StatCard 
              key={stat.title}
              title={stat.title} 
              value={stat.value} 
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