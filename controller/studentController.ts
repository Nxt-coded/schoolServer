import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import studentModel from "../model/studentModel";
import { AnyArray, Types } from "mongoose";
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { streamUpload } from "../utils/streamifier";
import {
  clockingInEmail,
  clockingOutEmail,
  verifySchoolFees,
} from "../utils/email";
import staffModel from "../model/staffModel";
import classroomModel from "../model/classroomModel";
import purchasedModel from "../model/historyModel";
import schoolFeeHistory from "../model/schoolFeeHistory";
// import subjectModel from "../model/subjectModel";
import csv from "csvtojson";
import moment from "moment-timezone";
import fs from "node:fs";
import path from "node:path";
import termModel from "../model/termModel";
import attendanceModel from "../model/attendanceModel";
import { sendClockInSMS, sendClockOutSMS, sendTestSMS } from "../utils/sms";

// CLOCK-IN/CLOCK-OUT

export const findStudenWithEnrollmentID = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { enrollmentID } = req.body;

    const student = await studentModel.findOne({ enrollmentID });
    return res.status(201).json({
      message: "viewing student with enrollment ID",
      data: student,
      status: 201,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error finding student",
      data: {
        errorMessage: error.message,
        errorType: error.stack,
      },
    });
  }
};

export const clockinAccount = async (
  req: Request | any,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, studentID } = req.params;

    // SECURITY: Verify that a staff member is logged in
    if (!req.session.isAuth || !req.session.isSchoolID) {
      return res.status(401).json({
        message: "Unauthorized: Staff authentication required",
        status: 401,
      });
    }

    const school = await schoolModel.findById(schoolID);
    const staff = await staffModel.findById(req.session.isSchoolID);

    if (school) {
      const student = await studentModel.findById(studentID);

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
        const lagosTime = moment().tz("Africa/Lagos");
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

        const clockInfo: any = await studentModel.findByIdAndUpdate(
          student._id,
          {
            clockIn: true,
            clockInTime: lagosTime.format("llll"),
            clockOut: false,
            lastActionTimestamp: nowMillis,
          },
          { new: true }
        );

        if (clockInfo) {
          await clockingInEmail(clockInfo, school);
          await sendClockInSMS(clockInfo, school);
        }

        // CREATE ATTENDANCE RECORD
        try {
          const dater = Date.now();
          const attendance = await attendanceModel.create({
            className: student.classAssigned,
            studentFirstName: student.studentFirstName,
            studentLastName: student.studentLastName,
            classTeacher: staff.staffName,
            dateTime: `${moment(dater).format("dddd")}, ${moment(dater).format("MMMM Do YYYY")}`,
            date: moment(dater).format("dddd"),
            present: true,
            absent: false,
            staffs: staff._id,
            students: student._id,
            classes: student.presentClassID,
          });

          // Update references
          if (staff.attendance) {
            staff.attendance.push(new Types.ObjectId(attendance._id));
            await staff.save();
          }

          if (student.attendance) {
            student.attendance.push(new Types.ObjectId(attendance._id));
            await student.save();
          }

          const classroom = await classroomModel.findById(student.presentClassID);
          if (classroom && classroom.attendance) {
            classroom.attendance.push(new Types.ObjectId(attendance._id));
            await classroom.save();
          }
        } catch (attErr) {
          console.error("Error creating attendance record during clock-in:", attErr);
        }

        return res.status(201).json({
          message: "student has clock-in",
          data: clockInfo,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "Student Does Not Exist",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "School Does not Exist",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error clockin student",
      data: {
        errorMessage: error.message,
        errorType: error.stack,
      },
    });
  }
};

export const clockinAccountWithID = async (
  req: Request | any,
  res: Response
): Promise<Response> => {
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

    const school = await schoolModel.findById(schoolID);
    const staff = await staffModel.findById(req.session.isSchoolID);

    if (school) {
      const student = await studentModel.findOne({ enrollmentID });

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
        const lagosTime = moment().tz("Africa/Lagos");
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

        const clockInfo: any = await studentModel.findByIdAndUpdate(
          student._id,
          {
            clockIn: true,
            clockInTime: lagosTime.format("llll"),
            clockOut: false,
            lastActionTimestamp: nowMillis,
          },
          { new: true }
        );

        if (clockInfo) {
          await clockingInEmail(clockInfo, school);
          await sendClockInSMS(clockInfo, school);
        }

        // CREATE ATTENDANCE RECORD
        try {
          const dater = Date.now();
          const attendance = await attendanceModel.create({
            className: student.classAssigned,
            studentFirstName: student.studentFirstName,
            studentLastName: student.studentLastName,
            classTeacher: staff.staffName,
            dateTime: `${moment(dater).format("dddd")}, ${moment(dater).format("MMMM Do YYYY")}`,
            date: moment(dater).format("dddd"),
            present: true,
            absent: false,
            staffs: staff._id,
            students: student._id,
            classes: student.presentClassID,
          });

          // Update references
          if (staff.attendance) {
            staff.attendance.push(new Types.ObjectId(attendance._id));
            await staff.save();
          }

          if (student.attendance) {
            student.attendance.push(new Types.ObjectId(attendance._id));
            await student.save();
          }

          const classroom = await classroomModel.findById(student.presentClassID);
          if (classroom && classroom.attendance) {
            classroom.attendance.push(new Types.ObjectId(attendance._id));
            await classroom.save();
          }
        } catch (attErr) {
          console.error("Error creating attendance record during clock-in:", attErr);
        }

        return res.status(201).json({
          message: "student has clock-in",
          data: clockInfo,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "Student Does Not Exist",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "School Does not Exist",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error clockin student",
      data: {
        errorMessage: error.message,
        errorType: error.stack,
      },
    });
  }
};

