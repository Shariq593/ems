const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  totalDays: { type: Number, default: 0 },
  presentDays: { type: Number, default: 0 },
  absentDays: { type: Number, default: 0 },
}, { _id: false }); // Disable _id for sub-schema


const paymentSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee", // Reference to Employee schema
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
    enum: ["salary", "advance"], // Define acceptable types
    required: true,
  },
  operation: {
    type: String,
    enum: ["plus", "minus"], // Define acceptable operations
    required: true,
  },
  attendance: {
    type: attendanceSchema,
    default: undefined,
  },
});

module.exports = mongoose.model('Payment', paymentSchema);
