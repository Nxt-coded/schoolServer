"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
require("../utils/strategies/googleStrategy");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = (0, express_1.Router)();
router
    .route("/login-auth")
    .post((req, res, next) => {
    passport_1.default.authenticate("local", (err, user, info) => {
        if (err) {
            return res.status(404).json({
                message: err,
            });
        }
        else if (info) {
            return res.status(404).json({
                message: info,
            });
        }
        res.status(201).json({
            message: "Login successful",
            data: user,
        });
    })(req, res, next);
});
router
    .route("/login")
    .post(passport_1.default.authenticate("local"), function (req, res) {
    res.status(201).json({
        message: "Login successful",
        data: req.user,
    });
});
router.get("/auth/google-data", (req, res) => {
    try {
        return res.status(200).json({
            message: "data gotten",
            data: req.session.passport?.user.toString(),
        });
    }
    catch (error) {
        return res.status(404).json({ message: "error" });
    }
});
router
    .route("/auth/google")
    .get(passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
router.route("/auth/google/callback").get(passport_1.default.authenticate("google", {
    successRedirect: `${process.env.APP_URL_DEPLOY}/auth/enquiry-form`,
}), (req, res) => {
    return res
        .status(200)
        .json({ message: "we have authenticated", data: req.user });
});
exports.default = router;
