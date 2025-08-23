import React, { createContext, useState, useEffect, useCallback } from 'react';
import { AppContextType, Page } from '../types';
import { login as apiLogin } from '../api/mockApi';

export const AppContext = createContext<AppContextType>(null!);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, _setActivePage] = useState<Page>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Clear search when navigating away from products page
  const setActivePage = (page: Page) => {
    if (activePage === 'products' && page !== 'products') {
      setSearchQuery('');
    }
    _setActivePage(page);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };
  
  const logout = useCallback(() => {
    setToken(null);
    setIsAuthenticated(false);
    sessionStorage.removeItem('authToken');
    _setActivePage('products');
    showToast("You have been successfully logged out.");
  }, []);

  useEffect(() => {
    try {
      const storedToken = sessionStorage.getItem('authToken');
      // Avoid parsing the literal string "undefined" which would throw a SyntaxError
      if (storedToken) {
        setToken(storedToken);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Failed to parse user data from sessionStorage", error);
      logout();
    }
    setIsLoading(false);
  }, [logout]);

  const login = async (name: string, password: string) => {
    const { token: authToken } = await apiLogin(name, password);
    sessionStorage.setItem('authToken', authToken);
    setToken(authToken);
    setIsAuthenticated(true);
    showToast(`Welcome back!`);
  };

  const contextValue: AppContextType = {
    activePage,
    setActivePage,
    searchQuery,
    setSearchQuery,
    toastMessage,
    showToast,
    isAuthenticated,
    token,
    isLoading,
    login,
    logout,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};