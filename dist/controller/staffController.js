"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStaffBulkInfo = exports.deleteStaff = exports.updateStaffActiveness = exports.updateStaffAvatar = exports.updateStaffSignature = exports.logoutTeacher = exports.updateTeacherSalary = exports.readTeacherDetail = exports.readSchooTeacher = exports.updateStaffLinkedinAcct = exports.updateStaffInstagramAcct = exports.updateStaffXAcct = exports.updateFacebookAccount = exports.updateStaffAdress = exports.updateStaffGender = exports.updatePhoneNumber = exports.updateStaffName = exports.createBulkTeachers = exports.createSchoolTeacher = exports.createSchoolTeacherByAdmin = exports.createSchoolTeacherByVicePrincipal = exports.createSchoolTeacherByPrincipal = exports.createSchoolVicePrincipal = exports.createSchoolPrincipal = exports.readTeacherCookie = exports.loginStaffWithToken = exports.loginTeacher = void 0;
const schoolModel_1 = __importDefault(require("../model/schoolModel"));
const staffModel_1 = __importDefault(require("../model/staffModel"));
const mongoose_1 = require("mongoose");
const enums_1 = require("../utils/enums");
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const streamifier_1 = require("../utils/streamifier");
const studentModel_1 = __importDefault(require("../model/studentModel"));
const cron_1 = require("cron");
const csvtojson_1 = __importDefault(require("csvtojson"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const loginTeacher = async (req, res) => {
    try {
        const { email, password } = req.body;
        const getTeacher = await staffModel_1.default.findOne({ email });
        const school = await schoolModel_1.default.findOne({
            schoolName: getTeacher?.schoolName,
        });
        if (school?.schoolName && getTeacher?.schoolName) {
            if (school.verify) {
                const token = jsonwebtoken_1.default.sign({ status: school.status }, "teacher", {
                    expiresIn: "1d",
                });
                const passed = await bcrypt_1.default.compare(password, getTeacher?.password);
                if (passed) {
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
                        message: "Password error",
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
        return res.status(201).json({
            message: "creating school",
            data: school,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school",
        });
    }
};
exports.loginTeacher = loginTeacher;
const loginStaffWithToken = async (req, res) => {
    try {
        const { token } = req.body;
        const getTeacher = await staffModel_1.default.findOne({
            enrollmentID: token,
        });
        const school = await schoolModel_1.default.findOne({
            schoolName: getTeacher?.schoolName,
        });
        if (school?.schoolName && getTeacher?.schoolName) {
            if (school.verify) {
                const token = jsonwebtoken_1.default.sign({ status: school.status }, "student", {
                    expiresIn: "1d",
                });
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
                    message: "please confirm with your school admin",
                });
            }
        }
        else {
            return res.status(404).json({
                message: "Error finding school",
            });
        }
        return res.status(201).json({
            message: "creating school",
            data: school,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error logging you in",
        });
    }
};
exports.loginStaffWithToken = loginStaffWithToken;
const readTeacherCookie = async (req, res) => {
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
            message: "Error verifying school",
        });
    }
};
exports.readTeacherCookie = readTeacherCookie;
const createSchoolPrincipal = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { staffName, staffAddress, assignedSubject } = req.body;
        const school = await schoolModel_1.default.findById(schoolID).populate({
            path: "subjects",
        });
        const enrollmentID = crypto_1.default.randomBytes(3).toString("hex");
        const salt = await bcrypt_1.default.genSalt(10);
        const hashed = await bcrypt_1.default.hash(`${staffName.replace(/ /gi, "")}`, salt);
        if (school && school.schoolName && school.status === "school-admin") {
            const staff = await staffModel_1.default.create({
                staffName,
                schoolName: school.schoolName,
                staffRole: enums_1.staffDuty.PRINCIPAL,
                status: "school-teacher",
                email: `${staffName
                    .replace(/ /gi, "")
                    .toLowerCase()}@${school?.schoolName
                    ?.replace(/ /gi, "")
                    .toLowerCase()}.com`,
                enrollmentID,
                password: hashed,
                staffAddress,
                assignedSubject,
            });
            school.staff.push(new mongoose_1.Types.ObjectId(staff._id));
            school.save();
            return res.status(201).json({
                message: "principal created successfully",
                data: staff,
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
exports.createSchoolPrincipal = createSchoolPrincipal;
const createSchoolVicePrincipal = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { staffName } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school && school.schoolName && school.status === "school-admin") {
            const staff = await staffModel_1.default.create({
                staffName,
                schoolName: school.schoolName,
                staffRole: enums_1.staffDuty.VICE_PRINCIPAL,
            });
            school.staff.push(new mongoose_1.Types.ObjectId(staff._id));
            school.save();
            return res.status(201).json({
                message: "principal created successfully",
                data: staff,
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
exports.createSchoolVicePrincipal = createSchoolVicePrincipal;
const createSchoolTeacherByPrincipal = async (req, res) => {
    try {
        const { staffID } = req.params;
        const { staffName } = req.body;
        const staff = await staffModel_1.default.findById(staffID);
        const school = await schoolModel_1.default.findOne({ schoolName: staff?.schoolName });
        if (staff && staff.schoolName && staff.staffRole === "principal") {
            const newStaff = await staffModel_1.default.create({
                staffName,
                staffRole: enums_1.staffDuty.TEACHER,
            });
            school.staff.push(new mongoose_1.Types.ObjectId(newStaff._id));
            school.save();
            return res.status(201).json({
                message: "teacher created successfully",
                data: newStaff,
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
exports.createSchoolTeacherByPrincipal = createSchoolTeacherByPrincipal;
const createSchoolTeacherByVicePrincipal = async (req, res) => {
    try {
        const { staffID } = req.params;
        const { staffName } = req.body;
        const staff = await staffModel_1.default.findById(staffID);
        const school = await schoolModel_1.default.findOne({ schoolName: staff?.schoolName });
        if (staff && staff.schoolName && staff.staffRole === "vice principal") {
            const newStaff = await staffModel_1.default.create({
                staffName,
                staffRole: enums_1.staffDuty.TEACHER,
            });
            school.staff.push(new mongoose_1.Types.ObjectId(newStaff._id));
            school.save();
            return res.status(201).json({
                message: "teacher created successfully",
                data: newStaff,
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
exports.createSchoolTeacherByVicePrincipal = createSchoolTeacherByVicePrincipal;
const createSchoolTeacherByAdmin = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { staffName } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school && school.schoolName && school.status === "school-admin") {
            const staff = await staffModel_1.default.create({
                staffName,
                schoolName: school.schoolName,
                staffRole: enums_1.staffDuty.TEACHER,
            });
            school.staff.push(new mongoose_1.Types.ObjectId(staff._id));
            school.save();
            return res.status(201).json({
                message: "teacher created successfully",
                data: staff,
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
exports.createSchoolTeacherByAdmin = createSchoolTeacherByAdmin;
const createSchoolTeacher = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { staffName, gender, salary, staffAddress, role, subjectTitle } = req.body;
        const enrollmentID = crypto_1.default.randomBytes(3).toString("hex");
        const salt = await bcrypt_1.default.genSalt(10);
        const hashed = await bcrypt_1.default.hash(`${staffName.replace(/ /gi, "")}`, salt);
        const school = await schoolModel_1.default.findById(schoolID).populate({
            path: "subjects",
        });
        const getSubject = school?.subjects.find((el) => {
            return el.subjectTitle === subjectTitle;
        });
        if (school && school.schoolName && school.status === "school-admin") {
            // if (getSubject) {
            const staff = await staffModel_1.default.create({
                schoolIDs: schoolID,
                staffName,
                schoolName: school.schoolName,
                staffRole: enums_1.staffDuty.TEACHER,
                // subjectAssigned: [{ title: subjectTitle, id: getSubject._id }],
                role,
                status: "school-teacher",
                salary,
                gender,
                email: `${staffName
                    .replace(/ /gi, "")
                    .toLowerCase()}@${school?.schoolName
                    ?.replace(/ /gi, "")
                    .toLowerCase()}.com`,
                enrollmentID,
                password: hashed,
                staffAddress,
            });
            school.staff.push(new mongoose_1.Types.ObjectId(staff._id));
            school.save();
            return res.status(201).json({
                message: "teacher created successfully",
                data: staff,
                status: 201,
            });
            // }
            // else {
            //   return res.status(404).json({
            //     message:
            //       "A teacher must have a subject to handle and Subject hasn't been created",
            //     status: 404,
            //   });
            // }
        }
        else {
            return res.status(404).json({
                message: "unable to read school",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating teacher",
        });
    }
};
exports.createSchoolTeacher = createSchoolTeacher;
const createBulkTeachers = async (req, res) => {
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
        for (let i of data) {
            const enrollmentID = crypto_1.default.randomBytes(3).toString("hex");
            console.log("staff: ", i);
            console.log("staff: ", i?.staffName);
            const salt = await bcrypt_1.default.genSalt(10);
            const hashed = await bcrypt_1.default.hash(`${i?.staffName.replace(/ /gi, "")}`, salt);
            const school = await schoolModel_1.default.findById(schoolID).populate({
                path: "subjects",
            });
            if (school && school.schoolName && school.status === "school-admin") {
                // if (getSubject) {
                const staff = await staffModel_1.default.create({
                    schoolIDs: schoolID,
                    staffName: i?.staffName,
                    schoolName: school.schoolName,
                    staffRole: enums_1.staffDuty.TEACHER,
                    // subjectAssigned: [{ title: subjectTitle, id: getSubject._id }],
                    role: i?.role,
                    status: "school-teacher",
                    salary: i?.salary,
                    gender: i?.gender,
                    email: `${i?.staffName
                        .replace(/ /gi, "")
                        .toLowerCase()}@${school?.schoolName
                        ?.replace(/ /gi, "")
                        .toLowerCase()}.com`,
                    enrollmentID,
                    password: hashed,
                    staffAddress: i?.staffAddress,
                });
                school.staff.push(new mongoose_1.Types.ObjectId(staff._id));
                school.save();
                deleteFilesInFolder(filePath);
            }
            else {
                return res.status(404).json({
                    message: "unable to read school",
                    status: 404,
                });
            }
        }
        return res.status(201).json({
            message: "done with class entry",
            status: 201,
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
exports.createBulkTeachers = createBulkTeachers;
const updateStaffName = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { staffID } = req.params;
        const { staffName } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const staff = await staffModel_1.default.findById(staffID);
            if (staff) {
                const updatedStaffName = await staffModel_1.default.findByIdAndUpdate(staff._id, {
                    staffName: staffName,
                    email: `${staffName
                        .replace(/ /gi, "")
                        .toLowerCase()}@${school?.schoolName
                        ?.replace(/ /gi, "")
                        .toLowerCase()}.com`,
                }, { new: true });
                return res.status(201).json({
                    message: "Staff Name Updated Successfully",
                    data: updatedStaffName,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Staff Does Not Exist",
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
            message: "Error Updating Staff Name",
            data: {
                errorMessage: error.message,
                errorType: error.stack,
            },
            status: 404,
        });
    }
};
exports.updateStaffName = updateStaffName;
const updatePhoneNumber = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { staffID } = req.params;
        const { phone } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const staff = await staffModel_1.default.findById(staffID);
            if (staff) {
                const updatedPhoneNumber = await staffModel_1.default.findByIdAndUpdate(staff._id, {
                    phone: phone,
                }, { new: true });
                return res.status(201).json({
                    message: "Staff Phone Number Updated Successfully",
                    data: updatedPhoneNumber,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Staff Does Not Exist",
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
            message: "Error Updating Staff Phone Number",
            data: {
                errorMessage: error.message,
                errorType: error.stack,
            },
            status: 404,
        });
    }
};
exports.updatePhoneNumber = updatePhoneNumber;
const updateStaffGender = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { staffID } = req.params;
        const { gender } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const staff = await staffModel_1.default.findById(staffID);
            if (staff) {
                const updateStaffGender = await staffModel_1.default.findByIdAndUpdate(staff._id, {
                    gender: gender,
                }, { new: true });
                return res.status(201).json({
                    message: "Staff Gender Updated Successfully",
                    data: updateStaffGender,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    mesaage: "Staff Does Not Exist",
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
            message: "Error Updating Staff Gender",
            data: {
                errorMessage: error.message,
                errorType: error.stack,
            },
            status: 404,
        });
    }
};
exports.updateStaffGender = updateStaffGender;
const updateStaffAdress = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { staffID } = req.params;
        const { staffAddress } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const staff = await staffModel_1.default.findByIdAndUpdate(staffID);
            if (staff) {
                const updateStaffDetails = await staffModel_1.default.findByIdAndUpdate(staff._id, { staffAddress: staffAddress }, { new: true });
                return res.status(201).json({
                    message: "StaffAddress Updated Successfully",
                    data: updateStaffDetails,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Staff Does Not Exist",
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
            message: "Error Updating StaffAddress",
            data: {
                errorMessage: error.message,
                errorType: error.stack,
            },
        });
    }
};
exports.updateStaffAdress = updateStaffAdress;
//Update Socials
const updateFacebookAccount = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { staffID } = req.params;
        const { facebookAcct } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const staff = await staffModel_1.default.findById(staffID);
            if (staff) {
                const updateStaffFacebookAcct = await staffModel_1.default.findByIdAndUpdate(staff._id, { facebookAcct: facebookAcct }, { new: true });
                return res.status(201).json({
                    message: "Staff Facebook Account Updated Successfully",
                    data: updateStaffFacebookAcct,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Staff Does Not Exist",
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
            message: "Error Updating Facebook Social",
            data: {
                errorMessage: error.message,
                errorType: error.stack,
            },
        });
    }
};
exports.updateFacebookAccount = updateFacebookAccount;
const updateStaffXAcct = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { staffID } = req.params;
        const { xAcct } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const staff = await staffModel_1.default.findById(staffID);
            if (staff) {
                const updateStaffXAcct = await staffModel_1.default.findByIdAndUpdate(staff._id, { xAcct: xAcct }, { new: true });
                return res.status(201).json({
                    message: "Staff X Acctount Updated Succesfully",
                    data: updateStaffXAcct,
                });
            }
            else {
                return res.status(404).json({
                    message: "Staff DOes Not Exist",
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
            message: "Error Updating Staff X account",
            data: {
                errorMessage: error.message,
                errorType: error.stack,
            },
        });
    }
};
exports.updateStaffXAcct = updateStaffXAcct;
const updateStaffInstagramAcct = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { staffID } = req.params;
        const { instagramAcct } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const staff = await staffModel_1.default.findById(staffID);
            if (staff) {
                const updateStaffInstagramAcct = await staffModel_1.default.findByIdAndUpdate(staff._id, { instagramAcct: instagramAcct }, { new: true });
                return res.status(201).json({
                    message: "Staff IG Acct Updated Succesfully",
                    data: updateStaffInstagramAcct,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "No Staff Found",
                    status: 404,
                });
            }
        }
        else {
            return res.status(404).json({
                message: "No School Found",
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
            status: 404,
        });
    }
};
exports.updateStaffInstagramAcct = updateStaffInstagramAcct;
const updateStaffLinkedinAcct = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const { staffID } = req.params;
        const { linkedinAcct } = req.body;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const staff = await staffModel_1.default.findById(staffID);
            if (staff) {
                const updateStaffLinkedinAcct = await staffModel_1.default.findByIdAndUpdate(staff._id, { linkedinAcct: linkedinAcct }, { new: true });
                return res.status(210).json({
                    message: "Staff Linkedin Updated Successfully",
                    data: updateStaffLinkedinAcct,
                    status: 201,
                });
            }
            else {
                return res.status(404).json({
                    message: "Staff Does Not Exist",
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
            message: "Error Updating LinkedinAcct",
            data: {
                errorMessage: error.message,
                errorType: error.stack,
            },
        });
    }
};
exports.updateStaffLinkedinAcct = updateStaffLinkedinAcct;
//Update Socials Ends Here
const readSchooTeacher = async (req, res) => {
    try {
        const { schoolID } = req.params;
        const students = await schoolModel_1.default.findById(schoolID).populate({
            path: "staff",
            options: {
                sort: {
                    createdAt: -1,
                },
            },
        });
        return res.status(201).json({
            message: "staff read successfully",
            data: students,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school staff",
            status: 404,
        });
    }
};
exports.readSchooTeacher = readSchooTeacher;
const readTeacherDetail = async (req, res) => {
    try {
        const { staffID } = req.params;
        const staff = await staffModel_1.default.findById(staffID);
        return res.status(200).json({
            message: "satff read successfully",
            data: staff,
            status: 200,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error Reading Teachers Details",
            status: 404,
        });
    }
};
exports.readTeacherDetail = readTeacherDetail;
const updateTeacherSalary = async (req, res) => {
    try {
        const { staffID } = req.params;
        const { salary } = req.body;
        const staff = await staffModel_1.default.findByIdAndUpdate(staffID, {
            salary,
        }, { new: true });
        return res.status(201).json({
            message: "satff read successfully",
            data: staff,
            status: 201,
        });
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating school staff",
            status: 404,
        });
    }
};
exports.updateTeacherSalary = updateTeacherSalary;
const logoutTeacher = async (req, res) => {
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
exports.logoutTeacher = logoutTeacher;
const updateStaffSignature = async (req, res) => {
    try {
        const { staffID } = req.params;
        const school = await staffModel_1.default.findById(staffID);
        if (school) {
            const { secure_url, public_id } = await (0, streamifier_1.streamUpload)(req);
            const updatedSchool = await staffModel_1.default.findByIdAndUpdate(staffID, {
                signature: secure_url,
                signatureID: public_id,
            }, { new: true });
            return res.status(201).json({
                message: "staff signature has been, added",
                data: updatedSchool,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "Something went wrong",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating user",
        });
    }
};
exports.updateStaffSignature = updateStaffSignature;
const updateStaffAvatar = async (req, res) => {
    try {
        const { staffID } = req.params;
        const school = await staffModel_1.default.findById(staffID);
        if (school) {
            const { secure_url, public_id } = await (0, streamifier_1.streamUpload)(req);
            const updatedSchool = await staffModel_1.default.findByIdAndUpdate(staffID, {
                avatar: secure_url,
                avatarID: public_id,
            }, { new: true });
            return res.status(201).json({
                message: "staff avatar has been, added",
                status: 201,
                data: updatedSchool,
            });
        }
        else {
            return res.status(404).json({
                message: "Something went wrong",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating user",
        });
    }
};
exports.updateStaffAvatar = updateStaffAvatar;
const updateStaffActiveness = async (req, res) => {
    try {
        const { studentID } = req.params;
        const { teacherName } = req.body;
        const student = await studentModel_1.default.findById(studentID);
        const teacher = await staffModel_1.default.findOne({ staffName: teacherName });
        if (teacher && student) {
            const updatedSchool = await staffModel_1.default.findByIdAndUpdate(teacher?._id, {
                activeStatus: true,
            }, { new: true });
            const timing = 40 * 60 * 1000;
            const job = new cron_1.CronJob("*/2 * * * *", async () => {
                await staffModel_1.default.findByIdAndUpdate(teacher?._id, {
                    activeStatus: false,
                }, { new: true });
                job.stop();
            }, null, true);
            // const taskId = setTimeout(async () => {
            //   await staffModel.findByIdAndUpdate(
            //     teacher?._id,
            //     {
            //       activeStatus: false,
            //     },
            //     { new: true }
            //   );
            //   clearTimeout(taskId);
            // }, timing);
            return res.status(201).json({
                message: "staff activity has been, active",
                data: updatedSchool,
                status: 201,
            });
        }
        else {
            return res.status(404).json({
                message: "Something went wrong",
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error creating user",
        });
    }
};
exports.updateStaffActiveness = updateStaffActiveness;
const deleteStaff = async (req, res) => {
    try {
        const { schoolID, staffID } = req.params;
        const school = await schoolModel_1.default.findById(schoolID);
        if (school) {
            const staff = await staffModel_1.default.findByIdAndDelete(staffID);
            school?.staff?.pull(new mongoose_1.Types.ObjectId(staffID));
            school.save();
            return res.status(200).json({
                message: "Successfully Deleted Staff",
                status: 200,
                data: staff,
            });
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
            message: "Error deleting Staff",
            status: 404,
            data: error.message,
        });
    }
};
exports.deleteStaff = deleteStaff;
const updateStaffBulkInfo = async (req, res) => {
    try {
        const { staffID } = req.params;
        const { staffName, phone, gender, staffAddress, salary, email, staffRole } = req.body;
        const staff = await staffModel_1.default.findById(staffID);
        if (staff) {
            const updateData = {};
            if (staffName !== undefined && staffName !== "")
                updateData.staffName = staffName;
            if (phone !== undefined && phone !== "")
                updateData.phone = phone;
            if (gender !== undefined && gender !== "")
                updateData.gender = gender;
            if (staffAddress !== undefined && staffAddress !== "")
                updateData.staffAddress = staffAddress;
            if (salary !== undefined && salary !== "")
                updateData.salary = salary;
            if (email !== undefined && email !== "")
                updateData.email = email;
            if (staffRole !== undefined && staffRole !== "")
                updateData.staffRole = staffRole;
            const updatedStaff = await staffModel_1.default.findByIdAndUpdate(staffID, updateData, { new: true });
            return res.status(200).json({
                message: "Staff details updated successfully",
                status: 200,
                data: updatedStaff,
            });
        }
        else {
            return res.status(404).json({
                message: "Staff does not exist",
                status: 404,
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            message: "Error updating staff details",
            status: 404,
            data: error.message,
        });
    }
};
exports.updateStaffBulkInfo = updateStaffBulkInfo;
