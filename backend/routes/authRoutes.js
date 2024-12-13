const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Employee = require("../Model/Employee");

const router = express.Router();



// Middleware for Admin Access
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};
// Middleware to Authenticate Requests
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to the request
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};



router.get("/employees", async (req, res) => {
  try {
    // Fetch all employees from the database
    const employees = await Employee.find();

    // If no employees found, return a message
    if (!employees || employees.length === 0) {
      return res.status(404).json({ message: "No employees found" });
    }

    // Return the list of employees
    res.status(200).json(employees);
  } catch (error) {


    
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/login", async (req, res) => {
  const { employeeId, password } = req.body;
  console.log("Login request received", req.body); // Log request body
  try {
    // Find the employee by ID
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(401).json({ message: "Invalid Employee ID" });
    }

    // Compare hashed passwords
    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Employee ID or password" });
    }

    const token = jwt.sign(
      {id : employee._id, role: employee.role, employeeId : employee.employeeId },
      process.env.JWT_SECRET,
      {expiresIn : "8h"}
    )

    // Return a success message without sending the token in the response body
    res.status(200).json({
      message: "Login successful",
      user: {
        id : employee._id,
        employeeId: employee.employeeId,
        name: employee.name,
        role: employee.role,
      },
      token,
    });


  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


router.get('/user', authMiddleware, async (req, res) => {
  try {
    const user = await Employee.findById(req.user.id);
    res.json({ user: { id: user._id, role: user.role, name: user.name } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});




module.exports = { router, authMiddleware, adminMiddleware };
