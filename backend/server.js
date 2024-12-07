const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const connectDB = require("./db/connectDb");

const authRoutes = require("./routes/authRoutes").router; // Fix import to use only the router
const employeeRoutes = require("./routes/employeeRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();
const port = 3000;

connectDB();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Allow only the frontend URL
  methods: 'GET,POST,PUT,DELETE', // Allowed HTTP methods
  allowedHeaders: 'Content-Type, Authorization' // Allowed headers
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes); // Use the fixed router import
app.use("/api/employees", employeeRoutes);
app.use("/api/payment", paymentRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
