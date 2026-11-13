import "./utils/nodeCompatibility";
import "dotenv/config";
import express, { Application, NextFunction, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import fs from "fs";

import cookieParser from "cookie-parser";
import session from "express-session";
import cors from "cors";
import { mainApp } from "./mainApp";
import { dbConfig } from "./utils/dbConfig";

// import { rateLimit } from "express-rate-limit";

import MongoDB from "connect-mongodb-session";

const MongoDBStore = MongoDB(session);
const mongoDbUrl =
  process.env.MONGO_DB_URL_ONLINE || process.env.MONGO_DB_URL_LOCAL;

if (!mongoDbUrl) {
  throw new Error("MONGO_DB_URL_ONLINE or MONGO_DB_URL_LOCAL must be configured");
}

const app: Application = express();
const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000;

const allowedOrigins = [
  process.env.APP_URL_DEPLOY,
  "https://justnext-dev.vercel.app",
  "https://justnext-dev.netlify.app",
  "https://just-next.web.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
].filter((origin): origin is string => Boolean(origin));

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: ["Content-Type"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(helmet());
app.use(morgan("dev"));

// app.use(limiter)
app.use(cookieParser(process.env.SESSION_SECRET as string));

//13.51.1.65/.well-known/pki-validation/F5F57A81136A32F3A3EB73DF8DB4BC06.txt

const createSessionStore = (): Promise<InstanceType<typeof MongoDBStore>> =>
  new Promise((resolve, reject) => {
    let store: InstanceType<typeof MongoDBStore>;
    store = new MongoDBStore(
      {
        uri: mongoDbUrl,
        collection: "sessions",
      },
      (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(store);
      },
    );
    store.on("error", (error: Error) => {
      console.error("Session store error:", error);
    });
  });

const startServer = async () => {
  try {
    await dbConfig();
    const store = await createSessionStore();

    app.use(
      session({
        secret: process.env.SESSION_SECRET as string,
        resave: false,
        saveUninitialized: false,
        cookie: {
          maxAge: 1000 * 60 * 60 * 24,
          httpOnly: true,
        },
        store,
      }),
    );

    mainApp(app);

    const server = app.listen(port, () => {
      console.clear();
      console.log(`Server running on port ${port}🔥❤️🔥`);
    });

    // Handle server-specific errors
    server.on("error", (error: Error) => {
      console.error("Server error:", error);
      process.exit(1);
    });

    return server;
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

const server = startServer();

export default app;

process.on("uncaughtException", (error: Error) => {
  console.log("uncaughtException: ", error);

  process.exit(1);
});

process.on("unhandledRejection", (reason: any) => {
  console.log("unhandledRejection: ", reason);
  process.exit(1);
});
