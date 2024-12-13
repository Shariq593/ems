import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {useUser} from '../context/userContext';

const loginSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      employeeId: '',
      password: '',
    },
  });

  const {setUser} =useUser()
  const navigate = useNavigate(); // React Router to navigate between pages

  // Submit handler when form is submitted
  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', data); // Send data to backend API
      const { user } = response.data;

      // Save the logged-in user to Zustand state
      localStorage.setItem("user",JSON.stringify(user))
      setUser(user);

      // Navigate to home page (or dashboard)
      navigate('/dashboard');
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Invalid credentials. Please try again.';
      setError('root', { message }); // Display error message in form
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Employee ID input */}
      <div>
        <label
          htmlFor="employeeId"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Employee ID
        </label>
        <input
          type="text"
          id="employeeId"
          {...register('employeeId')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Enter your employee ID"
        />
        {errors.employeeId && (
          <p className="mt-1 text-sm text-red-600">{errors.employeeId.message}</p>
        )}
      </div>

      {/* Password input */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Password
        </label>
        <input
          type="password"
          id="password"
          {...register('password')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Enter your password"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      {/* Global error message */}
      {errors.root && (
        <p className="text-sm text-red-600">{errors.root.message}</p>
      )}

      {/* Submit button */}
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Sign In
      </button>
    </form>
  );
}
