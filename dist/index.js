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
const app = (0, express_1.default)();
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
].filter((origin) => Boolean(origin));
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: ["Content-Type"],
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("dev"));
// app.use(limiter)
app.use((0, cookie_parser_1.default)(process.env.SESSION_SECRET));
//13.51.1.65/.well-known/pki-validation/F5F57A81136A32F3A3EB73DF8DB4BC06.txt
const createSessionStore = () => new Promise((resolve, reject) => {
    let store;
    store = new MongoDBStore({
        uri: mongoDbUrl,
        collection: "sessions",
    }, (error) => {
        if (error) {
            reject(error);
            return;
        }
        resolve(store);
    });
    store.on("error", (error) => {
        console.error("Session store error:", error);
    });
});
const startServer = async () => {
    try {
        await (0, dbConfig_1.dbConfig)();
        const store = await createSessionStore();
        app.use((0, express_session_1.default)({
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: false,
            cookie: {
                maxAge: 1000 * 60 * 60 * 24,
                httpOnly: true,
            },
            store,
        }));
        (0, mainApp_1.mainApp)(app);
        const server = app.listen(port, () => {
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
