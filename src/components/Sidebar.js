import React, { useState } from 'react';
import { useChat } from '../contexts/ChatContext';
import LoadingIndicator from './LoadingIndicator';

const Sidebar = ({ collapsed, onToggleCollapse }) => {
  const { chats, currentChatId, isInitialLoading, createNewChat, selectChat, deleteChat } = useChat();
  const [hoveredChatId, setHoveredChatId] = useState(null);

  const handleNewChat = () => {
    createNewChat();
  };

  const handleDeleteChat = (e, chatId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat?')) {
      deleteChat(chatId);
    }
  };

  const handleChatSelect = (chatId) => {
    selectChat(chatId);
  };

  const formatChatTitle = (chat) => {
    if (chat.title && chat.title !== 'New Chat') {
      return chat.title;
    }
    if (chat.messages && chat.messages.length > 0) {
      const firstMessage = chat.messages.find(m => m.role === 'user');
      if (firstMessage) {
        return firstMessage.content.substring(0, 30) + (firstMessage.content.length > 30 ? '...' : '');
      }
    }
    return 'New Chat';
  };

  const sortedChats = [...chats]
    .filter(chat => !chat.isTemporary || chat.messages.length > 0) // Hide empty temporary chats
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <div className={`bg-sidebar border-r border-gray-700 flex flex-col transition-all duration-300 ${
      collapsed ? 'w-0 overflow-hidden' : 'w-80'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Jarvis GPT</h1>
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-md hover:bg-gray-700 transition-colors"
            title="Hide sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
        
        <button
          onClick={handleNewChat}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Chat</span>
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
        <div className="space-y-1">
          {isInitialLoading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <LoadingIndicator type="spinner" size="medium" />
              <p className="text-gray-500 text-sm">Loading chat history...</p>
            </div>
          ) : sortedChats.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p>No chats yet</p>
              <p className="text-sm">Start a new conversation</p>
            </div>
          ) : (
            sortedChats.map((chat) => (
              <div
                key={chat.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                  currentChatId === chat.id ? 'bg-gray-700' : 'hover:bg-gray-800'
                }`}
                onClick={() => handleChatSelect(chat.id)}
                onMouseEnter={() => setHoveredChatId(chat.id)}
                onMouseLeave={() => setHoveredChatId(null)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {formatChatTitle(chat)}
                    </div>
                  </div>
                  {(hoveredChatId === chat.id || currentChatId === chat.id) && (
                    <button
                      onClick={(e) => handleDeleteChat(e, chat.id)}
                      className="p-1 rounded hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete chat"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
