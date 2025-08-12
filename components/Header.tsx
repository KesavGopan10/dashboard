import React, { useState, useRef, useContext } from 'react';
import { SearchIcon, ChevronDownIcon, SettingsIcon, LogoutIcon } from './icons';
import { useClickOutside } from '../hooks/useClickOutside';
import { AppContext } from '../contexts/AppContext';

interface HeaderProps {
    pageTitle: string;
    pageDescription: string;
}

const Header: React.FC<HeaderProps> = ({ pageTitle, pageDescription }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { searchQuery, setSearchQuery, setActivePage, logout, user } = useContext(AppContext);

  useClickOutside(dropdownRef, () => setIsDropdownOpen(false));

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">{pageTitle}</h2>
        <p className="text-gray-500 mt-1">{pageDescription}</p>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
        <div className="relative w-full sm:w-64">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D7A79]"
          />
        </div>
        {user && (
            <div className="relative w-full sm:w-auto" ref={dropdownRef}>
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-2 p-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors w-full border border-transparent hover:border-gray-200">
                <img 
                    src={`https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=A4F44A&color=2D7A79&bold=true`}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="hidden sm:block text-left flex-grow">
                    <p className="font-semibold text-gray-700 text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                    </div>
                    <ChevronDownIcon className={`h-5 w-5 text-gray-500 transition-transform duration-200 flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-20 border py-1">
                    <button
                    onClick={() => {
                        setActivePage('settings');
                        setIsDropdownOpen(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                    <SettingsIcon className="w-5 h-5 mr-3" />
                    Profile Settings
                    </button>
                    <button
                    onClick={() => {
                        logout();
                        setIsDropdownOpen(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                    <LogoutIcon className="w-5 h-5 mr-3" />
                    Logout
                    </button>
                </div>
                )}
            </div>
        )}
      </div>
    </header>
  );
};

export default Header;