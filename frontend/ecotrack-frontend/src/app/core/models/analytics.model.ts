export interface CategoryEmission {
  category: string;
  totalEmission: number;
}

export interface AnalyticsResponse {
  totalActivities: number;
  totalEmissions: number;
  averageEmissions: number;
  topCategory: string;
  monthlyEmissions: { [month: number]: number };
  categoryBreakdown: CategoryEmission[];
}