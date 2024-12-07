import React, { useState } from 'react';
import { useEmployeeStore } from '../store/employeeStore';
import { useAuthStore } from '../store/authStore';
import { Eye, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';
import Modal from '../components/Modal';

interface PaymentDetails {
  date: string;
  type: string;
  amount: number;
  note: string;
  operation?: 'plus' | 'minus';
}

type PaymentType = 'all' | 'salary' | 'advance';

export default function Reports() {
  const [selectedPayment, setSelectedPayment] = useState<PaymentDetails | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [paymentType, setPaymentType] = useState<PaymentType>('all');
  
  const { employees, payments, deletePayment } = useEmployeeStore();
  const { user } = useAuthStore();

  const filteredEmployees = user?.role === 'admin'
    ? employees.filter(emp => emp.role !== 'admin')
    : employees.filter(emp => emp.id === user?.id);

  const filteredPayments = payments.filter(payment => {
    const employeeMatch = selectedEmployee ? payment.employeeId === selectedEmployee : true;
    const dateMatch = (!dateRange.start || payment.date >= dateRange.start) &&
                     (!dateRange.end || payment.date <= dateRange.end);
    const typeMatch = paymentType === 'all' ? true : payment.type === paymentType;
    const userMatch = user?.role === 'admin' ? true : payment.employeeId === user?.id;
    
    return employeeMatch && dateMatch && typeMatch && userMatch;
  });

  const totalAdvanceDeduction = filteredPayments
    .filter(p => p.type === 'advance')
    .reduce((sum, p) => sum + (p.operation === 'minus' ? p.amount : 0), 0);

  const salaryPayments = filteredPayments.filter(p => p.type === 'salary');
  const advancePayments = filteredPayments.filter(p => p.type === 'advance');

  const totalSalary = salaryPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalAdvance = advancePayments.reduce((sum, p) => sum + (p.operation === 'plus' ? p.amount : -p.amount), 0);

  const handleDeletePayment = (id: string) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      deletePayment(id);
    }
  };

  const handleViewPayment = (payment: PaymentDetails) => {
    setSelectedPayment(payment);
  };

  const renderPaymentDetails = (note: string) => {
    const lines = note.split('\n');
    const periodLine = lines[0];
    const details = lines.slice(2); // Skip the empty line after period

    return (
      <div className="space-y-6">
        <div className="text-sm text-gray-900 dark:text-white font-medium">
          {periodLine}
        </div>

        <div className="space-y-4">
          {/* Attendance Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Attendance</h4>
            <div className="grid grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              {details.slice(0, 3).map((line, index) => {
                const [label, value] = line.split(':').map(s => s.trim());
                return (
                  <div key={index}>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">{label}</dt>
                    <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{value}</dd>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Salary Breakdown Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Salary Breakdown</h4>
            <div className="space-y-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              {details.slice(3).map((line, index) => {
                const [label, value] = line.split(':').map(s => s.trim());
                const isDeduction = label.includes('Deduction') || label.includes('Already Paid');
                return (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
                    <span className={`text-sm font-medium ${
                      isDeduction 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Final Amount */}
          <div className="pt-4 border-t dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900 dark:text-white">Final Amount</span>
              <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(selectedPayment?.amount || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {user?.role === 'admin' && (
            <div>
              <label htmlFor="employee" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Employee
              </label>
              <select
                id="employee"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Employees</option>
                {filteredEmployees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={dateRange.start}
              onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={dateRange.end}
              onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Payment Type
            </label>
            <select
              id="paymentType"
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value as PaymentType)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="salary">Salary</option>
              <option value="advance">Advance</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {user?.role === 'admin' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Total Salary Paid</h3>
              <p className="mt-2 text-2xl font-semibold text-blue-900 dark:text-blue-200">
                {formatCurrency(totalSalary)}
              </p>
            </div>
          )}
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-800 dark:text-purple-300">Total Advance</h3>
            <p className="mt-2 text-2xl font-semibold text-purple-900 dark:text-purple-200">
              {formatCurrency(totalAdvance)}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Total Advance Deduction</h3>
            <p className="mt-2 text-2xl font-semibold text-green-900 dark:text-green-200">
              {formatCurrency(totalAdvanceDeduction)}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Payment History</h3>
          <div className="bg-white dark:bg-gray-800 shadow overflow-x-auto rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Note
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {formatDate(payment.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          payment.type === 'salary'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}
                      >
                        {payment.type.charAt(0).toUpperCase() + payment.type.slice(1)}
                        {payment.type === 'advance' && ` (${payment.operation})`}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {payment.note.split('\n')[0]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-3">
                      <button
                        onClick={() => handleViewPayment(payment)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => handleDeletePayment(payment.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
        title="Payment Details"
      >
        {selectedPayment && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Date</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(selectedPayment.date)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Type</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                selectedPayment.type === 'salary'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              }`}>
                {selectedPayment.type.charAt(0).toUpperCase() + selectedPayment.type.slice(1)}
                {selectedPayment.type === 'advance' && ` (${selectedPayment.operation})`}
              </span>
            </div>

            <div className="pt-4 border-t dark:border-gray-700">
              {selectedPayment.type === 'salary' && selectedPayment.note.includes('period') ? (
                renderPaymentDetails(selectedPayment.note)
              ) : (
                <div className="space-y-2">
                  <span className="block text-sm text-gray-500 dark:text-gray-400">Details</span>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedPayment.note}</p>
                  <div className="pt-4 border-t dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Amount</span>
                      <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(selectedPayment.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}