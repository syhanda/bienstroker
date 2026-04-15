import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Inisialisasi Context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Cek session saat aplikasi pertama kali dibuka
  useEffect(() => {
    loadSession();
  }, []);

  async function loadSession() {
    try {
      const savedUser = await AsyncStorage.getItem('userSession');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error("Gagal memuat sesi:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Fungsi Login
  const login = async (userData) => {
    setUser(userData);
    await AsyncStorage.setItem('userSession', JSON.stringify(userData));
  };

  // 4. Fungsi Logout
  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('userSession');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};