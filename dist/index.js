"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./utils/nodeCompatibility");
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dns_1 = __importDefault(require("dns"));
// Override DNS servers to resolve MongoDB Atlas SRV lookup issues
dns_1.default.setServers(["8.8.8.8", "1.1.1.1"]);
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_session_1 = __importDefault(require("express-session"));
const cors_1 = __importDefault(require("cors"));
const mainApp_1 = require("./mainApp");
const dbConfig_1 = require("./utils/dbConfig");
// import { rateLimit } from "express-rate-limit";
const connect_mongodb_session_1 = __importDefault(require("connect-mongodb-session"));
const MongoDBStore = (0, connect_mongodb_session_1.default)(express_session_1.default);
const mongoDbUrl = process.env.MONGO_DB_URL_ONLINE || process.env.MONGO_DB_URL_LOCAL;
if (!mongoDbUrl) {
    throw new Error("MONGO_DB_URL_ONLINE or MONGO_DB_URL_LOCAL must be configured");
}
const store = new MongoDBStore({
    uri: mongoDbUrl,
    collection: "sessions",
});
const app = (0, express_1.default)();
const portServer = process.env.PORT;
const port = parseInt(portServer);
// cors headers starts
app.use((req, res, next) => {
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
app.use((0, cors_1.default)({
    origin: [
        process.env.APP_URL_DEPLOY,
        "https://justnext-dev.vercel.app",
        "https://justnext-dev.netlify.app",
        "https://just-next.web.app",
    ],
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("dev"));
// app.use(limiter)
app.use((0, cookie_parser_1.default)(process.env.SESSION_SECRET));
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET,
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
}));
(0, mainApp_1.mainApp)(app);
//13.51.1.65/.well-known/pki-validation/F5F57A81136A32F3A3EB73DF8DB4BC06.txt
const startServer = async () => {
    try {
        // Connect to database first
        await (0, dbConfig_1.dbConfig)();
        // Start server only after successful database connection
        const server = app.listen(process.env.PORT || port, () => {
            console.clear();
            console.log(`Server running on port ${port}🔥❤️🔥`);
        });
        // Handle server-specific errors
        server.on("error", (error) => {
            console.error("Server error:", error);
            process.exit(1);
        });
        return server;
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};
const server = startServer();
exports.default = app;
process.on("uncaughtException", (error) => {
    console.log("uncaughtException: ", error);
    process.exit(1);
});
process.on("unhandledRejection", (reason) => {
    console.log("unhandledRejection: ", reason);
    process.exit(1);
});
