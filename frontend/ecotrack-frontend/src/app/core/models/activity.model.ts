export interface Activity {
  id: number;

  title: string;
  activity: string;

  category: string;

  quantity: number;
  unit: string;

  carbon: number;
  carbonEmission: number;

  date: string;
  notes: string;

  createdAt: string;
  updatedAt: string;
}

export interface CarbonEntryRequest {
  category: string;
  activity: string;
  quantity: number;
  unit: string;
}

export interface CarbonEntryResponse {
  id: number;
  category: string;
  activity: string;
  quantity: number;
  unit: string;
  carbonEmission: number;
  createdAt: string;
  updatedAt: string;
}
