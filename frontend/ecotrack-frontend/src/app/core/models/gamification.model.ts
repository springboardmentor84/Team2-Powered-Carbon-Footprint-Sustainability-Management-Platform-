export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  pointsRequired: number;
  unlocked: boolean;
}

export interface Reward {
  id: number;
  name: string;
  description: string;
  pointsRequired: number;
  icon: string;
}

export interface ChallengePreview {
  id: number;
  title: string;
  description: string;
  target: number;
  unit: string;
  progress: number;
  rewardPoints: number;
}

export interface GamificationSummary {
  ecoPoints: number;
  currentLevel: number;
  levelName: string;
  pointsToNextLevel: number;
  progressPercentage: number;
  earnedBadges: Badge[];
  lockedBadges: Badge[];
  availableRewards: Reward[];
  activeChallenges: ChallengePreview[];
}
