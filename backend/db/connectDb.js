const mongoose = require("mongoose");

const connectDb = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true, // This is only required for older versions of Mongoose
            serverSelectionTimeoutMS: 10000, // Adjust the timeout as needed
        });

        console.log(`DB Connected: ${connect.connection.host} (${connect.connection.name})`);
    } catch (err) {
        console.error("MongoDB connection error:", err.message);

        // Log detailed error information for debugging
        console.error("Error details:", err);

        // Exit process if the database connection fails
        process.exit(1);
    }
};

module.exports = connectDb;
