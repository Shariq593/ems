import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import { UserProvider, useUser } from "./context/userContext";

function App() {
  const { user } = useUser();

  return (
    <UserProvider>
      <Router>
        {user ? (
          <Layout>
            <Routes>
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/employees"
                element={
                  <PrivateRoute roles={["admin"]}>
                    <Employees />
                  </PrivateRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <PrivateRoute>
                    <Reports />
                  </PrivateRoute>
                }
              />
            </Routes>
          </Layout>
        ) : (
          <Routes>
            <Route path="*" element={<Login />} />
          </Routes>
        )}
      </Router>
    </UserProvider>
  );
}

export default App;