export const clockOutAccount = async (
  req: Request | any,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, studentID } = req.params;

    // SECURITY: Verify that a staff member is logged in
    if (!req.session.isAuth || !req.session.isSchoolID) {
      return res.status(401).json({
        message: "Unauthorized: Staff authentication required",
        status: 401,
      });
    }

    const school = await schoolModel.findById(schoolID);
    const staff = await staffModel.findById(req.session.isSchoolID);

    if (school) {
      const student = await studentModel.findById(studentID);

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
        const lagosTime = moment().tz("Africa/Lagos");
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
          const clockInfo: any = await studentModel.findByIdAndUpdate(
            student._id,
            {
              clockIn: false,
              clockOut: true,
              clockOutTime: lagosTime.format("llll"),
              lastActionTimestamp: nowMillis,
            },
            { new: true }
          );

          if (clockInfo) {
            await clockingOutEmail(clockInfo, school);
            await sendClockOutSMS(clockInfo, school);
          }

          // CREATE ATTENDANCE RECORD (as Absent/Out)
          try {
            const dater = Date.now();
            const attendance = await attendanceModel.create({
              className: student.classAssigned,
              studentFirstName: student.studentFirstName,
              studentLastName: student.studentLastName,
              classTeacher: staff.staffName,
              dateTime: `${moment(dater).format("dddd")}, ${moment(dater).format("MMMM Do YYYY")}`,
              date: moment(dater).format("dddd"),
              present: false,
              absent: true,
              staffs: staff._id,
              students: student._id,
              classes: student.presentClassID,
            });

            // Update references
            if (staff.attendance) {
              staff.attendance.push(new Types.ObjectId(attendance._id));
              await staff.save();
            }

            if (student.attendance) {
              student.attendance.push(new Types.ObjectId(attendance._id));
              await student.save();
            }

            const classroom = await classroomModel.findById(student.presentClassID);
            if (classroom && classroom.attendance) {
              classroom.attendance.push(new Types.ObjectId(attendance._id));
              await classroom.save();
            }
          } catch (attErr) {
            console.error("Error creating attendance record during clock-out:", attErr);
          }

          return res.status(201).json({
            message: "student has clock-in",
            data: clockInfo,
            status: 201,
          });
        } else {
          return res.status(404).json({
            message:
              "Student has to be clock-in first before they can be clock-out",
            status: 404,
          });
        }
      } else {
        return res.status(404).json({
          message: "Student Does Not Exist",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "School Does not Exist",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error clockin student",
      data: {
        errorMessage: error.message,
        errorType: error.stack,
      },
    });
  }
};

export const clockOutAccountWidthID = async (
  req: Request | any,
  res: Response
): Promise<Response> => {
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

    const school = await schoolModel.findById(schoolID);
    const staff = await staffModel.findById(req.session.isSchoolID);

    if (school) {
      const student = await studentModel.findOne({ enrollmentID });

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
        const lagosTime = moment().tz("Africa/Lagos");
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
          const clockInfo: any = await studentModel.findByIdAndUpdate(
            student._id,
            {
              clockIn: false,
              clockOut: true,
              clockOutTime: lagosTime.format("llll"),
              lastActionTimestamp: nowMillis,
            },
            { new: true }
          );

          if (clockInfo) {
            await clockingOutEmail(clockInfo, school);
            await sendClockOutSMS(clockInfo, school);
          }

          // CREATE ATTENDANCE RECORD (as Absent/Out)
          try {
            const dater = Date.now();
            const attendance = await attendanceModel.create({
              className: student.classAssigned,
              studentFirstName: student.studentFirstName,
              studentLastName: student.studentLastName,
              classTeacher: staff.staffName,
              dateTime: `${moment(dater).format("dddd")}, ${moment(dater).format("MMMM Do YYYY")}`,
              date: moment(dater).format("dddd"),
              present: false,
              absent: true,
              staffs: staff._id,
              students: student._id,
              classes: student.presentClassID,
            });

            // Update references
            if (staff.attendance) {
              staff.attendance.push(new Types.ObjectId(attendance._id));
              await staff.save();
            }

            if (student.attendance) {
              student.attendance.push(new Types.ObjectId(attendance._id));
              await student.save();
            }

            const classroom = await classroomModel.findById(student.presentClassID);
            if (classroom && classroom.attendance) {
              classroom.attendance.push(new Types.ObjectId(attendance._id));
              await classroom.save();
            }
          } catch (attErr) {
            console.error("Error creating attendance record during clock-out:", attErr);
          }

          return res.status(201).json({
            message: "student has clock-in",
            data: clockInfo,
            status: 201,
          });
        } else {
          return res.status(404).json({
            message:
              "Student has to be clock-in first before they can be clock-out",
            status: 404,
          });
        }
      } else {
        return res.status(404).json({
          message: "Student Does Not Exist",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "School Does not Exist",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error clockin student",
      data: {
        errorMessage: error.message,
        errorType: error.stack,
      },
    });
  }
};

// QR Scan Clock-In/Out (called when phone scans student QR code)
export const qrScanClockInOut = async (
  req: Request | any,
  res: Response
): Promise<any> => {
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

    const school = await schoolModel.findById(schoolID);
    const student = await studentModel.findById(studentID);
    
    // Check if the session is for a Staff or a School Admin
    let staff = await staffModel.findById(req.session.isSchoolID);
    let isAdmin = false;

    if (!staff) {
      // If not staff, check if it's the school admin themselves
      const schoolAdmin = await schoolModel.findById(req.session.isSchoolID);
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
    const markedBy = isAdmin ? "School Admin" : staff!.staffName;
    const staffId = isAdmin ? school!._id : staff!._id;

    const lagosTime = moment().tz("Africa/Lagos");
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

    let action: string;
    let actionTime: string;

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

      const updated = await studentModel.findByIdAndUpdate(
        student._id,
        { 
          clockIn: false, 
          clockOut: true, 
          clockOutTime: now,
          lastActionTimestamp: nowMillis 
        },
        { new: true }
      );
      if (updated) {
        await clockingOutEmail(updated, school);
        await sendClockOutSMS(updated, school);
      }

      action = "Clocked Out";
      actionTime = now;
    } else {
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

      const updated = await studentModel.findByIdAndUpdate(
        student._id,
        { 
          clockIn: true, 
          clockInTime: now, 
          clockOut: false,
          lastActionTimestamp: nowMillis 
        },
        { new: true }
      );
      if (updated) {
        await clockingInEmail(updated, school);
        await sendClockInSMS(updated, school);
      }

      action = "Clocked In";
      actionTime = now;
    }

    // CREATE ATTENDANCE RECORD
    try {
      const dater = Date.now();
      const attendance = await attendanceModel.create({
        className: student.classAssigned,
        studentFirstName: student.studentFirstName,
        studentLastName: student.studentLastName,
        classTeacher: markedBy,
        dateTime: `${moment(dater).format("dddd")}, ${moment(dater).format("MMMM Do YYYY")}`,
        date: moment(dater).format("dddd"),
        present: action === "Clocked In" ? true : false,
        absent: action === "Clocked Out" ? true : false,
        staffs: staffId,
        students: student._id,
        classes: student.presentClassID,
      });

      // Update references
      if (!isAdmin && staff && staff.attendance) {
        staff.attendance.push(new Types.ObjectId(attendance._id));
        await staff.save();
      }

      if (student.attendance) {
        student.attendance.push(new Types.ObjectId(attendance._id));
        await student.save();
      }

      const classroom = await classroomModel.findById(student.presentClassID);
      if (classroom && classroom.attendance) {
        classroom.attendance.push(new Types.ObjectId(attendance._id));
        await classroom.save();
      }
    } catch (attErr) {
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
  } catch (error: any) {
    return res.status(500).send(`
      <html><body style="font-family:sans-serif;text-align:center;padding:40px;background:#fef2f2;">
        <h2 style="color:#dc2626;">⚠️ Error</h2>
        <p>${error.message}</p>
      </body></html>
    `);
  }
};

