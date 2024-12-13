import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';
import { useUser } from '../context/userContext';
import { getEmployees, getPayments, deletePayment } from '../api/apis';
import Modal from '../components/Modal';
import { Eye, Trash2 } from 'lucide-react';
import { Employee, Payment } from '../types';

interface PaymentDetails {
  date: string;
  type: string;
  amount: number;
  note: string;
  operation?: 'plus' | 'minus';
}

type PaymentType = 'all' | 'salary' | 'advance';

export default function Reports() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentDetails | null>(
    null
  );
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [paymentType, setPaymentType] = useState<PaymentType>("all");
  const { user } = useUser();

  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        const [fetchedEmployees, fetchedPayments] = await Promise.all([
          getEmployees(),
          getPayments(),
        ]);

        setEmployees(fetchedEmployees);

        const normalizedPayments = fetchedPayments.map((payment) => ({
          ...payment,
          id: payment._id || payment.id, // Ensure id is always present
        }));

        setPayments(normalizedPayments);
      } catch (error) {
        console.error("Error fetching reports data:", error);
      }
    };

    fetchReportsData();
  }, []);

  const filteredEmployees =
    user?.role === "admin"
      ? employees.filter((emp) => emp.role !== "admin")
      : employees.filter((emp) => emp.id === user?.id);

  const filteredPayments = payments.filter((payment) => {
    const employeeMatch = selectedEmployee
      ? payment.employeeId === selectedEmployee
      : true;
    const dateMatch =
      (!dateRange.start || payment.date >= dateRange.start) &&
      (!dateRange.end || payment.date <= dateRange.end);
    const typeMatch =
      paymentType === "all" ? true : payment.type === paymentType;
    const userMatch =
      user?.role === "admin" ? true : payment.employeeId === user?.id;

    return employeeMatch && dateMatch && typeMatch && userMatch;
  });

  // Add employeeName to payments for display
  const enrichedPayments = filteredPayments.map((payment) => {
    const employee = employees.find((emp) => emp.id === payment.employeeId);
    return {
      ...payment,
      employeeName: employee ? employee.name : "Unknown",
    };
  });

  const totalAdvanceDeduction = enrichedPayments
    .filter((p) => p.type === "advance")
    .reduce((sum, p) => sum + (p.operation === "minus" ? p.amount : 0), 0);

  const salaryPayments = enrichedPayments.filter((p) => p.type === "salary");
  const advancePayments = enrichedPayments.filter((p) => p.type === "advance");

  const totalSalary = salaryPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalAdvance = advancePayments.reduce(
    (sum, p) => sum + (p.operation === "plus" ? p.amount : -p.amount),
    0
  );

  const handleDeletePayment = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this payment?")) {
      try {
        console.log(id);
        await deletePayment(id);
        setPayments((prev) => prev.filter((payment) => payment.id !== id));
      } catch (error) {
        console.error("Error deleting payment:", error);
      }
    }
  };

  const handleViewPayment = (payment: PaymentDetails) => {
    setSelectedPayment(payment);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Reports
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {user?.role === "admin" && (
            <div>
              <label
                htmlFor="employee"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
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
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="paymentType"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
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

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {user?.role === "admin" && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Total Salary Paid
              </h3>
              <p className="mt-2 text-2xl font-semibold text-blue-900 dark:text-blue-200">
                {formatCurrency(totalSalary)}
              </p>
            </div>
          )}
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-800 dark:text-purple-300">
                Total Advance
              </h3>
              <p className="mt-2 text-2xl font-semibold text-purple-900 dark:text-purple-200">
                {formatCurrency(totalAdvance)}
              </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
              Total Advance Deduction
            </h3>
            <p className="mt-2 text-2xl font-semibold text-green-900 dark:text-green-200">
              {formatCurrency(totalAdvanceDeduction)}
            </p>
          </div>
        </div>

        {/* Payments Table */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Payment History
          </h3>
          <div className="bg-white dark:bg-gray-800 shadow overflow-x-auto rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Employee Name
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
                {enrichedPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {formatDate(payment.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {payment.employeeName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          payment.type === "salary"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : payment.type === "advance"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                        }`}
                      >
                        {payment.type
                          ? payment.type.charAt(0).toUpperCase() +
                            payment.type.slice(1)
                          : "Unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {payment.note
                        ? payment.note.split("\n")[0]
                        : "No notes available"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-3">
                      <button
                        onClick={() => handleViewPayment(payment)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      {user?.role === "admin" && (
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

      {/* Payment Details Modal */}
      <Modal
        isOpen={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
        title="Payment Details"
      >
        {selectedPayment && (
          <div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Date
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(selectedPayment.date)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Type
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  selectedPayment.type === "salary"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                }`}
              >
                {selectedPayment.type.charAt(0).toUpperCase() +
                  selectedPayment.type.slice(1)}
                {selectedPayment.type === "advance" &&
                  ` (${selectedPayment.operation})`}
              </span>
            </div>
            <div className="pt-4 border-t dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Amount
                </span>
                <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(selectedPayment.amount)}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
