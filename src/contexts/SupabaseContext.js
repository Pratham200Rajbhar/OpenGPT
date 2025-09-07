import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabaseService } from '../services/supabaseService';

const SupabaseContext = createContext();

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};

export const SupabaseProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Test connection on mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const connected = await supabaseService.testConnection();
        setIsConnected(connected);
      } catch (error) {
        console.error('Supabase connection test failed:', error);
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    testConnection();
  }, []);

  const saveChat = async (chat) => {
    if (!isConnected) return null;
    return await supabaseService.saveChat(chat);
  };

  const loadChats = async () => {
    if (!isConnected) return [];
    return await supabaseService.loadChats();
  };

  const deleteChat = async (chatId) => {
    if (!isConnected) return false;
    return await supabaseService.deleteChat(chatId);
  };

  return (
    <SupabaseContext.Provider value={{
      isConnected,
      isLoading,
      saveChat,
      loadChats,
      deleteChat
    }}>
      {children}
    </SupabaseContext.Provider>
  );
};
