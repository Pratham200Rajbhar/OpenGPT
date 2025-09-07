// localStorage service for persistent sessions
export const storageService = {
  // Keys for storing data
  STORAGE_KEYS: {
    USER_SESSION: 'jarvis_user_session',
    USER_PROFILE: 'jarvis_user_profile',
    CHAT_HISTORY: 'jarvis_chat_history',
    USER_PREFERENCES: 'jarvis_user_preferences',
    LAST_ACTIVE: 'jarvis_last_active'
  },

  // Save user session to localStorage (permanent until logout)
  saveUserSession(user, profile = null) {
    try {
      const sessionData = {
        user,
        profile,
        timestamp: Date.now(),
        version: '1.0.0',
        persistent: true // Mark as permanent session
      };
      
      localStorage.setItem(this.STORAGE_KEYS.USER_SESSION, JSON.stringify(sessionData));
      localStorage.setItem(this.STORAGE_KEYS.LAST_ACTIVE, Date.now().toString());
      
      if (profile) {
        localStorage.setItem(this.STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
      }
      
      console.log('✅ Permanent user session saved to localStorage');
      return true;
    } catch (error) {
      console.error('❌ Failed to save user session:', error);
      return false;
    }
  },

  // Load user session from localStorage
  loadUserSession() {
    try {
      const sessionData = localStorage.getItem(this.STORAGE_KEYS.USER_SESSION);
      const lastActive = localStorage.getItem(this.STORAGE_KEYS.LAST_ACTIVE);
      
      if (!sessionData) {
        console.log('📝 No saved session found');
        return null;
      }

      const parsed = JSON.parse(sessionData);
      
      // No expiration check - session stays until manual logout
      console.log('✅ User session loaded from localStorage (persistent until logout)');
      return {
        user: parsed.user,
        profile: parsed.profile,
        lastActive: lastActive ? parseInt(lastActive) : Date.now()
      };
    } catch (error) {
      console.error('❌ Failed to load user session:', error);
      this.clearUserSession(); // Clear corrupted data
      return null;
    }
  },

  // Clear user session
  clearUserSession() {
    try {
      localStorage.removeItem(this.STORAGE_KEYS.USER_SESSION);
      localStorage.removeItem(this.STORAGE_KEYS.USER_PROFILE);
      localStorage.removeItem(this.STORAGE_KEYS.LAST_ACTIVE);
      console.log('🗑️ User session cleared');
      return true;
    } catch (error) {
      console.error('❌ Failed to clear user session:', error);
      return false;
    }
  },

  // Save chat history
  saveChatHistory(chats) {
    try {
      const chatData = {
        chats,
        timestamp: Date.now(),
        version: '1.0.0'
      };
      localStorage.setItem(this.STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(chatData));
      console.log(`💬 Saved ${chats.length} chats to localStorage`);
      return true;
    } catch (error) {
      console.error('❌ Failed to save chat history:', error);
      return false;
    }
  },

  // Load chat history
  loadChatHistory() {
    try {
      const chatData = localStorage.getItem(this.STORAGE_KEYS.CHAT_HISTORY);
      if (!chatData) {
        return [];
      }

      const parsed = JSON.parse(chatData);
      console.log(`💬 Loaded ${parsed.chats?.length || 0} chats from localStorage`);
      return parsed.chats || [];
    } catch (error) {
      console.error('❌ Failed to load chat history:', error);
      return [];
    }
  },

  // Save user preferences
  saveUserPreferences(preferences) {
    try {
      localStorage.setItem(this.STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
      console.log('⚙️ User preferences saved');
      return true;
    } catch (error) {
      console.error('❌ Failed to save user preferences:', error);
      return false;
    }
  },

  // Load user preferences
  loadUserPreferences() {
    try {
      const preferences = localStorage.getItem(this.STORAGE_KEYS.USER_PREFERENCES);
      return preferences ? JSON.parse(preferences) : null;
    } catch (error) {
      console.error('❌ Failed to load user preferences:', error);
      return null;
    }
  },

  // Update last active timestamp
  updateLastActive() {
    try {
      localStorage.setItem(this.STORAGE_KEYS.LAST_ACTIVE, Date.now().toString());
      return true;
    } catch (error) {
      console.error('❌ Failed to update last active:', error);
      return false;
    }
  },

  // Get storage usage info
  getStorageInfo() {
    try {
      let totalSize = 0;
      const info = {};
      
      Object.values(this.STORAGE_KEYS).forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          const size = new Blob([value]).size;
          totalSize += size;
          info[key] = {
            size,
            sizeKB: Math.round(size / 1024 * 100) / 100
          };
        }
      });

      return {
        totalSize,
        totalSizeKB: Math.round(totalSize / 1024 * 100) / 100,
        items: info
      };
    } catch (error) {
      console.error('❌ Failed to get storage info:', error);
      return null;
    }
  },

  // Clear all app data
  clearAllData() {
    try {
      Object.values(this.STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      console.log('🗑️ All app data cleared');
      return true;
    } catch (error) {
      console.error('❌ Failed to clear all data:', error);
      return false;
    }
  }
};
