const aiService = {
  // Configuration for conversation memory
  config: {
    maxContextMessages: 10, // Maximum number of previous messages to include
    contextFormat: 'detailed', // 'simple', 'detailed', or 'summary'
    enableMemory: true // Toggle conversation memory on/off
  },
  /**
   * Send messages to the AI API and get a response
   * @param {Array} messages - Array of message objects with role and content
   * @returns {Object} AI response message object
   */
  async sendMessage(messages) {
    const apiUrl = process.env.REACT_APP_AI_API_URL;
    
    if (!apiUrl) {
      throw new Error('AI API URL is not configured. Please set REACT_APP_AI_API_URL in your .env file.');
    }

    try {
      console.log('[aiService] Sending request to:', apiUrl);
      console.log('[aiService] Messages:', messages);

      // Build conversation context from all messages
      const conversationContext = this.buildConversationContext(messages);
      const lastUserMessage = messages.filter(msg => msg.role === 'user').pop();
      
      if (!lastUserMessage || !lastUserMessage.content.trim()) {
        throw new Error('No message content to send');
      }

      // Try sending with conversation context first
      let requestBody;
      if (conversationContext && conversationContext.trim()) {
        // Include conversation history in the message
        requestBody = {
          message: `Context: ${conversationContext}\n\nCurrent message: ${lastUserMessage.content}`
        };
      } else {
        // Fallback to just the current message
        requestBody = {
          message: lastUserMessage.content
        };
      }

      console.log('[aiService] Request body:', requestBody);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[aiService] API Error:', response.status, errorText);
        throw new Error(`AI API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('[aiService] API Response:', data);

      // Check if the API response is successful
      if (!data.success) {
        throw new Error('API returned unsuccessful response');
      }

      // Extract the AI response from your API's response format
      const aiMessage = {
        role: 'assistant',
        content: data.data?.response || 'Sorry, I could not generate a response.',
        timestamp: new Date().toISOString(),
        provider: data.data?.provider,
        model: data.data?.model,
        responseTime: data.data?.responseTime
      };

      return aiMessage;
    } catch (error) {
      console.error('[aiService] Error in sendMessage:', error);
      
      // Return a user-friendly error message
      return {
        role: 'assistant',
        content: `I'm sorry, but I encountered an error while processing your request: ${error.message}`,
        timestamp: new Date().toISOString(),
        error: true
      };
    }
  },

  /**
   * Build conversation context from message history
   * @param {Array} messages - Array of message objects
   * @returns {String} Formatted conversation context
   */
  buildConversationContext(messages) {
    if (!this.config.enableMemory || !messages || messages.length <= 1) {
      return '';
    }

    // Get all messages except the last one (which is the current user message)
    const historyMessages = messages.slice(0, -1);
    
    if (historyMessages.length === 0) {
      return '';
    }

    // Limit the number of messages to include in context
    const limitedHistory = historyMessages.slice(-this.config.maxContextMessages);

    // Format based on the selected format
    switch (this.config.contextFormat) {
      case 'simple':
        return this.buildSimpleContext(limitedHistory);
      case 'detailed':
        return this.buildDetailedContext(limitedHistory);
      case 'summary':
        return this.buildSummaryContext(limitedHistory);
      default:
        return this.buildDetailedContext(limitedHistory);
    }
  },

  /**
   * Build simple conversation context (just the content)
   */
  buildSimpleContext(messages) {
    return messages.map(msg => `${msg.role === 'user' ? 'Q' : 'A'}: ${msg.content}`).join('\n');
  },

  /**
   * Build detailed conversation context with timestamps
   */
  buildDetailedContext(messages) {
    const contextLines = messages.map(msg => {
      const role = msg.role === 'user' ? 'User' : 'Assistant';
      const timestamp = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : '';
      return `${role}${timestamp ? ` (${timestamp})` : ''}: ${msg.content}`;
    });

    return `Previous conversation:\n${contextLines.join('\n')}`;
  },

  /**
   * Build summary context (summarize if too many messages)
   */
  buildSummaryContext(messages) {
    if (messages.length <= 3) {
      return this.buildDetailedContext(messages);
    }

    // For longer conversations, provide a summary of earlier messages and detailed recent ones
    const recentMessages = messages.slice(-3);
    const olderMessagesCount = messages.length - 3;
    
    const recentContext = this.buildDetailedContext(recentMessages);
    const summary = `[Earlier in conversation: ${olderMessagesCount} exchanges about ${this.extractTopics(messages.slice(0, -3))}]`;
    
    return `${summary}\n\n${recentContext}`;
  },

  /**
   * Extract main topics from messages (simple keyword extraction)
   */
  extractTopics(messages) {
    const allText = messages.map(msg => msg.content).join(' ').toLowerCase();
    
    // Simple topic extraction - could be enhanced with more sophisticated NLP
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'];
    
    const words = allText.match(/\b\w{4,}\b/g) || [];
    const significantWords = words.filter(word => !commonWords.includes(word));
    
    // Get the most common significant words
    const wordCount = {};
    significantWords.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    const topWords = Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);
    
    return topWords.length > 0 ? topWords.join(', ') : 'various topics';
  },

  /**
   * Generate a chat title based on the conversation messages
   * @param {Array} messages - Array of message objects
   * @returns {String} Generated title
   */
  async generateChatTitle(messages) {
    try {
      // Use the first user message as a basis for the title
      const firstUserMessage = messages.find(msg => msg.role === 'user');
      
      if (!firstUserMessage) {
        return 'New Chat';
      }

      const apiUrl = process.env.REACT_APP_AI_API_URL;
      
      if (!apiUrl) {
        // Fallback: generate a simple title from the first message
        return this.generateSimpleTitle(firstUserMessage.content);
      }

      // Create a prompt for title generation using your API format
      const titlePrompt = `Generate a concise, descriptive title (maximum 6 words) for this conversation based on this message: "${firstUserMessage.content}". Return only the title, nothing else.`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: titlePrompt
        }),
      });

      if (!response.ok) {
        console.warn('[aiService] Title generation failed, using fallback');
        return this.generateSimpleTitle(firstUserMessage.content);
      }

      const data = await response.json();
      
      if (data.success && data.data?.response) {
        const generatedTitle = data.data.response.trim();
        return generatedTitle || this.generateSimpleTitle(firstUserMessage.content);
      } else {
        return this.generateSimpleTitle(firstUserMessage.content);
      }
    } catch (error) {
      console.error('[aiService] Error generating title:', error);
      // Fallback to simple title generation
      const firstUserMessage = messages.find(msg => msg.role === 'user');
      return this.generateSimpleTitle(firstUserMessage?.content || 'Chat');
    }
  },

  /**
   * Generate a simple title from the message content
   * @param {String} content - Message content
   * @returns {String} Simple title
   */
  generateSimpleTitle(content) {
    if (!content) return 'New Chat';
    
    // Clean and truncate the content
    const cleanContent = content
      .replace(/[^\w\s]/gi, '') // Remove special characters
      .trim()
      .split(' ')
      .slice(0, 4) // Take first 4 words
      .join(' ');
    
    return cleanContent || 'New Chat';
  },

  /**
   * Test the AI API connection
   * @returns {Boolean} Connection status
   */
  async testConnection() {
    try {
      const apiUrl = process.env.REACT_APP_AI_API_URL;
      
      if (!apiUrl) {
        return false;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Hello'
        }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error('[aiService] Connection test failed:', error);
      return false;
    }
  },

  /**
   * Update conversation memory configuration
   * @param {Object} newConfig - Configuration options
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('[aiService] Configuration updated:', this.config);
  },

  /**
   * Get current configuration
   * @returns {Object} Current configuration
   */
  getConfig() {
    return { ...this.config };
  }
};

export default aiService;