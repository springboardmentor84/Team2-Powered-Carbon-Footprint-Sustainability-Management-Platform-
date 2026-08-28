export const API_ENDPOINTS = {

  AUTH: {
    LOGIN: '/api/v1/auth/login',
    SIGNUP: '/api/v1/auth/signup',

    // Password management
    CHANGE_PASSWORD: '/api/v1/auth/change-password',

    // Account management
    DEACTIVATE_ACCOUNT: '/api/v1/auth/deactivate-account',

    // Password recovery
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    VERIFY_OTP: '/api/v1/auth/verify-otp',
    RESET_PASSWORD: '/api/v1/auth/reset-password'
  },

  CARBON: {
    BASE: '/api/v1/carbon',

    BY_ID: (id: number) =>
      `/api/v1/carbon/${id}`
  },

  DASHBOARD: {
    SUMMARY: '/api/v1/dashboard/summary',
    CATEGORY: '/api/v1/dashboard/category',
    DAILY: '/api/v1/dashboard/daily',
    WEEKLY: '/api/v1/dashboard/weekly',
    MONTHLY: '/api/v1/dashboard/monthly',
    RECENT: '/api/v1/dashboard/recent'
  },

  USER: {
    PROFILE: '/api/v1/user/profile',
    PREFERENCES: '/api/v1/user/preferences',
    PROFILE_IMAGE: '/api/v1/user/profile/image'
  },

  LEADERBOARD: {
    BASE: '/api/v1/leaderboard',
    ME: '/api/v1/leaderboard/me'
  },

  BADGES: {
    BASE: '/api/v1/badges'
  },

  GOALS: {
    BASE: '/api/v1/goals',
    BY_ID: (id: number) =>
      `/api/v1/goals/${id}`
  },

  GAMIFICATION: {
    BASE: '/api/v1/gamification'
  },

  REWARDS: {
    BASE: '/api/v1/rewards'
  },

  CHALLENGES: {
    BASE: '/api/v1/challenges'
  },

  NOTIFICATIONS: {
    BASE: '/api/v1/notifications'
  },

  RECOMMENDATIONS: {
    BASE: '/api/v1/recommendations'
  }

};
