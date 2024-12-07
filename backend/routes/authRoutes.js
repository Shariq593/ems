const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Employee = require("../Model/Employee");

const router = express.Router();

const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d", // Token will be valid for 15 days
  });

  // Set the token as an HTTP-only cookie
  res.cookie("jwt", token, {
    httpOnly: true, // This cookie cannot be accessed by JavaScript on the client-side
    maxAge: 15 * 24 * 60 * 60 * 1000, // Cookie expiration time in milliseconds (15 days)
    sameSite: "strict", // Prevent CSRF attacks
  });

  return token;
};

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET ;

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

    // Generate the token and set it as an HTTP-only cookie
    generateTokenAndSetCookie(employee._id, res);

    // Return a success message without sending the token in the response body
    res.status(200).json({ message: "Login successful" });

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


// Middleware to Authenticate Requests
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach user info to the request
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Middleware for Admin Access
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};
const generteTokenAndSetCookie = (userId,res) =>{
  const token = jwt.sign({userId},process.env.JWT_SECRET,{
      expiresIn: '15d',
  })
  res.cookie("jwt",token, {
      httpOnly: true, //this cookie cannot be accessed by browser
      maxAge: 15*24*60*60*1000, //equals to 15 days
      sameSite: "strict" // csrf "For security of the token"
  })

  return token;

module.exports = { router, authMiddleware, adminMiddleware };
