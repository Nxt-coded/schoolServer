import "./utils/nodeCompatibility";
import "dotenv/config";
import express, { Application, NextFunction, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import fs from "fs";
import dns from "dns";

// Override DNS servers to resolve MongoDB Atlas SRV lookup issues
dns.setServers(["8.8.8.8", "1.1.1.1"]);

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

const store = new MongoDBStore({
  uri: mongoDbUrl,
  collection: "sessions",
});

const app: Application = express();
const portServer = process.env.PORT!;

const port = parseInt(portServer);

// cors headers starts

app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});
// [`${process.env.APP_URL_DEPLOY}`, "https://just-next.onrender.com"]
// cors headers ends

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   limit: 10,
//   message: "Limit exceeded, please try again in 15mins time!!!",
//   // standardHeaders: "draft-7",
//   // legacyHeaders: false, process.env.APP_URL_DEPLOY

// });
// app.use(
//   cors({
//     origin: [
//       process.env.APP_URL_DEPLOY as string,
//       "https://justnext-dev.vercel.app",
//       "https://justnext-dev.netlify.app",
//     ],
//   })
// );
app.use(
  cors({
    origin: [
      process.env.APP_URL_DEPLOY as string,
      "https://justnext-dev.vercel.app",
      "https://justnext-dev.netlify.app",
      "https://just-next.web.app",
    ],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(helmet());
app.use(morgan("dev"));

// app.use(limiter)
app.use(cookieParser(process.env.SESSION_SECRET as string));
app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,

    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      // sameSite: "lax",
      // secure: false,
      httpOnly: true,
      // domain: process.env.APP_URL_DEPLOY,
    },

    store,
  }),
);

mainApp(app);

//13.51.1.65/.well-known/pki-validation/F5F57A81136A32F3A3EB73DF8DB4BC06.txt

const startServer = async () => {
  try {
    // Connect to database first
    await dbConfig();

    // Start server only after successful database connection
    const server = app.listen(process.env.PORT || port, () => {
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
