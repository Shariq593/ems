import React, { createContext, useContext, useState, ReactNode } from 'react';


interface User {
  id: string;
  name: string;
  role: "admin" | "employee";
  employeeId: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(
    () => JSON.parse(localStorage.getItem('user') || 'null') // Initialize from localStorage
  );

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
