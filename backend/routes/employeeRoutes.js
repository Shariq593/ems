const express = require("express");
const bcrypt = require("bcryptjs");
const Employee = require("../Model/Employee");
const { authMiddleware, adminMiddleware } = require("./authRoutes");

const router = express.Router();

// Add Employee (Admin Only)
router.post("/add", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { employeeId, password, name, monthlySalary, startDate, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const employee = await Employee.create({
      employeeId,
      password: hashedPassword,
      name,
      monthlySalary,
      startDate,
      role,
    });

    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update Employee
router.put("/update/:id", authMiddleware, async (req, res) => {
  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedEmployee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete Employee (Admin Only)
router.delete("/delete/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    if (employee.role === "admin") {
      return res.status(403).json({ message: "Cannot delete an admin." });
    }

    await employee.remove();
    res.json({ message: "Employee deleted." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
