import { format, isValid } from 'date-fns';

export const formatDate = (dateString: string | Date): string => {
  const date = new Date(dateString);
  if (!isValid(date)) {
    return 'Invalid Date'; // Fallback for invalid dates
  }
  return format(date, 'dd/MM/yyyy');
};
