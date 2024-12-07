import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Employee, Payment } from '../types';

interface EmployeeStore {
  employees: Employee[];
  payments: Payment[];
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  addPayment: (payment: Omit<Payment, 'id'>) => void;
}

export const useEmployeeStore = create<EmployeeStore>()(
  persist(
    (set) => ({
      employees: [],
      payments: [],
      addEmployee: (employee) =>
        set((state) => ({
          employees: [...state.employees, { ...employee, id: uuidv4() }],
        })),
      addPayment: (payment) =>
        set((state) => ({
          payments: [...state.payments, { ...payment, id: uuidv4() }],
        })),
    }),
    {
      name: 'employee-storage',
    }
  )
);