// Specialized Login for QR Scanning Flow
export const qrStaffLogin = async (req: any, res: Response): Promise<any> => {
  try {
    const { enrollmentID, schoolID, studentID } = req.body;

    // 1. Try to find staff by enrollmentID
    const teacher = await staffModel.findOne({ 
      enrollmentID: enrollmentID?.trim(),
      schoolIDs: schoolID 
    });
    
    if (teacher) {
      const school = await schoolModel.findById(schoolID);
      if (!school || !school.verify) {
        return res.redirect(`/api/qr-scan/${schoolID}/${studentID}?error=true`);
      }

      // Log the teacher in (Session based)
      req.session.isAuth = true;
      req.session.isSchoolID = teacher._id;
      return res.redirect(`/api/qr-scan/${schoolID}/${studentID}`);
    }

    // 2. Try to find school admin by enrollmentID
    const schoolAdmin = await schoolModel.findOne({ 
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
  } catch (error) {
    return res.status(500).send("Verification Error during scan flow");
  }
};

// Create Account

export const createSchoolStudent = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const {
      studentLastName,
      gender,
      studentFirstName,
      studentAddress,
      classAssigned,
    } = req.body;

    const school = await schoolModel.findById(schoolID).populate({
      path: "classRooms",
    });

    const enrollmentID = crypto.randomBytes(4).toString("hex");

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(
      `${studentFirstName.replace(/ /gi, "").toLowerCase()}${studentLastName
        .replace(/ /gi, "")
        .toLowerCase()}`,
      salt
    );

    const findClass: any = school?.classRooms?.find((el: any) => {
      console.log(el.className.trim());
      return el.className.trim() === classAssigned;
    });

    if (school && school.schoolName && school.status === "school-admin") {
      if (findClass) {
        const student = await studentModel.create({
          schoolIDs: schoolID,
          presentClassID: findClass?._id,
          classTermFee:
            findClass?.presentTerm === "1st Term"
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

        school?.students.push(new Types.ObjectId(student._id));

        school?.historys?.push(new Types.ObjectId(student._id));
        await school.save();

        findClass?.students.push(new Types.ObjectId(student._id));
        await findClass.save();

        return res.status(201).json({
          message: "student created successfully",
          data: student,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "class must exist",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "school not found",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school session",
      data: error.message,
      status: 404,
    });
  }
};

export const createBulkSchoolStudent = async (
  req: Request | any,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    let filePath = path.join(__dirname, "../uploads/examination");

    const deleteFilesInFolder = (folderPath: any) => {
      if (fs.existsSync(folderPath)) {
        const files = fs.readdirSync(folderPath);

        files.forEach((file) => {
          const filePath = path.join(folderPath, file);
          fs.unlinkSync(filePath);
        });

        console.log(
          `All files in the folder '${folderPath}' have been deleted.`
        );
      } else {
        console.log(`The folder '${folderPath}' does not exist.`);
      }
    };

    const data = await csv().fromFile(req.file.path);
    let createdCount = 0;
    let duplicateCount = 0;
    const errors: string[] = [];

    for (const i of data) {
      const school = await schoolModel.findById(schoolID).populate({
        path: "classRooms",
      });

      const enrollmentID = crypto.randomBytes(4).toString("hex");

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(
        `${i?.studentFirstName
          ?.replace(/ /gi, "")
          .toLowerCase()}${i?.studentLastName
          ?.replace(/ /gi, "")
          .toLowerCase()}`,
        salt
      );

      const findClass: any = school?.classRooms?.find((el: any) => {
        return el.className.trim() === i?.classAssigned;
      });

      if (!(school && school.schoolName && school.status === "school-admin")) {
        errors.push(
          `School not found or not admin for row ${JSON.stringify(i)}`
        );
        continue;
      }

      if (!findClass) {
        errors.push(
          `Class '${i?.classAssigned}' not found for row ${JSON.stringify(i)}`
        );
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

      const existing = await studentModel.findOne({
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
        const student = await studentModel.create({
          schoolIDs: schoolID,
          presentClassID: findClass?._id,
          classTermFee:
            findClass?.presentTerm === "1st Term"
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

        school?.students.push(new Types.ObjectId(student._id));
        school?.historys?.push(new Types.ObjectId(student._id));
        await school.save();

        findClass?.students.push(new Types.ObjectId(student._id));
        await findClass.save();

        createdCount++;
      } catch (err: any) {
        errors.push(
          `Error creating student for row ${JSON.stringify(i)}: ${
            err?.message || err
          }`
        );
      }
    }

    // delete uploaded files once after processing
    deleteFilesInFolder(filePath);

    return res.status(201).json({
      message: "done with class entry",
      status: 201,
      summary: { created: createdCount, duplicates: duplicateCount, errors },
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school session",
      data: error.message,
      status: 404,
    });
  }
};

export const readSchoolStudents = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const students = await schoolModel.findById(schoolID).populate({
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
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school students",
      status: 404,
    });
  }
};

export const readStudentByEnrollmentID = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { enrollmentID } = req.params;

    const students = await studentModel.findOne({ enrollmentID });

    return res.status(200).json({
      message: "student read successfully",
      data: students,
      status: 200,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school students",
      status: 404,
    });
  }
};

export const readStudentDetail = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID } = req.params;

    const students = await studentModel.findById(studentID);

    return res.status(200).json({
      message: "student read successfully",
      data: students,
      status: 200,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school students",
      status: 404,
    });
  }
};

