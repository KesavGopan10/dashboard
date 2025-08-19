import React, { createContext, useState, useEffect, useCallback } from 'react';
import { AppContextType, Page, User } from '../types';
import { login as apiLogin } from '../api/mockApi';

export const AppContext = createContext<AppContextType>(null!);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, _setActivePage] = useState<Page>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
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
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('authUser');
    _setActivePage('dashboard');
    showToast("You have been successfully logged out.");
  }, []);

  useEffect(() => {
    try {
      const storedToken = sessionStorage.getItem('authToken');
      const storedUserRaw = sessionStorage.getItem('authUser');
      // Avoid parsing the literal string "undefined" which would throw a SyntaxError
      if (storedToken && storedUserRaw && storedUserRaw !== 'undefined') {
        setToken(storedToken);
        setUser(JSON.parse(storedUserRaw));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Failed to parse user data from sessionStorage", error);
      logout();
    }
    setIsLoading(false);
  }, [logout]);

  const login = async (email: string, password: string) => {
    const { user: loggedInUser, token: authToken } = await apiLogin(email, password);
    sessionStorage.setItem('authToken', authToken);
    sessionStorage.setItem('authUser', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    setToken(authToken);
    setIsAuthenticated(true);
    showToast(`Welcome back, ${loggedInUser.name}!`);
  };

  const contextValue: AppContextType = {
    activePage,
    setActivePage,
    searchQuery,
    setSearchQuery,
    toastMessage,
    showToast,
    isAuthenticated,
    user,
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