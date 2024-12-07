import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEmployeeStore } from '../store/employeeStore';

const advanceSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  date: z.string().min(1, 'Date is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  note: z.string().min(1, 'Note is required'),
  operation: z.enum(['plus', 'minus']),
});

type AdvanceFormData = z.infer<typeof advanceSchema>;

interface AdvancePaymentFormProps {
  onClose: () => void;
}

export default function AdvancePaymentForm({ onClose }: AdvancePaymentFormProps) {
  const { employees, addPayment } = useEmployeeStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdvanceFormData>({
    resolver: zodResolver(advanceSchema),
    defaultValues: {
      operation: 'plus',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = (data: AdvanceFormData) => {
    addPayment({
      ...data,
      type: 'advance',
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Employee
        </label>
        <select
          id="employeeId"
          {...register('employeeId')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="">Select an employee</option>
          {employees.filter(emp => emp.role !== 'admin').map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name}
            </option>
          ))}
        </select>
        {errors.employeeId && (
          <p className="mt-1 text-sm text-red-600">{errors.employeeId.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Date
        </label>
        <input
          type="date"
          id="date"
          {...register('date')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        {errors.date && (
          <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Amount
        </label>
        <input
          type="number"
          id="amount"
          step="0.01"
          {...register('amount', { valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Operation</label>
        <div className="mt-2 space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              {...register('operation')}
              value="plus"
              className="form-radio text-blue-600"
            />
            <span className="ml-2">Add Advance</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              {...register('operation')}
              value="minus"
              className="form-radio text-blue-600"
            />
            <span className="ml-2">Deduct Advance</span>
          </label>
        </div>
        {errors.operation && (
          <p className="mt-1 text-sm text-red-600">{errors.operation.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="note" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Note
        </label>
        <textarea
          id="note"
          {...register('note')}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        {errors.note && (
          <p className="mt-1 text-sm text-red-600">{errors.note.message}</p>
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
          Add Advance Payment
        </button>
      </div>
    </form>
  );
}