export const API_ENDPOINTS = {

  AUTH: {
    LOGIN: '/api/v1/auth/login',
    SIGNUP: '/api/v1/auth/signup'
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
  BASE: '...',
  BY_ID: (id: number) => `.../${id}`
},

  NOTIFICATIONS: {
    BASE: '/api/v1/notifications'
  },

  RECOMMENDATIONS: {
    BASE: '/api/v1/recommendations'
  }

};
