import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEmployeeStore } from '../store/employeeStore';
import { calculateSalaryForPeriod, calculatePaidSalaryForPeriod, calculateTotalDays } from '../utils/salary';
import { formatCurrency } from '../utils/currency';

const calculatorSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  presentDays: z.number().min(0, 'Present days must be non-negative'),
});

const paymentSchema = z.object({
  paymentDate: z.string().min(1, 'Payment date is required'),
});

type CalculatorFormData = z.infer<typeof calculatorSchema>;
type PaymentFormData = z.infer<typeof paymentSchema>;

interface SalaryCalculatorProps {
  onClose: () => void;
}

interface CalculationResult {
  employeeId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  baseSalary: number;
  absentDeduction: number;
  paidSalary: number;
  remainingSalary: number;
}

export default function SalaryCalculator({ onClose }: SalaryCalculatorProps) {
  const { employees, payments, addPayment } = useEmployeeStore();
  const [calculation, setCalculation] = useState<CalculationResult | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const {
    register: registerCalculator,
    handleSubmit: handleSubmitCalculator,
    formState: { errors: calculatorErrors },
  } = useForm<CalculatorFormData>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      presentDays: 0,
    },
  });

  const {
    register: registerPayment,
    handleSubmit: handleSubmitPayment,
    formState: { errors: paymentErrors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentDate: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = (data: CalculatorFormData) => {
    const employee = employees.find((emp) => emp.id === data.employeeId);
    if (!employee) return;

    const dateRange = { start: data.startDate, end: data.endDate };
    const totalDays = calculateTotalDays(dateRange);
    const absentDays = totalDays - data.presentDays;
    const baseSalary = employee.monthlySalary;
    const calculatedSalary = calculateSalaryForPeriod(baseSalary, data.presentDays, totalDays);
    const paidSalary = calculatePaidSalaryForPeriod(payments, employee.id, dateRange);
    const absentDeduction = baseSalary - calculatedSalary;
    
    setCalculation({
      employeeId: employee.id,
      startDate: data.startDate,
      endDate: data.endDate,
      totalDays,
      presentDays: data.presentDays,
      absentDays,
      baseSalary,
      absentDeduction,
      paidSalary,
      remainingSalary: calculatedSalary - paidSalary,
    });
  };

  const handlePaySalary = (paymentData: PaymentFormData) => {
    if (!calculation || calculation.remainingSalary <= 0 || isPaid) return;

    const note = `Salary paid for period ${calculation.startDate} to ${calculation.endDate}\n\n` +
      `Total Days: ${calculation.totalDays}\n` +
      `Present Days: ${calculation.presentDays}\n` +
      `Absent Days: ${calculation.absentDays}\n` +
      `Base Salary: ${formatCurrency(calculation.baseSalary)}\n` +
      `Absent Deduction: ${formatCurrency(calculation.absentDeduction)}\n` +
      `Already Paid: ${formatCurrency(calculation.paidSalary)}`;

    addPayment({
      employeeId: calculation.employeeId,
      date: paymentData.paymentDate,
      amount: calculation.remainingSalary,
      type: 'salary',
      operation: 'plus',
      note,
    });

    setIsPaid(true);
    setShowPaymentForm(false);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmitCalculator(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Employee
          </label>
          <select
            id="employeeId"
            {...registerCalculator('employeeId')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Select an employee</option>
            {employees.filter(emp => emp.role !== 'admin').map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
          {calculatorErrors.employeeId && (
            <p className="mt-1 text-sm text-red-600">{calculatorErrors.employeeId.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              {...registerCalculator('startDate')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            {calculatorErrors.startDate && (
              <p className="mt-1 text-sm text-red-600">{calculatorErrors.startDate.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              {...registerCalculator('endDate')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            {calculatorErrors.endDate && (
              <p className="mt-1 text-sm text-red-600">{calculatorErrors.endDate.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="presentDays" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Present Days
          </label>
          <input
            type="number"
            id="presentDays"
            {...registerCalculator('presentDays', { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {calculatorErrors.presentDays && (
            <p className="mt-1 text-sm text-red-600">{calculatorErrors.presentDays.message}</p>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Calculate
          </button>
        </div>
      </form>

      {calculation && (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Calculation Details</h3>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Attendance</h4>
              <div className="mt-1 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Days</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {calculation.totalDays}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Present Days</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {calculation.presentDays}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Absent Days</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {calculation.absentDays}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Salary Breakdown</h4>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Base Salary</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(calculation.baseSalary)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Absent Deduction</span>
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    - {formatCurrency(calculation.absentDeduction)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Already Paid</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(calculation.paidSalary)}
                  </span>
                </div>
                <div className="pt-2 border-t dark:border-gray-700">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Final Salary</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(calculation.remainingSalary)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {calculation.remainingSalary > 0 && !isPaid && !showPaymentForm && (
            <button
              onClick={() => setShowPaymentForm(true)}
              className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              Pay Salary
            </button>
          )}

          {showPaymentForm && !isPaid && (
            <form onSubmit={handleSubmitPayment(handlePaySalary)} className="space-y-4">
              <div>
                <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Payment Date
                </label>
                <input
                  type="date"
                  id="paymentDate"
                  {...registerPayment('paymentDate')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                {paymentErrors.paymentDate && (
                  <p className="mt-1 text-sm text-red-600">{paymentErrors.paymentDate.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          )}
          
          {isPaid && (
            <div className="text-center text-sm text-green-600 dark:text-green-400">
              ✓ Salary has been paid successfully
            </div>
          )}
        </div>
      )}
    </div>
  );
}