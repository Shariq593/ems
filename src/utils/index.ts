import { Payment } from '../types';

export const calculateAdvance = (payments: Payment[], employeeId: string): number => {
  return payments
    .filter((payment) => payment.employeeId === employeeId && payment.type === 'advance')
    .reduce((sum, payment) => {
      const amount = payment.amount;
      return sum + (payment.operation === 'plus' ? amount : -amount);
    }, 0);
};

export const calculateTotalSalary = (payments: Payment[]): number => {
  return payments.reduce((sum, payment) => {
    const amount = payment.amount;
    return sum + (payment.operation === 'plus' ? amount : -amount);
  }, 0);
};