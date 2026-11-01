import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import staffModel from "../model/staffModel";
import { Types } from "mongoose";
import { staffDuty } from "../utils/enums";
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { streamUpload } from "../utils/streamifier";
import studentModel from "../model/studentModel";
import { CronJob } from "cron";

import csv from "csvtojson";
import fs from "node:fs";
import path from "node:path";

export const loginTeacher = async (
  req: any,
  res: Response
): Promise<Response> => {
  try {
    const { email, password } = req.body;
    const getTeacher = await staffModel.findOne({ email });

    const school = await schoolModel.findOne({
      schoolName: getTeacher?.schoolName,
    });

    if (school?.schoolName && getTeacher?.schoolName) {
      if (school.verify) {
        const token = jwt.sign({ status: school.status }, "teacher", {
          expiresIn: "1d",
        });
        const passed = await bcrypt.compare(password, getTeacher?.password);

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
        } else {
          return res.status(404).json({
            message: "Password error",
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

    return res.status(201).json({
      message: "creating school",
      data: school,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school",
    });
  }
};

export const loginStaffWithToken = async (
  req: any,
  res: Response
): Promise<Response> => {
  try {
    const { token } = req.body;

    const getTeacher = await staffModel.findOne({
      enrollmentID: token,
    });

    const school = await schoolModel.findOne({
      schoolName: getTeacher?.schoolName,
    });

    if (school?.schoolName && getTeacher?.schoolName) {
      if (school.verify) {
        const token = jwt.sign({ status: school.status }, "student", {
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

    return res.status(201).json({
      message: "creating school",
      data: school,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error logging you in",
    });
  }
};

export const readTeacherCookie = async (
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
      message: "Error verifying school",
    });
  }
};

export const createSchoolPrincipal = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { staffName, staffAddress, assignedSubject } = req.body;

    const school = await schoolModel.findById(schoolID).populate({
      path: "subjects",
    });

    const enrollmentID = crypto.randomBytes(3).toString("hex");

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(`${staffName.replace(/ /gi, "")}`, salt);

    if (school && school.schoolName && school.status === "school-admin") {
      const staff = await staffModel.create({
        staffName,
        schoolName: school.schoolName,
        staffRole: staffDuty.PRINCIPAL,
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

      school.staff.push(new Types.ObjectId(staff._id));
      school.save();

      return res.status(201).json({
        message: "principal created successfully",
        data: staff,
      });
    } else {
      return res.status(404).json({
        message: "unable to read school",
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school session",
    });
  }
};

export const createSchoolVicePrincipal = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { staffName } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school && school.schoolName && school.status === "school-admin") {
      const staff = await staffModel.create({
        staffName,
        schoolName: school.schoolName,
        staffRole: staffDuty.VICE_PRINCIPAL,
      });

      school.staff.push(new Types.ObjectId(staff._id));
      school.save();

      return res.status(201).json({
        message: "principal created successfully",
        data: staff,
      });
    } else {
      return res.status(404).json({
        message: "unable to read school",
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school session",
    });
  }
};

export const createSchoolTeacherByPrincipal = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { staffID } = req.params;
    const { staffName } = req.body;

    const staff = await staffModel.findById(staffID);
    const school = await schoolModel.findOne({ schoolName: staff?.schoolName });

    if (staff && staff.schoolName && staff.staffRole === "principal") {
      const newStaff = await staffModel.create({
        staffName,
        staffRole: staffDuty.TEACHER,
      });

      school!.staff.push(new Types.ObjectId(newStaff._id));
      school!.save();

      return res.status(201).json({
        message: "teacher created successfully",
        data: newStaff,
      });
    } else {
      return res.status(404).json({
        message: "unable to read school",
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school session",
    });
  }
};

export const createSchoolTeacherByVicePrincipal = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { staffID } = req.params;
    const { staffName } = req.body;

    const staff = await staffModel.findById(staffID);
    const school = await schoolModel.findOne({ schoolName: staff?.schoolName });

    if (staff && staff.schoolName && staff.staffRole === "vice principal") {
      const newStaff = await staffModel.create({
        staffName,
        staffRole: staffDuty.TEACHER,
      });

      school!.staff.push(new Types.ObjectId(newStaff._id));
      school!.save();

      return res.status(201).json({
        message: "teacher created successfully",
        data: newStaff,
      });
    } else {
      return res.status(404).json({
        message: "unable to read school",
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school session",
    });
  }
};

export const createSchoolTeacherByAdmin = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { staffName } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school && school.schoolName && school.status === "school-admin") {
      const staff = await staffModel.create({
        staffName,
        schoolName: school.schoolName,
        staffRole: staffDuty.TEACHER,
      });

      school.staff.push(new Types.ObjectId(staff._id));
      school.save();

      return res.status(201).json({
        message: "teacher created successfully",
        data: staff,
      });
    } else {
      return res.status(404).json({
        message: "unable to read school",
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school session",
    });
  }
};

