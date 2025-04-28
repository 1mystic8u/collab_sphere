// src/config/aiConfig.js

/**
 * Configuration for Google Generative AI integration
 */
export default {
    // Function to safely get the API key from environment variables
    getApiKey: () => {
      const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
      
      if (!apiKey) {
        console.warn('Google AI API key is not set. Please add VITE_GOOGLE_AI_API_KEY to your .env file.');
        return null;
      }
      
      return apiKey;
    },
    
    // AI settings
    settings: {
      defaultModel: 'gemini-2.0-flash',
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
    
    // Helper function for error handling
    handleAiError: (error) => {
      console.error('AI API Error:', error);
      
      // Extract the most useful error message
      if (error.response) {
        return `API Error: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`;
      }
      
      if (error.message) {
        return `Error: ${error.message}`;
      }
      
      return 'An unknown error occurred while processing your request.';
    }
  };