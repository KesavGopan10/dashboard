import React, { useState, useContext } from 'react';
import { DashboardIcon, ProductsIcon, ReportsIcon, SettingsIcon, LogoutIcon, MenuIcon, XIcon, OrderIcon, Squares2X2Icon, TagIcon, GlobeAltIcon } from './icons';
import { AppContext } from '../contexts/AppContext';
import { Page } from '../types';

interface NavLinkProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 text-gray-200 rounded-lg transition-colors duration-200 text-left ${
      active
        ? 'bg-[#A4F44A] text-[#2D7A79] font-bold'
        : 'hover:bg-white hover:bg-opacity-20'
    }`}
  >
    {icon}
    <span className="ml-4">{label}</span>
  </button>
);

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { activePage, setActivePage, logout, user } = useContext(AppContext);

  const handleNavigate = (page: Page) => {
    setActivePage(page);
    setIsOpen(false);
  };
  
  const handleLogout = () => {
    logout();
    setIsOpen(false);
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="fixed top-4 left-4 z-40 lg:hidden p-2 rounded-md bg-[#2D7A79] text-white shadow-lg"
        aria-label="Toggle menu"
      >
        {isOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#2D7A79] text-white p-6 flex flex-col z-30 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center mb-12">
          <div className="bg-[#A4F44A] p-2 rounded-md">
            <DashboardIcon className="h-6 w-6 text-[#2D7A79]" />
          </div>
          <h1 className="text-2xl font-bold ml-3">Dashboard</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <NavLink icon={<DashboardIcon className="h-6 w-6" />} label="Dashboard" active={activePage === 'dashboard'} onClick={() => handleNavigate('dashboard')} />
          <NavLink icon={<ProductsIcon className="h-6 w-6" />} label="Products" active={activePage === 'products'} onClick={() => handleNavigate('products')} />
          <NavLink icon={<Squares2X2Icon className="h-6 w-6" />} label="Categories" active={activePage === 'categories'} onClick={() => handleNavigate('categories')} />
          <NavLink icon={<OrderIcon className="h-6 w-6" />} label="Orders" active={activePage === 'orders'} onClick={() => handleNavigate('orders')} />
          {/* <NavLink icon={<ReportsIcon className="h-6 w-6" />} label="Reports" active={activePage === 'reports'} onClick={() => handleNavigate('reports')} /> */}
          {/* <NavLink icon={<TagIcon className="h-6 w-6" />} label="Offers" active={activePage === 'offers'} onClick={() => handleNavigate('offers')} /> */}
          {/* <NavLink icon={<GlobeAltIcon className="h-6 w-6" />} label="Website" active={activePage === 'websiteContent'} onClick={() => handleNavigate('websiteContent')} /> */}
          <NavLink icon={<SettingsIcon className="h-6 w-6" />} label="Settings" active={activePage === 'settings'} onClick={() => handleNavigate('settings')} />
        </nav>

        <div>
          <div className="border-t border-white border-opacity-20 my-4"></div>
          {user && (
            <div className="flex items-center mb-4">
              <img 
                src={`https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=A4F44A&color=2D7A79&bold=true`}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="ml-4">
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-300">{user.role}</p>
              </div>
            </div>
          )}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-3 text-gray-200 rounded-lg transition-colors duration-200 hover:bg-white hover:bg-opacity-20"
          >
            <LogoutIcon className="h-6 w-6" />
            <span className="ml-4">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;