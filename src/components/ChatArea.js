import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import MessageBubble from './MessageBubble';
import LoadingIndicator from './LoadingIndicator';

const ChatArea = ({ sidebarCollapsed, onToggleSidebar }) => {
  const { 
    currentChat, 
    isLoading, 
    sendMessage, 
    regenerateLastMessage,
    error,
    clearError
  } = useChat();
  
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 200);
      textarea.style.height = `${newHeight}px`;
    }
  }, [inputValue]);

  // Handle '/' key press to focus input
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check if '/' is pressed and no input elements are focused
      if (event.key === '/' && 
          !event.ctrlKey && 
          !event.altKey && 
          !event.metaKey &&
          document.activeElement.tagName !== 'INPUT' &&
          document.activeElement.tagName !== 'TEXTAREA') {
        
        event.preventDefault();
        textareaRef.current?.focus();
      }
    };

    // Add event listener to document
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue.trim();
    setInputValue('');

    await sendMessage(message);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const messages = currentChat?.messages || [];
  const chatTitle = currentChat?.title || 'New Chat';



  return (
    <div className={`bg-chat-panel flex flex-col h-screen transition-all duration-300 ${
      sidebarCollapsed ? 'w-full' : 'flex-1'
    }`}>
      {/* Header */}
      <div className="bg-chat-panel border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {sidebarCollapsed && (
            <button
              onClick={onToggleSidebar}
              className="p-1.5 rounded-md hover:bg-gray-700 transition-colors"
              title="Show sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          )}
          <h2 className="text-lg font-semibold truncate">
            {chatTitle}
          </h2>
          {error && (
            <div className="flex items-center space-x-2 text-red-400 text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>Error: {error}</span>
              <button
                onClick={clearError}
                className="text-red-300 hover:text-red-100"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin bg-chat-panel">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 max-w-md">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Start a conversation</h3>
              <p>Send a message to begin chatting with Jarvis GPT</p>
            </div>
          </div>
        ) : (
          <div className="chat-container px-4 py-6">
            <div className="max-w-4xl mx-auto">
              {messages.map((message, index) => {
                return (
                  <MessageBubble
                    key={index}
                    message={message}
                    isLast={index === messages.length - 1}
                    onRegenerate={message.role === 'assistant' && index === messages.length - 1 ? regenerateLastMessage : undefined}
                  />
                );
              })}
              
              {/* Loading indicator for AI response */}
              {isLoading && (
                <LoadingIndicator 
                  type="typing" 
                  message="Jarvis is thinking..." 
                  size="medium"
                />
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-chat-panel border-t border-gray-700 p-4">
        <form onSubmit={handleSubmit} className="input-container">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={isLoading ? "Waiting for response..." : "Type your message... (Press Enter to send, Shift+Enter for new line)"}
              className={`chat-input transition-all duration-200 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
              rows={1}
              style={{ minHeight: '48px', maxHeight: '200px' }}
              disabled={isLoading}
            />
            {isLoading && (
              <div className="absolute inset-0 bg-gray-900 bg-opacity-20 rounded-lg pointer-events-none flex items-center justify-center">
                <div className="text-gray-400 text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                </div>
              </div>
            )}
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className={`absolute right-2 bottom-2 p-2 text-white rounded-lg transition-all duration-200 ${
                isLoading 
                  ? 'bg-gray-600 cursor-not-allowed animate-pulse' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800'
              } ${!inputValue.trim() ? 'bg-gray-600 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatArea;
