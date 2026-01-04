import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error parsing stored user:', err);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await window.electronAPI.login(username, password);
      if (response.success) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      if (user) {
        await window.electronAPI.logout(user.id, user.username);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  const logActivity = async (action, tableName = null, recordId = null, details = '') => {
    if (!user) return;
    try {
      await window.electronAPI.logActivity(
        user.id,
        user.username,
        action,
        tableName,
        recordId,
        details
      );
    } catch (error) {
      console.error('Activity logging error:', error);
    }
  };

  const isAdmin = () => user && user.role === 'admin';
  const isStaff = () => user && user.role === 'staff';
  const isAuthenticated = () => user !== null;

  const value = {
    user,
    login,
    logout,
    logActivity,
    isAdmin,
    isStaff,
    isAuthenticated,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

