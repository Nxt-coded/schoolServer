"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFeesRecord = exports.getOneFeeRecord = exports.getAllFeeRecords = exports.recordSecondFeePayment = exports.recordFeesPayment = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const studentModel_1 = __importDefault(require("../model/studentModel"));
const recordPaymentModel_1 = __importDefault(require("../model/recordPaymentModel"));
const mongoose_1 = require("mongoose");
const recordFeesPayment = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { studentID } = req.params;
        const { feePaid, feePaidDate, paidByWho, paymentMode } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        const student = await studentModel_1.default.findById(studentID);
        if (school) {
            const getTerm = school?.presentTerm;
            if (getTerm) {
                const getStudentClassFee = student?.classTermFee;
                const currentBalance = getStudentClassFee - feePaid;
                const recordSchoolFeesPayment = await recordPaymentModel_1.default.create({
                    feePaid,
                    feePaidDate,
                    paidByWho,
                    paymentMode,
                    feeBalance: currentBalance,
                    classFees: getStudentClassFee,
                    getTerm: getTerm,
                    studentID: student?._id,
                    studentFirstName: student?.studentFirstName,
                    studentLastName: student?.studentLastName,
                    studentClass: student?.classAssigned,
                    studentAvatar: student?.avatar,
                    parentMail: student?.parentEmail,
                });
                school?.recordPayments.push(new mongoose_1.Types.ObjectId(recordSchoolFeesPayment._id));
                student?.recordPayments.push(new mongoose_1.Types.ObjectId(recordSchoolFeesPayment._id));
                school?.save();
                student?.save();
                return res.status(201).json({
                    message: "Sucessfully Recorded School fees Payment",
                    data: recordSchoolFeesPayment,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Current Term Not Selected",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "No School Found",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error Recording Term Fees",
            errorData: {
                errorMessage: error.message,
                errorStack: error.stack,
            },
            status: 404,
        });
    }
};
exports.recordFeesPayment = recordFeesPayment;
const recordSecondFeePayment = async (req, res) => {
    try {
        const { feePaid } = req.body;
        const { recordID } = req.params;
        const record = await recordPaymentModel_1.default.findById(recordID);
        if (record) {
            const pushRecord = record?.feePaid?.push(feePaid);
            if (pushRecord) {
                const getRecord = record?.feePaid;
                const totalFees = getRecord?.reduce((accumulator, currentVal) => {
                    return accumulator + currentVal;
                });
                const lastFeePaid = getRecord[getRecord?.length - 1];
                const getClassFees = record?.classFees;
                if (totalFees === getClassFees) {
                    const update = await recordPaymentModel_1.default.findByIdAndUpdate(record._id, { feePaymentComplete: true, feeBalance: totalFees }, { new: true });
                    await record.save();
                    return res.status(201).json({
                        message: "Successfully Recorded New Payment. Payment Now Complete",
                        data: {
                            main: update,
                            total: totalFees,
                        },
                        status: 201,
                    });
                }
                else {
                    const convertNum = Number(totalFees);
                    const balance = getClassFees - convertNum;
                    await record.save();
                    return res.status(201).json({
                        message: "Successfully Recorded New Payment.",
                        data: {
                            paid: lastFeePaid,
                            totalPaid: totalFees,
                            balance: balance,
                        },
                        status: 201,
                    });
                }
            }
            else {
                return res.status(404).json({
                    message: "No Payment Added",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "Error Recording New Payment",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error Recording Second Fees Payment",
            errorData: {
                errorMessage: error.message,
                errorStack: error.stack,
            },
            status: 404,
        });
    }
};
exports.recordSecondFeePayment = recordSecondFeePayment;
const getAllFeeRecords = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const getAll = await schoolModel_1.default.findById(schoolID).populate({
            path: "recordPayments",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(200).json({
            message: "Successfully Gotten All The Fees Data",
            data: getAll,
            status: 200,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error Getting ALL Fees Records",
            errorData: {
                errorMessage: error.message,
                errorStack: error.stack,
            },
            status: 404,
        });
    }
};
exports.getAllFeeRecords = getAllFeeRecords;
const getOneFeeRecord = async (req, res) => {
    try {
        const { studentID } = req.params;
        const getAll = await studentModel_1.default.findById(studentID).populate({
            path: "recordPayments",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(200).json({
            message: "Successfully Gotten All The Fees Data",
            data: getAll,
            status: 200,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error Getting ALL Fees Records",
            errorData: {
                errorMessage: error.message,
                errorStack: error.stack,
            },
            status: 404,
        });
    }
};
exports.getOneFeeRecord = getOneFeeRecord;
const deleteFeesRecord = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { studentID } = req.params;
        const { recordID } = req.params;
        const school = await schoolModel_1.default.findById(schoolID);
        const student = await studentModel_1.default.findById(studentID);
        if (school) {
            const findRecord = await recordPaymentModel_1.default.findByIdAndDelete(recordID);
            school?.recordPayments?.pull(new mongoose_1.Types.ObjectId(recordID));
            student?.recordPayments?.pull(new mongoose_1.Types.ObjectId(recordID));
            await school.save();
            await student.save();
            return res.status(200).json({
                message: "Successfully Deleted Fees Record",
                data: findRecord,
                status: 200,
            });
        }
        else {
            return res.status(404).json({
                message: "Error Deleting Fees Record",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error Deleting Fees Record",
            errorData: {
                errorMessage: error.message,
                errorStack: error.stack,
            },
            status: 404,
        });
    }
};
exports.deleteFeesRecord = deleteFeesRecord;