export const loginStudent = async (
  req: any,
  res: Response
): Promise<Response> => {
  try {
    const { email, password } = req.body;
    const getTeacher = await studentModel.findOne({ email });

    const school = await schoolModel.findOne({
      schoolName: getTeacher?.schoolName,
    });

    if (school?.schoolName && getTeacher?.schoolName) {
      if (school.verify) {
        const token = jwt.sign({ status: school.status }, "student", {
          expiresIn: "1d",
        });

        const pass = await bcrypt.compare(password, getTeacher?.password);

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
        } else {
          return res.status(404).json({
            message: "Invalid Password",
          });
        }
      } else {
        return res.status(404).json({
          message: "please confirm with your school admin",
        });
      }
    } else {
      return res.status(404).json({
        message: "Error finding school",
      });
    }

    // return res.status(201).json({
    //   message: "creating school",
    //   data: school,
    // });
  } catch (error) {
    return res.status(404).json({
      message: "Error logging you in",
    });
  }
};

export const loginStudentWithToken = async (
  req: any,
  res: Response
): Promise<Response> => {
  try {
    const { token } = req.body;

    const getStudent = await studentModel.findOne({ enrollmentID: token });

    const school = await schoolModel.findOne({
      schoolName: getStudent?.schoolName,
    });

    if (school?.schoolName && getStudent?.schoolName) {
      if (school.verify) {
        const token = jwt.sign({ status: school.status }, "student", {
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
      } else {
        return res.status(404).json({
          message: "please confirm with your school admin",
        });
      }
    } else {
      return res.status(404).json({
        message: "Error finding school",
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error logging you in",
    });
  }
};

export const readStudentCookie = async (
  req: any,
  res: Response
): Promise<Response> => {
  try {
    const readSchool = req.session.isSchoolID;

    return res.status(200).json({
      message: "GoodBye",
      data: readSchool,
      status: 200,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error verifying student",
    });
  }
};

export const logoutStudent = async (
  req: any,
  res: Response
): Promise<Response> => {
  try {
    req.session.destroy();

    return res.status(200).json({
      message: "GoodBye",
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error logging out teacher",
    });
  }
};

export const updateStudentAvatar = async (req: any, res: Response) => {
  try {
    const { studentID } = req.params;

    const school = await studentModel.findById(studentID);

    if (school) {
      const { secure_url, public_id }: any = await streamUpload(req);

      const updatedStudent = await studentModel.findByIdAndUpdate(
        studentID,
        {
          avatar: secure_url,
          avatarID: public_id,
        },
        { new: true }
      );

      return res.status(200).json({
        message: "student avatar has been, added",
        data: updatedStudent,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "student not seen",
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating avatar",
      data: error.message,
    });
  }
};

//Student Updates settings

export const updateStudentParentEmail = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, studentID } = req.params;
    const { parentEmail } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school && school.schoolName) {
      const student = await studentModel.findByIdAndUpdate(
        studentID,
        { parentEmail },
        { new: true }
      );

      return res.status(201).json({
        message: "student profile updated successful",
        data: student,
        status: 200,
      });
    } else {
      return res.status(404).json({
        message: "unable to update student profile",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error getting school",
      status: 404,
    });
  }
};

export const updateStudentFirstName = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, studentID } = req.params;
    const { studentFirstName, studentLastName } = req.body;

    const school = await schoolModel.findById(schoolID);
    if (!school) {
      return res.status(404).json({
        message: "School Does Not Exist",
        status: 404,
      });
    }

    const student = await studentModel.findById(studentID);
    if (!student) {
      return res.status(404).json({
        message: "Student Does Not Exist",
        status: 404,
      });
    }

    const updatedFields: any = {};
    if (studentFirstName) updatedFields.studentFirstName = studentFirstName;
    if (studentLastName) updatedFields.studentLastName = studentLastName;

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

    const updatedStudent = await studentModel.findByIdAndUpdate(
      student._id,
      updatedFields,
      { new: true }
    );

    return res.status(201).json({
      message: "Student Information Updated Successfully",
      data: updatedStudent,
      status: 201,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error Updating Student Information",
      error: {
        errorMessage: error.message,
        errorStack: error.stack,
      },
    });
  }
};

export const updateStudentLastName = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, studentID } = req.params;
    const { studentLastName } = req.body;

    const school = await schoolModel.findById(schoolID);
    if (!school) {
      return res.status(404).json({
        message: "School Does Not Exist",
        status: 404,
      });
    }

    const student = await studentModel.findById(studentID);
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

    const studentUpdateLastName = await studentModel.findByIdAndUpdate(
      student._id,
      {
        studentLastName: updatedLastName,
        email: email,
      },
      { new: true }
    );

    return res.status(201).json({
      message: "Student LastName Updated Successfully",
      data: studentUpdateLastName,
      status: 201,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error Updating Student Last Name",
      data: {
        errorMessage: error.message,
        errorType: error.stack,
      },
    });
  }
};

export const updateStudentAddress = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, studentID } = req.params;
    const { studentAddress } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school) {
      const student = await studentModel.findById(studentID);
      if (student) {
        const updateAddress = await studentModel.findByIdAndUpdate(
          student._id,
          { studentAddress: studentAddress },
          { new: true }
        );
        return res.status(201).json({
          message: "Student Address Updated Successfully",
          data: updateAddress,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "Student Does Not Exist",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "School Does Not Exist",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error Updating Student Address",
      data: {
        errorMessage: error.message,
        errorType: error.stack,
      },
    });
  }
};

