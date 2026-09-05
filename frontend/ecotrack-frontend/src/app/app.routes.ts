import { Routes } from '@angular/router';

import { Landing } from './features/landing/pages/landing/landing';

import { Login } from './features/auth/pages/login/login';
import { Signup } from './features/auth/pages/signup/signup';
import { Otp } from './features/auth/pages/otp/otp';
import { ForgotPassword } from './features/auth/pages/forgot-password/forgot-password';
import { ResetPassword } from './features/auth/pages/reset-password/reset-password';

import { DashboardLayout } from './shared/layouts/dashboard-layout/dashboard-layout';
import { DashboardHome } from './features/dashboard/pages/dashboard-home/dashboard-home';
import { Activities } from './features/activities/pages/activities/activities';
import { Goals } from './features/goals/pages/goals/goals';
import { Reports } from './features/reports/pages/reports/reports';
import { Analytics } from './features/analytics/pages/analytics/analytics';
import { Leaderboard } from './features/leaderboard/pages/leaderboard/leaderboard';
import { AchievementsComponent } from './features/achievements/pages/achievements/achievements.component';
import { ChallengesComponent } from './features/challenges/pages/challenges/challenges.component';
import { Notifications } from './features/notifications/pages/notifications/notifications';
import { Profile } from './features/profile/pages/profile/profile';
import { Settings } from './features/settings/pages/settings/settings';
import { CarbonTracker } from './features/carbon-tracker/pages/carbon-tracker/carbon-tracker';
import { AiAssistant } from './features/ai-assistant/pages/ai-assistant/ai-assistant';

import { AuthLayout } from './shared/layouts/auth-layout/auth-layout';

import { AdminLayout } from './shared/layouts/admin-layout/admin-layout';
import { AdminDashboard } from './features/admin/pages/admin-dashboard/admin-dashboard';

import { AdminUsers } from './features/admin/pages/admin-users/admin-users';
import { AdminChallenges } from './features/admin/pages/admin-challenges/admin-challenges';
import { AdminAnalytics } from './features/admin/pages/admin-analytics/admin-analytics';
import { AdminReports } from './features/admin/pages/admin-reports/admin-reports';

import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [

  {
    path: '',
    component: Landing
  },

  {
    path: '',
    component: AuthLayout,
    children: [
      { path: 'login', component: Login },
      { path: 'signup', component: Signup },
      { path: 'otp', component: Otp },
      { path: 'forgot-password', component: ForgotPassword },
      { path: 'reset-password', component: ResetPassword }
    ]
  },

  {
    path: 'dashboard',
    component: DashboardLayout,
    canActivate: [authGuard],
    children: [
      { path: '', component: DashboardHome },
      { path: 'activities', component: Activities },
      { path: 'goals', component: Goals },
      { path: 'reports', component: Reports },
      { path: 'analytics', component: Analytics },
      { path: 'leaderboard', component: Leaderboard },
      { path: 'achievements', component: AchievementsComponent },
      { path: 'challenges', component: ChallengesComponent },
      { path: 'notifications', component: Notifications },
      { path: 'profile', component: Profile },
      { path: 'settings', component: Settings },
      { path: 'carbon-tracker', component: CarbonTracker },
      { path: 'ai-assistant', component: AiAssistant }
    ]
  },

  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboard },
      { path: 'users', component: AdminUsers },
      { path: 'challenges', component: AdminChallenges },
      { path: 'analytics', component: AdminAnalytics },
      { path: 'reports', component: AdminReports }
    ]
  },

  {
    path: '**',
    redirectTo: ''
  }

];
