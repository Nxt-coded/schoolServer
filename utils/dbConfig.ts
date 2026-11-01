import { connect } from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const dbConfig = async () => {
  try {
    const connectionString =
      process.env.MONGO_DB_URL_ONLINE || process.env.MONGO_DB_URL_LOCAL;

    if (!connectionString) {
      throw new Error(
        "MONGO_DB_URL_ONLINE or MONGO_DB_URL_LOCAL must be configured"
      );
    }

    await connect(connectionString, {
      connectTimeoutMS: 30000, // Increase connection timeout to 30 seconds
      socketTimeoutMS: 30000, // Increase socket timeout to 30 seconds
      serverSelectionTimeoutMS: 30000, // Increase server selection timeout
      heartbeatFrequencyMS: 1000, // More frequent heartbeats
      retryWrites: true,
      maxPoolSize: 10, // Adjust based on your needs
    });

    console.log("Database connection established 🔥❤️🔥");
  } catch (error) {
    console.error("Database connection error:", error);
    throw error; // Re-throw to handle it in the main application
  }
};
