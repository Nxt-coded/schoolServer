"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySMSPayment = exports.makeSMSPayment = exports.verifyOtherSchoolTransaction = exports.verifySchoolTransaction = exports.makeOtherSchoolPayment = exports.schoolFeePayment = exports.makeSplitSchoolfeePayment = exports.storePayment = exports.makeSplitPayment = exports.verifyTransaction = exports.makePayment = exports.createPayment = exports.getBankAccount = exports.createPaymentAccount = exports.paymentFromStore = exports.viewVerifyTransaction = exports.makeSchoolPayment = exports.viewSchoolPayment = exports.makePaymentWithCron = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const paymentModel_1 = __importDefault(require("../model/paymentModel"));
const mongoose_1 = require("mongoose");
const moment_1 = __importDefault(require("moment"));
const crypto_1 = __importDefault(require("crypto"));
const cron_1 = require("cron");
const axios_1 = __importDefault(require("axios"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// import https from "https";
const dotenv_1 = __importDefault(require("dotenv"));
const studentModel_1 = __importDefault(require("../model/studentModel"));
const termModel_1 = __importDefault(require("../model/termModel"));
const sessionModel_1 = __importDefault(require("../model/sessionModel"));
dotenv_1.default.config();
const URL = process.env.APP_URL_DEPLOY;
const https = require("https");
const makePaymentWithCron = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school && school.schoolName) {
            const startDate = new Date();
            const startedDate = new Date().setTime(startDate.getTime());
            // const dataPeriod = startDate.setFullYear(startDate.getFullYear() + 1);
            const dataPeriod = startDate.setMinutes(startDate.getMinutes() + 1);
            const paymentID = crypto_1.default.randomBytes(3).toString("hex");
            const payments = await paymentModel_1.default.create({
                cost: 200000,
                schoolName: school?.schoolName,
                expiryDate: (0, moment_1.default)(dataPeriod).format("LLLL"),
                datePaid: (0, moment_1.default)(startedDate).format("LLLL"),
                paymentID,
            });
            school.payments.push(new mongoose_1.Types.ObjectId(payments._id));
            school.save();
            await schoolModel_1.default.findByIdAndUpdate(schoolID, {
                plan: "active",
            }, { new: true });
            const timer = setTimeout(async () => {
                await schoolModel_1.default.findByIdAndUpdate(schoolID, {
                    plan: "in active",
                }, { new: true });
                clearTimeout(timer);
            }, 1000 * 60);
            // const cronParser = require("cron-parser");
            return res.status(201).json({
                message: "payment created successfully",
                data: school,
            });
        }
        else {
            return res.status(404).json({
                message: "unable to read school",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
        });
    }
};
exports.makePaymentWithCron = makePaymentWithCron;
const viewSchoolPayment = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const school = await schoolModel_1.default.findById(schoolID).populate({
            path: "payments",
        });
        return res.status(200).json({
            message: "viewing school payments",
            data: school,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error viewing school payments",
        });
    }
};
exports.viewSchoolPayment = viewSchoolPayment;
const makeSchoolPayment = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            cron_1.CronJob;
        }
        return res.status(200).json({
            message: "viewing school payments",
            data: school,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error viewing school payments",
        });
    }
};
exports.makeSchoolPayment = makeSchoolPayment;
const viewVerifyTransaction = async (req, res) => {
    try {
        const { ref } = req.params;
        await axios_1.default
            .get(`https://api.paystack.co/transaction/verify/${ref}`, {
            headers: {
                authorization: `Bearer ${process.env.APP_PAYSTACK}`,
                "content-type": "application/json",
                "cache-control": "no-cache",
            },
        })
            .then((resp) => {
            return res.status(201).json({
                message: "welcome",
                data: resp.data,
                status: 201,
            });
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error",
            data: error.message,
            error: error,
            status: 404,
        });
    }
};
exports.viewVerifyTransaction = viewVerifyTransaction;
const paymentFromStore = (req, res) => {
    try {
        const { account } = req.body;
        const params = JSON.stringify({
            email: "customer@email.com",
            amount: "20000",
            subaccount: account,
        });
        const options = {
            hostname: "api.paystack.co",
            port: 443,
            path: "/transaction/initialize",
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.APP_PAYSTACK}`,
                "Content-Type": "application/json",
            },
        };
        const request = https
            .request(options, (res) => {
            let data = "";
            res.on("data", (chunk) => {
                data += chunk;
            });
            res.on("end", () => { });
        })
            .on("error", (error) => {
            console.error(error);
        });
        request.write(params);
        request.end();
    }
    catch (error) {
        res.status(404).json({
            message: "Error",
            status: 404,
        });
    }
};
exports.paymentFromStore = paymentFromStore;
const createPaymentAccount = (req, res) => {
    try {
        const { account } = req.body;
        const params = JSON.stringify({
            // business_name: "Cheese Sticks",
            // bank_code: "058",
            account_number: "2254710854",
            percentage_charge: 20,
        });
        const options = {
            hostname: "api.paystack.co",
            port: 443,
            path: "/subaccount",
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.APP_PAYSTACK}`,
                "Content-Type": "application/json",
            },
        };
        const request = https
            .request(options, (resp) => {
            let data = "";
            resp.on("data", (chunk) => {
                data += chunk;
            });
            resp.on("end", () => {
                res.status(200).json({
                    message: "gotten",
                    data: JSON.parse(data),
                    status: 200,
                });
            });
        })
            .on("error", (error) => {
            console.error(error);
        });
        request.write(params);
        request.end();
    }
    catch (error) {
        res.status(404).json({
            message: "Error",
            status: 404,
        });
    }
};
exports.createPaymentAccount = createPaymentAccount;
const getBankAccount = (req, res) => {
    try {
        const { account } = req.body;
        const options = {
            hostname: "api.paystack.co",
            port: 443,
            path: "/bank",
            method: "GET",
            headers: {
                Authorization: `Bearer ${process.env.APP_PAYSTACK}`,
            },
        };
        https
            .request(options, (resp) => {
            let data = "";
            resp.on("data", (chunk) => {
                data += chunk;
            });
            resp.on("end", () => {
                res.status(200).json({
                    message: "gotten",
                    data: JSON.parse(data),
                    status: 200,
                });
            });
        })
            .on("error", (error) => {
            console.error(error);
        });
    }
    catch (error) {
        res.status(404).json({
            message: "Error",
            status: 404,
        });
    }
};
exports.getBankAccount = getBankAccount;
// Perfect integration and selected...
const createPayment = async (req, res) => {
    try {
        const { schoolID } = req.params;
        // const { cost, schoolName, expiryDate, datePaid, paymentID } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school && school.schoolName) {
            const startDate = new Date();
            const startedDate = new Date().setTime(startDate.getTime());
            // const dataPeriod = startDate.setFullYear(startDate.getFullYear() + 1);
            const dataPeriod = startDate.setMinutes(startDate.getMinutes() + 1);
            const paymentID = crypto_1.default.randomBytes(3).toString("hex");
            const payments = await paymentModel_1.default.create({
                cost: school?.students.length * 1000,
                schoolName: school?.schoolName,
                expiryDate: (0, moment_1.default)(dataPeriod).format("LLLL"),
                datePaid: (0, moment_1.default)(startedDate).format("LLLL"),
                paymentID,
            });
            school.payments.push(new mongoose_1.Types.ObjectId(payments._id));
            school.save();
            await schoolModel_1.default.findByIdAndUpdate(schoolID, {
                plan: "active",
            }, { new: true });
            // const timer = setTimeout(async () => {
            //   console.log("work out this...!");
            //   await schoolModel.findByIdAndUpdate(
            //     schoolID,
            //     {
            //       plan: "in active",
            //     },
            //     { new: true }
            //   );
            //   clearTimeout(timer);
            // }, 1000 * 60);
            return res.status(201).json({
                message: "payment created successfully",
                data: school,
            });
        }
        else {
            return res.status(404).json({
                message: "unable to read school",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
        });
    }
};
exports.createPayment = createPayment;
const makePayment = async (req, res) => {
    try {
        const { email } = req.body;
        const { schoolID } = req.params;
        const school = await schoolModel_1.default.findById(schoolID);
        let amount = school?.students.length * 1000;
        let termID = school?.presentTermID;
        let token = jsonwebtoken_1.default.sign({ termID }, process.env.API_SECRET_KEY, {
            expiresIn: "3d",
        });
        const params = JSON.stringify({
            email,
            amount: (amount * 100).toString(),
            callback_url: `${process.env.APP_URL_DEPLOY}/${token}/successful-payment`,
            metadata: {
                cancel_action: `${process.env.APP_URL_DEPLOY}`,
            },
            channels: ["card"],
        });
        const options = {
            hostname: "api.paystack.co",
            port: 443,
            path: "/transaction/initialize",
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.APP_PAYSTACK}`,
                "Content-Type": "application/json",
            },
        };
        const request = https
            .request(options, (response) => {
            let data = "";
            response.on("data", (chunk) => {
                data += chunk;
            });
            response.on("end", () => {
                return res.status(201).json({
                    message: "processing payment",
                    data: JSON.parse(data),
                    status: 201,
                });
            });
        })
            .on("error", (error) => {
            console.error(error);
        });
        request.write(params);
        request.end();
    }
    catch (error) {
        return res.status(404).json({
            message: "Error",
            data: error.message,
            status: 404,
        });
    }
};
exports.makePayment = makePayment;
const verifyTransaction = async (req, res) => {
    try {
        const { ref } = req.params;
        const url = `https://api.paystack.co/transaction/verify/${ref}`;
        console.log(ref);
        await axios_1.default
            .get(url, {
            headers: {
                Authorization: `Bearer ${process.env.APP_PAYSTACK}`,
            },
        })
            .then((data) => {
            return res.status(200).json({
                message: "payment verified",
                status: 200,
                data: data.data,
            });
        });
    }
    catch (error) {
        res.status(404).json({
            message: "Errror",
            data: error.message,
        });
    }
};
exports.verifyTransaction = verifyTransaction;
const makeSplitPayment = async (req, res) => {
    try {
        const { accountName, accountNumber, accountBankCode } = req.body;
        const params = JSON.stringify({
            business_name: accountName,
            settlement_bank: accountBankCode,
            account_number: accountNumber,
            percentage_charge: 10,
        });
        const options = {
            hostname: "api.paystack.co",
            port: 443,
            path: "/subaccount",
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.APP_PAYSTACK}`,
                "Content-Type": "application/json",
            },
        };
        const request = https
            .request(options, (response) => {
            let data = "";
            response.on("data", (chunk) => {
                data += chunk;
            });
            response.on("end", () => {
                return res.status(200).json({
                    message: "sub-account created",
                    status: 200,
                    data: JSON.parse(data),
                });
            });
        })
            .on("error", (error) => {
            console.error(error);
        });
        request.write(params);
        request.end();
    }
    catch (error) {
        return res.status(404).json({
            message: "Error viewing store",
        });
    }
};
exports.makeSplitPayment = makeSplitPayment;
const storePayment = async (req, res) => {
    try {
        const { subAccountCode, email, amount } = req.body;
        const params = JSON.stringify({
            email,
            amount: `${amount * 100}`,
            subaccount: subAccountCode,
            callback_url: `${URL}/purchase-history`,
            meta: {
                cancel: `${URL}`,
            },
        });
        const options = {
            hostname: "api.paystack.co",
            port: 443,
            path: "/transaction/initialize",
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.APP_PAYSTACK}`,
                "Content-Type": "application/json",
            },
        };
        const request = https
            .request(options, (response) => {
            let data = "";
            response.on("data", (chunk) => {
                data += chunk;
            });
            response.on("end", () => {
                return res.status(200).json({
                    message: "sub account payment ",
                    status: 200,
                    data: JSON.parse(data),
                });
            });
        })
            .on("error", (error) => {
            console.error(error);
        });
        request.write(params);
        request.end();
    }
    catch (error) {
        res.status(404).json({
            message: "Errror",
            data: error.message,
        });
    }
};
exports.storePayment = storePayment;
const makeSplitSchoolfeePayment = async (req, res) => {
    try {
        const { accountName, accountNumber, accountBankCode } = req.body;
        const params = JSON.stringify({
            business_name: accountName,
            settlement_bank: accountBankCode,
            account_number: accountNumber,
            percentage_charge: 5,
        });
        const options = {
            hostname: "api.paystack.co",
            port: 443,
            path: "/subaccount",
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.APP_PAYSTACK}`,
                "Content-Type": "application/json",
            },
        };
        const request = https
            .request(options, (response) => {
            let data = "";
            response.on("data", (chunk) => {
                data += chunk;
            });
            response.on("end", () => {
                return res.status(200).json({
                    message: "sub-account created",
                    status: 200,
                    data: JSON.parse(data),
                });
            });
        })
            .on("error", (error) => {
            console.error(error);
        });
        request.write(params);
        request.end();
    }
    catch (error) {
        return res.status(404).json({
            message: "Error viewing store",
        });
    }
};
exports.makeSplitSchoolfeePayment = makeSplitSchoolfeePayment;
const schoolFeePayment = async (req, res) => {
    try {
        const { subAccountCode, email, amount } = req.body;
        const params = JSON.stringify({
            email,
            amount: `${amount * 100}`,
            subaccount: subAccountCode,
            callback_url: `${URL}/school-fee-payment`,
            meta: {
                cancel: `${URL}`,
            },
        });
        const options = {
            hostname: "api.paystack.co",
            port: 443,
            path: "/transaction/initialize",
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.APP_PAYSTACK}`,
                "Content-Type": "application/json",
            },
        };
        const request = https
            .request(options, (response) => {
            let data = "";
            response.on("data", (chunk) => {
                data += chunk;
            });
            response.on("end", () => {
                return res.status(200).json({
                    message: "sub account payment ",
                    status: 200,
                    data: JSON.parse(data),
                });
            });
        })
            .on("error", (error) => {
            console.error(error);
        });
        request.write(params);
        request.end();
    }
    catch (error) {
        res.status(404).json({
            message: "Errror",
            data: error.message,
        });
    }
};
exports.schoolFeePayment = schoolFeePayment;
const makeOtherSchoolPayment = async (req, res) => {
    try {
        const { subAccountCode, email, paymentAmount, paymentName } = req.body;
        const params = JSON.stringify({
            email,
            amount: `${paymentAmount * 100}`,
            subaccount: subAccountCode,
            callback_url: `${URL}/other-school-payment`,
            meta: {
                cancel: `${URL}`,
                custom_fields: [
                    {
                        display_name: paymentName,
                    },
                ],
            },
        });
        const options = {
            hostname: "api.paystack.co",
            port: 443,
            path: "/transaction/initialize",
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.APP_PAYSTACK}`,
                "Content-Type": "application/json",
            },
        };
        const request = https
            .request(options, (response) => {
            let data = "";
            response.on("data", (chunk) => {
                data += chunk;
            });
            response.on("end", () => {
                return res.status(200).json({
                    message: "other payment made successfully",
                    status: 201,
                    data: JSON.parse(data),
                });
            });
        })
            .on("error", (error) => {
            console.error(error);
        });
        request.write(params);
        request.end();
    }
    catch (error) {
        res.status(404).json({
            message: "Errror",
            data: error.message,
        });
    }
};
exports.makeOtherSchoolPayment = makeOtherSchoolPayment;
const verifySchoolTransaction = async (req, res) => {
    try {
        const { ref, studentID } = req.params;
        const { paymentName } = req.body;
        const student = await studentModel_1.default.findById(studentID);
        const school = await schoolModel_1.default.findById(student?.schoolIDs).populate({
            path: "session",
        });
        const readSession = school?.session?.find((el) => el?._id.toString() === school?.presentSessionID);
        const termly = await sessionModel_1.default.findById(readSession?._id).populate({
            path: "term",
        });
        const readTerm = termly?.term?.find((el) => el?.presentTerm === school?.presentTerm &&
            el._id.toString() === school?.presentTermID);
        const mainTerm = await termModel_1.default.findById(readTerm?._id);
        const url = `https://api.paystack.co/transaction/verify/${ref}`;
        console.log("ref: ", ref);
        return await axios_1.default
            .get(url, {
            headers: {
                Authorization: `Bearer ${process.env.APP_PAYSTACK}`,
            },
        })
            .then(async (data) => {
            const check = mainTerm?.paymentOptions?.some((el) => el.reference === ref);
            if (!check) {
                let id = crypto_1.default.randomBytes(4).toString("hex");
                let newData = await termModel_1.default.findByIdAndUpdate(mainTerm?._id, {
                    paymentOptions: [
                        ...mainTerm?.paymentOptions,
                        {
                            id,
                            studentName: `${student?.studentFirstName} ${student?.studentLastName}`,
                            createdAt: (0, moment_1.default)(new Date().getTime()).format("lll"),
                            paymentMode: "online",
                            confirm: false,
                            paymentDetails: paymentName,
                            paymentAmount: parseFloat(data?.data?.data?.amount) / 100,
                            reference: data?.data?.data?.reference,
                            studentID,
                            schoolID: student?.schoolIDs,
                            termID: mainTerm?._id,
                            sessionID: school?.presentSessionID,
                            session: termly?.year,
                            term: mainTerm.presentTerm,
                        },
                    ],
                }, { new: true });
                await studentModel_1.default.findByIdAndUpdate(student?._id, {
                    otherPayment: [
                        ...student?.otherPayment,
                        {
                            id,
                            studentName: `${student?.studentFirstName} ${student?.studentLastName}`,
                            createdAt: (0, moment_1.default)(new Date().getTime()).format("lll"),
                            paymentMode: "online",
                            confirm: false,
                            paymentDetails: paymentName,
                            paymentAmount: parseFloat(data?.data?.data?.amount) / 100,
                            reference: data?.data?.data?.reference,
                            studentID,
                            schoolID: student?.schoolIDs,
                            termID: mainTerm?._id,
                            sessionID: school?.presentSessionID,
                            term: mainTerm.presentTerm,
                            session: termly?.year,
                        },
                    ],
                }, { new: true });
                return res.status(200).json({
                    message: "payment verified",
                    status: 200,
                    data: data.data,
                    newData,
                });
            }
            else {
                return res.status(200).json({
                    message: "Ref is already in used",
                    data: data.data,
                });
            }
        });
    }
    catch (error) {
        console.log("Error: ", error);
        res.status(404).json({
            message: "Errror",
            data: error.message,
        });
    }
};
exports.verifySchoolTransaction = verifySchoolTransaction;
const verifyOtherSchoolTransaction = async (req, res) => {
    try {
        const { studentID } = req.params;
        const { paymentName, paymentAmount } = req.body;
        const student = await studentModel_1.default.findById(studentID);
        const school = await schoolModel_1.default.findById(student?.schoolIDs).populate({
            path: "session",
        });
        const readSession = school?.session?.find((el) => el?._id.toString() === school?.presentSessionID);
        const termly = await sessionModel_1.default.findById(readSession?._id).populate({
            path: "term",
        });
        const readTerm = termly?.term?.find((el) => el?.presentTerm === school?.presentTerm &&
            el._id.toString() === school?.presentTermID);
        const mainTerm = await termModel_1.default.findById(readTerm?._id);
        let id = crypto_1.default.randomBytes(4).toString("hex");
        let reff = crypto_1.default.randomBytes(4).toString("hex");
        const check = mainTerm?.paymentOptions.some((el) => el?.paymentDetails === paymentName &&
            el?.term === mainTerm.presentTerm &&
            el?.session === termly?.year &&
            el?.studentName ===
                `${student?.studentFirstName} ${student?.studentLastName}`);
        if (!check) {
            let newData = await termModel_1.default.findByIdAndUpdate(mainTerm?._id, {
                paymentOptions: [
                    ...mainTerm?.paymentOptions,
                    {
                        id,
                        studentName: `${student?.studentFirstName} ${student?.studentLastName}`,
                        createdAt: (0, moment_1.default)(new Date().getTime()).format("lll"),
                        paymentMode: "cash",
                        confirm: false,
                        paymentDetails: paymentName,
                        paymentAmount: paymentAmount,
                        reference: reff,
                        studentID,
                        schoolID: student?.schoolIDs,
                        termID: mainTerm?._id,
                        sessionID: school?.presentSessionID,
                        session: termly?.year,
                        term: mainTerm.presentTerm,
                    },
                ],
            }, { new: true });
            await studentModel_1.default.findByIdAndUpdate(student?._id, {
                otherPayment: [
                    ...student?.otherPayment,
                    {
                        id,
                        studentName: `${student?.studentFirstName} ${student?.studentLastName}`,
                        createdAt: (0, moment_1.default)(new Date().getTime()).format("lll"),
                        paymentMode: "cash",
                        confirm: false,
                        paymentDetails: paymentName,
                        paymentAmount: paymentAmount,
                        reference: reff,
                        studentID,
                        schoolID: student?.schoolIDs,
                        termID: mainTerm?._id,
                        sessionID: school?.presentSessionID,
                        term: mainTerm.presentTerm,
                        session: termly?.year,
                    },
                ],
            }, { new: true });
            return res.status(200).json({
                message: "payment verified",
                status: 200,
                data: newData?.paymentOptions[newData?.paymentOptions?.length - 1],
            });
        }
        else {
            res.status(404).json({
                message: "Payment already made",
            });
        }
    }
    catch (error) {
        console.log(error);
        res.status(404).json({
            message: "Errror",
            data: error.message,
        });
    }
};
exports.verifyOtherSchoolTransaction = verifyOtherSchoolTransaction;
const makeSMSPayment = async (req, res) => {
    try {
        const { email } = req.body;
        const { schoolID } = req.params;
        const school = await schoolModel_1.default.findById(schoolID);
        // Cost: 6 Naira * 2/day * 5/week * 4/month * 4/term = 960 Naira per student
        let amount = school?.students.length * 960;
        const params = JSON.stringify({
            email,
            amount: (amount * 100).toString(),
            callback_url: `${process.env.APP_URL_DEPLOY}/sms-payment-success`,
            metadata: {
                paymentType: "sms_activation",
                schoolID,
            },
            channels: ["card"],
        });
        const options = {
            hostname: "api.paystack.co",
            port: 443,
            path: "/transaction/initialize",
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.APP_PAYSTACK}`,
                "Content-Type": "application/json",
            },
        };
        const request = https
            .request(options, (response) => {
            let data = "";
            response.on("data", (chunk) => {
                data += chunk;
            });
            response.on("end", () => {
                return res.status(201).json({
                    message: "processing SMS payment",
                    data: JSON.parse(data),
                    status: 201,
                });
            });
        })
            .on("error", (error) => {
            console.error(error);
        });
        request.write(params);
        request.end();
    }
    catch (error) {
        return res.status(404).json({
            message: "Error",
            data: error.message,
            status: 404,
        });
    }
};
exports.makeSMSPayment = makeSMSPayment;
const verifySMSPayment = async (req, res) => {
    try {
        const { ref, schoolID } = req.params;
        const url = `https://api.paystack.co/transaction/verify/${ref}`;
        const response = await axios_1.default.get(url, {
            headers: {
                Authorization: `Bearer ${process.env.APP_PAYSTACK}`,
            },
        });
        if (response.data.status && response.data.data.status === "success") {
            const metadata = response.data.data.metadata;
            if (metadata.paymentType === "sms_activation") {
                await schoolModel_1.default.findByIdAndUpdate(schoolID, { sendSMS: true }, { new: true });
                return res.status(200).json({
                    message: "SMS payment verified and activated",
                    status: 200,
                    data: response.data.data,
                });
            }
        }
        return res.status(400).json({
            message: "Payment verification failed",
            status: 400,
        });
    }
    catch (error) {
        res.status(404).json({
            message: "Error",
            data: error.message,
        });
    }
};
exports.verifySMSPayment = verifySMSPayment;