export const createSchoolTeacher = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { staffName, gender, salary, staffAddress, role, subjectTitle } =
      req.body;

    const enrollmentID = crypto.randomBytes(3).toString("hex");

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(`${staffName.replace(/ /gi, "")}`, salt);

    const school = await schoolModel.findById(schoolID).populate({
      path: "subjects",
    });

    const getSubject: any = school?.subjects.find((el: any) => {
      return el.subjectTitle === subjectTitle;
    });

    if (school && school.schoolName && school.status === "school-admin") {
      // if (getSubject) {
      const staff = await staffModel.create({
        schoolIDs: schoolID,
        staffName,
        schoolName: school.schoolName,
        staffRole: staffDuty.TEACHER,
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

      school.staff.push(new Types.ObjectId(staff._id));
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
    } else {
      return res.status(404).json({
        message: "unable to read school",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating teacher",
    });
  }
};

export const createBulkTeachers = async (
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

    for (let i of data) {
      const enrollmentID = crypto.randomBytes(3).toString("hex");
      console.log("staff: ", i);
      console.log("staff: ", i?.staffName);
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(
        `${i?.staffName.replace(/ /gi, "")}`,
        salt
      );

      const school = await schoolModel.findById(schoolID).populate({
        path: "subjects",
      });

      if (school && school.schoolName && school.status === "school-admin") {
        // if (getSubject) {
        const staff = await staffModel.create({
          schoolIDs: schoolID,
          staffName: i?.staffName,
          schoolName: school.schoolName,
          staffRole: staffDuty.TEACHER,
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

        school.staff.push(new Types.ObjectId(staff._id));
        school.save();

        deleteFilesInFolder(filePath);
      } else {
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
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school session",
      data: error.message,
      status: 404,
    });
  }
};

export const updateStaffName = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { staffID } = req.params;
    const { staffName } = req.body;
    const school = await schoolModel.findById(schoolID);

    if (school) {
      const staff = await staffModel.findById(staffID);
      if (staff) {
        const updatedStaffName = await staffModel.findByIdAndUpdate(
          staff._id,
          {
            staffName: staffName,
            email: `${staffName
              .replace(/ /gi, "")
              .toLowerCase()}@${school?.schoolName
              ?.replace(/ /gi, "")
              .toLowerCase()}.com`,
          },
          { new: true }
        );

        return res.status(201).json({
          message: "Staff Name Updated Successfully",
          data: updatedStaffName,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "Staff Does Not Exist",
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
      message: "Error Updating Staff Name",
      data: {
        errorMessage: error.message,
        errorType: error.stack,
      },
      status: 404,
    });
  }
};

export const updatePhoneNumber = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { staffID } = req.params;
    const { phone } = req.body;
    const school = await schoolModel.findById(schoolID);

    if (school) {
      const staff = await staffModel.findById(staffID);
      if (staff) {
        const updatedPhoneNumber = await staffModel.findByIdAndUpdate(
          staff._id,
          {
            phone: phone,
          },
          { new: true }
        );

        return res.status(201).json({
          message: "Staff Phone Number Updated Successfully",
          data: updatedPhoneNumber,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "Staff Does Not Exist",
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
      message: "Error Updating Staff Phone Number",
      data: {
        errorMessage: error.message,
        errorType: error.stack,
      },
      status: 404,
    });
  }
};

export const updateStaffGender = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { staffID } = req.params;
    const { gender } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school) {
      const staff = await staffModel.findById(staffID);
      if (staff) {
        const updateStaffGender = await staffModel.findByIdAndUpdate(
          staff._id,
          {
            gender: gender,
          },
          { new: true }
        );

        return res.status(201).json({
          message: "Staff Gender Updated Successfully",
          data: updateStaffGender,
          status: 201,
        });
      } else {
        return res.status(404).json({
          mesaage: "Staff Does Not Exist",
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
      message: "Error Updating Staff Gender",
      data: {
        errorMessage: error.message,
        errorType: error.stack,
      },
      status: 404,
    });
  }
};

export const updateStaffAdress = async (req: Request, res: Response) => {
  try {
    const { schoolID } = req.params;
    const { staffID } = req.params;

    const { staffAddress } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school) {
      const staff = await staffModel.findByIdAndUpdate(staffID);
      if (staff) {
        const updateStaffDetails = await staffModel.findByIdAndUpdate(
          staff._id,
          { staffAddress: staffAddress },
          { new: true }
        );
        return res.status(201).json({
          message: "StaffAddress Updated Successfully",
          data: updateStaffDetails,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "Staff Does Not Exist",
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
      message: "Error Updating StaffAddress",
      data: {
        errorMessage: error.message,
        errorType: error.stack,
      },
    });
  }
};

//Update Socials

export const updateFacebookAccount = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { staffID } = req.params;

    const { facebookAcct } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school) {
      const staff = await staffModel.findById(staffID);
      if (staff) {
        const updateStaffFacebookAcct = await staffModel.findByIdAndUpdate(
          staff._id,
          { facebookAcct: facebookAcct },
          { new: true }
        );
        return res.status(201).json({
          message: "Staff Facebook Account Updated Successfully",
          data: updateStaffFacebookAcct,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "Staff Does Not Exist",
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
      message: "Error Updating Facebook Social",
      data: {
        errorMessage: error.message,
        errorType: error.stack,
      },
    });
  }
};

export const updateStaffXAcct = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { staffID } = req.params;

    const { xAcct } = req.body;
    const school = await schoolModel.findById(schoolID);
    if (school) {
      const staff = await staffModel.findById(staffID);
      if (staff) {
        const updateStaffXAcct = await staffModel.findByIdAndUpdate(
          staff._id,
          { xAcct: xAcct },
          { new: true }
        );
        return res.status(201).json({
          message: "Staff X Acctount Updated Succesfully",
          data: updateStaffXAcct,
        });
      } else {
        return res.status(404).json({
          message: "Staff DOes Not Exist",
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
      message: "Error Updating Staff X account",
      data: {
        errorMessage: error.message,
        errorType: error.stack,
      },
    });
  }
};

export const updateStaffInstagramAcct = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { staffID } = req.params;

    const { instagramAcct } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school) {
      const staff = await staffModel.findById(staffID);

      if (staff) {
        const updateStaffInstagramAcct = await staffModel.findByIdAndUpdate(
          staff._id,
          { instagramAcct: instagramAcct },
          { new: true }
        );
        return res.status(201).json({
          message: "Staff IG Acct Updated Succesfully",
          data: updateStaffInstagramAcct,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "No Staff Found",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "No School Found",
      });
    }
  } catch (error: any) {
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

export const updateStaffLinkedinAcct = async (req: Request, res: Response) => {
  try {
    const { schoolID } = req.params;
    const { staffID } = req.params;

    const { linkedinAcct } = req.body;

    const school = await schoolModel.findById(schoolID);
    if (school) {
      const staff = await staffModel.findById(staffID);

      if (staff) {
        const updateStaffLinkedinAcct = await staffModel.findByIdAndUpdate(
          staff._id,
          { linkedinAcct: linkedinAcct },
          { new: true }
        );

        return res.status(210).json({
          message: "Staff Linkedin Updated Successfully",
          data: updateStaffLinkedinAcct,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "Staff Does Not Exist",
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
      message: "Error Updating LinkedinAcct",
      data: {
        errorMessage: error.message,
        errorType: error.stack,
      },
    });
  }
};

//Update Socials Ends Here

export const readSchooTeacher = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const students = await schoolModel.findById(schoolID).populate({
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
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school staff",
      status: 404,
    });
  }
};

export const readTeacherDetail = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { staffID } = req.params;

    const staff = await staffModel.findById(staffID);

    return res.status(200).json({
      message: "satff read successfully",
      data: staff,
      status: 200,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error Reading Teachers Details",
      status: 404,
    });
  }
};