export const updateStudentGender = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, studentID } = req.params;

    const { gender } = req.body;

    const school = await schoolModel.findById(schoolID);
    if (school) {
      const student = await studentModel.findById(studentID);
      if (student) {
        const updateGender = await studentModel.findByIdAndUpdate(
          student._id,
          { gender: gender },
          { new: true }
        );
        return res.status(201).json({
          message: "Student Gender Updated Succed=sfully",
          data: updateGender,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "Student Does Not Exist",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "School Does Not Exist",
        status: 404,
      });
    }
  } catch (error: any) {
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

export const updateStudentPhone = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, studentID } = req.params;
    const { phone } = req.body;

    const school = await schoolModel.findById(schoolID);
    if (school) {
      const student = await studentModel.findById(studentID);
      if (student) {
        const updatePhone = await studentModel.findByIdAndUpdate(
          student._id,
          { phone: phone },
          { new: true }
        );
        return res.status(201).json({
          message: "Student Phone Number Updated Successfully",
          data: updatePhone,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "Student Does Not Exist",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "School Does Not Exist",
        status: 404,
      });
    }
  } catch (error: any) {
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

export const updateStudentViewReportCard = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, studentID } = req.params;
    const { toggle } = req.body;

    const school = await schoolModel.findById(schoolID);
    if (school) {
      const student = await studentModel.findById(studentID);
      if (student) {
        const studentData = await studentModel.findByIdAndUpdate(
          student._id,
          { viewReportCard: toggle },
          { new: true }
        );

        console.log(toggle);
        return res.status(201).json({
          message: "Student can now view Report card",
          data: studentData,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "Student Does Not Exist",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "School Does Not Exist",
        status: 404,
      });
    }
  } catch (error: any) {
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

export const updateStudentInfo = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID } = req.params;

    if (true) {
      const student = await studentModel.findById(studentID);
      if (student) {
        const updatePhone = await studentModel.findByIdAndUpdate(
          student._id,
          req.body,
          { new: true }
        );
        return res.status(201).json({
          message: "Student Phone Number Updated Successfully",
          data: updatePhone,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "Student Does Not Exist",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "School Does Not Exist",
        status: 404,
      });
    }
  } catch (error: any) {
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

export const updateMainStudentBulkInfo = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID } = req.params;

    if (true) {
      const student = await studentModel.findById(studentID);
      if (student) {
        const updatePhone = await studentModel.findByIdAndUpdate(
          student._id,
          req.body,
          { new: true }
        );
        return res.status(201).json({
          message: "Student Phone Number Updated Successfully",
          data: updatePhone,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "Student Does Not Exist",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "School Does Not Exist",
        status: 404,
      });
    }
  } catch (error: any) {
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

export const updateStudentBulkInfo = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID } = req.params;
    const {
      phone,
      studentFirstName,
      parentPhoneNumber,
      parentEmail,
      studentLastName,
      studentAddress,
    } = req.body;

    if (true) {
      const student = await studentModel.findById(studentID);
      if (student) {
        const updatePhone = await studentModel.findByIdAndUpdate(
          student._id,
          {
            phone,
            studentFirstName,
            parentPhoneNumber,
            parentEmail,
            studentLastName,
            studentAddress,
          },
          { new: true }
        );
        return res.status(201).json({
          message: "Student Phone Number Updated Successfully",
          data: updatePhone,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "Student Does Not Exist",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "School Does Not Exist",
        status: 404,
      });
    }
  } catch (error: any) {
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

export const updateStudentParentNumber = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, studentID } = req.params;
    const { parentPhoneNumber } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school) {
      const student = await studentModel.findById(studentID);
      if (student) {
        const updateParentNumber = await studentModel.findByIdAndUpdate(
          student._id,
          { parentPhoneNumber: parentPhoneNumber },
          { new: true }
        );
        return res.status(201).json({
          message: "Student Phone Number Updated Succesfully",
          data: updateParentNumber,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "Student Does Not Exist",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "School Does Not Exist",
        status: 404,
      });
    }
  } catch (error: any) {
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

export const updateStudent1stFees = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, studentID } = req.params;

    const school = await schoolModel.findById(schoolID);
    const getStudent: any = await studentModel.findById(studentID);
    const presentClass = await classroomModel.findById(
      getStudent?.presentClassID
    );

    const findTerm: any = await termModel.findById(school?.presentTermID);

    if (school?.status === "school-admin" && school) {
      const students = await studentModel.findByIdAndUpdate(
        studentID,
        { feesPaid1st: !getStudent?.feesPaid1st },
        { new: true }
      );
      verifySchoolFees(students, 1);

      await termModel?.findByIdAndUpdate(
        findTerm?._id,
        {
          schoolFeePayment: [
            ...findTerm?.schoolFeePayment,
            {
              studentID: getStudent._id,
              feesPaid1st: getStudent.feesPaid1st,
              cost: presentClass?.class1stFee,
              date: moment(new Date().getTime()).format("llll"),
            },
          ],
        },
        { new: true }
      );

      return res.status(201).json({
        message: "student fees updated successfully",
        data: students,
        status: 200,
      });
    } else {
      return res.status(404).json({
        message: "student 1st fees not found",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school students",
      status: 404,
    });
  }
};

//Student Updates settings ends here

//Student/Parent Socials

