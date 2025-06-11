export const CONFIG = {
  // Usage limits
  FREE_DAILY_LIMIT: 10,
  
  // Premium pricing
  PREMIUM_MONTHLY_PRICE: 500, // 500 yen
  
  // LLM Settings
  MAX_MESSAGE_LENGTH: 1000,
  CONVERSATION_CONTEXT_LIMIT: 10, // Number of previous messages to include
  
  // Audio settings
  SPEECH_TIMEOUT: 30000, // 30 seconds
  
  // UI settings
  TYPING_ANIMATION_DELAY: 50,
  
  // Mood scale
  MOOD_SCALE: {
    MIN: 1,
    MAX: 10,
  },
} as const;