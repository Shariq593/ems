export interface Employee {
  _id : string;
  id?: string;
  employeeId: string;
  password: string;
  name: string;
  monthlySalary: number;
  startDate: string;
  role: 'admin' | 'employee';
}

export interface Payment {
  _id? : string;
  id: string;
  employeeId: string;
  date: string;
  amount: number;
  description: string;
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

export interface User {
  id: string;
  employeeId: string;
  role: "admin" | "employee";

}

export interface PaymentFormData {
  employeeId: string;
  date: string;
  amount: number;
  description: string;
}

export interface NewPaymentRequest extends PaymentFormData {
  type: 'salary' | 'advance';
  operation: 'plus' | 'minus';
}

export interface PaymentData {
  employeeId: string;
  date: string;
  amount: number;
  note: string;
  operation: 'plus' | 'minus';
  type: string; // For advance payments, this will be "advance"
}

export interface SalaryPaymentData {
  employeeId: string;
  date: string;
  amount: number;
  note: string;
}