export const updateStudentFacebookAcct = async (
  req: Request,
  res: Response
) => {
  try {
    const { schoolID, studentID } = req.params;
    const { facebookAccount } = req.body;
    const school = await schoolModel.findById(schoolID);
    if (school) {
      const student = await studentModel.findById(studentID);

      if (student) {
        const updateStudentFacebook = await studentModel.findByIdAndUpdate(
          student._id,
          { facebookAccount: facebookAccount },
          { new: true }
        );
        return res.status(201).json({
          message: "Student Facebook Account Updated Successfuly",
          data: updateStudentFacebook,
          status: 404,
        });
      } else {
        return res.status(404).json({
          message: "Student Does Not Exist",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "School Does Not Exist",
        status: 404,
      });
    }
  } catch (error: any) {
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

export const updateInstagramAccout = async (req: Request, res: Response) => {
  try {
    const { schoolID, studentID } = req.params;
    const { instagramAccount } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school) {
      const student = await studentModel.findById(studentID);

      if (student) {
        const updateStudentInstagram = await studentModel.findByIdAndUpdate(
          student._id,
          { instagramAccount: instagramAccount },
          { new: true }
        );
        return res.status(201).json({
          message: "IG Account Updated Successfully",
          data: updateStudentInstagram,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "Student Does Not Exist",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "School Does Not Exist",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error Updating IG Account",
      data: {
        errorMessage: error.message,
        errorType: error.stack,
      },
    });
  }
};

export const updateXAcctount = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, studentID } = req.params;
    const { xAccount } = req.body;

    const school = await schoolModel.findById(schoolID);
    if (school) {
      const student = await studentModel.findById(studentID);

      if (student) {
        const updateXhandle = await studentModel.findByIdAndUpdate(
          student._id,
          { xAccount: xAccount },
          { new: true }
        );

        return res.status(201).json({
          message: "X Account Updated Succsfully",
          data: updateXhandle,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "Student Does Not Exist",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "School Does not Exist",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error Updating X Account",
      data: {
        errorMessage: error.message,
        errorType: error.stack,
      },
    });
  }
};

export const updateStudentLinkedinAccount = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, studentID } = req.params;
    const { linkedinAccount } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school) {
      const student = await studentModel.findById(studentID);

      if (student) {
        const updateLinkedinAccount = await studentModel.findByIdAndUpdate(
          student._id,
          { linkedinAccount: linkedinAccount },
          { new: true }
        );

        return res.status(201).json({
          message: "Linkedin Account Updated Successfully",
          data: updateLinkedinAccount,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "Student Does Not Exist",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "School Does Not Exist",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error Updating Linkedin Account",
      data: {
        errorMessage: error.message,
        errorType: error.stack,
      },
    });
  }
};

//Student/Parent Socials Ends Here

export const updateStudent2ndFees = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, studentID } = req.params;

    const school = await schoolModel.findById(schoolID);

    const getStudent: any = await studentModel.findById(studentID);
    const presentClass = await classroomModel.findById(
      getStudent?.presentClassID
    );

    const findTerm: any = await termModel.findById(school?.presentTermID);

    if (school?.status === "school-admin" && school) {
      let students = await studentModel.findById(studentID);

      if (students?.feesPaid1st === true) {
        let student = await studentModel.findByIdAndUpdate(
          students?._id,
          { feesPaid2nd: !students?.feesPaid2nd },
          { new: true }
        );

        verifySchoolFees(student, 2);

        await termModel?.findByIdAndUpdate(
          findTerm?._id,
          {
            schoolFeePayment: [
              ...findTerm?.schoolFeePayment,
              {
                studentID: getStudent._id,
                feesPaid2nd: getStudent.feesPaid2nd,
                cost: presentClass?.class2ndFee,
                date: moment(new Date().getTime()).format("llll"),
              },
            ],
          },
          { new: true }
        );

        return res.status(201).json({
          message: "student fees updated successfully",
          data: student,
          status: 200,
        });
      } else {
        return res.status(404).json({
          message: "student 3rd fees not found",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "School not found",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school students",
      status: 404,
    });
  }
};

export const updateStudent3rdFees = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, studentID } = req.params;

    const school = await schoolModel.findById(schoolID);
    const getStudent: any = await studentModel.findById(studentID);
    const presentClass = await classroomModel.findById(
      getStudent?.presentClassID
    );

    const findTerm: any = await termModel.findById(school?.presentTermID);

    if (school?.status === "school-admin" && school) {
      const student = await studentModel.findById(studentID);
      if (student?.feesPaid2nd === true) {
        await studentModel.findByIdAndUpdate(
          studentID,
          { feesPaid3rd: !student?.feesPaid3rd },
          { new: true }
        );
        verifySchoolFees(student, 3);

        await termModel?.findByIdAndUpdate(
          findTerm?._id,
          {
            schoolFeePayment: [
              ...findTerm?.schoolFeePayment,
              {
                studentID: getStudent._id,
                feesPaid3rd: getStudent.feesPaid3rd,
                cost: presentClass?.class3rdFee,
                date: moment(new Date().getTime()).format("llll"),
              },
            ],
          },
          { new: true }
        );

        return res.status(201).json({
          message: "student fees updated successfully",
          data: student,
          status: 200,
        });
      } else {
        return res.status(404).json({
          message: "student 2nd fees not found",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "School not found",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school students",
      status: 404,
    });
  }
};

export const updatePurchaseRecord = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID } = req.params;
    const { purchased } = req.body;
    const student: any = await studentModel.findById(studentID);
    const school: any = await schoolModel.findById(student?.schoolIDs!);

    if (school?.status === "school-admin" && school) {
      await studentModel.findById(
        studentID,
        {
          purchaseHistory: student?.purchaseHistory?.push(purchased),
        },
        { new: true }
      );

      return res.status(201).json({
        message: "student purchase recorded successfully",
        data: student,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "School not found",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating students purchase",
      status: 404,
    });
  }
};

export const createStorePurchased = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID } = req.params;
    const { date, amount, cart, reference, purchasedID, delievered } = req.body;

    const student = await studentModel.findById(studentID).populate({
      path: "purchaseHistory",
    });

    const school = await schoolModel.findById(student?.schoolIDs);
    const term: any = await termModel?.findById(school?.presentTermID);

    if (school) {
      const check = student?.purchaseHistory.some((el: any) => {
        return el.reference === reference;
      });

      if (!check) {
        const store = await purchasedModel.create({
          date,
          amount,
          cart,
          reference,
          purchasedID,
          delievered: false,
          studentName: `${student?.studentFirstName} ${student?.studentLastName}`,
          studentClass: student?.classAssigned,
        });

        await termModel.findByIdAndUpdate(
          term?._id,
          {
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
          },
          { new: true }
        );

        student?.purchaseHistory.push(new Types.ObjectId(store._id));
        student?.save();

        school?.purchaseHistory.push(new Types.ObjectId(store._id));
        school?.save();

        return res.status(201).json({
          message: "remark created successfully",
          data: store,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "Has already entered it",

          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "unable to read school",
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school's store item",
      data: error.message,
    });
  }
};

export const viewStorePurchased = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID } = req.params;

    const student = await studentModel.findById(studentID).populate({
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
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school's store item",
      data: error.message,
    });
  }
};

export const viewSchoolStorePurchased = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const student = await schoolModel.findById(schoolID).populate({
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
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school's store item",
      data: error.message,
    });
  }
};

