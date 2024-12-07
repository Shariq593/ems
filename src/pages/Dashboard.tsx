import React, { useState } from 'react';
import { useEmployeeStore } from '../store/employeeStore';
import { useAuthStore } from '../store/authStore';
import { calculateAdvance } from '../utils';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';
import { Eye, EyeOff } from 'lucide-react';

export default function Dashboard() {
  const { employees, payments } = useEmployeeStore();
  const { user } = useAuthStore();
  const [hiddenCards, setHiddenCards] = useState<Record<string, boolean>>({});

  const filteredEmployees = user?.role === 'admin'
    ? employees.filter(emp => emp.role !== 'admin')
    : employees.filter(emp => emp.id === user?.id);

  const getLastPaymentDate = (employeeId: string) => {
    const employeePayments = payments
      .filter(payment => payment.employeeId === employeeId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return employeePayments[0]?.date || null;
  };

  const toggleCardVisibility = (employeeId: string) => {
    setHiddenCards(prev => ({
      ...prev,
      [employeeId]: !prev[employeeId]
    }));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => {
          const totalAdvance = calculateAdvance(payments, employee.id);
          const lastPaymentDate = getLastPaymentDate(employee.id);
          const isHidden = hiddenCards[employee.id];
          
          return (
            <div
              key={employee.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{employee.name}</h3>
                  <button
                    onClick={() => toggleCardVisibility(employee.id)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {isHidden ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Monthly Salary</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {isHidden ? '••••••' : formatCurrency(employee.monthlySalary)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Total Advance</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {isHidden ? '••••••' : formatCurrency(totalAdvance)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Start Date</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatDate(employee.startDate)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Last Payment</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {lastPaymentDate 
                        ? formatDate(lastPaymentDate)
                        : 'No payments yet'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}