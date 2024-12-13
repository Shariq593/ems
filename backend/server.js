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

const allowedOrigins = [
  'http://localhost:5173', // Local development
  'https://sd-ems.netlify.app' // Deployed frontend
];
app.use(express.json()); // This parses incoming JSON payloads
app.use(express.urlencoded({ extended: true })); 
// Middleware

app.use(cors({
  origin: (origin, callback) => {
    console.log("Incoming request origin:", origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow the request
    } else {
      console.error("Blocked by CORS:", origin);
      callback(new Error('Not allowed by CORS')); // Deny the request
    }
  },
  methods: 'GET,POST,PUT,DELETE', // Allowed HTTP methods
  credentials: true, // Allow cookies and credentials
  allowedHeaders: 'Content-Type, Authorization', // Allowed headers
}));


// Routes
app.use("/api/auth", authRoutes); // Use the fixed router import
app.use("/api/employees", employeeRoutes);
app.use("/api/payment", paymentRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