export const updateSchoolStorePurchased = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { purchaseID } = req.params;
    const { delievered } = req.body;

    const item = await purchasedModel.findByIdAndUpdate(
      purchaseID,
      {
        delievered,
      },
      { new: true }
    );

    return res.status(201).json({
      message: `item delieved successfully`,
      data: item,
      status: 201,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error updating school's store item",
      data: error.message,
    });
  }
};

export const createStorePurchasedTeacher = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { staffID } = req.params;
    const { date, amount, cart, reference, purchasedID } = req.body;

    const student = await staffModel.findById(staffID).populate({
      path: "purchaseHistory",
    });

    const school = await schoolModel.findById(student?.schoolIDs);

    if (school) {
      const check = student?.purchaseHistory.some((el: any) => {
        return el.reference === reference;
      });

      if (!check) {
        const store = await purchasedModel.create({
          date,
          amount,
          cart,
          reference,
          purchasedID,
          delievered: false,
          studentName: student?.staffName,
          studentClass: student?.classesAssigned,
        });

        student?.purchaseHistory.push(new Types.ObjectId(store._id));
        student?.save();

        school?.purchaseHistory.push(new Types.ObjectId(store._id));
        school?.save();

        return res.status(201).json({
          message: "remark created successfully",
          data: store,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "Has already entered it",

          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "unable to read school",
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school's store item",
      data: error.message,
    });
  }
};

export const viewStorePurchasedTeacher = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { staffID } = req.params;

    const student = await staffModel.findById(staffID).populate({
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
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school's store item",
      data: error.message,
    });
  }
};

export const createSchoolFeePayment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID } = req.params;
    const { date, amount, purchasedID, reference } = req.body;

    const student = await studentModel.findById(studentID).populate({
      path: "schoolFeesHistory",
    });

    const classOne: any = await classroomModel.findById(
      student?.presentClassID
    );

    const school: any = await schoolModel.findById(student?.schoolIDs);

    if (school) {
      const check = student?.schoolFeesHistory.some((el: any) => {
        return el.reference === reference;
      });

      const payment = student?.schoolFeesHistory.some((el: any) => {
        return (
          el.sessionID === school?.presentSessionID &&
          el.session === school?.presentSession &&
          el.termID === school?.presentTermID &&
          el.term === school?.presentTerm
        );
      });

      if (!payment) {
        const store = await schoolFeeHistory.create({
          studentID,
          session: school?.presentSession!,

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

        student?.schoolFeesHistory.push(new Types.ObjectId(store._id));
        student?.save();

        school?.schoolFeesHistory.push(new Types.ObjectId(store._id));
        school?.save();

        if (classOne?.presentTerm === "1st Term") {
          classOne?.schoolFeesHistory.push(new Types.ObjectId(store._id));
          classOne?.save();
        } else if (classOne?.presentTerm === "2nd Term") {
          classOne?.schoolFeesHistory2.push(new Types.ObjectId(store._id));
          classOne?.save();
        } else if (classOne?.presentTerm === "3rd Term") {
          classOne?.schoolFeesHistory3.push(new Types.ObjectId(store._id));
          classOne?.save();
        }

        if (classOne?.presentTerm === "1st Term") {
          const classData: any = await classroomModel
            .findById(student?.presentClassID)
            .populate({
              path: "schoolFeesHistory",
            });

          const amount = classData?.schoolFeesHistory
            ?.filter((el: any) => {
              return (
                el.sessionID === school?.presentSessionID &&
                el.termID === school?.presentTermID &&
                el.term === "1st Term"
              );
            })
            .map((el: any) => {
              return el.amount;
            })
            .reduce((a: number, b: number) => {
              return a + b;
            }, 0);

          const real = await classroomModel.findByIdAndUpdate(
            classData?._id,
            {
              class1stFee: amount,
            },
            { new: true }
          );
        } else if (classOne?.presentTerm === "2nd Term") {
          const classData: any = await classroomModel
            .findById(student?.presentClassID)
            .populate({
              path: "schoolFeesHistory2",
            });

          const amount = classData?.schoolFeesHistory
            ?.filter((el: any) => {
              return (
                el.sessionID === school?.presentSessionID &&
                el.termID === school?.presentTermID &&
                el.term === "2nd Term"
              );
            })
            .map((el: any) => {
              return el.amount;
            })
            .reduce((a: number, b: number) => {
              return a + b;
            }, 0);

          classroomModel.findByIdAndUpdate(
            classData?._id,
            {
              class2ndFee: amount,
            },
            { new: true }
          );
        } else if (classOne?.presentTerm === "3rd Term") {
          const classData: any = await classroomModel
            .findById(student?.presentClassID)
            .populate({
              path: "schoolFeesHistory3",
            });

          const amount = classData?.schoolFeesHistory
            ?.filter((el: any) => {
              return (
                el.sessionID === school?.presentSessionID &&
                el.termID === school?.presentTermID &&
                el.term === "3rd Term"
              );
            })
            .map((el: any) => {
              return el.amount;
            })
            .reduce((a: number, b: number) => {
              return a + b;
            }, 0);

          classroomModel.findByIdAndUpdate(
            classData?._id,
            {
              class3rdFee: amount,
            },
            { new: true }
          );
        }

        return res.status(201).json({
          message: "schoolfee paid successfully",
          data: store,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "Has already entered it",

          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "unable to read school",
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error paying school's fee",
      data: error.message,
    });
  }
};

export const viewSchoolFeeRecord = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID } = req.params;

    const student = await studentModel.findById(studentID).populate({
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
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school's store item",
      data: error.message,
    });
  }
};

export const viewSchoolSchoolFeeRecord = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const student = await schoolModel.findById(schoolID).populate({
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
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school's store item",
      data: error.message,
    });
  }
};

export const updateSchoolSchoolFee = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolFeeID } = req.params;
    const { confirm } = req.body;

    const item: any = await schoolFeeHistory.findByIdAndUpdate(
      schoolFeeID,
      {
        confirm,
      },
      { new: true }
    );
    let studentRecord: any = await studentModel.findById(item.studentID);
    let studetClass = await classroomModel.findById(
      studentRecord?.presentClassID
    );
    const school = await schoolModel.findById(studentRecord?.schoolIDs);

    const term: any = await termModel.findById(school?.presentTermID);

    if (studetClass?.presentTerm === "1st Term") {
      await studentModel.findByIdAndUpdate(
        item?.studentID,
        {
          feesPaid1st: true,
        },
        { new: true }
      );
    } else if (studetClass?.presentTerm === "2nd Term") {
      await studentModel.findByIdAndUpdate(
        item?.studentID,
        {
          feesPaid2nd: true,
        },
        { new: true }
      );
    } else if (studetClass?.presentTerm === "3rd Term") {
      await studentModel.findByIdAndUpdate(
        item?.studentID,
        {
          feesPaid3rd: true,
        },
        { new: true }
      );
    }

    const check = term?.schoolFeePayment.some(
      (el: any) => el?.purchasedID !== item?.purchasedID
    );

  
