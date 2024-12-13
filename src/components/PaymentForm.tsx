import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addPayment } from '../api/apis'; // API function to add payment
import { NewPaymentRequest, Employee } from '../types';



const paymentSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  date: z.string().min(1, 'Date is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  note: z.string().min(1, 'Note is required'),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  onClose: () => void;
  employees: Employee[]; // Pass the employee list from the parent component
  onPaymentAdded: () => void; // Callback to refresh the payment list or state
}

export default function PaymentForm({ onClose, employees, onPaymentAdded }: PaymentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      date: new Date().toISOString().split('T')[0],
    },
  });


  const onSubmit = async (data: PaymentFormData) => {
    try {
      const paymentRequest: NewPaymentRequest = {
        employeeId: data.employeeId,
        date: data.date,
        amount: data.amount,
        description: data.note, // Map note to description
        type: 'salary', // Example type
        operation: 'plus', // Example operation
      };
  
      await addPayment(paymentRequest);
      onPaymentAdded();
      onClose();
    } catch (error) {
      console.error('Error adding payment:', error);
    }
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
          {employees
            .filter((emp) => emp.role !== 'admin')
            .map((employee) => (
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
          Add Payment
        </button>
      </div>
    </form>
  );
}
