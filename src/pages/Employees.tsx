import React, { useState } from 'react';
import { Plus, Calculator, Trash2, Eye, Edit, IndianRupee } from 'lucide-react';
import Modal from '../components/Modal';
import { useEmployeeStore } from '../store/employeeStore';
import SalaryCalculator from '../components/SalaryCalculator';
import AdvancePaymentForm from '../components/AdvancePaymentForm';
import PaymentForm from '../components/PaymentForm';
import { useAuthStore } from '../store/authStore';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';

export default function Employees() {
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isNewPaymentOpen, setIsNewPaymentOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isAdvanceOpen, setIsAdvanceOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useEmployeeStore();
  const { user } = useAuthStore();

  const handleAddEmployee = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addEmployee({
      name: formData.get('name') as string,
      employeeId: formData.get('employeeId') as string,
      password: formData.get('password') as string,
      monthlySalary: Number(formData.get('salary')),
      startDate: formData.get('startDate') as string,
      role: 'employee'
    });
    setIsAddEmployeeOpen(false);
  };

  const handleEditEmployee = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    
    const formData = new FormData(e.currentTarget);
    updateEmployee(selectedEmployee.id, {
      name: formData.get('name') as string,
      employeeId: formData.get('employeeId') as string,
      password: formData.get('password') as string,
      monthlySalary: Number(formData.get('salary')),
      startDate: formData.get('startDate') as string,
    });
    setIsEditOpen(false);
  };

  const handleDeleteEmployee = (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      deleteEmployee(id);
    }
  };

  const handleViewEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setIsViewOpen(true);
  };

  const handleEditClick = (employee: any) => {
    setSelectedEmployee(employee);
    setIsEditOpen(true);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employees</h1>
        {isAdmin && (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsCalculatorOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-green-600 rounded-lg text-green-600 hover:bg-green-50 transition-colors dark:hover:bg-green-900 dark:hover:border-green-400 dark:hover:text-green-400"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Calculate Salary
            </button>
            <button
              onClick={() => setIsAdvanceOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-purple-600 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors dark:hover:bg-purple-900 dark:hover:border-purple-400 dark:hover:text-purple-400"
            >
              <IndianRupee className="h-4 w-4 mr-2" />
              Advance Payment
            </button>
            <button
              onClick={() => setIsNewPaymentOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors dark:hover:bg-blue-900 dark:hover:border-blue-400 dark:hover:text-blue-400"
            >
              <IndianRupee className="h-4 w-4 mr-2" />
              New Payment
            </button>
            <button
              onClick={() => setIsAddEmployeeOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700 whitespace-nowrap">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Employee ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Monthly Salary
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Start Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {employees.filter(emp => emp.role !== 'admin').map((employee) => (
              <tr key={employee.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-100">{employee.employeeId}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{employee.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {formatCurrency(employee.monthlySalary)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {formatDate(employee.startDate)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-3">
                  <button
                    onClick={() => handleViewEmployee(employee)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => handleEditClick(employee)}
                        className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 inline-flex items-center"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 inline-flex items-center"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Employee Details"
      >
        {selectedEmployee && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Employee ID</label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedEmployee.employeeId}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Password</label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedEmployee.password}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedEmployee.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Salary</label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatCurrency(selectedEmployee.monthlySalary)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Start Date</label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatDate(selectedEmployee.startDate)}</p>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Employee"
      >
        {selectedEmployee && (
          <form onSubmit={handleEditEmployee} className="space-y-4">
            <div>
              <label htmlFor="edit-employeeId" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Employee ID
              </label>
              <input
                type="text"
                name="employeeId"
                id="edit-employeeId"
                defaultValue={selectedEmployee.employeeId}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="edit-password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Password
              </label>
              <input
                type="password"
                name="password"
                id="edit-password"
                defaultValue={selectedEmployee.password}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Employee Name
              </label>
              <input
                type="text"
                name="name"
                id="edit-name"
                defaultValue={selectedEmployee.name}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="edit-salary" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Monthly Salary
              </label>
              <input
                type="number"
                name="salary"
                id="edit-salary"
                defaultValue={selectedEmployee.monthlySalary}
                required
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="edit-startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                id="edit-startDate"
                defaultValue={selectedEmployee.startDate}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        isOpen={isAddEmployeeOpen}
        onClose={() => setIsAddEmployeeOpen(false)}
        title="Add Employee"
      >
        <form onSubmit={handleAddEmployee} className="space-y-4">
          <div>
            <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Employee ID
            </label>
            <input
              type="text"
              name="employeeId"
              id="employeeId"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Employee Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="salary" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Monthly Salary
            </label>
            <input
              type="number"
              name="salary"
              id="salary"
              required
              min="0"
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              id="startDate"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Employee
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        title="Calculate Salary"
      >
        <SalaryCalculator onClose={() => setIsCalculatorOpen(false)} />
      </Modal>

      <Modal
        isOpen={isAdvanceOpen}
        onClose={() => setIsAdvanceOpen(false)}
        title="Add Advance Payment"
      >
        <AdvancePaymentForm onClose={() => setIsAdvanceOpen(false)} />
      </Modal>

      <Modal
        isOpen={isNewPaymentOpen}
        onClose={() => setIsNewPaymentOpen(false)}
        title="Add Payment"
      >
        <PaymentForm onClose={() => setIsNewPaymentOpen(false)} />
      </Modal>
    </div>
  );
}