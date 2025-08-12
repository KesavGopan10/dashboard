import React, { createContext, useState, useEffect, useCallback } from 'react';
import { AppContextType, Page, User } from '../types';
import { login as apiLogin, getMe, updateUser as apiUpdateUser } from '../api/mockApi';

export const AppContext = createContext<AppContextType>(null!);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, _setActivePage] = useState<Page>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'));
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
    localStorage.removeItem('authToken');
    _setActivePage('dashboard');
    showToast("You have been successfully logged out.");
  }, []);

  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        try {
          const currentUser = await getMe(token);
          setUser(currentUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Session expired or token is invalid.", error);
          logout();
        }
      }
      setIsLoading(false);
    };
    validateToken();
  }, [token, logout]);

  const login = async (email: string, password: string) => {
    const { user: loggedInUser, token: authToken } = await apiLogin(email, password);
    localStorage.setItem('authToken', authToken);
    setUser(loggedInUser);
    setToken(authToken);
    setIsAuthenticated(true);
    showToast(`Welcome back, ${loggedInUser.name}!`);
  };

  const updateUserProfile = useCallback(async (updatedProfile: Partial<Pick<User, 'name' | 'email'>>) => {
      if (!user) {
          throw new Error("User not authenticated");
      }
      const updatedUser = await apiUpdateUser(user.id, updatedProfile);
      setUser(updatedUser);
  }, [user]);

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
    updateUserProfile,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};