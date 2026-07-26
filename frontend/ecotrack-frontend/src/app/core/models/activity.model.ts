export interface Activity {

  id: number;

  activity: string;

  category: string;

  carbonSaved: number;

  date: string;

  status: 'Completed' | 'Pending';

}
