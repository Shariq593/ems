const express = require('express');
const Payment = require('../Model/Payment'); // Payment model
const router = express.Router();

// Add a payment
router.post('/', async (req, res) => {
  console.log("REq.body", req.body);

  const { employeeId, amount, date, description, type, operation } = req.body;

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
    });

    console.log("payment", payment);

    // Save the payment in the database
    const savedPayment = await payment.save();
    console.log("savedPayment", savedPayment);

    res.status(201).json(savedPayment);
  } catch (error) {
    console.error("Error in adding payment:", error);
    res.status(500).json({ message: 'Error adding payment', error });
  }
});


// Get all payments
router.get('/', async (req, res) => {
  try {
    const payments = await Payment.find();
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payments', error });
  }
});

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
      note,
      type: "advance",
      operation: "minus",
    });

    await newPayment.save();
    res.status(201).json({ message: "Advance payment added successfully", payment: newPayment });
  } catch (error) {
    console.error("Error adding advance payment:", error);
    res.status(500).json({ message: "Server error", error });
  }
});


// Pay salary
router.post('/salary', async (req, res) => {
  const { employeeId, date, amount, note } = req.body;

  try {
    // Validate required fields
    if (!employeeId || !amount || !date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create a new salary payment
    const salaryPayment = new Payment({
      employeeId,
      amount,
      date,
      description: note,
      type: 'salary',
      operation: 'plus',
    });

    // Save to the database
    const savedPayment = await salaryPayment.save();
    res.status(201).json(savedPayment);
  } catch (error) {
    console.error('Error processing salary payment:', error);
    res.status(500).json({ message: 'Error processing salary payment', error });
  }
});


router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Payment ID is required' });
  }

  try {
    const deletedPayment = await Payment.findByIdAndDelete(id);
    if (!deletedPayment) {
      return res.status(403).json({ message: 'Payment not found' });
    }

    res.status(200).json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;


