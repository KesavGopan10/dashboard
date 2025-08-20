import React, { useContext } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import CategoriesPage from './pages/CategoriesPage';
import OrdersPage from './pages/OrdersPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import OffersPage from './pages/OffersPage';
import WebsiteContentPage from './pages/WebsiteContentPage';
import { AppContext } from './contexts/AppContext';
import Toast from './components/Toast';
import LoadingSpinner from './components/LoadingSpinner';
import { Page } from './types';

const App: React.FC = () => {
  const { activePage, toastMessage, isAuthenticated, isLoading } = useContext(AppContext);

  const getPageConfig = (): Record<Page, { title: string; description: string }> => ({
    dashboard: {
      title: 'Hello Admin,',
      description: 'Welcome back and explore the dashboard!',
    },
    products: {
      title: 'Products',
      description: 'Manage your products, add new ones, and see their performance.',
    },
    categories: {
      title: 'Categories',
      description: 'Manage the product categories for your e-commerce site.',
    },
    orders: {
      title: 'Customer Orders',
      description: 'Track, manage, and fulfill customer orders.',
    },
    reports: {
      title: 'Reports',
      description: 'View detailed analytics and reports on your sales and products.',
    },
    offers: {
      title: 'Offers & Promotions',
      description: 'Create and manage promotional offers for your store.',
    },
    websiteContent: {
      title: 'Website Content',
      description: 'Manage banners and text content on your public website.',
    },
    settings: {
      title: 'Settings',
      description: 'Configure your profile, notifications, and application preferences.',
    },
  });

  const pageConfig = getPageConfig();

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'products':
        return <ProductsPage />;
      case 'categories':
        return <CategoriesPage />;
      case 'orders':
        return <OrdersPage />;
      case 'reports':
        return <ReportsPage />;
      case 'offers':
        return <OffersPage />;
      case 'websiteContent':
        return <WebsiteContentPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F7F8FA]">
        <LoadingSpinner />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="flex min-h-screen bg-[#F7F8FA]">
      <Sidebar />
      <main className="flex-1 p-4 lg:p-8 ml-0 lg:ml-64 transition-all duration-300 pt-20 lg:pt-8">
        <Header 
          pageTitle={pageConfig[activePage].title}
          pageDescription={pageConfig[activePage].description}
        />
        <div className="mt-8">
          {renderPage()}
        </div>
      </main>
      <Toast message={toastMessage} />
    </div>
  );
};

export default App;