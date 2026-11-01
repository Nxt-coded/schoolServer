"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAllStudents = exports.deleteStudent = exports.changeStudentClass = exports.assignClassMonitor = exports.updateSchoolSchoolFee = exports.viewSchoolSchoolFeeRecord = exports.viewSchoolFeeRecord = exports.createSchoolFeePayment = exports.viewStorePurchasedTeacher = exports.createStorePurchasedTeacher = exports.updateSchoolStorePurchased = exports.viewSchoolStorePurchased = exports.viewStorePurchased = exports.createStorePurchased = exports.updatePurchaseRecord = exports.updateStudent3rdFees = exports.updateStudent2ndFees = exports.updateStudentLinkedinAccount = exports.updateXAcctount = exports.updateInstagramAccout = exports.updateStudentFacebookAcct = exports.updateStudent1stFees = exports.updateStudentParentNumber = exports.updateStudentBulkInfo = exports.updateMainStudentBulkInfo = exports.updateStudentInfo = exports.updateStudentViewReportCard = exports.updateStudentPhone = exports.updateStudentGender = exports.updateStudentAddress = exports.updateStudentLastName = exports.updateStudentFirstName = exports.updateStudentParentEmail = exports.updateStudentAvatar = exports.logoutStudent = exports.readStudentCookie = exports.loginStudentWithToken = exports.loginStudent = exports.readStudentDetail = exports.readStudentByEnrollmentID = exports.readSchoolStudents = exports.createBulkSchoolStudent = exports.createSchoolStudent = exports.qrStaffLogin = exports.qrScanClockInOut = exports.clockOutAccountWidthID = exports.clockOutAccount = exports.clockinAccountWithID = exports.clockinAccount = exports.findStudenWithEnrollmentID = void 0;
exports.testSMS = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const studentModel_1 = __importDefault(require("../model/studentModel"));
const mongoose_1 = require("mongoose");
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const streamifier_1 = require("../utils/streamifier");
const email_1 = require("../utils/email");
const staffModel_1 = __importDefault(require("../model/staffModel"));
const classroomModel_1 = __importDefault(require("../model/classroomModel"));
const historyModel_1 = __importDefault(require("../model/historyModel"));
const schoolFeeHistory_1 = __importDefault(require("../model/schoolFeeHistory"));
// import subjectModel from "../model/subjectModel";
const csvtojson_1 = __importDefault(require("csvtojson"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const termModel_1 = __importDefault(require("../model/termModel"));
const attendanceModel_1 = __importDefault(require("../model/attendanceModel"));
const sms_1 = require("../utils/sms");
// CLOCK-IN/CLOCK-OUT
const findStudenWithEnrollmentID = async (req, res) => {
    try {
        const { enrollmentID } = req.body;
        const student = await studentModel_1.default.findOne({ enrollmentID });
        return res.status(201).json({
            message: "viewing student with enrollment ID",
            data: student,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error finding student",
            data: {
                errorMessage: error.message,
                errorType: error.stack,
            },
        });
    }
};
exports.findStudenWithEnrollmentID = findStudenWithEnrollmentID;
const clockinAccount = async (req, res) => {
    try {
        const { schoolID, studentID } = req.params;
        // SECURITY: Verify that a staff member is logged in
        if (!req.session.isAuth || !req.session.isSchoolID) {
            return res.status(401).json({
                message: "Unauthorized: Staff authentication required",
                status: 401,
            });
        }
        const school = await schoolModel_1.default.findById(schoolID);
        const staff = await staffModel_1.default.findById(req.session.isSchoolID);
        if (school) {
            const student = await studentModel_1.default.findById(studentID);
            if (student && student.schoolIDs === school?._id.toString()) {
                const nowMillis = new Date().getTime();
                const currentHour = new Date().getHours();
                const thirtyMinutes = 30 * 60 * 1000;
                // 1. Cooldown Check
                if (student.lastActionTimestamp && (nowMillis - student.lastActionTimestamp < thirtyMinutes)) {
                    const remainingMins = Math.ceil((thirtyMinutes - (nowMillis - student.lastActionTimestamp)) / (60 * 1000));
                    return res.status(400).json({
                        message: `Cooldown active. Please wait ${remainingMins} more minutes.`,
                        status: 400,
                    });
                }
                // 2. Time Window Check (6 AM - 12 PM Lagos Time for clock-in)
                const lagosTime = (0, moment_timezone_1.default)().tz("Africa/Lagos");
                const lagosHour = lagosTime.hour();
                if (lagosHour < 6 || lagosHour >= 12) {
                    return res.status(400).json({
                        message: `Clock-in is only allowed between 6:00 AM and 12:00 PM (Lagos Time). Current Lagos hour: ${lagosHour}`,
                        status: 400,
                    });
                }
                // AUTH CHECK: Ensure staff belongs to this school
                if (!staff || (staff.schoolIDs !== schoolID && staff.schoolName !== school.schoolName)) {
                    return res.status(403).json({
                        message: "You do not have permission to mark attendance for this school",
                        status: 403,
                    });
                }
                const clockInfo = await studentModel_1.default.findByIdAndUpdate(student._id, {
                    clockIn: true,
                    clockInTime: lagosTime.format("llll"),
                    clockOut: false,
                    lastActionTimestamp: nowMillis,
                }, { new: true });
                if (clockInfo) {
                    await (0, email_1.clockingInEmail)(clockInfo, school);
                    await (0, sms_1.sendClockInSMS)(clockInfo, school);
                }
                // CREATE ATTENDANCE RECORD
                try {
                    const dater = Date.now();
                    const attendance = await attendanceModel_1.default.create({
                        className: student.classAssigned,
                        studentFirstName: student.studentFirstName,
                        studentLastName: student.studentLastName,
                        classTeacher: staff.staffName,
                        dateTime: `${(0, moment_timezone_1.default)(dater).format("dddd")}, ${(0, moment_timezone_1.default)(dater).format("MMMM Do YYYY")}`,
                        date: (0, moment_timezone_1.default)(dater).format("dddd"),
                        present: true,
                        absent: false,
                        staffs: staff._id,
                        students: student._id,
                        classes: student.presentClassID,
                    });
                    // Update references
                    if (staff.attendance) {
                        staff.attendance.push(new mongoose_1.Types.ObjectId(attendance._id));
                        await staff.save();
                    }
                    if (student.attendance) {
                        student.attendance.push(new mongoose_1.Types.ObjectId(attendance._id));
                        await student.save();
                    }
                    const classroom = await classroomModel_1.default.findById(student.presentClassID);
                    if (classroom && classroom.attendance) {
                        classroom.attendance.push(new mongoose_1.Types.ObjectId(attendance._id));
                        await classroom.save();
                    }
                }
                catch (attErr) {
                    console.error("Error creating attendance record during clock-in:", attErr);
                }
                return res.status(201).json({
                    message: "student has clock-in",
                    data: clockInfo,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Student Does Not Exist",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "School Does not Exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error clockin student",
            data: {
                errorMessage: error.message,
                errorType: error.stack,
            },
        });
    }
};
exports.clockinAccount = clockinAccount;
const clockinAccountWithID = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { enrollmentID } = req.body;
        // SECURITY: Verify that a staff member is logged in
        if (!req.session.isAuth || !req.session.isSchoolID) {
            return res.status(401).json({
                message: "Unauthorized: Staff authentication required",
                status: 401,
            });
        }
        const school = await schoolModel_1.default.findById(schoolID);
        const staff = await staffModel_1.default.findById(req.session.isSchoolID);
        if (school) {
            const student = await studentModel_1.default.findOne({ enrollmentID });
            if (student) {
                const nowMillis = new Date().getTime();
                const currentHour = new Date().getHours();
                const thirtyMinutes = 30 * 60 * 1000;
                // 1. Cooldown Check
                if (student.lastActionTimestamp && (nowMillis - student.lastActionTimestamp < thirtyMinutes)) {
                    const remainingMins = Math.ceil((thirtyMinutes - (nowMillis - student.lastActionTimestamp)) / (60 * 1000));
                    return res.status(400).json({
                        message: `Cooldown active. Please wait ${remainingMins} more minutes.`,
                        status: 400,
                    });
                }
                // 2. Time Window Check (6 AM - 12 PM Lagos Time for clock-in)
                const lagosTime = (0, moment_timezone_1.default)().tz("Africa/Lagos");
                const lagosHour = lagosTime.hour();
                if (lagosHour < 6 || lagosHour >= 12) {
                    return res.status(400).json({
                        message: `Clock-in is only allowed between 6:00 AM and 12:00 PM (Lagos Time). Current Lagos hour: ${lagosHour}`,
                        status: 400,
                    });
                }
                // AUTH CHECK: Ensure staff belongs to this school
                if (!staff || (staff.schoolIDs !== schoolID && staff.schoolName !== school.schoolName)) {
                    return res.status(403).json({
                        message: "You do not have permission to mark attendance for this school",
                        status: 403,
                    });
                }
                const clockInfo = await studentModel_1.default.findByIdAndUpdate(student._id, {
                    clockIn: true,
                    clockInTime: lagosTime.format("llll"),
                    clockOut: false,
                    lastActionTimestamp: nowMillis,
                }, { new: true });
                if (clockInfo) {
                    await (0, email_1.clockingInEmail)(clockInfo, school);
                    await (0, sms_1.sendClockInSMS)(clockInfo, school);
                }
                // CREATE ATTENDANCE RECORD
                try {
                    const dater = Date.now();
                    const attendance = await attendanceModel_1.default.create({
                        className: student.classAssigned,
                        studentFirstName: student.studentFirstName,
                        studentLastName: student.studentLastName,
                        classTeacher: staff.staffName,
                        dateTime: `${(0, moment_timezone_1.default)(dater).format("dddd")}, ${(0, moment_timezone_1.default)(dater).format("MMMM Do YYYY")}`,
                        date: (0, moment_timezone_1.default)(dater).format("dddd"),
                        present: true,
                        absent: false,
                        staffs: staff._id,
                        students: student._id,
                        classes: student.presentClassID,
                    });
                    // Update references
                    if (staff.attendance) {
                        staff.attendance.push(new mongoose_1.Types.ObjectId(attendance._id));
                        await staff.save();
                    }
                    if (student.attendance) {
                        student.attendance.push(new mongoose_1.Types.ObjectId(attendance._id));
                        await student.save();
                    }
                    const classroom = await classroomModel_1.default.findById(student.presentClassID);
                    if (classroom && classroom.attendance) {
                        classroom.attendance.push(new mongoose_1.Types.ObjectId(attendance._id));
                        await classroom.save();
                    }
                }
                catch (attErr) {
                    console.error("Error creating attendance record during clock-in:", attErr);
                }
                return res.status(201).json({
                    message: "student has clock-in",
                    data: clockInfo,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Student Does Not Exist",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "School Does not Exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error clockin student",
            data: {
                errorMessage: error.message,
                errorType: error.stack,
            },
        });
    }
};
exports.clockinAccountWithID = clockinAccountWithID;
const clockOutAccount = async (req, res) => {
    try {
        const { schoolID, studentID } = req.params;
        // SECURITY: Verify that a staff member is logged in
        if (!req.session.isAuth || !req.session.isSchoolID) {
            return res.status(401).json({
                message: "Unauthorized: Staff authentication required",
                status: 401,
            });
        }
        const school = await schoolModel_1.default.findById(schoolID);
        const staff = await staffModel_1.default.findById(req.session.isSchoolID);
        if (school) {
            const student = await studentModel_1.default.findById(studentID);
            if (student && student.schoolIDs === school?._id.toString()) {
                const nowMillis = new Date().getTime();
                const currentHour = new Date().getHours();
                const thirtyMinutes = 30 * 60 * 1000;
                // 1. Cooldown Check
                if (student.lastActionTimestamp && (nowMillis - student.lastActionTimestamp < thirtyMinutes)) {
                    const remainingMins = Math.ceil((thirtyMinutes - (nowMillis - student.lastActionTimestamp)) / (60 * 1000));
                    return res.status(400).json({
                        message: `Cooldown active. Please wait ${remainingMins} more minutes.`,
                        status: 400,
                    });
                }
                // 2. Time Window Check (12:01 PM - 8 PM Lagos Time for clock-out)
                const lagosTime = (0, moment_timezone_1.default)().tz("Africa/Lagos");
                const lagosHour = lagosTime.hour();
                const lagosMinute = lagosTime.minute();
                // 12:01 PM check (Hour 12, Minute >= 1) or Hour > 12 and < 20 (8 PM)
                const isAfterNoon = (lagosHour === 12 && lagosMinute >= 1) || lagosHour > 12;
                const isBeforeEight = lagosHour < 20;
                if (!isAfterNoon || !isBeforeEight) {
                    return res.status(400).json({
                        message: `Clock-out is only allowed between 12:01 PM and 8:00 PM (Lagos Time). Current Lagos time: ${lagosHour}:${lagosMinute}`,
                        status: 400,
                    });
                }
                // AUTH CHECK: Ensure staff belongs to this school
                if (!staff || (staff.schoolIDs !== schoolID && staff.schoolName !== school.schoolName)) {
                    return res.status(403).json({
                        message: "You do not have permission to mark attendance for this school",
                        status: 403,
                    });
                }
                if (student?.clockIn) {
                    const clockInfo = await studentModel_1.default.findByIdAndUpdate(student._id, {
                        clockIn: false,
                        clockOut: true,
                        clockOutTime: lagosTime.format("llll"),
                        lastActionTimestamp: nowMillis,
                    }, { new: true });
                    if (clockInfo) {
                        await (0, email_1.clockingOutEmail)(clockInfo, school);
                        await (0, sms_1.sendClockOutSMS)(clockInfo, school);
                    }
                    // CREATE ATTENDANCE RECORD (as Absent/Out)
                    try {
                        const dater = Date.now();
                        const attendance = await attendanceModel_1.default.create({
                            className: student.classAssigned,
                            studentFirstName: student.studentFirstName,
                            studentLastName: student.studentLastName,
                            classTeacher: staff.staffName,
                            dateTime: `${(0, moment_timezone_1.default)(dater).format("dddd")}, ${(0, moment_timezone_1.default)(dater).format("MMMM Do YYYY")}`,
                            date: (0, moment_timezone_1.default)(dater).format("dddd"),
                            present: false,
                            absent: true,
                            staffs: staff._id,
                            students: student._id,
                            classes: student.presentClassID,
                        });
                        // Update references
                        if (staff.attendance) {
                            staff.attendance.push(new mongoose_1.Types.ObjectId(attendance._id));
                            await staff.save();
                        }
                        if (student.attendance) {
                            student.attendance.push(new mongoose_1.Types.ObjectId(attendance._id));
                            await student.save();
                        }
                        const classroom = await classroomModel_1.default.findById(student.presentClassID);
                        if (classroom && classroom.attendance) {
                            classroom.attendance.push(new mongoose_1.Types.ObjectId(attendance._id));
                            await classroom.save();
                        }
                    }
                    catch (attErr) {
                        console.error("Error creating attendance record during clock-out:", attErr);
                    }
                    return res.status(201).json({
                        message: "student has clock-in",
                        data: clockInfo,
                        status: 201,
                    });
                }
                else {
                    return res.status(404).json({
                        message: "Student has to be clock-in first before they can be clock-out",
                        status: 404,
                    });
                }
            }
            else {
                return res.status(404).json({
                    message: "Student Does Not Exist",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "School Does not Exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error clockin student",
            data: {
                errorMessage: error.message,
                errorType: error.stack,
            },
        });
    }
};
exports.clockOutAccount = clockOutAccount;
const clockOutAccountWidthID = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { enrollmentID } = req.body;
        // SECURITY: Verify that a staff member is logged in
        if (!req.session.isAuth || !req.session.isSchoolID) {
            return res.status(401).json({
                message: "Unauthorized: Staff authentication required",
                status: 401,
            });
        }
        const school = await schoolModel_1.default.findById(schoolID);
        const staff = await staffModel_1.default.findById(req.session.isSchoolID);
        if (school) {
            const student = await studentModel_1.default.findOne({ enrollmentID });
            if (student) {
                const nowMillis = new Date().getTime();
                const currentHour = new Date().getHours();
                const thirtyMinutes = 30 * 60 * 1000;
                // 1. Cooldown Check
                if (student.lastActionTimestamp && (nowMillis - student.lastActionTimestamp < thirtyMinutes)) {
                    const remainingMins = Math.ceil((thirtyMinutes - (nowMillis - student.lastActionTimestamp)) / (60 * 1000));
                    return res.status(400).json({
                        message: `Cooldown active. Please wait ${remainingMins} more minutes.`,
                        status: 400,
                    });
                }
                // 2. Time Window Check (12:01 PM - 8 PM Lagos Time for clock-out)
                const lagosTime = (0, moment_timezone_1.default)().tz("Africa/Lagos");
                const lagosHour = lagosTime.hour();
                const lagosMinute = lagosTime.minute();
                const isAfterNoon = (lagosHour === 12 && lagosMinute >= 1) || lagosHour > 12;
                const isBeforeEight = lagosHour < 20;
                if (!isAfterNoon || !isBeforeEight) {
                    return res.status(400).json({
                        message: `Clock-out is only allowed between 12:01 PM and 8:00 PM (Lagos Time). Current Lagos time: ${lagosHour}:${lagosMinute}`,
                        status: 400,
                    });
                }
                // AUTH CHECK: Ensure staff belongs to this school
                if (!staff || (staff.schoolIDs !== schoolID && staff.schoolName !== school.schoolName)) {
                    return res.status(403).json({
                        message: "You do not have permission to mark attendance for this school",
                        status: 403,
                    });
                }
                if (student?.clockIn) {
                    const clockInfo = await studentModel_1.default.findByIdAndUpdate(student._id, {
                        clockIn: false,
                        clockOut: true,
                        clockOutTime: lagosTime.format("llll"),
                        lastActionTimestamp: nowMillis,
                    }, { new: true });
                    if (clockInfo) {
                        await (0, email_1.clockingOutEmail)(clockInfo, school);
                        await (0, sms_1.sendClockOutSMS)(clockInfo, school);
                    }
                    // CREATE ATTENDANCE RECORD (as Absent/Out)
                    try {
                        const dater = Date.now();
                        const attendance = await attendanceModel_1.default.create({
                            className: student.classAssigned,
                            studentFirstName: student.studentFirstName,
                            studentLastName: student.studentLastName,
                            classTeacher: staff.staffName,
                            dateTime: `${(0, moment_timezone_1.default)(dater).format("dddd")}, ${(0, moment_timezone_1.default)(dater).format("MMMM Do YYYY")}`,
                            date: (0, moment_timezone_1.default)(dater).format("dddd"),
                            present: false,
                            absent: true,
                            staffs: staff._id,
                            students: student._id,
                            classes: student.presentClassID,
                        });
                        // Update references
                        if (staff.attendance) {
                            staff.attendance.push(new mongoose_1.Types.ObjectId(attendance._id));
                            await staff.save();
                        }
                        if (student.attendance) {
                            student.attendance.push(new mongoose_1.Types.ObjectId(attendance._id));
                            await student.save();
                        }
                        const classroom = await classroomModel_1.default.findById(student.presentClassID);
                        if (classroom && classroom.attendance) {
                            classroom.attendance.push(new mongoose_1.Types.ObjectId(attendance._id));
                            await classroom.save();
                        }
                    }
                    catch (attErr) {
                        console.error("Error creating attendance record during clock-out:", attErr);
                    }
                    return res.status(201).json({
                        message: "student has clock-in",
                        data: clockInfo,
                        status: 201,
                    });
                }
                else {
                    return res.status(404).json({
                        message: "Student has to be clock-in first before they can be clock-out",
                        status: 404,
                    });
                }
            }
            else {
                return res.status(404).json({
                    message: "Student Does Not Exist",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "School Does not Exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error clockin student",
            data: {
                errorMessage: error.message,
                errorType: error.stack,
            },
        });
    }
};
exports.clockOutAccountWidthID = clockOutAccountWidthID;
// QR Scan Clock-In/Out (called when phone scans student QR code)
const qrScanClockInOut = async (req, res) => {
    try {
        const { schoolID, studentID } = req.params;
        // SECURITY: Verify that a staff member is logged in
        if (!req.session.isAuth || !req.session.isSchoolID) {
            // Return a mobile-optimized login page
            const errorMsg = req.query.error === "true" ? "<p style='color:#ef4444;margin-bottom:15px;font-size:14px;'>❌ Invalid credentials. Please try again.</p>" : "";
            return res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Staff Authentication Required</title>
          <style>
            body { font-family: sans-serif; background: #0f172a; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; color: white; }
            .card { background: white; color: #1e293b; padding: 30px; border-radius: 16px; width: 100%; max-width: 360px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
            h2 { margin: 0 0 10px; color: #1e3a8a; }
            p.desc { color: #64748b; font-size: 14px; margin-bottom: 20px; }
            .field { margin-bottom: 15px; }
            label { display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 5px; color: #475569; }
            input { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 16px; box-sizing: border-box; }
            button { width: 100%; padding: 14px; background: #1e3a8a; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; margin-top: 10px; }
            button:active { transform: scale(0.98); }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Staff Login</h2>
            <p class="desc">Please enter your Staff ID to record attendance for this student.</p>
            ${errorMsg}
            <form action="/api/qr-staff-login" method="POST">
              <input type="hidden" name="schoolID" value="${schoolID}" />
              <input type="hidden" name="studentID" value="${studentID}" />
              <div class="field">
                <label>Staff ID (Enrollment ID)</label>
                <input type="text" name="enrollmentID" required placeholder="ST-12345" />
              </div>
              <button type="submit">Verify & Process Scan</button>
            </form>
            <div style="margin-top:20px;text-align:center;">
              <a href="javascript:history.back()" style="color:#64748b;font-size:14px;text-decoration:none;">← Return to Scanner</a>
            </div>
          </div>
        </body>
        </html>
      `);
        }
        const school = await schoolModel_1.default.findById(schoolID);
        const student = await studentModel_1.default.findById(studentID);
        // Check if the session is for a Staff or a School Admin
        let staff = await staffModel_1.default.findById(req.session.isSchoolID);
        let isAdmin = false;
        if (!staff) {
            // If not staff, check if it's the school admin themselves
            const schoolAdmin = await schoolModel_1.default.findById(req.session.isSchoolID);
            if (schoolAdmin && schoolAdmin._id.toString() === schoolID) {
                isAdmin = true;
            }
        }
        if (!school || !student) {
            return res.status(404).send(`
        <html><body style="font-family:sans-serif;text-align:center;padding:40px;background:#fef2f2;">
          <h2 style="color:#dc2626;">❌ Resource Not Found</h2>
          <p style="margin-bottom:20px;">This QR code is invalid or the student/school record is missing.</p>
          <a href="javascript:history.back()" style="display:inline-block;padding:12px 24px;background:#dc2626;color:white;text-decoration:none;border-radius:8px;font-weight:600;">Return to Scanner</a>
        </body></html>
      `);
        }
        // AUTH CHECK: Ensure either valid staff or school admin belongs to this school
        const isAuthorizedStaff = staff && (staff.schoolIDs === schoolID || staff.schoolName === school.schoolName);
        if (!isAuthorizedStaff && !isAdmin) {
            return res.status(403).send(`
        <html><body style="font-family:sans-serif;text-align:center;padding:40px;background:#fef2f2;">
          <h2 style="color:#dc2626;">❌ Unauthorized Access</h2>
          <p style="margin-bottom:20px;">You do not have permission to record attendance for this school. Please log in as an authorized Staff or School Admin.</p>
          <a href="javascript:history.back()" style="display:inline-block;padding:12px 24px;background:#dc2626;color:white;text-decoration:none;border-radius:8px;font-weight:600;">Return to Scanner</a>
        </body></html>
      `);
        }
        // Set the name of the person marking attendance
        const markedBy = isAdmin ? "School Admin" : staff.staffName;
        const staffId = isAdmin ? school._id : staff._id;
        const lagosTime = (0, moment_timezone_1.default)().tz("Africa/Lagos");
        const nowMillis = lagosTime.valueOf();
        const lagosHour = lagosTime.hour();
        const lagosMinute = lagosTime.minute();
        const now = lagosTime.format("llll");
        const name = `${student.studentFirstName} ${student.studentLastName}`;
        // 1. 30-Minute Cooldown Check
        const thirtyMinutes = 30 * 60 * 1000;
        if (student.lastActionTimestamp && (nowMillis - student.lastActionTimestamp < thirtyMinutes)) {
            const remainingMillis = thirtyMinutes - (nowMillis - student.lastActionTimestamp);
            const remainingMins = Math.ceil(remainingMillis / (60 * 1000));
            return res.status(200).send(`
        <html><body style="font-family:sans-serif;text-align:center;padding:40px;background:#fff7ed;">
          <div style="font-size:60px;margin-bottom:16px;">⏳</div>
          <h2 style="color:#c2410c;">Cooldown Active</h2>
          <p style="color:#7c2d12;margin-bottom:20px;">Please wait at least 30 minutes between clocking actions. Try again in about <strong>${remainingMins} minutes</strong>.</p>
          <a href="javascript:history.back()" style="display:inline-block;padding:12px 24px;background:#c2410c;color:white;text-decoration:none;border-radius:8px;font-weight:600;">Return to Scanner</a>
        </body></html>
      `);
        }
        let action;
        let actionTime;
        if (student.clockIn) {
            // Restriction: Clock-out only between 12:01 PM and 8:00 PM
            const isAfterNoon = (lagosHour === 12 && lagosMinute >= 1) || lagosHour > 12;
            const isBeforeEight = lagosHour < 20;
            if (!isAfterNoon || !isBeforeEight) {
                return res.status(200).send(`
            <html><body style="font-family:sans-serif;text-align:center;padding:40px;background:#fef2f2;">
              <div style="font-size:60px;margin-bottom:16px;">⏰</div>
              <h2 style="color:#dc2626;">Clock-out Restricted</h2>
              <p style="color:#991b1b;margin-bottom:20px;">Clock-out is only allowed between <strong>12:01 PM and 8:00 PM</strong> (Lagos Time). (Lagos Hour: ${lagosHour}:${lagosMinute})</p>
              <a href="javascript:history.back()" style="display:inline-block;padding:12px 24px;background:#dc2626;color:white;text-decoration:none;border-radius:8px;font-weight:600;">Return to Scanner</a>
            </body></html>
          `);
            }
            const updated = await studentModel_1.default.findByIdAndUpdate(student._id, {
                clockIn: false,
                clockOut: true,
                clockOutTime: now,
                lastActionTimestamp: nowMillis
            }, { new: true });
            if (updated) {
                await (0, email_1.clockingOutEmail)(updated, school);
                await (0, sms_1.sendClockOutSMS)(updated, school);
            }
            action = "Clocked Out";
            actionTime = now;
        }
        else {
            // Restriction: Clock-in only between 6:00 AM and 12:00 NOON
            if (lagosHour < 6 || lagosHour >= 12) {
                return res.status(200).send(`
            <html><body style="font-family:sans-serif;text-align:center;padding:40px;background:#fef2f2;">
              <div style="font-size:60px;margin-bottom:16px;">⏰</div>
              <h2 style="color:#dc2626;">Clock-in Restricted</h2>
              <p style="color:#991b1b;margin-bottom:20px;">Clock-in is only allowed between <strong>6:00 AM and 12:00 NOON</strong> (Lagos Time). (Lagos Hour: ${lagosHour})</p>
              <a href="javascript:history.back()" style="display:inline-block;padding:12px 24px;background:#dc2626;color:white;text-decoration:none;border-radius:8px;font-weight:600;">Return to Scanner</a>
            </body></html>
          `);
            }
            const updated = await studentModel_1.default.findByIdAndUpdate(student._id, {
                clockIn: true,
                clockInTime: now,
                clockOut: false,
                lastActionTimestamp: nowMillis
            }, { new: true });
            if (updated) {
                await (0, email_1.clockingInEmail)(updated, school);
                await (0, sms_1.sendClockInSMS)(updated, school);
            }
            action = "Clocked In";
            actionTime = now;
        }
        // CREATE ATTENDANCE RECORD
        try {
            const dater = Date.now();
            const attendance = await attendanceModel_1.default.create({
                className: student.classAssigned,
                studentFirstName: student.studentFirstName,
                studentLastName: student.studentLastName,
                classTeacher: markedBy,
                dateTime: `${(0, moment_timezone_1.default)(dater).format("dddd")}, ${(0, moment_timezone_1.default)(dater).format("MMMM Do YYYY")}`,
                date: (0, moment_timezone_1.default)(dater).format("dddd"),
                present: action === "Clocked In" ? true : false,
                absent: action === "Clocked Out" ? true : false,
                staffs: staffId,
                students: student._id,
                classes: student.presentClassID,
            });
            // Update references
            if (!isAdmin && staff && staff.attendance) {
                staff.attendance.push(new mongoose_1.Types.ObjectId(attendance._id));
                await staff.save();
            }
            if (student.attendance) {
                student.attendance.push(new mongoose_1.Types.ObjectId(attendance._id));
                await student.save();
            }
            const classroom = await classroomModel_1.default.findById(student.presentClassID);
            if (classroom && classroom.attendance) {
                classroom.attendance.push(new mongoose_1.Types.ObjectId(attendance._id));
                await classroom.save();
            }
        }
        catch (attErr) {
            console.error("Error creating attendance record during QR scan:", attErr);
        }
        return res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Attendance Recorded</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .card {
            background: white;
            border-radius: 20px;
            padding: 40px 30px;
            text-align: center;
            max-width: 360px;
            width: 100%;
            box-shadow: 0 25px 60px rgba(0,0,0,0.4);
          }
          .icon { font-size: 60px; margin-bottom: 16px; }
          .action {
            font-size: 26px;
            font-weight: 800;
            color: #1e3a8a;
            margin-bottom: 8px;
          }
          .name {
            font-size: 18px;
            font-weight: 600;
            color: #374151;
            text-transform: capitalize;
            margin-bottom: 6px;
          }
          .time {
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 20px;
          }
          .badge {
            display: inline-block;
            background: #eff6ff;
            color: #1d4ed8;
            border-radius: 999px;
            padding: 6px 18px;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.05em;
            text-transform: uppercase;
          }
          .school { font-size: 12px; color: #9ca3af; margin-top: 20px; }
          .staff-info { font-size: 11px; color: #64748b; margin-top: 15px; border-top: 1px solid #f1f5f9; padding-top: 15px; margin-bottom: 20px; }
          .btn-group { display: flex; flex-direction: column; gap: 10px; }
          .btn { display: block; width: 100%; padding: 12px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; transition: all 0.2s; }
          .btn-primary { background: #1e3a8a; color: white; }
          .btn-secondary { background: #f1f5f9; color: #1e3a8a; border: 1px solid #e2e8f0; }
          .btn:active { transform: scale(0.98); }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">${action === "Clocked In" ? "✅" : "👋"}</div>
          <div class="action">${action}!</div>
          <div class="name">${name}</div>
          <div class="time">${actionTime}</div>
          <div class="badge">${student.enrollmentID}</div>
          <div class="staff-info">Marked by: ${markedBy}</div>
          
          <div class="btn-group">
            <a href="javascript:history.back()" class="btn btn-primary">
               Return to Scanner
            </a>
            <a href="${process.env.APP_URL_DEPLOY || ""}/dashboard" class="btn btn-secondary">
               Done (Go to Dashboard)
            </a>
          </div>
        </div>
      </body>
      </html>
    `);
    }
    catch (error) {
        return res.status(500).send(`
      <html><body style="font-family:sans-serif;text-align:center;padding:40px;background:#fef2f2;">
        <h2 style="color:#dc2626;">⚠️ Error</h2>
        <p>${error.message}</p>
      </body></html>
    `);
    }
};
exports.qrScanClockInOut = qrScanClockInOut;
// Specialized Login for QR Scanning Flow
const qrStaffLogin = async (req, res) => {
    try {
        const { enrollmentID, schoolID, studentID } = req.body;
        // 1. Try to find staff by enrollmentID
        const teacher = await staffModel_1.default.findOne({
            enrollmentID: enrollmentID?.trim(),
            schoolIDs: schoolID
        });
        if (teacher) {
            const school = await schoolModel_1.default.findById(schoolID);
            if (!school || !school.verify) {
                return res.redirect(`/api/qr-scan/${schoolID}/${studentID}?error=true`);
            }
            // Log the teacher in (Session based)
            req.session.isAuth = true;
            req.session.isSchoolID = teacher._id;
            return res.redirect(`/api/qr-scan/${schoolID}/${studentID}`);
        }
        // 2. Try to find school admin by enrollmentID
        const schoolAdmin = await schoolModel_1.default.findOne({
            enrollmentID: enrollmentID?.trim(),
            _id: schoolID
        });
        if (schoolAdmin) {
            if (!schoolAdmin.verify) {
                return res.redirect(`/api/qr-scan/${schoolID}/${studentID}?error=true`);
            }
            // Log the school in (Session based)
            req.session.isAuth = true;
            req.session.isSchoolID = schoolAdmin._id;
            return res.redirect(`/api/qr-scan/${schoolID}/${studentID}`);
        }
        // If neither found
        return res.redirect(`/api/qr-scan/${schoolID}/${studentID}?error=true`);
    }
    catch (error) {
        return res.status(500).send("Verification Error during scan flow");
    }
};
exports.qrStaffLogin = qrStaffLogin;
// Create Account
const createSchoolStudent = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { studentLastName, gender, studentFirstName, studentAddress, classAssigned, } = req.body;
        const school = await schoolModel_1.default.findById(schoolID).populate({
            path: "classRooms",
        });
        const enrollmentID = crypto_1.default.randomBytes(4).toString("hex");
        const salt = await bcrypt_1.default.genSalt(10);
        const hashed = await bcrypt_1.default.hash(`${studentFirstName.replace(/ /gi, "").toLowerCase()}${studentLastName
            .replace(/ /gi, "")
            .toLowerCase()}`, salt);
        const findClass = school?.classRooms?.find((el) => {
            console.log(el.className.trim());
            return el.className.trim() === classAssigned;
        });
        if (school && school.schoolName && school.status === "school-admin") {
            if (findClass) {
                const student = await studentModel_1.default.create({
                    schoolIDs: schoolID,
                    presentClassID: findClass?._id,
                    classTermFee: findClass?.presentTerm === "1st Term"
                        ? findClass?.class1stFee
                        : findClass?.presentTerm === "2nd Term"
                            ? findClass?.class2ndFee
                            : findClass?.presentTerm === "3rd Term"
                                ? findClass?.class3rdFee
                                : null,
                    gender,
                    enrollmentID,
                    schoolID: school?.enrollmentID,
                    studentFirstName,
                    studentLastName,
                    schoolName: school?.schoolName,
                    studentAddress,
                    classAssigned,
                    email: `${studentFirstName
                        .replace(/ /gi, "")
                        .toLowerCase()}${studentLastName
                        .replace(/ /gi, "")
                        .toLowerCase()}@${school?.schoolName
                        ?.replace(/ /gi, "")
                        .toLowerCase()}.com`,
                    password: hashed,
                    status: "school-student",
                });
                school?.students.push(new mongoose_1.Types.ObjectId(student._id));
                school?.historys?.push(new mongoose_1.Types.ObjectId(student._id));
                await school.save();
                findClass?.students.push(new mongoose_1.Types.ObjectId(student._id));
                await findClass.save();
                return res.status(201).json({
                    message: "student created successfully",
                    data: student,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "class must exist",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "school not found",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
            data: error.message,
            status: 404,
        });
    }
};
exports.createSchoolStudent = createSchoolStudent;
const createBulkSchoolStudent = async (req, res) => {
    try {
        const { schoolID } = req.params;
        let filePath = node_path_1.default.join(__dirname, "../uploads/examination");
        const deleteFilesInFolder = (folderPath) => {
            if (node_fs_1.default.existsSync(folderPath)) {
                const files = node_fs_1.default.readdirSync(folderPath);
                files.forEach((file) => {
                    const filePath = node_path_1.default.join(folderPath, file);
                    node_fs_1.default.unlinkSync(filePath);
                });
                console.log(`All files in the folder '${folderPath}' have been deleted.`);
            }
            else {
                console.log(`The folder '${folderPath}' does not exist.`);
            }
        };
        const data = await (0, csvtojson_1.default)().fromFile(req.file.path);
        let createdCount = 0;
        let duplicateCount = 0;
        const errors = [];
        for (const i of data) {
            const school = await schoolModel_1.default.findById(schoolID).populate({
                path: "classRooms",
            });
            const enrollmentID = crypto_1.default.randomBytes(4).toString("hex");
            const salt = await bcrypt_1.default.genSalt(10);
            const hashed = await bcrypt_1.default.hash(`${i?.studentFirstName
                ?.replace(/ /gi, "")
                .toLowerCase()}${i?.studentLastName
                ?.replace(/ /gi, "")
                .toLowerCase()}`, salt);
            const findClass = school?.classRooms?.find((el) => {
                return el.className.trim() === i?.classAssigned;
            });
            if (!(school && school.schoolName && school.status === "school-admin")) {
                errors.push(`School not found or not admin for row ${JSON.stringify(i)}`);
                continue;
            }
            if (!findClass) {
                errors.push(`Class '${i?.classAssigned}' not found for row ${JSON.stringify(i)}`);
                continue;
            }
            // check duplicate by email or exact name within the same school
            const email = `${i?.studentFirstName
                ?.replace(/ /gi, "")
                .toLowerCase()}${i?.studentLastName
                ?.replace(/ /gi, "")
                .toLowerCase()}@${school?.schoolName
                ?.replace(/ /gi, "")
                .toLowerCase()}.com`;
            const existing = await studentModel_1.default.findOne({
                $or: [
                    { email },
                    {
                        studentFirstName: i?.studentFirstName,
                        studentLastName: i?.studentLastName,
                        schoolIDs: schoolID,
                    },
                ],
            });
            if (existing) {
                duplicateCount++;
                continue;
            }
            try {
                const student = await studentModel_1.default.create({
                    schoolIDs: schoolID,
                    presentClassID: findClass?._id,
                    classTermFee: findClass?.presentTerm === "1st Term"
                        ? findClass?.class1stFee
                        : findClass?.presentTerm === "2nd Term"
                            ? findClass?.class2ndFee
                            : findClass?.presentTerm === "3rd Term"
                                ? findClass?.class3rdFee
                                : null,
                    gender: i?.gender,
                    enrollmentID,
                    schoolID: school?.enrollmentID,
                    studentFirstName: i?.studentFirstName,
                    studentLastName: i?.studentLastName,
                    schoolName: school?.schoolName,
                    studentAddress: i?.studentAddress,
                    classAssigned: i?.classAssigned,
                    email,
                    password: hashed,
                    status: "school-student",
                });
                school?.students.push(new mongoose_1.Types.ObjectId(student._id));
                school?.historys?.push(new mongoose_1.Types.ObjectId(student._id));
                await school.save();
                findClass?.students.push(new mongoose_1.Types.ObjectId(student._id));
                await findClass.save();
                createdCount++;
            }
            catch (err) {
                errors.push(`Error creating student for row ${JSON.stringify(i)}: ${err?.message || err}`);
            }
        }
        // delete uploaded files once after processing
        deleteFilesInFolder(filePath);
        return res.status(201).json({
            message: "done with class entry",
            status: 201,
            summary: { created: createdCount, duplicates: duplicateCount, errors },
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school session",
            data: error.message,
            status: 404,
        });
    }
};
exports.createBulkSchoolStudent = createBulkSchoolStudent;
const readSchoolStudents = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const students = await schoolModel_1.default.findById(schoolID).populate({
            path: "students",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(201).json({
            message: "students read successfully",
            data: students,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school students",
            status: 404,
        });
    }
};
exports.readSchoolStudents = readSchoolStudents;
const readStudentByEnrollmentID = async (req, res) => {
    try {
        const { enrollmentID } = req.params;
        const students = await studentModel_1.default.findOne({ enrollmentID });
        return res.status(200).json({
            message: "student read successfully",
            data: students,
            status: 200,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school students",
            status: 404,
        });
    }
};
exports.readStudentByEnrollmentID = readStudentByEnrollmentID;
const readStudentDetail = async (req, res) => {
    try {
        const { studentID } = req.params;
        const students = await studentModel_1.default.findById(studentID);
        return res.status(200).json({
            message: "student read successfully",
            data: students,
            status: 200,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school students",
            status: 404,
        });
    }
};
exports.readStudentDetail = readStudentDetail;
const loginStudent = async (req, res) => {
    try {
        const { email, password } = req.body;
        const getTeacher = await studentModel_1.default.findOne({ email });
        const school = await schoolModel_1.default.findOne({
            schoolName: getTeacher?.schoolName,
        });
        if (school?.schoolName && getTeacher?.schoolName) {
            if (school.verify) {
                const token = jsonwebtoken_1.default.sign({ status: school.status }, "student", {
                    expiresIn: "1d",
                });
                const pass = await bcrypt_1.default.compare(password, getTeacher?.password);
                if (pass) {
                    req.session.isAuth = true;
                    req.session.isSchoolID = getTeacher._id;
                    return res.status(201).json({
                        message: "welcome back",
                        user: getTeacher?.status,
                        data: token,
                        id: req.session.isSchoolID,
                        status: 201,
                    });
                }
                else {
                    return res.status(404).json({
                        message: "Invalid Password",
                    });
                }
            }
            else {
                return res.status(404).json({
                    message: "please confirm with your school admin",
                });
            }
        }
        else {
            return res.status(404).json({
                message: "Error finding school",
            });
        }
        // return res.status(201).json({
        //   message: "creating school",
        //   data: school,
        // });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error logging you in",
        });
    }
};
exports.loginStudent = loginStudent;
const loginStudentWithToken = async (req, res) => {
    try {
        const { token } = req.body;
        const getStudent = await studentModel_1.default.findOne({ enrollmentID: token });
        const school = await schoolModel_1.default.findOne({
            schoolName: getStudent?.schoolName,
        });
        if (school?.schoolName && getStudent?.schoolName) {
            if (school.verify) {
                const token = jsonwebtoken_1.default.sign({ status: school.status }, "student", {
                    expiresIn: "1d",
                });
                req.session.isAuth = true;
                req.session.isSchoolID = getStudent._id;
                return res.status(201).json({
                    message: "welcome back",
                    user: getStudent?.status,
                    data: token,
                    id: req.session.isSchoolID,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "please confirm with your school admin",
                });
            }
        }
        else {
            return res.status(404).json({
                message: "Error finding school",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error logging you in",
        });
    }
};
exports.loginStudentWithToken = loginStudentWithToken;
const readStudentCookie = async (req, res) => {
    try {
        const readSchool = req.session.isSchoolID;
        return res.status(200).json({
            message: "GoodBye",
            data: readSchool,
            status: 200,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error verifying student",
        });
    }
};
exports.readStudentCookie = readStudentCookie;
const logoutStudent = async (req, res) => {
    try {
        req.session.destroy();
        return res.status(200).json({
            message: "GoodBye",
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error logging out teacher",
        });
    }
};
exports.logoutStudent = logoutStudent;
const updateStudentAvatar = async (req, res) => {
    try {
        const { studentID } = req.params;
        const school = await studentModel_1.default.findById(studentID);
        if (school) {
            const { secure_url, public_id } = await (0, streamifier_1.streamUpload)(req);
            const updatedStudent = await studentModel_1.default.findByIdAndUpdate(studentID, {
                avatar: secure_url,
                avatarID: public_id,
            }, { new: true });
            return res.status(200).json({
                message: "student avatar has been, added",
                data: updatedStudent,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "student not seen",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating avatar",
            data: error.message,
        });
    }
};
exports.updateStudentAvatar = updateStudentAvatar;
//Student Updates settings
const updateStudentParentEmail = async (req, res) => {
    try {
        const { schoolID, studentID } = req.params;
        const { parentEmail } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school && school.schoolName) {
            const student = await studentModel_1.default.findByIdAndUpdate(studentID, { parentEmail }, { new: true });
            return res.status(201).json({
                message: "student profile updated successful",
                data: student,
                status: 200,
            });
        }
        else {
            return res.status(404).json({
                message: "unable to update student profile",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error getting school",
            status: 404,
        });
    }
};
exports.updateStudentParentEmail = updateStudentParentEmail;
const updateStudentFirstName = async (req, res) => {
    try {
        const { schoolID, studentID } = req.params;
        const { studentFirstName, studentLastName } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (!school) {
            return res.status(404).json({
                message: "School Does Not Exist",
                status: 404,
            });
        }
        const student = await studentModel_1.default.findById(studentID);
        if (!student) {
            return res.status(404).json({
                message: "Student Does Not Exist",
                status: 404,
            });
        }
        const updatedFields = {};
        if (studentFirstName)
            updatedFields.studentFirstName = studentFirstName;
        if (studentLastName)
            updatedFields.studentLastName = studentLastName;
        const updatedFirstName = studentFirstName || student.studentFirstName;
        const updatedLastName = studentLastName || student.studentLastName;
        const email = `${updatedFirstName
            .replace(/ /gi, "")
            .toLowerCase()}${updatedLastName
            .replace(/ /gi, "")
            .toLowerCase()}@${school.schoolName
            .replace(/ /gi, "")
            .toLowerCase()}.com`;
        updatedFields.email = email;
        const updatedStudent = await studentModel_1.default.findByIdAndUpdate(student._id, updatedFields, { new: true });
        return res.status(201).json({
            message: "Student Information Updated Successfully",
            data: updatedStudent,
            status: 201,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Error Updating Student Information",
            error: {
                errorMessage: error.message,
                errorStack: error.stack,
            },
        });
    }
};
exports.updateStudentFirstName = updateStudentFirstName;
const updateStudentLastName = async (req, res) => {
    try {
        const { schoolID, studentID } = req.params;
        const { studentLastName } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (!school) {
            return res.status(404).json({
                message: "School Does Not Exist",
                status: 404,
            });
        }
        const student = await studentModel_1.default.findById(studentID);
        if (!student) {
            return res.status(404).json({
                message: "Student Does Not Exist",
                status: 404,
            });
        }
        const updatedFirstName = student.studentFirstName;
        const updatedLastName = studentLastName || student.studentLastName;
        const email = `${updatedFirstName
            .replace(/ /gi, "")
            .toLowerCase()}${updatedLastName
            .replace(/ /gi, "")
            .toLowerCase()}@${school.schoolName
            .replace(/ /gi, "")
            .toLowerCase()}.com`;
        const studentUpdateLastName = await studentModel_1.default.findByIdAndUpdate(student._id, {
            studentLastName: updatedLastName,
            email: email,
        }, { new: true });
        return res.status(201).json({
            message: "Student LastName Updated Successfully",
            data: studentUpdateLastName,
            status: 201,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Error Updating Student Last Name",
            data: {
                errorMessage: error.message,
                errorType: error.stack,
            },
        });
    }
};
exports.updateStudentLastName = updateStudentLastName;
const updateStudentAddress = async (req, res) => {
    try {
        const { schoolID, studentID } = req.params;
        const { studentAddress } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const student = await studentModel_1.default.findById(studentID);
            if (student) {
                const updateAddress = await studentModel_1.default.findByIdAndUpdate(student._id, { studentAddress: studentAddress }, { new: true });
                return res.status(201).json({
                    message: "Student Address Updated Successfully",
                    data: updateAddress,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Student Does Not Exist",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "School Does Not Exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error Updating Student Address",
            data: {
                errorMessage: error.message,
                errorType: error.stack,
            },
        });
    }
};
exports.updateStudentAddress = updateStudentAddress;
const updateStudentGender = async (req, res) => {
    try {
        const { schoolID, studentID } = req.params;
        const { gender } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const student = await studentModel_1.default.findById(studentID);
            if (student) {
                const updateGender = await studentModel_1.default.findByIdAndUpdate(student._id, { gender: gender }, { new: true });
                return res.status(201).json({
                    message: "Student Gender Updated Succed=sfully",
                    data: updateGender,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Student Does Not Exist",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "School Does Not Exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error Updating Student Gender",
            data: {
                errorMessage: error.message,
                errorTypes: error.stack,
            },
            status: 404,
        });
    }
};
exports.updateStudentGender = updateStudentGender;
const updateStudentPhone = async (req, res) => {
    try {
        const { schoolID, studentID } = req.params;
        const { phone } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const student = await studentModel_1.default.findById(studentID);
            if (student) {
                const updatePhone = await studentModel_1.default.findByIdAndUpdate(student._id, { phone: phone }, { new: true });
                return res.status(201).json({
                    message: "Student Phone Number Updated Successfully",
                    data: updatePhone,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Student Does Not Exist",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "School Does Not Exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error Updating Student Phone Number",
            data: {
                errorMessage: error.mesaage,
                errorType: error.stack,
            },
            status: 404,
        });
    }
};
exports.updateStudentPhone = updateStudentPhone;
const updateStudentViewReportCard = async (req, res) => {
    try {
        const { schoolID, studentID } = req.params;
        const { toggle } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const student = await studentModel_1.default.findById(studentID);
            if (student) {
                const studentData = await studentModel_1.default.findByIdAndUpdate(student._id, { viewReportCard: toggle }, { new: true });
                console.log(toggle);
                return res.status(201).json({
                    message: "Student can now view Report card",
                    data: studentData,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Student Does Not Exist",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "School Does Not Exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error Updating Student Phone Number",
            data: {
                errorMessage: error.mesaage,
                errorType: error.stack,
            },
            status: 404,
        });
    }
};
exports.updateStudentViewReportCard = updateStudentViewReportCard;
const updateStudentInfo = async (req, res) => {
    try {
        const { studentID } = req.params;
        if (true) {
            const student = await studentModel_1.default.findById(studentID);
            if (student) {
                const updatePhone = await studentModel_1.default.findByIdAndUpdate(student._id, req.body, { new: true });
                return res.status(201).json({
                    message: "Student Phone Number Updated Successfully",
                    data: updatePhone,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Student Does Not Exist",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "School Does Not Exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error Updating Student Phone Number",
            data: {
                errorMessage: error.mesaage,
                errorType: error.stack,
            },
            status: 404,
        });
    }
};
exports.updateStudentInfo = updateStudentInfo;
const updateMainStudentBulkInfo = async (req, res) => {
    try {
        const { studentID } = req.params;
        if (true) {
            const student = await studentModel_1.default.findById(studentID);
            if (student) {
                const updatePhone = await studentModel_1.default.findByIdAndUpdate(student._id, req.body, { new: true });
                return res.status(201).json({
                    message: "Student Phone Number Updated Successfully",
                    data: updatePhone,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Student Does Not Exist",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "School Does Not Exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error Updating Student Phone Number",
            data: {
                errorMessage: error.mesaage,
                errorType: error.stack,
            },
            status: 404,
        });
    }
};
exports.updateMainStudentBulkInfo = updateMainStudentBulkInfo;
const updateStudentBulkInfo = async (req, res) => {
    try {
        const { studentID } = req.params;
        const { phone, studentFirstName, parentPhoneNumber, parentEmail, studentLastName, studentAddress, } = req.body;
        if (true) {
            const student = await studentModel_1.default.findById(studentID);
            if (student) {
                const updatePhone = await studentModel_1.default.findByIdAndUpdate(student._id, {
                    phone,
                    studentFirstName,
                    parentPhoneNumber,
                    parentEmail,
                    studentLastName,
                    studentAddress,
                }, { new: true });
                return res.status(201).json({
                    message: "Student Phone Number Updated Successfully",
                    data: updatePhone,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Student Does Not Exist",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "School Does Not Exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error Updating Student Phone Number",
            data: {
                errorMessage: error.mesaage,
                errorType: error.stack,
            },
            status: 404,
        });
    }
};
exports.updateStudentBulkInfo = updateStudentBulkInfo;
const updateStudentParentNumber = async (req, res) => {
    try {
        const { schoolID, studentID } = req.params;
        const { parentPhoneNumber } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const student = await studentModel_1.default.findById(studentID);
            if (student) {
                const updateParentNumber = await studentModel_1.default.findByIdAndUpdate(student._id, { parentPhoneNumber: parentPhoneNumber }, { new: true });
                return res.status(201).json({
                    message: "Student Phone Number Updated Succesfully",
                    data: updateParentNumber,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Student Does Not Exist",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "School Does Not Exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error Updating Parents Phone Number",
            data: {
                errorMessage: error.message,
                messageType: error.stack,
            },
            status: 404,
        });
    }
};
exports.updateStudentParentNumber = updateStudentParentNumber;
const updateStudent1stFees = async (req, res) => {
    try {
        const { schoolID, studentID } = req.params;
        const school = await schoolModel_1.default.findById(schoolID);
        const getStudent = await studentModel_1.default.findById(studentID);
        const presentClass = await classroomModel_1.default.findById(getStudent?.presentClassID);
        const findTerm = await termModel_1.default.findById(school?.presentTermID);
        if (school?.status === "school-admin" && school) {
            const students = await studentModel_1.default.findByIdAndUpdate(studentID, { feesPaid1st: !getStudent?.feesPaid1st }, { new: true });
            (0, email_1.verifySchoolFees)(students, 1);
            await termModel_1.default?.findByIdAndUpdate(findTerm?._id, {
                schoolFeePayment: [
                    ...findTerm?.schoolFeePayment,
                    {
                        studentID: getStudent._id,
                        feesPaid1st: getStudent.feesPaid1st,
                        cost: presentClass?.class1stFee,
                        date: (0, moment_timezone_1.default)(new Date().getTime()).format("llll"),
                    },
                ],
            }, { new: true });
            return res.status(201).json({
                message: "student fees updated successfully",
                data: students,
                status: 200,
            });
        }
        else {
            return res.status(404).json({
                message: "student 1st fees not found",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school students",
            status: 404,
        });
    }
};
exports.updateStudent1stFees = updateStudent1stFees;
//Student Updates settings ends here
//Student/Parent Socials
const updateStudentFacebookAcct = async (req, res) => {
    try {
        const { schoolID, studentID } = req.params;
        const { facebookAccount } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const student = await studentModel_1.default.findById(studentID);
            if (student) {
                const updateStudentFacebook = await studentModel_1.default.findByIdAndUpdate(student._id, { facebookAccount: facebookAccount }, { new: true });
                return res.status(201).json({
                    message: "Student Facebook Account Updated Successfuly",
                    data: updateStudentFacebook,
                    status: 404,
                });
            }
            else {
                return res.status(404).json({
                    message: "Student Does Not Exist",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "School Does Not Exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error Updating Facebook Account",
            data: {
                errorMessage: error.message,
                messageType: error.stack,
            },
            status: 404,
        });
    }
};
exports.updateStudentFacebookAcct = updateStudentFacebookAcct;
const updateInstagramAccout = async (req, res) => {
    try {
        const { schoolID, studentID } = req.params;
        const { instagramAccount } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const student = await studentModel_1.default.findById(studentID);
            if (student) {
                const updateStudentInstagram = await studentModel_1.default.findByIdAndUpdate(student._id, { instagramAccount: instagramAccount }, { new: true });
                return res.status(201).json({
                    message: "IG Account Updated Successfully",
                    data: updateStudentInstagram,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Student Does Not Exist",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "School Does Not Exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error Updating IG Account",
            data: {
                errorMessage: error.message,
                errorType: error.stack,
            },
        });
    }
};
exports.updateInstagramAccout = updateInstagramAccout;
const updateXAcctount = async (req, res) => {
    try {
        const { schoolID, studentID } = req.params;
        const { xAccount } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const student = await studentModel_1.default.findById(studentID);
            if (student) {
                const updateXhandle = await studentModel_1.default.findByIdAndUpdate(student._id, { xAccount: xAccount }, { new: true });
                return res.status(201).json({
                    message: "X Account Updated Succsfully",
                    data: updateXhandle,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Student Does Not Exist",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "School Does not Exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error Updating X Account",
            data: {
                errorMessage: error.message,
                errorType: error.stack,
            },
        });
    }
};
exports.updateXAcctount = updateXAcctount;
const updateStudentLinkedinAccount = async (req, res) => {
    try {
        const { schoolID, studentID } = req.params;
        const { linkedinAccount } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const student = await studentModel_1.default.findById(studentID);
            if (student) {
                const updateLinkedinAccount = await studentModel_1.default.findByIdAndUpdate(student._id, { linkedinAccount: linkedinAccount }, { new: true });
                return res.status(201).json({
                    message: "Linkedin Account Updated Successfully",
                    data: updateLinkedinAccount,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Student Does Not Exist",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "School Does Not Exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error Updating Linkedin Account",
            data: {
                errorMessage: error.message,
                errorType: error.stack,
            },
        });
    }
};
exports.updateStudentLinkedinAccount = updateStudentLinkedinAccount;
//Student/Parent Socials Ends Here
const updateStudent2ndFees = async (req, res) => {
    try {
        const { schoolID, studentID } = req.params;
        const school = await schoolModel_1.default.findById(schoolID);
        const getStudent = await studentModel_1.default.findById(studentID);
        const presentClass = await classroomModel_1.default.findById(getStudent?.presentClassID);
        const findTerm = await termModel_1.default.findById(school?.presentTermID);
        if (school?.status === "school-admin" && school) {
            let students = await studentModel_1.default.findById(studentID);
            if (students?.feesPaid1st === true) {
                let student = await studentModel_1.default.findByIdAndUpdate(students?._id, { feesPaid2nd: !students?.feesPaid2nd }, { new: true });
                (0, email_1.verifySchoolFees)(student, 2);
                await termModel_1.default?.findByIdAndUpdate(findTerm?._id, {
                    schoolFeePayment: [
                        ...findTerm?.schoolFeePayment,
                        {
                            studentID: getStudent._id,
                            feesPaid2nd: getStudent.feesPaid2nd,
                            cost: presentClass?.class2ndFee,
                            date: (0, moment_timezone_1.default)(new Date().getTime()).format("llll"),
                        },
                    ],
                }, { new: true });
                return res.status(201).json({
                    message: "student fees updated successfully",
                    data: student,
                    status: 200,
                });
            }
            else {
                return res.status(404).json({
                    message: "student 3rd fees not found",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "School not found",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school students",
            status: 404,
        });
    }
};
exports.updateStudent2ndFees = updateStudent2ndFees;
const updateStudent3rdFees = async (req, res) => {
    try {
        const { schoolID, studentID } = req.params;
        const school = await schoolModel_1.default.findById(schoolID);
        const getStudent = await studentModel_1.default.findById(studentID);
        const presentClass = await classroomModel_1.default.findById(getStudent?.presentClassID);
        const findTerm = await termModel_1.default.findById(school?.presentTermID);
        if (school?.status === "school-admin" && school) {
            const student = await studentModel_1.default.findById(studentID);
            if (student?.feesPaid2nd === true) {
                await studentModel_1.default.findByIdAndUpdate(studentID, { feesPaid3rd: !student?.feesPaid3rd }, { new: true });
                (0, email_1.verifySchoolFees)(student, 3);
                await termModel_1.default?.findByIdAndUpdate(findTerm?._id, {
                    schoolFeePayment: [
                        ...findTerm?.schoolFeePayment,
                        {
                            studentID: getStudent._id,
                            feesPaid3rd: getStudent.feesPaid3rd,
                            cost: presentClass?.class3rdFee,
                            date: (0, moment_timezone_1.default)(new Date().getTime()).format("llll"),
                        },
                    ],
                }, { new: true });
                return res.status(201).json({
                    message: "student fees updated successfully",
                    data: student,
                    status: 200,
                });
            }
            else {
                return res.status(404).json({
                    message: "student 2nd fees not found",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "School not found",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school students",
            status: 404,
        });
    }
};
exports.updateStudent3rdFees = updateStudent3rdFees;
const updatePurchaseRecord = async (req, res) => {
    try {
        const { studentID } = req.params;
        const { purchased } = req.body;
        const student = await studentModel_1.default.findById(studentID);
        const school = await schoolModel_1.default.findById(student?.schoolIDs);
        if (school?.status === "school-admin" && school) {
            await studentModel_1.default.findById(studentID, {
                purchaseHistory: student?.purchaseHistory?.push(purchased),
            }, { new: true });
            return res.status(201).json({
                message: "student purchase recorded successfully",
                data: student,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "School not found",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating students purchase",
            status: 404,
        });
    }
};
exports.updatePurchaseRecord = updatePurchaseRecord;
const createStorePurchased = async (req, res) => {
    try {
        const { studentID } = req.params;
        const { date, amount, cart, reference, purchasedID, delievered } = req.body;
        const student = await studentModel_1.default.findById(studentID).populate({
            path: "purchaseHistory",
        });
        const school = await schoolModel_1.default.findById(student?.schoolIDs);
        const term = await termModel_1.default?.findById(school?.presentTermID);
        if (school) {
            const check = student?.purchaseHistory.some((el) => {
                return el.reference === reference;
            });
            if (!check) {
                const store = await historyModel_1.default.create({
                    date,
                    amount,
                    cart,
                    reference,
                    purchasedID,
                    delievered: false,
                    studentName: `${student?.studentFirstName} ${student?.studentLastName}`,
                    studentClass: student?.classAssigned,
                });
                await termModel_1.default.findByIdAndUpdate(term?._id, {
                    storePayment: [
                        ...term?.storePayment,
                        {
                            date,
                            amount,
                            cart,
                            reference,
                            purchasedID,
                            studentName: `${student?.studentFirstName} ${student?.studentLastName}`,
                            studentClass: student?.classAssigned,
                        },
                    ],
                }, { new: true });
                student?.purchaseHistory.push(new mongoose_1.Types.ObjectId(store._id));
                student?.save();
                school?.purchaseHistory.push(new mongoose_1.Types.ObjectId(store._id));
                school?.save();
                return res.status(201).json({
                    message: "remark created successfully",
                    data: store,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Has already entered it",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "unable to read school",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school's store item",
            data: error.message,
        });
    }
};
exports.createStorePurchased = createStorePurchased;
const viewStorePurchased = async (req, res) => {
    try {
        const { studentID } = req.params;
        const student = await studentModel_1.default.findById(studentID).populate({
            path: "purchaseHistory",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(201).json({
            message: "remark created successfully",
            data: student?.purchaseHistory,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school's store item",
            data: error.message,
        });
    }
};
exports.viewStorePurchased = viewStorePurchased;
const viewSchoolStorePurchased = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const student = await schoolModel_1.default.findById(schoolID).populate({
            path: "purchaseHistory",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(201).json({
            message: "remark created successfully",
            data: student?.purchaseHistory,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school's store item",
            data: error.message,
        });
    }
};
exports.viewSchoolStorePurchased = viewSchoolStorePurchased;
const updateSchoolStorePurchased = async (req, res) => {
    try {
        const { purchaseID } = req.params;
        const { delievered } = req.body;
        const item = await historyModel_1.default.findByIdAndUpdate(purchaseID, {
            delievered,
        }, { new: true });
        return res.status(201).json({
            message: `item delieved successfully`,
            data: item,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error updating school's store item",
            data: error.message,
        });
    }
};
exports.updateSchoolStorePurchased = updateSchoolStorePurchased;
const createStorePurchasedTeacher = async (req, res) => {
    try {
        const { staffID } = req.params;
        const { date, amount, cart, reference, purchasedID } = req.body;
        const student = await staffModel_1.default.findById(staffID).populate({
            path: "purchaseHistory",
        });
        const school = await schoolModel_1.default.findById(student?.schoolIDs);
        if (school) {
            const check = student?.purchaseHistory.some((el) => {
                return el.reference === reference;
            });
            if (!check) {
                const store = await historyModel_1.default.create({
                    date,
                    amount,
                    cart,
                    reference,
                    purchasedID,
                    delievered: false,
                    studentName: student?.staffName,
                    studentClass: student?.classesAssigned,
                });
                student?.purchaseHistory.push(new mongoose_1.Types.ObjectId(store._id));
                student?.save();
                school?.purchaseHistory.push(new mongoose_1.Types.ObjectId(store._id));
                school?.save();
                return res.status(201).json({
                    message: "remark created successfully",
                    data: store,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Has already entered it",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "unable to read school",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school's store item",
            data: error.message,
        });
    }
};
exports.createStorePurchasedTeacher = createStorePurchasedTeacher;
const viewStorePurchasedTeacher = async (req, res) => {
    try {
        const { staffID } = req.params;
        const student = await staffModel_1.default.findById(staffID).populate({
            path: "purchaseHistory",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(201).json({
            message: "remark created successfully",
            data: student?.purchaseHistory,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school's store item",
            data: error.message,
        });
    }
};
exports.viewStorePurchasedTeacher = viewStorePurchasedTeacher;
const createSchoolFeePayment = async (req, res) => {
    try {
        const { studentID } = req.params;
        const { date, amount, purchasedID, reference } = req.body;
        const student = await studentModel_1.default.findById(studentID).populate({
            path: "schoolFeesHistory",
        });
        const classOne = await classroomModel_1.default.findById(student?.presentClassID);
        const school = await schoolModel_1.default.findById(student?.schoolIDs);
        if (school) {
            const check = student?.schoolFeesHistory.some((el) => {
                return el.reference === reference;
            });
            const payment = student?.schoolFeesHistory.some((el) => {
                return (el.sessionID === school?.presentSessionID &&
                    el.session === school?.presentSession &&
                    el.termID === school?.presentTermID &&
                    el.term === school?.presentTerm);
            });
            if (!payment) {
                const store = await schoolFeeHistory_1.default.create({
                    studentID,
                    session: school?.presentSession,
                    sessionID: school?.presentSessionID,
                    termID: school?.presentTermID,
                    confirm: false,
                    term: classOne?.presentTerm,
                    studentName: `${student?.studentFirstName} ${student?.studentLastName}`,
                    studentClass: student?.classAssigned,
                    image: student?.avatar,
                    date,
                    amount: amount,
                    purchasedID,
                    reference,
                });
                student?.schoolFeesHistory.push(new mongoose_1.Types.ObjectId(store._id));
                student?.save();
                school?.schoolFeesHistory.push(new mongoose_1.Types.ObjectId(store._id));
                school?.save();
                if (classOne?.presentTerm === "1st Term") {
                    classOne?.schoolFeesHistory.push(new mongoose_1.Types.ObjectId(store._id));
                    classOne?.save();
                }
                else if (classOne?.presentTerm === "2nd Term") {
                    classOne?.schoolFeesHistory2.push(new mongoose_1.Types.ObjectId(store._id));
                    classOne?.save();
                }
                else if (classOne?.presentTerm === "3rd Term") {
                    classOne?.schoolFeesHistory3.push(new mongoose_1.Types.ObjectId(store._id));
                    classOne?.save();
                }
                if (classOne?.presentTerm === "1st Term") {
                    const classData = await classroomModel_1.default
                        .findById(student?.presentClassID)
                        .populate({
                        path: "schoolFeesHistory",
                    });
                    const amount = classData?.schoolFeesHistory
                        ?.filter((el) => {
                        return (el.sessionID === school?.presentSessionID &&
                            el.termID === school?.presentTermID &&
                            el.term === "1st Term");
                    })
                        .map((el) => {
                        return el.amount;
                    })
                        .reduce((a, b) => {
                        return a + b;
                    }, 0);
                    const real = await classroomModel_1.default.findByIdAndUpdate(classData?._id, {
                        class1stFee: amount,
                    }, { new: true });
                }
                else if (classOne?.presentTerm === "2nd Term") {
                    const classData = await classroomModel_1.default
                        .findById(student?.presentClassID)
                        .populate({
                        path: "schoolFeesHistory2",
                    });
                    const amount = classData?.schoolFeesHistory
                        ?.filter((el) => {
                        return (el.sessionID === school?.presentSessionID &&
                            el.termID === school?.presentTermID &&
                            el.term === "2nd Term");
                    })
                        .map((el) => {
                        return el.amount;
                    })
                        .reduce((a, b) => {
                        return a + b;
                    }, 0);
                    classroomModel_1.default.findByIdAndUpdate(classData?._id, {
                        class2ndFee: amount,
                    }, { new: true });
                }
                else if (classOne?.presentTerm === "3rd Term") {
                    const classData = await classroomModel_1.default
                        .findById(student?.presentClassID)
                        .populate({
                        path: "schoolFeesHistory3",
                    });
                    const amount = classData?.schoolFeesHistory
                        ?.filter((el) => {
                        return (el.sessionID === school?.presentSessionID &&
                            el.termID === school?.presentTermID &&
                            el.term === "3rd Term");
                    })
                        .map((el) => {
                        return el.amount;
                    })
                        .reduce((a, b) => {
                        return a + b;
                    }, 0);
                    classroomModel_1.default.findByIdAndUpdate(classData?._id, {
                        class3rdFee: amount,
                    }, { new: true });
                }
                return res.status(201).json({
                    message: "schoolfee paid successfully",
                    data: store,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Has already entered it",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "unable to read school",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error paying school's fee",
            data: error.message,
        });
    }
};
exports.createSchoolFeePayment = createSchoolFeePayment;
const viewSchoolFeeRecord = async (req, res) => {
    try {
        const { studentID } = req.params;
        const student = await studentModel_1.default.findById(studentID).populate({
            path: "schoolFeesHistory",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(201).json({
            message: "remark created successfully",
            data: student?.schoolFeesHistory,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school's store item",
            data: error.message,
        });
    }
};
exports.viewSchoolFeeRecord = viewSchoolFeeRecord;
const viewSchoolSchoolFeeRecord = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const student = await schoolModel_1.default.findById(schoolID).populate({
            path: "schoolFeesHistory",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(201).json({
            message: "remark created successfully",
            data: student?.schoolFeesHistory,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school's store item",
            data: error.message,
        });
    }
};
exports.viewSchoolSchoolFeeRecord = viewSchoolSchoolFeeRecord;
const updateSchoolSchoolFee = async (req, res) => {
    try {
        const { schoolFeeID } = req.params;
        const { confirm } = req.body;
        const item = await schoolFeeHistory_1.default.findByIdAndUpdate(schoolFeeID, {
            confirm,
        }, { new: true });
        let studentRecord = await studentModel_1.default.findById(item.studentID);
        let studetClass = await classroomModel_1.default.findById(studentRecord?.presentClassID);
        const school = await schoolModel_1.default.findById(studentRecord?.schoolIDs);
        const term = await termModel_1.default.findById(school?.presentTermID);
        if (studetClass?.presentTerm === "1st Term") {
            await studentModel_1.default.findByIdAndUpdate(item?.studentID, {
                feesPaid1st: true,
            }, { new: true });
        }
        else if (studetClass?.presentTerm === "2nd Term") {
            await studentModel_1.default.findByIdAndUpdate(item?.studentID, {
                feesPaid2nd: true,
            }, { new: true });
        }
        else if (studetClass?.presentTerm === "3rd Term") {
            await studentModel_1.default.findByIdAndUpdate(item?.studentID, {
                feesPaid3rd: true,
            }, { new: true });
        }
        const check = term?.schoolFeePayment.some((el) => el?.purchasedID !== item?.purchasedID);
        if (true) {
            let x = await termModel_1.default.findByIdAndUpdate(item?.termID, {
                schoolFeePayment: [...term?.schoolFeePayment, item],
            }, { new: true });
            console.log("loading: ", x);
            return res.status(201).json({
                message: `schoolfee confirm successfully`,
                data: item,
                status: 201,
            });
        }
        else {
            return res.status(201).json({
                message: `schoolfee confirm successfully`,
                data: item,
                status: 201,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error updating school's school fee",
            data: error.message,
        });
    }
};
exports.updateSchoolSchoolFee = updateSchoolSchoolFee;
const assignClassMonitor = async (req, res) => {
    try {
        const { teacherID, studentID } = req.params;
        const teacher = await staffModel_1.default.findById(teacherID);
        const getClass = await classroomModel_1.default
            .findById(teacher?.presentClassID)
            .populate({
            path: "students",
        });
        let readStudent = getClass?.students?.find((el) => {
            return el?.monitor === true;
        });
        await studentModel_1.default.findByIdAndUpdate(readStudent?._id, {
            monitor: false,
        }, { new: true });
        const student = await studentModel_1.default.findByIdAndUpdate(studentID, {
            monitor: true,
        }, { new: true });
        return res.status(201).json({
            message: `class monitor assigned to ${student?.studentFirstName} `,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error updating class's monitor",
            data: error.message,
        });
    }
};
exports.assignClassMonitor = assignClassMonitor;
const changeStudentClass = async (req, res) => {
    try {
        const { studentID } = req.params;
        const { classID } = req.body;
        const getClass = await classroomModel_1.default.findById(classID).populate({
            path: "students",
        });
        const studentData = await studentModel_1.default.findById(studentID);
        const getStudentClass = await classroomModel_1.default.findById(studentData?.presentClassID);
        getStudentClass?.students?.pull(new mongoose_1.Types.ObjectId(studentID));
        getStudentClass?.save();
        const student = await studentModel_1.default.findByIdAndUpdate(studentID, {
            classAssigned: getClass?.className,
            presentClassID: getClass?._id,
            classTermFee: getClass?.presentTerm === "1st Term"
                ? getClass?.class1stFee
                : getClass?.presentTerm === "2nd Term"
                    ? getClass?.class2ndFee
                    : getClass?.presentTerm === "3rd Term"
                        ? getClass?.class3rdFee
                        : null,
        }, { new: true });
        getClass?.students?.push(new mongoose_1.Types.ObjectId(student?._id));
        getClass?.save();
        return res.status(201).json({
            message: `class monitor assigned to ${student?.studentFirstName} `,
            data: student,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error updating class's monitor",
            data: error.message,
        });
    }
};
exports.changeStudentClass = changeStudentClass;
const deleteStudent = async (req, res) => {
    try {
        const { schoolID, studentID } = req.params;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            // First get the student to get their class info before deletion
            const student = await studentModel_1.default.findById(studentID);
            if (!student) {
                return res.status(404).json({
                    message: "Student not found",
                    status: 404,
                });
            }
            // Find and update the student's current classroom
            if (student.presentClassID) {
                await classroomModel_1.default.findByIdAndUpdate(student.presentClassID, {
                    $pull: { students: new mongoose_1.Types.ObjectId(studentID) },
                }, { new: true });
            }
            // Remove student from school's students array
            await schoolModel_1.default.findByIdAndUpdate(schoolID, {
                $pull: { students: new mongoose_1.Types.ObjectId(studentID) },
            }, { new: true });
            // Finally delete the student
            await studentModel_1.default.findByIdAndDelete(studentID);
            return res.status(200).json({
                message: "Successfully deleted student and removed all references",
                status: 200,
                data: student,
            });
        }
        else {
            return res.status(404).json({
                message: "School not found",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error deleting student",
            status: 404,
            data: error.message,
        });
    }
};
exports.deleteStudent = deleteStudent;
// Delete ALL students in one click endpoint
const deleteAllStudents = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const allStudentIDs = school?.students;
            for (const studentID of allStudentIDs) {
                const student = await studentModel_1.default.findByIdAndDelete(studentID);
                if (student) {
                    await classroomModel_1.default.updateMany({ students: studentID }, { $pull: { students: studentID } });
                }
            }
            school.students = [];
            await school.save();
            return res.status(200).json({
                message: "Successfully deleted all students",
                data: allStudentIDs,
                status: 200,
            });
        }
        else {
            return res.status(404).json({
                message: "School Does Not Exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error Deleting All Students",
            status: 404,
            error: error.message,
        });
    }
};
exports.deleteAllStudents = deleteAllStudents;
const testSMS = async (req, res) => {
    try {
        const { phone } = req.params;
        const { action, channel, customMsg } = req.query;
        const selectedChannel = channel || "generic";
        const userCustomMessage = customMsg ? customMsg : undefined;
        if (action === "send") {
            await (0, sms_1.sendTestSMS)(phone, selectedChannel, userCustomMessage);
            return res.status(200).send(`
        <html><body style="font-family:sans-serif;text-align:center;padding:40px;">
          <h2 style="color:#16a34a;">✅ Test SMS Sent (${selectedChannel})!</h2>
          <p>Check your backend terminal logs for the Termii response.</p>
          <p><strong>Message:</strong> ${userCustomMessage || "Default Test Message"}</p>
          <a href="/api/test-sms/${phone}" style="color:#2563eb;">Go Back</a>
        </body></html>
      `);
        }
        return res.status(200).send(`
      <html><body style="font-family:sans-serif;text-align:center;padding:40px;">
        <h2>SMS Test Utility</h2>
        <p>Testing SMS for number: <strong>${phone}</strong></p>
        
        <form action="/api/test-sms/${phone}" method="GET">
          <input type="hidden" name="action" value="send" />
          
          <div style="margin-bottom:20px; text-align:left; display:inline-block;">
            <p style="font-weight:bold;">Select Channel:</p>
            <label style="display:block; margin-bottom:10px;">
              <input type="radio" name="channel" value="generic" checked /> 
              Generic (Best for approved IDs - default)
            </label>
            <label style="display:block; margin-bottom:10px;">
              <input type="radio" name="channel" value="dnd" /> 
              DND (Try this if Generic gives 404)
            </label>
            <label style="display:block;">
              <input type="radio" name="channel" value="whatsapp" /> 
              WhatsApp
            </label>
          </div>

          <br/>
          <button type="submit" style="padding:12px 24px;background:#1e3a8a;color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer;">
            Send Test SMS Now
          </button>
        </form>
        <p style="margin-top:20px;color:#64748b;font-size:14px;">This will use your TERMII_API_KEY and TERMII_SENDER_ID from .env</p>
      </body></html>
    `);
    }
    catch (error) {
        return res.status(200).send(`
      <html><body style="font-family:sans-serif;text-align:center;padding:40px;">
        <h2 style="color:#dc2626;">❌ SMS Test Failed</h2>
        <div style="background:#fef2f2; border:1px solid #fee2e2; padding:15px; border-radius:8px; margin-bottom:20px; text-align:left; display:inline-block; max-width:500px;">
          <p><strong>Error Message:</strong> ${error.message}</p>
          ${error.response?.data
            ? `<p><strong>Termii Details:</strong> <pre style="background:#fff; padding:10px; border-radius:4px;">${JSON.stringify(error.response.data, null, 2)}</pre></p>`
            : ""}
        </div>
        <br/>
        <a href="javascript:history.back()" style="color:#2563eb; font-weight:bold;">Try Again</a>
      </body></html>
    `);
    }
};
exports.testSMS = testSMS;