export const updateTeacherSalary = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { staffID } = req.params;
    const { salary } = req.body;

    const staff = await staffModel.findByIdAndUpdate(
      staffID,
      {
        salary,
      },
      { new: true }
    );

    return res.status(201).json({
      message: "satff read successfully",
      data: staff,
      status: 201,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school staff",
      status: 404,
    });
  }
};

export const logoutTeacher = async (
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

export const updateStaffSignature = async (req: any, res: Response) => {
  try {
    const { staffID } = req.params;

    const school = await staffModel.findById(staffID);

    if (school) {
      const { secure_url, public_id }: any = await streamUpload(req);

      const updatedSchool = await staffModel.findByIdAndUpdate(
        staffID,
        {
          signature: secure_url,
          signatureID: public_id,
        },
        { new: true }
      );

      return res.status(201).json({
        message: "staff signature has been, added",
        data: updatedSchool,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "Something went wrong",
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating user",
    });
  }
};

export const updateStaffAvatar = async (req: any, res: Response) => {
  try {
    const { staffID } = req.params;

    const school = await staffModel.findById(staffID);

    if (school) {
      const { secure_url, public_id }: any = await streamUpload(req);

      const updatedSchool = await staffModel.findByIdAndUpdate(
        staffID,
        {
          avatar: secure_url,
          avatarID: public_id,
        },
        { new: true }
      );

      return res.status(201).json({
        message: "staff avatar has been, added",
        status: 201,
        data: updatedSchool,
      });
    } else {
      return res.status(404).json({
        message: "Something went wrong",
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating user",
    });
  }
};

export const updateStaffActiveness = async (req: any, res: Response) => {
  try {
    const { studentID } = req.params;
    const { teacherName } = req.body;

    const student = await studentModel.findById(studentID);
    const teacher = await staffModel.findOne({ staffName: teacherName });

    if (teacher && student) {
      const updatedSchool = await staffModel.findByIdAndUpdate(
        teacher?._id,
        {
          activeStatus: true,
        },
        { new: true }
      );

      const timing = 40 * 60 * 1000;

      const job = new CronJob(
        "*/2 * * * *",
        async () => {
          await staffModel.findByIdAndUpdate(
            teacher?._id,
            {
              activeStatus: false,
            },
            { new: true }
          );

          job.stop();
        },
        null,
        true
      );

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
    } else {
      return res.status(404).json({
        message: "Something went wrong",
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating user",
    });
  }
};

export const deleteStaff = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID, staffID } = req.params;
    const school: any = await schoolModel.findById(schoolID);

    if (school) {
      const staff = await staffModel.findByIdAndDelete(staffID);

      school?.staff?.pull(new Types.ObjectId(staffID));
      school.save();

      return res.status(200).json({
        message: "Successfully Deleted Staff",
        status: 200,
        data: staff,
      });
    } else {
      return res.status(404).json({
        message: "No School Found",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error deleting Staff",
      status: 404,
      data: error.message,
    });
  }
};

export const updateStaffBulkInfo = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { staffID } = req.params;
    const { staffName, phone, gender, staffAddress, salary, email, staffRole } =
      req.body;

    const staff = await staffModel.findById(staffID);
    if (staff) {
      const updateData: any = {};
      if (staffName !== undefined && staffName !== "") updateData.staffName = staffName;
      if (phone !== undefined && phone !== "") updateData.phone = phone;
      if (gender !== undefined && gender !== "") updateData.gender = gender;
      if (staffAddress !== undefined && staffAddress !== "") updateData.staffAddress = staffAddress;
      if (salary !== undefined && salary !== "") updateData.salary = salary;
      if (email !== undefined && email !== "") updateData.email = email;
      if (staffRole !== undefined && staffRole !== "") updateData.staffRole = staffRole;

      const updatedStaff = await staffModel.findByIdAndUpdate(
        staffID,
        updateData,
        { new: true }
      );

      return res.status(200).json({
        message: "Staff details updated successfully",
        status: 200,
        data: updatedStaff,
      });
    } else {
      return res.status(404).json({
        message: "Staff does not exist",
        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error updating staff details",
      status: 404,
      data: error.message,
    });
  }
};