if (true) {
  let x = await termModel.findByIdAndUpdate(
    item?.termID,
    {
      schoolFeePayment: [...term?.schoolFeePayment!, item],
    },
    { new: true }
  );

  console.log("loading: ", x);

  return res.status(201).json({
    message: `schoolfee confirm successfully`,
    data: item,
    status: 201,
  });
} else {
  return res.status(201).json({
    message: `schoolfee confirm successfully`,
    data: item,
    status: 201,
  });
}
  } catch (error: any) {
    return res.status(404).json({
      message: "Error updating school's school fee",
      data: error.message,
    });
  }
};

export const assignClassMonitor = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { teacherID, studentID } = req.params;

    const teacher = await staffModel.findById(teacherID);

    const getClass = await classroomModel
      .findById(teacher?.presentClassID)
      .populate({
        path: "students",
      });

    let readStudent: any = getClass?.students?.find((el: any) => {
      return el?.monitor === true;
    });

    await studentModel.findByIdAndUpdate(
      readStudent?._id,
      {
        monitor: false,
      },
      { new: true }
    );

    const student = await studentModel.findByIdAndUpdate(
      studentID,
      {
        monitor: true,
      },
      { new: true }
    );

    return res.status(201).json({
      message: `class monitor assigned to ${student?.studentFirstName} `,
      status: 201,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error updating class's monitor",
      data: error.message,
    });
  }
};

export const changeStudentClass = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID } = req.params;
    const { classID } = req.body;

    const getClass = await classroomModel.findById(classID).populate({
      path: "students",
    });

    const studentData = await studentModel.findById(studentID);
    const getStudentClass: any = await classroomModel.findById(
      studentData?.presentClassID
    );

    getStudentClass?.students?.pull(new Types.ObjectId(studentID));
    getStudentClass?.save();

    const student = await studentModel.findByIdAndUpdate(
      studentID,
      {
        classAssigned: getClass?.className,
        presentClassID: getClass?._id,
        classTermFee:
          getClass?.presentTerm === "1st Term"
            ? getClass?.class1stFee
            : getClass?.presentTerm === "2nd Term"
            ? getClass?.class2ndFee
            : getClass?.presentTerm === "3rd Term"
            ? getClass?.class3rdFee
            : null,
      },
      { new: true }
    );

    getClass?.students?.push(new Types.ObjectId(student?._id));
    getClass?.save();

    return res.status(201).json({
      message: `class monitor assigned to ${student?.studentFirstName} `,
      data: student,
      status: 201,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error updating class's monitor",
      data: error.message,
    });
  }
};

export const deleteStudent = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, studentID } = req.params;
    const school = await schoolModel.findById(schoolID);

    if (school) {
      // First get the student to get their class info before deletion
      const student = await studentModel.findById(studentID);
      if (!student) {
        return res.status(404).json({
          message: "Student not found",
          status: 404,
        });
      }

      // Find and update the student's current classroom
      if (student.presentClassID) {
        await classroomModel.findByIdAndUpdate(
          student.presentClassID,
          {
            $pull: { students: new Types.ObjectId(studentID) },
          },
          { new: true }
        );
      }

      // Remove student from school's students array
      await schoolModel.findByIdAndUpdate(
        schoolID,
        {
          $pull: { students: new Types.ObjectId(studentID) },
        },
        { new: true }
      );

      // Finally delete the student
      await studentModel.findByIdAndDelete(studentID);

      return res.status(200).json({
        message: "Successfully deleted student and removed all references",
        status: 200,
        data: student,
      });
    } else {
      return res.status(404).json({
        message: "School not found",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error deleting student",
      status: 404,
      data: error.message,
    });
  }
};

// Delete ALL students in one click endpoint
export const deleteAllStudents = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const school = await schoolModel.findById(schoolID);

    if (school) {
      const allStudentIDs = school?.students;

      for (const studentID of allStudentIDs) {
        const student = await studentModel.findByIdAndDelete(studentID);

        if (student) {
          await classroomModel.updateMany(
            { students: studentID },
            { $pull: { students: studentID } }
          );
        }
      }

      school.students = [];
      await school.save();

      return res.status(200).json({
        message: "Successfully deleted all students",
        data: allStudentIDs,
        status: 200,
      });
    } else {
      return res.status(404).json({
        message: "School Does Not Exist",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error Deleting All Students",
      status: 404,
      error: error.message,
    });
  }
};

export const testSMS = async (req: Request, res: Response): Promise<any> => {
  try {
    const { phone } = req.params;
    const { action, channel, customMsg } = req.query;

    const selectedChannel = (channel as string) || "generic";
    const userCustomMessage = customMsg ? (customMsg as string) : undefined;

    if (action === "send") {
      await sendTestSMS(phone, selectedChannel, userCustomMessage);
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
  } catch (error: any) {
    return res.status(200).send(`
      <html><body style="font-family:sans-serif;text-align:center;padding:40px;">
        <h2 style="color:#dc2626;">❌ SMS Test Failed</h2>
        <div style="background:#fef2f2; border:1px solid #fee2e2; padding:15px; border-radius:8px; margin-bottom:20px; text-align:left; display:inline-block; max-width:500px;">
          <p><strong>Error Message:</strong> ${error.message}</p>
          ${
            error.response?.data
              ? `<p><strong>Termii Details:</strong> <pre style="background:#fff; padding:10px; border-radius:4px;">${JSON.stringify(
                  error.response.data,
                  null,
                  2
                )}</pre></p>`
              : ""
          }
        </div>
        <br/>
        <a href="javascript:history.back()" style="color:#2563eb; font-weight:bold;">Try Again</a>
      </body></html>
    `);
  }
};
