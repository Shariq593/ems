const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee', // Reference to Employee schema
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
    enum: ['salary', 'advance'], // Define acceptable types
    required: true,
  },
  operation: {
    type: String,
    enum: ['plus', 'minus'], // Define acceptable operations
    required: true,
  },
});

module.exports = mongoose.model('Payment', paymentSchema);
