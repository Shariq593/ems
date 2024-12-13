const express = require('express');
const Employee = require('../Model/Employee');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Get all employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find();
    // Map _id to id for each employee
    const mappedEmployees = employees.map((emp) => ({
      ...emp.toObject(),
      id: emp._id,
    }));
    res.json(mappedEmployees);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employees' });
  }
});


// Add an employee
router.post('/', async (req, res) => {
  try {
    const { employeeId, password, name, monthlySalary, startDate, role } = req.body;

    // Validate required fields
    if (!employeeId || !password || !name || !startDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the employee
    const newEmployee = new Employee({
      employeeId,
      password: hashedPassword,
      name,
      monthlySalary,
      startDate,
      role,
    });

    const savedEmployee = await newEmployee.save();
    res.status(201).json(savedEmployee);
  } catch (error) {
    console.error('Error adding employee:', error);
    res.status(500).json({ message: 'Error adding employee', error: error.message });
  }
});


// Update an employee
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'Missing employee ID' });
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(updatedEmployee);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ message: 'Error updating employee' });
  }
});


// Delete an employee
router.delete('/:id', async (req, res) => {
  try {
    const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
    if (!deletedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(204).end(); // No content
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Error deleting employee' });
  }
});

module.exports = router;
