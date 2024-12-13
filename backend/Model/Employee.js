const mongoose = require('mongoose');
const Payment = require('./Payment'); 
const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    monthlySalary: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "employee"],
      default: "employee",
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt timestamps
  }
);

employeeSchema.pre('findOneAndDelete', async function (next) {
  try {
    const employeeId = this.getQuery()._id; // Get the ID of the employee being deleted
    await Payment.deleteMany({ employeeId }); // Delete all payments with this employeeId
    next();
  } catch (error) {
    next(error);
  }
});


module.exports = mongoose.model('Employee', employeeSchema);
