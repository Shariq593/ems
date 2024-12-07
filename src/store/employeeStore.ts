import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Employee, Payment } from '../types';

// Default admin user
const defaultAdmin: Employee = {
  id: 'admin-1',
  employeeId: 'admin',
  password: 'admin123',
  name: 'System Admin',
  monthlySalary: 0,
  startDate: new Date().toISOString().split('T')[0],
  role: 'admin'
};

interface EmployeeStore {
  employees: Employee[];
  payments: Payment[];
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  deletePayment: (id: string) => void;
  reset: () => void;
}

export const useEmployeeStore = create<EmployeeStore>()(
  persist(
    (set, get) => ({
      employees: [defaultAdmin],
      payments: [],
      addEmployee: (employee) =>
        set((state) => ({
          employees: [...state.employees, { ...employee, id: uuidv4() }],
        })),
      updateEmployee: (id, employee) =>
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === id ? { ...emp, ...employee } : emp
          ),
        })),
      deleteEmployee: (id) =>
        set((state) => {
          // Don't delete if it's the admin user
          const employeeToDelete = state.employees.find(emp => emp.id === id);
          if (employeeToDelete?.role === 'admin') {
            return state;
          }
          
          return {
            employees: state.employees.filter((emp) => emp.id !== id),
            payments: state.payments.filter((payment) => payment.employeeId !== id),
          };
        }),
      addPayment: (payment) =>
        set((state) => ({
          payments: [...state.payments, { ...payment, id: uuidv4() }],
        })),
      deletePayment: (id) =>
        set((state) => ({
          payments: state.payments.filter((payment) => payment.id !== id),
        })),
      reset: () => set({ employees: [defaultAdmin], payments: [] }),
    }),
    {
      name: 'employee-storage',
      onRehydrateStorage: () => (state) => {
        // Ensure admin user always exists after rehydration
        if (state && !state.employees.some(emp => emp.role === 'admin')) {
          state.employees.push(defaultAdmin);
        }
      },
    }
  )
);