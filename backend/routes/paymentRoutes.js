const express = require('express');
const mongoose = require('mongoose');
const Payment = require('../Model/Payment'); // Payment model
const Employee = require('../Model/Employee'); // Employee model
const router = express.Router();

// Add a payment (with optional attendance)
router.post('/', async (req, res) => {
  console.log("Request Body:", req.body);

  const { employeeId, amount, date, description, type, operation, attendance } = req.body;

  try {
    // Validate required fields
    if (!employeeId || !amount || !date || !type || !operation) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Create the Payment object
    const payment = new Payment({
      employeeId,
      amount,
      date,
      description,
      type,
      operation,
      ...(attendance && { attendance }) // Conditionally add attendance
    });

    console.log("New Payment:", payment);

    // Save the payment
    const savedPayment = await payment.save();
    res.status(201).json(savedPayment);
  } catch (error) {
    console.error("Error in adding payment:", error);
    res.status(500).json({ message: 'Error adding payment', error });
  }
});

// Pay salary (with optional attendance)
router.post('/salary', async (req, res) => {
  const { employeeId, date, amount, note, attendance } = req.body;

  try {
    // Validate required fields
    if (!employeeId || !amount || !date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create a salary payment object
    const salaryPayment = new Payment({
      employeeId,
      amount,
      date,
      description: note,
      type: 'salary',
      operation: 'plus',
      ...(attendance && { attendance }) // Add attendance details conditionally
    });

    console.log("Salary Payment:", salaryPayment);

    // Save the payment
    const savedPayment = await salaryPayment.save();
    res.status(201).json(savedPayment);
  } catch (error) {
    console.error('Error processing salary payment:', error);
    res.status(500).json({ message: 'Error processing salary payment', error });
  }
});

// Add advance payment
router.post("/advance", async (req, res) => {
  const { employeeId, amount, date, note } = req.body;

  try {
    // Validate employeeId
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: "Invalid employee ID format" });
    }

    // Check if the employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Create and save the payment
    const newPayment = new Payment({
      employeeId,
      amount,
      date,
      description: note,
      type: "advance",
      operation: "minus",
    });

    console.log("Advance Payment:", newPayment);

    await newPayment.save();
    res.status(201).json({ message: "Advance payment added successfully", payment: newPayment });
  } catch (error) {
    console.error("Error adding advance payment:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// Get all payments
router.get('/', async (req, res) => {
  try {
    const payments = await Payment.find().populate('employeeId', 'name'); // Populate employee name
    res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Error fetching payments', error });
  }
});

// Delete a payment by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Payment ID is required' });
  }

  try {
    const deletedPayment = await Payment.findByIdAndDelete(id);
    if (!deletedPayment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    console.log("Deleted Payment:", deletedPayment);

    res.status(200).json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ message: 'Server error', error });
  }
}); 

module.exports = router;
