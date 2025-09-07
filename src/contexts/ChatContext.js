import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import aiService from '../services/aiService';
import { useSupabase } from './SupabaseContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [memoryConfig, setMemoryConfig] = useState(aiService.getConfig());
  const loadingTimeoutRef = useRef(null);
  
  const { isConnected, saveChat, loadChats, deleteChat: deleteFromSupabase } = useSupabase();

  // Safety mechanism to prevent loading state from getting stuck
  const setLoadingWithTimeout = useCallback((loading) => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    
    setIsLoading(loading);
    
    if (loading) {
      // Set a maximum timeout of 30 seconds for any loading operation
      loadingTimeoutRef.current = setTimeout(() => {
        console.warn('[ChatContext] Loading timeout reached, forcing loading state to false');
        setIsLoading(false);
        setError('Request timed out. Please try again.');
        loadingTimeoutRef.current = null;
      }, 30000);
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  const currentChat = chats.find(chat => chat.id === currentChatId);

  // Load chats on mount and always start with a new chat
  useEffect(() => {
    const loadInitialChats = async () => {
      setIsInitialLoading(true);
      let loadedChats = [];
      
      if (isConnected) {
        try {
          const supabaseChats = await loadChats();
          if (supabaseChats.length > 0) {
            loadedChats = supabaseChats;
          }
        } catch (error) {
          console.error('Failed to load from Supabase:', error);
        }
      }
      
      // Fallback to localStorage if no Supabase data
      if (loadedChats.length === 0) {
        const localChats = localStorage.getItem('jarvis-chats');
        if (localChats) {
          try {
            const parsedChats = JSON.parse(localChats);
            loadedChats = parsedChats || [];
          } catch (error) {
            console.error('Failed to parse local chats:', error);
          }
        }
      }
      
      // Set loaded chats
      setChats(loadedChats);
      
      // Always create a new temporary chat for immediate use
      const tempChat = {
        id: uuidv4(),
        title: 'New Chat',
        messages: [],
        created_at: new Date().toISOString(),
        isTemporary: true // Mark as temporary (not saved yet)
      };
      
      setChats(prev => [tempChat, ...prev]);
      setCurrentChatId(tempChat.id);
      setIsInitialLoading(false);
    };

    loadInitialChats();
  }, [isConnected, loadChats]);

  // Save individual chat to both Supabase and localStorage
  const saveChatToStorage = useCallback(async (chatToSave, allChats) => {
    // Don't save temporary chats
    if (chatToSave.isTemporary) {
      return;
    }
    
    // Filter out temporary chats before saving
    const chatsToSave = allChats.filter(chat => !chat.isTemporary);
    
    // Save to localStorage immediately
    localStorage.setItem('jarvis-chats', JSON.stringify(chatsToSave));
    
    // Save to Supabase if connected
    if (isConnected) {
      try {
        await saveChat(chatToSave);
      } catch (error) {
        console.error('Failed to save to Supabase:', error);
      }
    }
  }, [isConnected, saveChat]);

  const createNewChat = useCallback(() => {
    // Clean up any existing empty temporary chats
    const cleanedChats = chats.filter(chat => !chat.isTemporary || chat.messages.length > 0);
    
    const newChat = {
      id: uuidv4(),
      title: 'New Chat',
      messages: [],
      created_at: new Date().toISOString(),
      isTemporary: true // Mark as temporary (not saved yet)
    };
    
    const updatedChats = [newChat, ...cleanedChats];
    setChats(updatedChats);
    setCurrentChatId(newChat.id);
    setError(null);
    
    // Don't save empty chats - they will be saved when first message is sent
    
    return newChat.id;
  }, [chats]);

  const selectChat = useCallback((chatId) => {
    // Clean up empty temporary chats when switching (except the one we're selecting)
    const cleanedChats = chats.filter(chat => 
      !chat.isTemporary || 
      chat.messages.length > 0 || 
      chat.id === chatId
    );
    
    if (cleanedChats.length !== chats.length) {
      setChats(cleanedChats);
    }
    
    setCurrentChatId(chatId);
    setError(null);
  }, [chats]);

  const deleteChat = useCallback(async (chatId) => {
    const chatToDelete = chats.find(chat => chat.id === chatId);
    
    // Only try to delete from Supabase if the chat is not temporary (has been saved)
    if (isConnected && chatToDelete && !chatToDelete.isTemporary) {
      try {
        await deleteFromSupabase(chatId);
      } catch (error) {
        console.error('Failed to delete from Supabase:', error);
      }
    }
    
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    setChats(updatedChats);
    
    if (currentChatId === chatId) {
      setCurrentChatId(null);
    }
    
    // Update localStorage (exclude temporary chats)
    const chatsToSave = updatedChats.filter(chat => !chat.isTemporary);
    localStorage.setItem('jarvis-chats', JSON.stringify(chatsToSave));
  }, [chats, currentChatId, isConnected, deleteFromSupabase]);

  const sendMessage = useCallback(async (content) => {
    if (!content.trim()) return;

    console.log('[DEBUG] Sending message:', content);
    console.log('[DEBUG] Current chat ID:', currentChatId);
    console.log('[DEBUG] API URL:', process.env.REACT_APP_AI_API_URL);

    let chatId = currentChatId;
    
    // Create new chat if none exists
    if (!chatId) {
      chatId = createNewChat();
      console.log('[DEBUG] Created new chat with ID:', chatId);
    }

    const userMessage = {
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString()
    };

    console.log('[DEBUG] User message created:', userMessage);

    // Add user message immediately and mark chat as no longer temporary
    const updatedChatsWithUser = chats.map(chat => 
      chat.id === chatId 
        ? { ...chat, messages: [...chat.messages, userMessage], isTemporary: false }
        : chat
    );
    setChats(updatedChatsWithUser);
    console.log('[DEBUG] Updated chats with user message');

    // Save the chat now that it has content
    const currentChatWithUser = updatedChatsWithUser.find(chat => chat.id === chatId);
    if (currentChatWithUser && !currentChatWithUser.isTemporary) {
      await saveChatToStorage(currentChatWithUser, updatedChatsWithUser);
      console.log('[DEBUG] Chat saved to storage after first message');
    }

    setLoadingWithTimeout(true);
    setError(null);

    try {
      // Get the current chat's messages including the user message we just added
      const currentChatWithUser = updatedChatsWithUser.find(chat => chat.id === chatId);
      const allMessages = currentChatWithUser ? currentChatWithUser.messages : [userMessage];
      
      console.log('[DEBUG] Calling AI service with messages:', allMessages);
      const response = await aiService.sendMessage(allMessages);
      console.log('[DEBUG] AI response received:', response);
      
      // Ensure loading is stopped before updating chats
      setLoadingWithTimeout(false);
      
      // Add assistant response
      const finalUpdatedChats = updatedChatsWithUser.map(chat => 
        chat.id === chatId 
          ? { ...chat, messages: [...chat.messages, response] }
          : chat
      );
      setChats(finalUpdatedChats);
      console.log('[DEBUG] Final chats with AI response updated');
      
      // Save the updated chat with AI response
      const updatedChat = finalUpdatedChats.find(chat => chat.id === chatId);
      if (updatedChat && !updatedChat.isTemporary) {
        await saveChatToStorage(updatedChat, finalUpdatedChats);
        
        // Generate AI title after the first exchange (2 messages: user + assistant)
        if (updatedChat.messages.length === 2 && updatedChat.title === 'New Chat') {
          try {
            console.log('[DEBUG] Generating chat title...');
            const generatedTitle = await aiService.generateChatTitle(updatedChat.messages);
            console.log('[DEBUG] Generated title:', generatedTitle);
            
            // Update chat with AI-generated title
            const chatsWithNewTitle = finalUpdatedChats.map(chat => 
              chat.id === chatId 
                ? { ...chat, title: generatedTitle }
                : chat
            );
            setChats(chatsWithNewTitle);
            
            // Save updated chat with new title
            const chatWithTitle = chatsWithNewTitle.find(chat => chat.id === chatId);
            if (chatWithTitle && !chatWithTitle.isTemporary) {
              await saveChatToStorage(chatWithTitle, chatsWithNewTitle);
            }
          } catch (error) {
            console.error('Failed to generate chat title:', error);
            // Don't let title generation failure affect the main flow
          }
        }
      }
      
    } catch (error) {
      console.error('[DEBUG] Error in sendMessage:', error);
      setError(error.message);
      setLoadingWithTimeout(false);
    }
  }, [chats, currentChatId, createNewChat, saveChatToStorage, setLoadingWithTimeout]);

  const clearError = useCallback(() => setError(null), []);

  const forceStopLoading = useCallback(() => {
    console.log('[ChatContext] Force stopping loading state');
    setLoadingWithTimeout(false);
    setError(null);
  }, [setLoadingWithTimeout]);

  const regenerateLastMessage = useCallback(async () => {
    if (!currentChat || currentChat.messages.length < 2) return;
    
    // Find the last assistant message
    const messages = [...currentChat.messages];
    const lastAssistantIndex = messages.length - 1;
    
    if (messages[lastAssistantIndex].role !== 'assistant') return;
    
    // Remove the last assistant message
    const messagesWithoutLast = messages.slice(0, -1);
    
    // Update chat without the last assistant message
    const updatedChats = chats.map(chat => 
      chat.id === currentChatId 
        ? { ...chat, messages: messagesWithoutLast }
        : chat
    );
    setChats(updatedChats);
    
    setLoadingWithTimeout(true);
    setError(null);

    try {
      // Regenerate response using the conversation history
      console.log('[DEBUG] Regenerating with messages:', messagesWithoutLast);
      const response = await aiService.sendMessage(messagesWithoutLast);
      console.log('[DEBUG] Regenerated response:', response);

      // Ensure loading is stopped before updating chats
      setLoadingWithTimeout(false);

      // Add the new assistant message
      const finalUpdatedChats = chats.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, messages: [...messagesWithoutLast, response] }
          : chat
      );
      setChats(finalUpdatedChats);

      // Save updated chat
      const updatedChat = finalUpdatedChats.find(chat => chat.id === currentChatId);
      if (updatedChat) {
        await saveChatToStorage(updatedChat, finalUpdatedChats);
      }

    } catch (error) {
      console.error('[DEBUG] Error in regenerateLastMessage:', error);
      setError(error.message);
      setLoadingWithTimeout(false);
    }
  }, [chats, currentChat, currentChatId, memoryConfig, saveChatToStorage, setLoadingWithTimeout]);

  const updateMemoryConfig = useCallback((newConfig) => {
    aiService.updateConfig(newConfig);
    setMemoryConfig(aiService.getConfig());
  }, []);

  return (
    <ChatContext.Provider value={{
      chats,
      currentChat,
      currentChatId,
      isLoading,
      isInitialLoading,
      error,
      memoryConfig,
      createNewChat,
      selectChat,
      deleteChat,
      sendMessage,
      clearError,
      forceStopLoading,
      regenerateLastMessage,
      updateMemoryConfig
    }}>
      {children}
    </ChatContext.Provider>
  );
};

