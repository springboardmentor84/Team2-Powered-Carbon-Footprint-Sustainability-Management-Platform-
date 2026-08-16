export interface DashboardSummary {

  totalCarbonSaved: number;

  totalActivities: number;

  sustainabilityScore: number;

  goalProgress: number;

  currentStreak?: number;

}

export interface MonthlyCarbonSummary {

  month: string;

  carbonSaved: number;

}

export interface WeeklyCarbonSummary {

  day: string;

  carbonSaved: number;

}
export interface SustainabilityScore {

  score: number;

  level: string;

  progress: number;

}
