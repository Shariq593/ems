
import axios from 'axios';
import { Employee, Payment, SalaryPaymentData, PaymentData } from '../types'; // Ensure the path is correct
import { NewPaymentRequest } from '../types';
const API_URL =  "https://sdems.onrender.com/api"


// Get all employees
export const getEmployees = async (): Promise<Employee[]> => {
  const response = await axios.get(`${API_URL}/employees`);
  // Map _id to id for consistency
  return response.data.map((emp: Employee) => ({ ...emp, id: emp._id }));
};


// Add a new employee
export const addEmployee = async (employee: Omit<Employee, 'id'>): Promise<Employee> => {
  const response = await axios.post<Employee>(`${API_URL}/employees`, employee);
  return response.data;
};

// Update an employee
export const updateEmployee = async (
  id: string,
  updatedData: Partial<Omit<Employee, 'id'>>
): Promise<Employee> => {
  console.log(id);
  
  const response = await axios.put<Employee>(`${API_URL}/employees/${id}`, updatedData);
  return response.data;
};

// Delete an employee
export const deleteEmployee = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/employees/${id}`);
};

// Get all payments
export const getPayments = async (): Promise<Payment[]> => {
  const response = await axios.get<Payment[]>(`${API_URL}/payment`);
  return response.data;
};

export const addPayment = async (paymentData: NewPaymentRequest) => {
  const response = await axios.post(`${API_URL}/payment`, paymentData);
  return response.data;
};

// Delete a payment
export const deletePayment = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/payment/${id}`);
};

export const addAdvancePayment = async (paymentData: PaymentData) => {
  const response = await axios.post(`${API_URL}/payment/advance`, paymentData);
  return response.data;
};


export const paySalary = async (paymentData: SalaryPaymentData) => {
  const response = await axios.post(`${API_URL}/payment/salary`, paymentData);
  return response.data;
};
