export interface Place {
  id: number;
  name: string;
  description: string;
}

export interface Day {
  id: number;
  date: string;
  weather_condition?: string;
  places: Place[];
}

export interface Expense {
  id: number;
  title: string;
  amount: string;
  category: string;
}

export interface Trip {
  id: number;
  destination: string;
  start_date: string;
  end_date: string;
  budget: string;
  number_of_people: number;
  days: Day[];
  expenses?: Expense[];
  budget_alert?: string;
}