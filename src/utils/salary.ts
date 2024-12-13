import { differenceInDays, parseISO } from 'date-fns';
import { Payment, DateRange } from '../types';

export const calculateSalaryForPeriod = (
  monthlySalary: number,
  presentDays: number,
  totalDays: number
): number => {
  if (totalDays === 0) return 0;
  
  // Calculate daily salary
  const dailySalary = monthlySalary / totalDays;
  
  // Calculate deduction for absent days
  const absentDays = totalDays - presentDays;
  const absentDeduction = dailySalary * absentDays;
  
  // Return salary after absent days deduction
  return monthlySalary - absentDeduction;
};

export const calculatePaidSalaryForPeriod = (
  payments: Payment[], // Use the Payment type
  employeeId: string,
  dateRange: DateRange
): number => {
  return payments
    .filter(
      (payment) =>
        payment.employeeId === employeeId &&
        payment.type === "salary" &&
        payment.date >= dateRange.start &&
        payment.date <= dateRange.end
    )
    .reduce((sum, payment) => sum + payment.amount, 0);
};


export const calculateTotalDays = (dateRange: DateRange): number => {
  const start = parseISO(dateRange.start);
  const end = parseISO(dateRange.end);
  return differenceInDays(end, start) + 1;
};