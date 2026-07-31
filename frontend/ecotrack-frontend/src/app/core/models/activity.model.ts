export interface Activity {

  id: number;

  title: string;

  category: string;

  carbon: number;

  date: string;

  status: 'Completed' | 'Pending';

}
