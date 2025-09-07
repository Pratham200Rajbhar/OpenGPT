import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const supabaseService = {
  // Save a chat to Supabase
  async saveChat(chat) {
    try {
      const { data, error } = await supabase
        .from('chats')
        .upsert({
          id: chat.id,
          title: chat.title,
          messages: chat.messages,
          created_at: chat.created_at,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) {
        return null;
      }
      
      return data;
    } catch (error) {
      return null;
    }
  },

  // Load all chats from Supabase
  async loadChats() {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        return [];
      }
      
      return data || [];
    } catch (error) {
      return [];
    }
  },

  // Delete a chat from Supabase
  async deleteChat(chatId) {
    try {
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);

      if (error) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  },

  // Check if connected to Supabase
  async testConnection() {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('count')
        .limit(1);

      return !error;
    } catch (error) {
      return false;
    }
  }
};
