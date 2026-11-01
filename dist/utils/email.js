"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWeeklyReport = exports.clockingOutEmail = exports.clockingInEmail = exports.verifySchoolFees = exports.changeTokenEmail = exports.addMemberEmail = exports.verifiedEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const googleapis_1 = require("googleapis");
const path_1 = __importDefault(require("path"));
const ejs_1 = __importDefault(require("ejs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const moment_1 = __importDefault(require("moment"));
const sms_1 = require("./sms");
dotenv_1.default.config();
const GOOGLE_ID = process.env.GOOGLE_ID;
const GOOGLE_SECRET = process.env.GOOGLE_SECRET;
const GOOGLE_REDIRECT_URL = process.env.GOOGLE_REDIRECT_URL;
const GOOGLE_REFRESH = process.env.GOOGLE_REFRESH;
const GPASS = process.env.GPASS;
const GMAIL = process.env.GMAIL;
const oAuth = new googleapis_1.google.auth.OAuth2(GOOGLE_ID, GOOGLE_SECRET, GOOGLE_REDIRECT_URL);
oAuth.setCredentials({ refresh_token: GOOGLE_REFRESH });
const url = process.env.APP_URL_DEPLOY;
// const createEmailTransporter = async () => {
//   try {
//     // const accessToken: any = (await oAuth.getAccessToken()).token;
//     // const transporter = nodemail.createTransport({
//     //   service: "gmail",
//     //   auth: {
//     //     type: "OAuth2",
//     //     user: GMAIL, // Your Gmail address
//     //     clientSecret: GOOGLE_SECRET,
//     //     clientId: GOOGLE_ID,
//     //     refreshToken: GOOGLE_REFRESH,
//     //     accessToken,
//     //   },
//     // });
//     // Verify transporter
//     await transporter.verify();
//     console.log("Email transporter verified successfully");
//     return transporter;
//   } catch (error) {
//     console.error("Email configuration error:", error);
//     throw error;
//   }
// };
const verifiedEmail = async (user) => {
    try {
        // const transporter = await createEmailTransporter();
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: GMAIL,
                pass: GPASS,
            },
        });
        const token = jsonwebtoken_1.default.sign({
            id: user._id,
            email: user.email,
        }, "secretCode", {
            expiresIn: "5m",
        });
        const timer = setTimeout(async () => {
            const getSchool = await schoolModel_1.default.findById(user._id);
            if (!getSchool.verify) {
                await schoolModel_1.default.findByIdAndDelete(getSchool._id);
            }
            clearTimeout(timer);
        }, 5 * 60 * 1000);
        let frontEndURL = `${url}/${token}/sign-in`;
        let devURL = `${url}/auth/api/verify-user/${token}`;
        const myPath = path_1.default.join(__dirname, "../views/index.ejs");
        const html = await ejs_1.default.renderFile(myPath, {
            link: devURL,
            tokenCode: user?.enrollmentID,
            userName: user?.userName,
        });
        const mailerOption = {
            from: "NEXT🟦🟦🟦 <justtnext@gmail.com>",
            to: user.email,
            subject: "Account Verification",
            html,
        };
        await transporter.sendMail(mailerOption);
    }
    catch (error) {
        console.error();
    }
};
exports.verifiedEmail = verifiedEmail;
const addMemberEmail = async (member, getUser) => {
    try {
        // const accessToken: any = (await oAuth.getAccessToken()).token;
        // const transporter = nodemail.createTransport({
        //   service: "gmail",
        //   auth: {
        //     type: "OAuth2",
        //     user: GMAIL,
        //     clientSecret: GOOGLE_SECRET,
        //     clientId: GOOGLE_ID,
        //     refreshToken: GOOGLE_REFRESH,
        //     accessToken,
        //   },
        // });
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: GMAIL,
                pass: GPASS,
            },
        });
        let devURL = `${url}/api/verify-user/${getUser._id}`;
        const myPath = path_1.default.join(__dirname, "../views/memberAdded.ejs");
        const html = await ejs_1.default.renderFile(myPath, {
            relationship: member.relationship,
            firstName: member.firstName,
        });
        const mailerOption = {
            from: "wecareHMO❤️⛑️🚑 <justtnext@gmail.com>",
            to: getUser.email,
            subject: "Family Member added Notification",
            html,
        };
        await transporter.sendMail(mailerOption);
    }
    catch (error) {
        console.error();
    }
};
exports.addMemberEmail = addMemberEmail;
const changeTokenEmail = async (getUser) => {
    try {
        // const accessToken: any = (await oAuth.getAccessToken()).token;
        // const transporter = nodemail.createTransport({
        //   service: "gmail",
        //   auth: {
        //     type: "OAuth2",
        //     user: GMAIL,
        //     clientSecret: GOOGLE_SECRET,
        //     clientId: GOOGLE_ID,
        //     refreshToken: GOOGLE_REFRESH,
        //     accessToken,
        //   },
        // });
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: GMAIL,
                pass: GPASS,
            },
        });
        let devURL = `${url}/api/verify-user/${getUser._id}`;
        const myPath = path_1.default.join(__dirname, "../views/resetToken.ejs");
        const html = await ejs_1.default.renderFile(myPath, {
            token: getUser.firstName,
            link: devURL,
        });
        const mailerOption = {
            from: "wecareHMO❤️⛑️🚑 <justtnext@gmail.com>",
            to: getUser.email,
            subject: "Token reset Notification",
            html,
        };
        await transporter.sendMail(mailerOption);
    }
    catch (error) {
        console.error();
    }
};
exports.changeTokenEmail = changeTokenEmail;
const verifySchoolFees = async (user, term) => {
    try {
        // const accessToken: any = (await oAuth.getAccessToken()).token;
        // const transporter = nodemail.createTransport({
        //   service: "gmail",
        //   auth: {
        //     type: "OAuth2",
        //     user: "codelabbest@gmail.com",
        //     clientSecret: GOOGLE_SECRET,
        //     clientId: GOOGLE_ID,
        //     refreshToken: GOOGLE_REFRESH,
        //     accessToken,
        //   },
        // });
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: GMAIL,
                pass: GPASS,
            },
        });
        const token = jsonwebtoken_1.default.sign({
            id: user._id,
            email: user.parentEmail,
        }, "weEducation");
        let frontEndURL = `${url}/${token}/sign-in`;
        let devURL = `${url}/api/update-student-fees-1st/${user._id}`;
        const myPath = path_1.default.join(__dirname, "../views/feesMail.ejs");
        const html = await ejs_1.default.renderFile(myPath, {
            link: devURL,
            token: user.token,
            studentName: user.studentFirstName,
            // schoolMail: user.email,
            // schoolName: user.schoolName,
        });
        const mailerOption = {
            from: `${user.schoolName}📘📘📘 <justtnext@gmail.com>`,
            to: user.parentEmail,
            subject: `${term} Term School Fees Payment`,
            html,
        };
        await transporter.sendMail(mailerOption);
    }
    catch (error) {
        console.error();
    }
};
exports.verifySchoolFees = verifySchoolFees;
const clockingInEmail = async (user, school) => {
    try {
        // const accessToken: any = (await oAuth.getAccessToken()).token;
        // const transporter = nodemail.createTransport({
        //   service: "gmail",
        //   auth: {
        //     type: "OAuth2",
        //     user: GMAIL,
        //     clientSecret: GOOGLE_SECRET,
        //     clientId: GOOGLE_ID,
        //     refreshToken: GOOGLE_REFRESH,
        //     accessToken,
        //   },
        // });
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: GMAIL,
                pass: GPASS,
            },
        });
        const myPath = path_1.default.join(__dirname, "../views/clockinMail.ejs");
        const x = user?.clockInTime.split(",");
        const y = x[2].trim();
        const html = await ejs_1.default.renderFile(myPath, {
            clockin: user.clockInTime,
            parent: user.studentLastName,
            child: user.studentFirstName,
            address: school?.address,
            school: school?.schoolName,
            phone: school?.phone,
            date: `${x[0]} ${x[1]} ${y.split(" ")[0]}`,
            time: `${y.split(" ")[1]} ${y.split(" ")[2]}`,
        });
        const mailerOption = {
            from: `${user.schoolName} 📘📘📘 <justtnext@gmail.com>`,
            to: user.parentEmail,
            subject: `${user?.studentFirstName} just Clocked in`,
            html,
        };
        console.log("awesome: ", user.parentEmail);
        await transporter.sendMail(mailerOption).then((res) => {
            console.log("sent", user.parentEmail, res);
        });
        // SMS via Termii (if enabled)
        if (school?.sendSMS) {
            (0, sms_1.sendClockInSMS)(user, school).catch(() => { });
        }
        else {
            console.log(`SMS Skipped for ${school?.schoolName}: sendSMS flag is false`);
        }
    }
    catch (error) {
        console.error();
    }
};
exports.clockingInEmail = clockingInEmail;
const clockingOutEmail = async (user, school) => {
    try {
        // const accessToken: any = (await oAuth.getAccessToken()).token;
        // const transporter = nodemail.createTransport({
        //   service: "gmail",
        //   auth: {
        //     type: "OAuth2",
        //     user: GMAIL,
        //     clientSecret: GOOGLE_SECRET,
        //     clientId: GOOGLE_ID,
        //     refreshToken: GOOGLE_REFRESH,
        //     accessToken,
        //   },
        // });
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: GMAIL,
                pass: GPASS,
            },
        });
        const myPath = path_1.default.join(__dirname, "../views/clockoutMail.ejs");
        const x = user?.clockOutTime.split(",");
        const y = x[2].trim();
        const html = await ejs_1.default.renderFile(myPath, {
            clockin: user.clockOutTime,
            parent: user.studentLastName,
            child: user.studentFirstName,
            address: school?.address,
            school: school?.schoolName,
            phone: school?.phone,
            date: `${x[0]} ${x[1]} ${y.split(" ")[0]}`,
            time: `${y.split(" ")[1]} ${y.split(" ")[2]}`,
        });
        const mailerOption = {
            from: `${user.schoolName} 📘📘📘 <justtnext@gmail.com>`,
            to: user.parentEmail,
            subject: `${user?.studentFirstName} just Clocked Out`,
            html,
        };
        await transporter.sendMail(mailerOption);
        // SMS via Termii (if enabled)
        if (school?.sendSMS) {
            (0, sms_1.sendClockOutSMS)(user, school).catch(() => { });
        }
        else {
            console.log(`SMS Skipped for ${school?.schoolName}: sendSMS flag is false`);
        }
    }
    catch (error) {
        console.error();
    }
};
exports.clockingOutEmail = clockingOutEmail;
const sendWeeklyReport = async (user, school, remark) => {
    try {
        // const accessToken: any = (await oAuth.getAccessToken()).token;
        // const transporter = nodemail.createTransport({
        //   service: "gmail",
        //   auth: {
        //     type: "OAuth2",
        //     user: GMAIL,
        //     clientSecret: GOOGLE_SECRET,
        //     clientId: GOOGLE_ID,
        //     refreshToken: GOOGLE_REFRESH,
        //     accessToken,
        //   },
        // });
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: GMAIL,
                pass: GPASS,
            },
        });
        const myPath = path_1.default.join(__dirname, "../views/weeklyReport.ejs");
        // const x = user?.clockInTime.split(",");
        // const y = x[2].trim();
        let link = `${url}/report`;
        const html = await ejs_1.default.renderFile(myPath, {
            parent: user.studentLastName,
            studentName: user.studentFirstName,
            address: school?.address,
            school: school?.schoolName,
            phone: school?.phone,
            date: (0, moment_1.default)(remark?.createdAt).format("LL"),
            attendance: parseInt(remark?.attendanceRatio) * 20,
            best: remark?.best,
            worst: remark?.worst,
            link,
            classParticipation: remark?.classParticipation,
            sportParticipation: remark?.sportParticipation,
        });
        const mailerOption = {
            from: `${user.schoolName} 📘📘📘 <justtnext@gmail.com>`,
            to: user.parentEmail,
            subject: `${user?.studentFirstName} Weekly Academic Performance Report`,
            html,
        };
        await transporter.sendMail(mailerOption).then(() => {
            console.log("sent");
        });
    }
    catch (error) {
        console.error();
    }
};
exports.sendWeeklyReport = sendWeeklyReport;
