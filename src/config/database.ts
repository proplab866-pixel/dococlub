// Importing necessary modules and constants
import { DB_NAME } from "@/constants"; // Database name constant
import mongoose from "mongoose"; // Mongoose library for MongoDB connection and schema management

// Variable to track the database connection status
let isDbConnected: string | null = null;

// MongoDB connection URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  // Throw an error if the MongoDB URI is not defined in the environment variables
  throw new Error("Please define the MONGODB_URI environment variable");
}

// Function to connect to the MongoDB database
const connectDB = async (): Promise<void> => {
  // Check if the database connection is already established
  if (mongoose.connection.readyState >= 1) {
    return; // Exit if already connected
  }

  try {
    // Attempt to connect to the MongoDB database
    const connectionInstance = mongoose.connect(
      `${MONGODB_URI}/${DB_NAME}` // Construct the full database URI
    );

    // Update the connection status and log the host
    isDbConnected = (await connectionInstance).connection.host;
    console.log(
      `MongoDB Connected! DB host: ${
        (await connectionInstance).connection.host
      }\n`
    );
  } catch (error) {
    // Log any connection errors and exit the process
    console.log("MongoDB connection error: ", error);
    process.exit(1);
  }
};

// Exporting the database connection function and connection status
export { connectDB, isDbConnected };