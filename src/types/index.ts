export interface Employee {
  id: string;
  employeeId: string;
  password: string;
  name: string;
  monthlySalary: number;
  startDate: string;
  role: 'admin' | 'employee';
}

export interface Payment {
  id: string;
  employeeId: string;
  date: string;
  amount: number;
  note: string;
  type: 'salary' | 'advance';
  operation: 'plus' | 'minus';
}

export interface SidebarItem {
  name: string;
  icon: React.ComponentType;
  path: string;
  roles: ('admin' | 'employee')[];
}

export interface AuthState {
  user: Employee | null;
  isAuthenticated: boolean;
}

export interface DateRange {
  start: string;
  end: string;
}