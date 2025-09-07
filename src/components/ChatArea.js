import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import MessageBubble from './MessageBubble';
import LoadingIndicator from './LoadingIndicator';
import fileProcessingService from '../services/fileProcessingService';

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
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

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

  // Generate suggestions after AI responses
  useEffect(() => {
    if (currentChat?.messages && currentChat.messages.length > 0) {
      const lastMessage = currentChat.messages[currentChat.messages.length - 1];
      
      // Show suggestions only after assistant messages and when not loading
      if (lastMessage?.role === 'assistant' && !isLoading) {
        const suggestions = generatePromptSuggestions(currentChat.messages);
        setSuggestedPrompts(suggestions);
        setShowSuggestions(suggestions.length > 0);
        
        // Auto-hide suggestions after 30 seconds
        setTimeout(() => {
          setShowSuggestions(false);
        }, 30000);
      } else if (lastMessage?.role === 'user') {
        // Hide suggestions when user sends a new message
        setShowSuggestions(false);
      }
    }
  }, [currentChat?.messages, isLoading]);

  // Enhanced keyboard shortcuts and productivity features
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Existing '/' functionality
      if (event.key === '/' && 
          !event.ctrlKey && 
          !event.altKey && 
          !event.metaKey &&
          document.activeElement.tagName !== 'INPUT' &&
          document.activeElement.tagName !== 'TEXTAREA') {
        event.preventDefault();
        textareaRef.current?.focus();
        return;
      }

      // Ctrl+K or Cmd+K to focus input (like Discord)
      if ((event.ctrlKey || event.metaKey) && event.key === 'k' &&
          document.activeElement.tagName !== 'INPUT' &&
          document.activeElement.tagName !== 'TEXTAREA') {
        event.preventDefault();
        textareaRef.current?.focus();
        return;
      }

      // Ctrl+U or Cmd+U to open file upload
      if ((event.ctrlKey || event.metaKey) && event.key === 'u' &&
          document.activeElement.tagName !== 'INPUT' &&
          document.activeElement.tagName !== 'TEXTAREA') {
        event.preventDefault();
        fileInputRef.current?.click();
        return;
      }

      // Escape to clear files or unfocus
      if (event.key === 'Escape') {
        if (uploadedFiles.length > 0) {
          setUploadedFiles([]);
          event.preventDefault();
        } else if (document.activeElement === textareaRef.current) {
          textareaRef.current?.blur();
        }
        return;
      }

      // Ctrl+Shift+V or Cmd+Shift+V to paste files from clipboard
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'V') {
        event.preventDefault();
        handleClipboardPaste();
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [uploadedFiles]);

  // Generate smart prompt suggestions based on chat context
  const generatePromptSuggestions = (messages) => {
    if (!messages || messages.length === 0) return [];
    
    const lastMessage = messages[messages.length - 1];
    const lastUserMessage = messages.filter(m => m.role === 'user').slice(-1)[0];
    const lastAssistantMessage = messages.filter(m => m.role === 'assistant').slice(-1)[0];
    
    // Context-aware suggestion generation
    const suggestions = [];
    
    // If last message was from assistant, suggest follow-ups
    if (lastMessage?.role === 'assistant') {
      const content = lastMessage.content?.toLowerCase() || '';
      
      // Code-related suggestions
      if (content.includes('code') || content.includes('function') || content.includes('```')) {
        suggestions.push(
          "Can you explain this code in more detail?",
          "Show me how to test this code",
          "What are potential issues with this approach?"
        );
      }
      
      // Problem-solving suggestions
      if (content.includes('solution') || content.includes('approach') || content.includes('method')) {
        suggestions.push(
          "What are alternative approaches?",
          "Can you provide a simpler solution?",
          "Show me step-by-step implementation"
        );
      }
      
      // Explanation-related suggestions
      if (content.includes('because') || content.includes('reason') || content.includes('explain')) {
        suggestions.push(
          "Can you give me an example?",
          "What are the pros and cons?",
          "How does this compare to other options?"
        );
      }
      
      // Learning-focused suggestions
      if (content.includes('learn') || content.includes('tutorial') || content.includes('guide')) {
        suggestions.push(
          "What should I learn next?",
          "Can you recommend resources?",
          "Give me practice exercises"
        );
      }
      
      // Error/debugging suggestions
      if (content.includes('error') || content.includes('bug') || content.includes('fix')) {
        suggestions.push(
          "How can I prevent this in the future?",
          "What are best practices for this?",
          "Show me debugging techniques"
        );
      }
      
      // General follow-up suggestions if no specific context
      if (suggestions.length === 0) {
        suggestions.push(
          "Can you elaborate on this?",
          "Show me a practical example",
          "What are the next steps?"
        );
      }
    }
    
    // Add context-specific suggestions based on user's last question
    if (lastUserMessage) {
      const userContent = lastUserMessage.content?.toLowerCase() || '';
      
      if (userContent.includes('how') && suggestions.length < 3) {
        suggestions.push("What are common mistakes to avoid?");
      }
      
      if (userContent.includes('what') && suggestions.length < 3) {
        suggestions.push("Can you show me an example?");
      }
      
      if (userContent.includes('why') && suggestions.length < 3) {
        suggestions.push("What are the benefits of this approach?");
      }
    }
    
    // Return up to 3 unique suggestions
    return [...new Set(suggestions)].slice(0, 3);
  };

  // Handle clicking on suggested prompts
  const handleSuggestionClick = async (suggestion) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    
    // Auto-send the suggestion after a brief delay for better UX
    setTimeout(async () => {
      try {
        // Use the same logic as handleSubmit but with the suggestion
        const content = suggestion.trim();
        if (!content) return;

        // Clear input and send message
        setInputValue('');
        setUploadedFiles([]);
        
        // Send message with suggestion
        await sendMessage(content);
        
        // Focus back on input for next message
        textareaRef.current?.focus();
      } catch (error) {
        console.error('Error sending suggested prompt:', error);
        // Restore the suggestion text on error
        setInputValue(suggestion);
      }
    }, 100);
  };

  // Enhanced file handling with progress and better validation
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const processedFiles = [];
      const maxFiles = 10; // Limit for productivity
      const filesToProcess = files.slice(0, maxFiles);
      
      if (files.length > maxFiles) {
        alert(`Only the first ${maxFiles} files will be processed.`);
      }
      
      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        
        // Enhanced validation
        const validation = fileProcessingService.validateFile(file, 50 * 1024 * 1024); // 50MB limit
        if (validation.length > 0) {
          console.warn(`Skipping ${file.name}: ${validation.join(', ')}`);
          continue;
        }

        try {
          // Process file with progress
          const result = await fileProcessingService.processFile(file, {
            onProgress: (progress) => {
              console.log(`Processing ${file.name}: ${progress.stage} ${progress.progress}%`);
            }
          });
          
          processedFiles.push({
            id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            size: file.size,
            type: file.type,
            content: result.text,
            chunks: result.chunks || [],
            uploadedAt: new Date()
          });
        } catch (fileError) {
          console.error(`Failed to process ${file.name}:`, fileError);
          alert(`Failed to process ${file.name}: ${fileError.message}`);
        }
      }
      
      if (processedFiles.length > 0) {
        setUploadedFiles(prev => [...prev, ...processedFiles]);
        
        // Show success notification
        const message = processedFiles.length === 1 
          ? `✅ ${processedFiles[0].name} uploaded successfully!`
          : `✅ ${processedFiles.length} files uploaded successfully!`;
        
        // You could add a toast notification here
        console.log(message);
      }
    } catch (error) {
      console.error('File upload error:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = ''; // Reset input
    }
  };

  // Handle clipboard paste for files
  const handleClipboardPaste = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      const files = [];
      
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith('image/')) {
            const blob = await clipboardItem.getType(type);
            const file = new File([blob], `pasted-image-${Date.now()}.png`, { type });
            files.push(file);
          }
        }
      }
      
      if (files.length > 0) {
        // Simulate file input for processing
        handleFileUpload({ target: { files } });
      } else {
        // Try to get text content
        const text = await navigator.clipboard.readText();
        if (text && text.length > 100) {
          // Create a text file from clipboard content
          const textBlob = new Blob([text], { type: 'text/plain' });
          const textFile = new File([textBlob], `clipboard-${Date.now()}.txt`, { type: 'text/plain' });
          handleFileUpload({ target: { files: [textFile] } });
        }
      }
    } catch (error) {
      console.warn('Clipboard access failed:', error);
    }
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Enhanced drag and drop with better tracking
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragOver) {
      setDragOver(true);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    if (!dragOver) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => {
      const newCount = prev - 1;
      if (newCount === 0) {
        setDragOver(false);
      }
      return newCount;
    });
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    setDragCounter(0);
    
    const dt = e.dataTransfer;
    const files = [];
    
    // Handle files
    if (dt.files && dt.files.length > 0) {
      files.push(...Array.from(dt.files));
    }
    
    // Handle directories (Chrome/Edge)
    if (dt.items) {
      const items = Array.from(dt.items);
      for (const item of items) {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file && !files.find(f => f.name === file.name && f.size === file.size)) {
            files.push(file);
          }
        }
      }
    }
    
    // Handle text drops (URLs, text content)
    if (files.length === 0) {
      const text = dt.getData('text/plain');
      const html = dt.getData('text/html');
      
      if (text || html) {
        const content = html || text;
        if (content.length > 50) {
          const blob = new Blob([content], { type: 'text/plain' });
          const file = new File([blob], `dropped-content-${Date.now()}.txt`, { type: 'text/plain' });
          files.push(file);
        } else {
          // Short text, add to input instead
          setInputValue(prev => prev + (prev ? ' ' : '') + text);
          return;
        }
      }
    }
    
    if (files.length > 0) {
      // Simulate file input for processing
      const input = fileInputRef.current;
      const dataTransfer = new DataTransfer();
      files.forEach(file => dataTransfer.items.add(file));
      input.files = dataTransfer.files;
      
      handleFileUpload({ target: input });
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (error) {
      clearError();
    }
    
    // Hide suggestions when user starts typing
    if (showSuggestions && e.target.value.length > 0) {
      setShowSuggestions(false);
    }
    
    // Typing indicator for productivity
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if ((!inputValue.trim() && uploadedFiles.length === 0) || isLoading) return;

    const messageContent = inputValue.trim();
    setInputValue('');

    // Prepare the message that will be shown to the user (ChatGPT style)
    let displayMessage = messageContent;
    if (uploadedFiles.length > 0) {
      const fileNames = uploadedFiles.map(file => file.name).join(', ');
      if (messageContent) {
        displayMessage = uploadedFiles.length === 1 
          ? `${messageContent}\n\n📎 ${fileNames}` 
          : `${messageContent}\n\n📎 ${uploadedFiles.length} files: ${fileNames}`;
      } else {
        displayMessage = uploadedFiles.length === 1 
          ? `📎 ${fileNames}` 
          : `📎 ${uploadedFiles.length} files: ${fileNames}`;
      }
    }

    // Prepare the full message with file content for AI processing
    let aiMessage = messageContent;
    if (uploadedFiles.length > 0) {
      const fileContext = uploadedFiles.map(file => 
        `[File: ${file.name}]\n${file.content}`
      ).join('\n\n');
      if (messageContent) {
        aiMessage = `${fileContext}\n\nUser Question: ${messageContent}`;
      } else {
        aiMessage = `${fileContext}\n\nPlease analyze these files and provide insights or answer any questions about them.`;
      }
    }

    // For now, send the display message and let the AI work with what it gets
    // In a real ChatGPT implementation, this would be handled on the backend
    if (uploadedFiles.length > 0) {
      // Send display message to user, but AI content for processing
      await sendMessage(displayMessage, aiMessage);
    } else {
      await sendMessage(displayMessage);
    }
    
    // Clear uploaded files after sending
    setUploadedFiles([]);
  };

  const handleKeyDown = (e) => {
    // Send message on Enter (not Shift+Enter)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
      return;
    }
    
    // Ctrl+Enter or Cmd+Enter to send (alternative)
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e);
      return;
    }
    
    // Tab to autocomplete or indent (basic)
    if (e.key === 'Tab' && !e.shiftKey) {
      // For code-like content, allow tab indentation
      if (inputValue.includes('```') || inputValue.includes('function') || inputValue.includes('class')) {
        e.preventDefault();
        const start = e.target.selectionStart;
        const end = e.target.selectionEnd;
        const newValue = inputValue.substring(0, start) + '  ' + inputValue.substring(end);
        setInputValue(newValue);
        setTimeout(() => {
          e.target.selectionStart = e.target.selectionEnd = start + 2;
        }, 0);
      }
    }
    
    // Ctrl+A or Cmd+A to select all
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      // Let default behavior happen
      return;
    }
    
    // Ctrl+Z or Cmd+Z for undo (enhance with custom undo)
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      // Could implement custom undo here
      return;
    }
  };

  const messages = currentChat?.messages || [];
  const chatTitle = currentChat?.title || 'New Chat';



  return (
    <div 
      className={`bg-chat-panel flex flex-col h-screen transition-all duration-300 ${
        sidebarCollapsed ? 'w-full' : 'flex-1'
      } relative`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Enhanced drag overlay with file type indicators */}
      {dragOver && (
        <div className="absolute inset-0 bg-blue-600/20 border-2 border-dashed border-blue-500 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="text-center">
            <svg className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-blue-400 text-lg font-medium mb-2">Drop files here to upload</p>
            <p className="text-blue-300 text-sm">Supports PDFs, Office docs, documents, code files, images, and more</p>
            <div className="mt-4 flex justify-center space-x-4 text-xs text-blue-300">
              <span>📄 Documents</span>
              <span>📘 Office</span>
              <span>💻 Code</span>
              <span>🖼️ Images</span>
              <span>📊 Data</span>
            </div>
          </div>
        </div>
      )}
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
        {/* Uploaded Files Display - ChatGPT Style */}
        {uploadedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center bg-gray-800 rounded-lg px-3 py-2 text-sm border border-gray-600">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-gray-300">{file.name}</span>
                <button
                  onClick={() => removeFile(index)}
                  className="ml-2 text-gray-500 hover:text-gray-300 transition-colors"
                  title="Remove file"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Smart prompt suggestions */}
        {showSuggestions && suggestedPrompts.length > 0 && (
          <div className="mb-3 px-4">
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="group bg-gray-800/50 hover:bg-gray-700/70 border border-gray-600/50 hover:border-gray-500 rounded-lg px-3 py-2 text-sm text-gray-300 hover:text-white transition-all duration-200 hover:scale-105 hover:shadow-lg backdrop-blur-sm"
                  title="Click to send this prompt"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-3 h-3 text-gray-500 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="leading-relaxed">{suggestion}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Suggested follow-up prompts based on our conversation
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="input-container">
          <div className="relative">
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              multiple
              accept=".txt,.md,.csv,.json,.html,.xml,.pdf,.rtf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.odt,.ods,.odp,.py,.js,.ts,.jsx,.tsx,.java,.cpp,.c,.cs,.php,.rb,.go,.rs,.kt,.swift,.scala,.sql,.yaml,.yml,.toml,.ini,.cfg,.conf,.log,.sh,.bash,.bat,.ps1,.r,.tex,.lua,.dart,.elm,.hs,.ml,.pas,.cob,.lisp,.scm,.tcl,.vhdl,.v"
            />
            
            {/* File upload button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute left-3 bottom-3 p-1.5 text-gray-400 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors z-10"
              title="Upload files"
            >
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              )}
            </button>
            
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={isLoading ? "Waiting for response..." : "Type your message... (Press Enter to send, Shift+Enter for new line)"}
              className={`chat-input transition-all duration-200 pl-12 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
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
              disabled={(!inputValue.trim() && uploadedFiles.length === 0) || isLoading}
              className={`absolute right-2 bottom-2 p-2 text-white rounded-lg transition-all duration-200 ${
                isLoading 
                  ? 'bg-gray-600 cursor-not-allowed animate-pulse' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800'
              } ${(!inputValue.trim() && uploadedFiles.length === 0) ? 'bg-gray-600 cursor-not-allowed' : ''}`}
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
