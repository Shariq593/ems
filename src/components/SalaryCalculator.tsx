import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { paySalary } from "../api/apis"; // Backend API call
import {
  calculateSalaryForPeriod,
  calculatePaidSalaryForPeriod,
  calculateTotalDays,
} from "../utils/salary";
import { formatCurrency } from "../utils/currency";

const calculatorSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  presentDays: z.number().min(0, "Present days must be non-negative"),
});

const paymentSchema = z.object({
  paymentDate: z.string().min(1, "Payment date is required"),
});

type CalculatorFormData = z.infer<typeof calculatorSchema>;
type PaymentFormData = z.infer<typeof paymentSchema>;

interface SalaryCalculatorProps {
  onClose: () => void;
  employees: {
    id: string;
    name: string;
    monthlySalary: number;
    role: string;
  }[];
  payments: {
    employeeId: string;
    amount: number;
    date: string;
    type: string;
  }[];
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

export default function SalaryCalculator({
  onClose,
  employees,
  payments,
}: SalaryCalculatorProps) {
  const [calculation, setCalculation] = useState<CalculationResult | null>(
    null
  );
  const [isPaid, setIsPaid] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const {
    register: registerCalculator,
    handleSubmit: handleSubmitCalculator,
    formState: { errors: calculatorErrors },
  } = useForm<CalculatorFormData>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: { presentDays: 0 },
  });

  const {
    register: registerPayment,
    handleSubmit: handleSubmitPayment,
    formState: { errors: paymentErrors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { paymentDate: new Date().toISOString().split("T")[0] },
  });

  const onSubmit = (data: CalculatorFormData) => {
    const employee = employees.find((emp) => emp.id === data.employeeId);
    if (!employee) return;

    const dateRange = { start: data.startDate, end: data.endDate };
    const totalDays = calculateTotalDays(dateRange);
    const absentDays = totalDays - data.presentDays;
    const baseSalary = employee.monthlySalary;
    const calculatedSalary = calculateSalaryForPeriod(
      baseSalary,
      data.presentDays,
      totalDays
    );
    const paidSalary = calculatePaidSalaryForPeriod(
      payments,
      employee.id,
      dateRange
    );
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

  const handlePaySalary = async (paymentData: PaymentFormData) => {
    if (!calculation || calculation.remainingSalary <= 0 || isPaid) return;

    const note = `Salary paid for period ${calculation.startDate} to ${calculation.endDate}\n\n` +
      `Total Days: ${calculation.totalDays}\n` +
      `Present Days: ${calculation.presentDays}\n` +
      `Absent Days: ${calculation.absentDays}\n` +
      `Base Salary: ${formatCurrency(calculation.baseSalary)}\n` +
      `Absent Deduction: ${formatCurrency(calculation.absentDeduction)}\n` +
      `Already Paid: ${formatCurrency(calculation.paidSalary)}`;

    try {
      await paySalary({
        employeeId: calculation.employeeId,
        date: paymentData.paymentDate,
        amount: calculation.remainingSalary,
        note,
      });

      alert("Salary payment processed successfully!");
      setIsPaid(true);
      setShowPaymentForm(false);
    } catch (error) {
      console.error("Error processing salary payment:", error);
      alert("Failed to process salary payment.");
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmitCalculator(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="employeeId"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"

          >
            Employee
          </label>
          <select
            id="employeeId"
            {...registerCalculator("employeeId")}
            className="mt-1 block w-full rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"

          >
            <option value="">Select an employee</option>
            {employees
              .filter((emp) => emp.role !== "admin")
              .map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
          </select>
          {calculatorErrors.employeeId && (
            <p className="text-red-600">{calculatorErrors.employeeId.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"

            >
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              {...registerCalculator("startDate")}
              className="mt-1 block w-full rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"

            />
            {calculatorErrors.startDate && (
              <p className="text-red-600">{calculatorErrors.startDate.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"

            >
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              {...registerCalculator("endDate")}
              className="mt-1 block w-full rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"

            />
            {calculatorErrors.endDate && (
              <p className="text-red-600">{calculatorErrors.endDate.message}</p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="presentDays"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"

          >
            Present Days
          </label>
          <input
            type="number"
            id="presentDays"
            {...registerCalculator("presentDays", { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"

          />
          {calculatorErrors.presentDays && (
            <p className="text-red-600">{calculatorErrors.presentDays.message}</p>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Calculate
          </button>
        </div>
      </form>

      {calculation && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700">
              Calculation Details
            </h3>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Total Days</span>
                <span className="text-sm font-medium text-gray-900">
                  {calculation.totalDays}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Present Days</span>
                <span className="text-sm font-medium text-gray-900">
                  {calculation.presentDays}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Absent Days</span>
                <span className="text-sm font-medium text-gray-900">
                  {calculation.absentDays}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Base Salary</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(calculation.baseSalary)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Absent Deduction</span>
                <span className="text-sm font-medium text-red-600">
                  -{formatCurrency(calculation.absentDeduction)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Already Paid</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(calculation.paidSalary)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Remaining Salary</span>
                <span className="text-sm font-medium text-green-600">
                  {formatCurrency(calculation.remainingSalary)}
                </span>
              </div>
            </div>
          </div>

          {calculation.remainingSalary > 0 && !isPaid && !showPaymentForm && (
            <button
              onClick={() => setShowPaymentForm(true)}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Pay Salary
            </button>
          )}

          {showPaymentForm && (
            <form onSubmit={handleSubmitPayment(handlePaySalary)} className="space-y-4">
              <div>
                <label
                  htmlFor="paymentDate"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"

                >
                  Payment Date
                </label>
                <input
                  type="date"
                  id="paymentDate"
                  {...registerPayment("paymentDate")}
                  className="mt-1 block w-full rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"

                />
                {paymentErrors.paymentDate && (
                  <p className="text-red-600">{paymentErrors.paymentDate.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          )}

          {isPaid && <p className="text-green-600">Salary has been paid successfully!</p>}
        </div>
      )}
    </div>
  );
}
