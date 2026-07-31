export interface Goal {

  id: number;

  userId: number;

  title: string;

  targetValue: number;

  currentValue: number;

  progressPercentage: number;

  unit: string;

  startDate: string;

  targetDate: string;

  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED';

  createdAt: string;

  updatedAt: string;

}
