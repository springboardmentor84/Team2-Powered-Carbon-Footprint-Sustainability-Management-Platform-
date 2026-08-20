export interface Challenge {
  id: number;
  title: string;
  description: string;
  category: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  target: number;
  unit: string;
  rewardPoints: number;
}

export interface ChallengeParticipation {
  id: number;
  challengeId: number;
  challengeTitle: string;
  userId: number;
  userName: string;
  joinedAt: string; // ISO string
  status: string; // 'JOINED' or 'LEFT'
}

export interface ChallengeProgress {
  challengeId: number;
  challengeTitle: string;
  target: number;
  currentProgress: number;
  unit: string;
  completionPercentage: number;
  participationStatus: string;
  challengeStatus: string; // 'COMPLETED', 'IN_PROGRESS', 'EXPIRED', 'NOT_STARTED'
  rewardGranted: boolean;
}

export interface ChallengeLeaderboardEntry {
  userId: number;
  userName: string;
  progress: number;
  unit: string;
  rank: number;
}
