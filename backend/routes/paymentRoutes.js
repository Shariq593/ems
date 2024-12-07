const express = require('express');
const Payment = require('../Model/Payment');

const router = express.Router();

// Add Payment
router.post('/add', async (req, res) => {
  try {
    const payment = await Payment.create(req.body);
    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete Payment
router.delete('/delete/:id', async (req, res) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Payment deleted.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
