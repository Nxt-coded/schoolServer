import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import crypto from "crypto";
import { verifiedEmail } from "../utils/email";
import jwt from "jsonwebtoken";
import { streamUpload } from "../utils/streamifier";
import lodash from "lodash";
import { CronJob } from "cron";
import { verifiedaccess_v1 } from "googleapis";
import sessionModel from "../model/sessionModel";
import staffModel from "../model/staffModel";
import cardReportModel from "../model/cardReportModel";
import midReportCardModel from "../model/midReportCardModel";
import outGoneStudentModel from "../model/outGoneStudentModel";
import termModel from "../model/termModel";
import classHistoryModel from "../model/classHistory";
import subjectModel from "../model/subjectModel";
import classroomModel from "../model/classroomModel";
import studentModel from "../model/studentModel";
import announcementModel from "../model/announcementModel";
import articleModel from "../model/articleModel";
import assignmentModel from "../model/assignmentModel";
import assignmentResolvedModel from "../model/assignmentResolvedModel";
import attendanceModel from "../model/attendanceModel";
import examinationModel from "../model/examinationModel";
import ExpenditureModel from "../model/ExpenditureModel";
import expenseModel from "../model/expenseModel";
import gallaryModel from "../model/gallaryModel";
import historyModel from "../model/historyModel";
import lessonNoteModel from "../model/lessonNoteModel";
import midTestModel from "../model/midTestModel";
import pastQuestionModel from "../model/pastQuestionModel";
import paymentHistory from "../model/paymentHistory";
import paymentModel from "../model/paymentModel";
import performanceModel from "../model/performanceModel";
import quizModel from "../model/quizModel";
import recordPaymentModel from "../model/recordPaymentModel";
import reportCardModel from "../model/reportCardModel";
import scheduleModel from "../model/scheduleModel";
import schemeOfWorkModel from "../model/schemeOfWorkModel";
import schoolFeeHistory from "../model/schoolFeeHistory";
import sessionHistoryModel from "../model/sessionHistoryModel";
import storeModel from "../model/storeModel";
import studentHistoricalResultModel from "../model/studentHistoricalResultModel";
import studentRemark from "../model/studentRemark";
import teachSubjectModel from "../model/teachSubjectModel";
import teachSubjectTopics from "../model/teachSubjectTopics";
import teachTopicQuizesModel from "../model/teachTopicQuizesModel";
import timetableModel from "../model/timetableModel";
import cloudinary from "../utils/cloudinary";
const archiver: any = require("archiver");

export const viewSchoolTopStudent = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const schoolClasses = await schoolModel.findById(schoolID).populate({
      path: "students",
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });

    const rate = lodash.orderBy(
      schoolClasses?.students,
      ["totalPerformance"],
      ["desc"]
    );

    return res.status(200).json({
      message: "finding class students top performance!",
      status: 200,
      data: rate,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school class",
      status: 404,
      data: error.message,
    });
  }
};

export const loginSchool = async (
  req: any,
  res: Response
): Promise<Response> => {
  try {
    const { email, enrollmentID } = req.body;

    const school = await schoolModel.findOne({
      email,
    });

    if (school) {
      if (school.enrollmentID === enrollmentID) {
        if (school.verify) {
          const token = jwt.sign({ status: school.status }, "school", {
            expiresIn: "1d",
          });

          req.session.isAuth = true;
          req.session.isSchoolID = school._id;

          return res.status(201).json({
            message: "welcome back",
            data: token,
            user: school?.status,
            id: req.session.isSchoolID,
            status: 201,
          });
        } else {
          return res.status(404).json({
            message: "please check your email to verify your account",
          });
        }
      } else {
        return res.status(404).json({
          message: "Error reading your school enrollment ID",
        });
      }
    } else {
      return res.status(404).json({
        message: "Error finding school",
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school",
      data: error.message,
    });
  }
};

export const createSchool = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email } = req.body;

    const id = crypto.randomBytes(4).toString("hex");
    const adminCode = crypto.randomBytes(6).toString("hex");

    const school = await schoolModel.create({
      email,
      enrollmentID: id,
      adminCode,
      status: "school-admin",
    });

    // verifiedEmail(school);

    const job = new CronJob(
      " * * * * 7", // cronTime
      async () => {
        const viewSchool = await schoolModel.findById(school._id);

        if (
          viewSchool?.staff?.length === 0 &&
          viewSchool?.students?.length === 0 &&
          viewSchool?.classRooms?.length === 0 &&
          viewSchool?.subjects?.length === 0 &&
          !viewSchool?.started &&
          !viewSchool?.verify
        ) {
          await schoolModel.findByIdAndDelete(school._id);
        }

        job.stop();
      }, // onTick
      null, // onComplete
      true // start
    );

    return res.status(201).json({
      message: "creating school",
      data: school,
      status: 201,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school",
      data: error.message,
      status: 404,
    });
  }
};

export const verifySchool = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const school = await schoolModel.findById(schoolID);

    if (school) {
      const verified = await schoolModel.findByIdAndUpdate(
        schoolID,
        { verify: true },
        { new: true }
      );

      return res.status(201).json({
        message: "school verified successfully",
        data: verified,
      });
    } else {
      return res.status(404).json({
        message: "error finding school",
        data: school,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error verifying school",
    });
  }
};

export const viewSchoolStatus = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const school = await schoolModel.findById(schoolID);

    return res.status(200).json({
      message: "viewing school record",
      data: school,
      status: 200,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error verifying school",
    });
  }
};

export const viewSchoolStatusByName = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolName } = req.params;

    const school = await schoolModel.findOne({ schoolName });

    return res.status(200).json({
      message: "viewing school record by her name",
      data: school,
      status: 200,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error verifying school",
    });
  }
};

export const logoutSchool = async (
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
      message: "Error verifying school",
    });
  }
};

export const readSchoolCookie = async (
  req: any,
  res: Response
): Promise<Response> => {
  try {
    const readSchool = req.session.isSchoolID;

    return res.status(200).json({
      message: "GoodBye",
      data: readSchool,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error verifying school",
    });
  }
};

export const viewAllSchools = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const school = await schoolModel.find();

    return res.status(200).json({
      total: `Number of Schools: ${school.length} on our platform`,
      length: school.length,
      message: "viewing all school",
      data: school,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error verifying school",
    });
  }
};

export const deleteSchool = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    let id = "678d4e5060a0cbcd2e27dc51";
    const getSchool: any = await schoolModel.findById(schoolID);
    if (!getSchool) {
      return res.status(404).json({ message: "School not found" });
    }

    const summary: any = { deleted: {}, errors: [] };

    // Helper to safely delete cloud assets by public_id
    const tryDestroy = async (publicId?: string) => {
      if (!publicId) return;
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        // don't fail entire operation on cloud delete errors
        summary.errors.push({
          publicId,
          error: (err as any)?.message || String(err),
        });
      }
    };

    // Delete sessions and their terms
    try {
      const sessionIds = (getSchool.session || []).map((s: any) =>
        s.toString()
      );
      for (const sid of sessionIds) {
        const sess: any = await sessionModel.findById(sid).lean();
        if (sess?.term && sess.term.length) {
          await termModel.deleteMany({ _id: { $in: sess.term } });
          summary.deleted.terms =
            (summary.deleted.terms || 0) + sess.term.length;
        }
      }
      await sessionModel.deleteMany({ _id: { $in: sessionIds } });
      summary.deleted.sessions = sessionIds.length;
    } catch (err: any) {
      summary.errors.push({ area: "sessions", error: err.message });
    }

    // Models that store a reference to the school via `school` or `schoolInfo` field
    const schoolLinkedModels: any[] = [
      announcementModel,
      articleModel,
      assignmentModel,
      assignmentResolvedModel,
      attendanceModel,
      examinationModel,
      ExpenditureModel,
      expenseModel,
      gallaryModel,
      historyModel,
      lessonNoteModel,
      midTestModel,
      pastQuestionModel,
      paymentHistory,
      paymentModel,
      performanceModel,
      quizModel,
      recordPaymentModel,
      reportCardModel,
      scheduleModel,
      schemeOfWorkModel,
      schoolFeeHistory,
      sessionHistoryModel,
      storeModel,
      studentHistoricalResultModel,
      studentRemark,
      teachSubjectModel,
      teachSubjectTopics,
      teachTopicQuizesModel,
      timetableModel,
    ];

    for (const m of schoolLinkedModels) {
      try {
        const del = await (m as any).deleteMany({ school: getSchool._id });
        summary.deleted[m.modelName || m.collection?.name || m.name] =
          del?.deletedCount || del?.n || 0;
      } catch (err: any) {
        // some models may use 'schoolInfo' field
        try {
          const del2 = await (m as any).deleteMany({
            schoolInfo: getSchool._id,
          });
          summary.deleted[m.modelName || m.collection?.name || m.name] =
            (summary.deleted[m.modelName || m.collection?.name || m.name] ||
              0) + (del2?.deletedCount || del2?.n || 0);
        } catch (err2: any) {
          summary.errors.push({
            model: m.modelName || m.name,
            error: (err2 as any)?.message || String(err2),
          });
        }
      }
    }

    // Delete docs referenced directly in school arrays (classes, subjects, staff, students, etc.)
    const arrayRefs: { key: string; model: any }[] = [
      { key: "classRooms", model: classroomModel },
      { key: "subjects", model: subjectModel },
      { key: "staff", model: staffModel },
      { key: "students", model: studentModel },
      { key: "reportCard", model: reportCardModel },
      { key: "midReportCard", model: midReportCardModel },
      { key: "outGoneStudents", model: outGoneStudentModel },
      { key: "store", model: storeModel },
      { key: "announcements", model: announcementModel },
      { key: "articles", model: articleModel },
      { key: "gallaries", model: gallaryModel },
    ];

    for (const ref of arrayRefs) {
      try {
        const ids = (getSchool[ref.key] || []).map((x: any) => x.toString());
        if (ids.length) {
          // attempt to delete cloud assets if present (gallary, staff avatars, students avatars, store images, articles)
          if (ref.model === gallaryModel) {
            const items: any[] = await gallaryModel
              .find({ _id: { $in: ids } })
              .lean();
            for (const it of items) {
              await tryDestroy(it?.avatarID || it?.public_id || it?.imageID);
            }
          }

          if (ref.model === staffModel) {
            const items: any[] = await staffModel
              .find({ _id: { $in: ids } })
              .lean();
            for (const it of items) {
              await tryDestroy(
                it?.avatarID || it?.staffAvatarID || it?.signatureID
              );
            }
          }

          if (ref.model === studentModel) {
            const items: any[] = await studentModel
              .find({ _id: { $in: ids } })
              .lean();
            for (const it of items) {
              await tryDestroy(
                it?.avatarID || it?.studentAvatarID || it?.studentAvatarID
              );
            }
          }

          await ref.model.deleteMany({ _id: { $in: ids } });
          summary.deleted[ref.key] = ids.length;
        }
      } catch (err: any) {
        summary.errors.push({
          area: `arrayRef:${ref.key}`,
          error: err.message,
        });
      }
    }

    // Fallback: delete any remaining documents that explicitly reference this school via school field
    try {
      const fallbackModels = [
        classroomModel,
        subjectModel,
        staffModel,
        studentModel,
        reportCardModel,
        midReportCardModel,
        outGoneStudentModel,
        gallaryModel,
        articleModel,
      ];
      for (const m of fallbackModels) {
        const del = await (m as any).deleteMany({ school: getSchool._id });
        summary.deleted[m.modelName || m.name] =
          (summary.deleted[m.modelName || m.name] || 0) +
          (del?.deletedCount || del?.n || 0);
      }
    } catch (err: any) {
      summary.errors.push({
        area: "fallback",
        error: (err as any)?.message || String(err),
      });
    }

    // Finally remove the school document itself
    try {
      await schoolModel.findByIdAndDelete(getSchool._id);
      summary.deleted.school = 1;
    } catch (err: any) {
      summary.errors.push({ area: "schoolDelete", error: err.message });
    }

    return res
      .status(200)
      .json({ message: "school deleted successfully", summary });
  } catch (error) {
    return res.status(404).json({
      message: "Error verifying school",
    });
  }
};

export const exportSchoolData = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const school = await schoolModel.findById(schoolID).lean();

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    const [
      classRooms,
      staff,
      subjects,
      students,
      sessions,
      reportCards,
      midReportCards,
      outGoneStudents,
    ] = await Promise.all([
      classroomModel.find({ _id: { $in: school.classRooms || [] } }).lean(),
      staffModel.find({ _id: { $in: school.staff || [] } }).lean(),
      subjectModel.find({ _id: { $in: school.subjects || [] } }).lean(),
      studentModel.find({ _id: { $in: school.students || [] } }).lean(),
      sessionModel.find({ _id: { $in: school.session || [] } }).lean(),
      cardReportModel
        .find({ _id: { $in: school.reportCard || [] } })
        .lean()
        .catch(() => []),
      midReportCardModel
        .find({ _id: { $in: school.midReportCard || [] } })
        .lean()
        .catch(() => []),
      outGoneStudentModel
        .find({ _id: { $in: school.outGoneStudents || [] } })
        .lean()
        .catch(() => []),
    ]);

    const exportPkg = {
      school,
      classRooms,
      staff,
      subjects,
      students,
      sessions,
      reportCards,
      midReportCards,
      outGoneStudents,
    };

    return res.status(200).json({ message: "export ready", data: exportPkg });
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: "Error exporting school data", error: error.message });
  }
};

export const exportSchoolDataFile = async (
  req: any,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    // Admin-only: simple guard - user must be logged in and match school admin session or school.status
    const sessionSchoolID = req.session?.isSchoolID;
    // if (
    //   !sessionSchoolID ||
    //   sessionSchoolID.toString() !== schoolID.toString()
    // ) {
    //   return res
    //     .status(403)
    //     .json({ message: "Forbidden, admin access required" });
    // }

    const school = await schoolModel.findById(schoolID).lean();
    if (!school) return res.status(404).json({ message: "School not found" });

    const [
      classRooms,
      staff,
      subjects,
      students,
      sessions,
      reportCards,
      midReportCards,
      outGoneStudents,
    ] = await Promise.all([
      classroomModel.find({ _id: { $in: school.classRooms || [] } }).lean(),
      staffModel.find({ _id: { $in: school.staff || [] } }).lean(),
      subjectModel.find({ _id: { $in: school.subjects || [] } }).lean(),
      studentModel.find({ _id: { $in: school.students || [] } }).lean(),
      sessionModel.find({ _id: { $in: school.session || [] } }).lean(),
      cardReportModel
        .find({ _id: { $in: school.reportCard || [] } })
        .lean()
        .catch(() => []),
      midReportCardModel
        .find({ _id: { $in: school.midReportCard || [] } })
        .lean()
        .catch(() => []),
      outGoneStudentModel
        .find({ _id: { $in: school.outGoneStudents || [] } })
        .lean()
        .catch(() => []),
    ]);

    const exportPkg = {
      school,
      classRooms,
      staff,
      subjects,
      students,
      sessions,
      reportCards,
      midReportCards,
      outGoneStudents,
    };

    // Stream a zip containing the export JSON
    const baseName = (school.schoolName || "school").replace(
      /[^a-z0-9_-]/gi,
      "_"
    );
    const zipName = `${baseName}-export-${Date.now()}.zip`;

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${zipName}"`);

    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.on("error", (err: any) => {
      console.error("Archive error", err);
      try {
        res.status(500).end();
      } catch (e) {}
    });

    // Pipe archive data to the response
    archive.pipe(res as any);

    // Append export JSON as a file inside the zip
    archive.append(JSON.stringify(exportPkg, null, 2), {
      name: `${baseName}-export.json`,
    });

    // finalize the archive (this will end the response when done)
    await archive.finalize();
    // response is streamed; return a 200 OK handled by the stream
    return res as any;
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: "Error exporting school data", error: error.message });
  }
};

export const importSchoolData = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body?.data || req.body;
    if (!payload || !payload.school) {
      return res.status(400).json({ message: "Invalid import payload" });
    }

    const exported = payload;

    // Prepare school data (avoid unique conflicts on email)
    const schoolData = { ...exported.school } as any;
    delete schoolData._id;
    // ensure unique email to avoid duplicate key
    if (schoolData.email) {
      schoolData.email = `${schoolData.email}.import.${Date.now()}`;
    }

    // Create school record first
    const newSchool: any = await schoolModel.create(schoolData);

    // helper collections and mapping
    const collections: Array<{
      items: any[];
      model: any;
      key: string;
    }> = [
      {
        items: exported.classRooms || [],
        model: classroomModel,
        key: "classRooms",
      },
      { items: exported.subjects || [], model: subjectModel, key: "subjects" },
      { items: exported.staff || [], model: staffModel, key: "staff" },
      { items: exported.students || [], model: studentModel, key: "students" },
      { items: exported.sessions || [], model: sessionModel, key: "session" },
      {
        items: exported.reportCards || [],
        model: cardReportModel,
        key: "reportCard",
      },
      {
        items: exported.midReportCards || [],
        model: midReportCardModel,
        key: "midReportCard",
      },
      {
        items: exported.outGoneStudents || [],
        model: outGoneStudentModel,
        key: "outGoneStudents",
      },
    ];

    const idMap: Record<string, any> = {};

    // First pass: create documents without reference arrays
    for (const col of collections) {
      for (const item of col.items) {
        const oldId = item._id?.toString();
        const doc = { ...item };
        delete doc._id;
        // replace school references with new school id
        if (doc.school || doc.schoolInfo) {
          doc.school = newSchool._id;
          doc.schoolInfo = newSchool._id;
        }

        // Remove array refs - to be set in second pass
        for (const k of Object.keys(doc)) {
          if (Array.isArray(doc[k])) {
            // keep simple scalar arrays if they are primitives, else set to [] now
            if (doc[k].length > 0 && typeof doc[k][0] === "object") {
              doc[k] = [];
            }
          }
        }

        const created = await col.model.create(doc);
        if (oldId) idMap[oldId] = created._id;
        // store mapping for school arrays
        newSchool[col.key] = newSchool[col.key] || [];
        newSchool[col.key].push(created._id);
      }
    }

    await newSchool.save();

    // Second pass: update created docs with remapped references
    for (const col of collections) {
      for (const item of col.items) {
        const oldId = item._id?.toString();
        const newId = idMap[oldId];
        if (!newId) continue;

        const updates: any = {};

        for (const k of Object.keys(item)) {
          const val = item[k];
          if (Array.isArray(val) && val.length > 0) {
            const mapped = val.map((v: any) => {
              if (!v) return v;
              const s = v.toString ? v.toString() : v;
              return idMap[s] || v;
            });
            updates[k] = mapped;
          } else if (val && typeof val === "string" && idMap[val]) {
            updates[k] = idMap[val];
          }
        }

        if (Object.keys(updates).length) {
          await col.model.findByIdAndUpdate(newId, updates, { new: true });
        }
      }
    }

    // finally, save the updated school arrays
    await schoolModel.findByIdAndUpdate(newSchool._id, newSchool, {
      new: true,
    });

    return res
      .status(201)
      .json({ message: "Import completed", schoolID: newSchool._id });
  } catch (error: any) {
    console.error("Import error", error);
    return res
      .status(500)
      .json({ message: "Error importing school data", error: error.message });
  }
};

export const changeSchoolName = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { schoolName } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school) {
      const verified = await schoolModel.findByIdAndUpdate(
        schoolID,
        { schoolName },
        { new: true }
      );

      return res.status(201).json({
        message: "school verified successfully",
        data: verified,
      });
    } else {
      return res.status(404).json({
        message: "error finding school",
        data: school,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error verifying school",
    });
  }
};

export const changeSchoolAddress = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { address } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school) {
      const verified = await schoolModel.findByIdAndUpdate(
        schoolID,
        { address },
        { new: true }
      );

      return res.status(201).json({
        message: "school verified successfully",
        data: verified,
      });
    } else {
      return res.status(404).json({
        message: "error finding school",
        data: school,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error verifying school",
    });
  }
};

export const changeSchoolPhoneNumber = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { phone } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school) {
      const verified = await schoolModel.findByIdAndUpdate(
        schoolID,
        { phone },
        { new: true }
      );

      return res.status(201).json({
        message: "school phone number changes successfully",
        data: verified,
      });
    } else {
      return res.status(404).json({
        message: "error finding school",
        data: school,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error verifying school",
    });
  }
};

export const changeSchoolPersonalName = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { name, name2 } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school) {
      const verified: any = await schoolModel.findByIdAndUpdate(
        schoolID,

        { name, name2 },

        { new: true }
      );

      return res.status(201).json({
        message: "school name changes successfully",
        data: verified,
      });
    } else {
      return res.status(404).json({
        message: "error finding school",
        data: school,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error verifying school",
    });
  }
};

// school Image/Logo

export const updateSchoolAvatar = async (req: any, res: Response) => {
  try {
    const { schoolID } = req.params;

    const school = await schoolModel.findById(schoolID);

    if (school) {
      const { secure_url, public_id }: any = await streamUpload(req);

      const updatedSchool = await schoolModel.findByIdAndUpdate(
        schoolID,
        {
          avatar: secure_url,
          avatarID: public_id,
        },
        { new: true }
      );

      return res.status(200).json({
        message: "school avatar has been, added",
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

export const updateSchoolStamp = async (req: any, res: Response) => {
  try {
    const { schoolID } = req.params;

    const school = await schoolModel.findById(schoolID);

    if (school) {
      const { secure_url, public_id }: any = await streamUpload(req);

      const updatedSchool = await schoolModel.findByIdAndUpdate(
        schoolID,
        {
          stamp: secure_url,
          stampID: public_id,
        },
        { new: true }
      );

      return res.status(200).json({
        message: "school stamp has been, added",
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
// school shool has started

export const updateSchoolSignature = async (req: any, res: Response) => {
  try {
    const { schoolID } = req.params;

    const school = await schoolModel.findById(schoolID);

    if (school) {
      const { secure_url, public_id }: any = await streamUpload(req);

      const updatedSchool = await schoolModel.findByIdAndUpdate(
        schoolID,
        {
          signature: secure_url,
          signatureID: public_id,
        },
        { new: true }
      );

      return res.status(200).json({
        message: "school signature has been, added",
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
// school shool has started

export const updateSchoolStartPossition = async (req: any, res: Response) => {
  try {
    const { schoolID } = req.params;

    const school: any = await schoolModel.findById(schoolID);

    if (school.schoolName) {
      const updatedSchool = await schoolModel.findByIdAndUpdate(
        schoolID,
        {
          started: true,
        },
        { new: true }
      );

      return res.status(200).json({
        message: "school has started, operation",
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
// school school Account info

export const updateSchoolAccountDetail = async (req: any, res: Response) => {
  try {
    const { schoolID } = req.params;
    const { bankDetails } = req.body;

    const school: any = await schoolModel.findById(schoolID);

    if (school.schoolName) {
      const updatedSchool = await schoolModel.findByIdAndUpdate(
        schoolID,
        {
          bankDetails,
        },
        { new: true }
      );

      return res.status(200).json({
        message: "school account detail updated successfully",
        data: updatedSchool,
      });
    } else {
      return res.status(404).json({
        message: "Something went wrong",
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error updating account details",
    });
  }
};
// school school Team/Resumption info

export const updateSchoolTeamData = async (req: any, res: Response) => {
  try {
    const { schoolID } = req.params;
    const { SchoolTeamResumption, SchoolTeamCloses, NumberOfDays } = req.body;
 

    const school: any = await schoolModel.findById(schoolID);

    if (school.schoolName) {
      const updatedSchool = await schoolModel.findByIdAndUpdate(
        schoolID,
        {
          SchoolTeamResumption,
          SchoolTeamCloses,
          NumberOfDays,
        },
        { new: true }
      );


      return res.status(200).json({
        message: "school account detail updated successfully",
        data: updatedSchool,
      });
    } else {
      return res.status(404).json({
        message: "Something went wrong",
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error updating account details",
    });
  }
};

export const updateSchoolPaymentOptions = async (req: any, res: Response) => {
  try {
    const { schoolID } = req.params;
    const { paymentDetails, paymentAmount } = req.body;

    let id = crypto.randomBytes(4).toString("hex");
    const school: any = await schoolModel.findById(schoolID);

    if (school.schoolName) {
      const updatedSchool = await schoolModel.findByIdAndUpdate(
        schoolID,
        {
          paymentOptions: [
            ...school?.paymentOptions,
            { id, paymentDetails, paymentAmount },
          ],
        },
        { new: true }
      );

      return res.status(201).json({
        message: "school account detail updated successfully",
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
      message: "Error updating account details",
    });
  }
};

export const RemoveSchoolPaymentOptions = async (req: any, res: Response) => {
  try {
    const { schoolID, refID } = req.params;
    const { paymentDetails, paymentAmount } = req.body;

    let id = crypto.randomBytes(4).toString("hex");
    const school: any = await schoolModel.findById(schoolID);

    const mainOption = school?.paymentOptions.filter((el: any) => {
      return el?.id !== refID;
    });

    if (school.schoolName) {
      const updatedSchool = await schoolModel.findByIdAndUpdate(
        schoolID,
        {
          paymentOptions: mainOption,
        },
        { new: true }
      );

      return res.status(201).json({
        message: "school account detail updated successfully",
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
      message: "Error updating account details",
    });
  }
};

export const updateAdminCode = async (req: any, res: Response) => {
  try {
    const { schoolID } = req.params;
    const { adminCode } = req.body;

    const school: any = await schoolModel.findById(schoolID);
    // const adminCode = crypto.randomBytes(6).toString("hex");

    if (school.schoolName) {
      const updatedSchoolAdminCode = await schoolModel.findByIdAndUpdate(
        schoolID,
        {
          adminCode,
        },
        { new: true }
      );

      return res.status(200).json({
        message: "school admin code has been updated successfully",
        data: updatedSchoolAdminCode,
      });
    } else {
      return res.status(404).json({
        message: "Something went wrong",
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error updating admin code details",
    });
  }
};

export const changeSchoolEnrollmentID = async (req: any, res: Response) => {
  try {
    const { schoolID } = req.params;
    const { currentEnrollmentID, newEnrollmentID } = req.body;

    if (!currentEnrollmentID || !newEnrollmentID) {
      return res.status(400).json({
        message: "Please provide both present and new Enrollment ID",
        status: 400,
      });
    }

    const school: any = await schoolModel.findById(schoolID);

    if (!school) {
      return res.status(404).json({
        message: "School not found",
        status: 404,
      });
    }

    if (school.enrollmentID !== currentEnrollmentID) {
      return res.status(400).json({
        message: "Present Enrollment ID is incorrect",
        status: 400,
      });
    }

    const updatedSchool = await schoolModel.findByIdAndUpdate(
      schoolID,
      {
        enrollmentID: newEnrollmentID,
      },
      { new: true }
    );

    return res.status(201).json({
      message: "Enrollment ID updated successfully",
      data: updatedSchool,
      status: 201,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error updating enrollment ID",
      error: error?.message,
      status: 500,
    });
  }
};


export const updateSchoolName = async (req: any, res: Response) => {
  try {
    const { schoolID } = req.params;
    const { schoolName } = req.body;

    const school: any = await schoolModel.findById(schoolID);

    if (school.schoolName) {
      const updatedSchool = await schoolModel.findByIdAndUpdate(
        schoolID,
        {
          schoolName,
        },
        { new: true }
      );

      return res.status(200).json({
        message: "school name has been updated successfully",
        data: updatedSchool,
      });
    } else {
      return res.status(404).json({
        message: "Something went wrong",
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error updating account details",
    });
  }
};

export const updateRegisterationStatus = async (req: any, res: Response) => {
  try {
    const {
      schoolName,
      email,
      schoolPhoneNumber,
      schoolCategory,
      schoolLocation,
      schoolOrganization,
    } = req.body;

    const school = await schoolModel.findOne({ email });
    // const id = crypto.randomBytes(4).toString("hex");
    // const adminCode = crypto.randomBytes(6).toString("hex");
    // if (school) {
    const updatedSchool = await schoolModel.findByIdAndUpdate(
      school?._id,
      {
        // adminCode,
        // enrollmentID: id,
        status: "school-admin",
        schoolName,
        email,
        phone: schoolPhoneNumber,
        categoryType: schoolCategory,
        address: schoolLocation,
        organizationType: schoolOrganization,
      },
      { new: true }
    );

    return res.status(201).json({
      message: "school detail has been updated successfully",
      data: updatedSchool,
      status: 201,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error updating account details",
      error: error,
    });
  }
};

// export const approvedRegisteration = async (req: any, res: Response) => {
//   try {
//     const { email } = req.body;

//     const school: any = await schoolModel.findOne({ email });
//     if (school) {
//       const updatedSchool = await schoolModel.findByIdAndUpdate(
//         school?._id,
//         {
//           started: true,
//         },
//         { new: true }
//       );
//       verifiedEmail(school);

//       return res.status(200).json({
//         message: "school Has Approved",
//         data: updatedSchool,
//         status: 201,
//       });
//     } else {
//       return res.status(404).json({
//         message: "Something went wrong",
//       });
//     }
//   } catch (error) {
//     return res.status(404).json({
//       message: "Error updating account details",
//     });
//   }
// };

export const getSchoolRegistered = async (req: Request, res: Response) => {
  try {
    const school: any = await schoolModel.find();

    return res.status(200).json({
      message: "school Has Approved",
      data: school,
      status: 201,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error updating account details",
    });
  }
};

export const approveRegistration = async (req: Request, res: Response) => {
  try {
    const { schoolID } = req.params;
    const { email } = req.body;

    const school: any = await schoolModel.findById(schoolID);

    if (school) {
      const updatedSchool = await schoolModel.findByIdAndUpdate(
        school._id,
        {
          started: true,
          verify: true,
        },
        { new: true }
      );

      await verifiedEmail(school);

      return res.status(200).json({
        message: "School has been approved",
        data: updatedSchool,
        status: 200,
      });
    } else {
      return res.status(404).json({
        message: "School not found",

        status: 404,
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error approving registration",
      error: error.message,
    });
  }
};

export const changeSchoolTag = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { schoolTags } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school) {
      const verified = await schoolModel.findByIdAndUpdate(
        schoolID,
        { schoolTags },
        { new: true }
      );

      return res.status(201).json({
        message: "school verified successfully",
        data: verified,
      });
    } else {
      return res.status(404).json({
        message: "error finding school",
        data: school,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error verifying school",
    });
  }
};

export const createSchoolTimetableRecord = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { startBreak, startClass, endClass, endBreak, peroid } = req.body;

    const school = await schoolModel.findById(schoolID);

    const timeStructure = (
      startTime: string,
      endTime: string,
      interval: number
    ): Array<string> => {
      const timeSlots = [];
      let [startHour, startMinute] = startTime.split(":").map(Number);
      let [endHour, endMinute] = endTime.split(":").map(Number);

      // Convert everything to minutes
      let currentMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;

      while (currentMinutes < endMinutes) {
        // Calculate start time
        let startHours = Math.floor(currentMinutes / 60);
        let startMinutes = currentMinutes % 60;

        // Increment current time by interval (40 minutes)
        currentMinutes += interval;

        // Calculate end time
        let endHours = Math.floor(currentMinutes / 60);
        let endMinutes = currentMinutes % 60;

        // Convert to 12-hour format with AM/PM for both start and end
        const startPeriod = startHours >= 12 ? "PM" : "AM";
        startHours = startHours % 12 || 12; // Handle 12-hour format

        const endPeriod = endHours >= 12 ? "PM" : "AM";
        endHours = endHours % 12 || 12;

        // Format the times and push to the result
        const startFormatted = `${startHours
          .toString()
          .padStart(2, "0")}:${startMinutes
          .toString()
          .padStart(2, "0")}${startPeriod}`;
        const endFormatted = `${endHours
          .toString()
          .padStart(2, "0")}:${endMinutes
          .toString()
          .padStart(2, "0")}${endPeriod}`;

        timeSlots.push(`${startFormatted} - ${endFormatted}`);
      }

      return timeSlots;
    };

    const startPeriod = parseInt(startBreak) >= 12 ? "PM" : "AM";
    const endPeriod = parseInt(endBreak) >= 12 ? "PM" : "AM";

    if (school) {
      const classStructure = await schoolModel.findByIdAndUpdate(
        schoolID,
        {
          startBreak,
          startClass,
          endClass,
          endBreak,
          peroid,
          timeTableStructure: timeStructure(
            startClass,
            startBreak,
            parseInt(peroid!)
          ).concat(
            `${startBreak}${startPeriod} - ${endBreak}${endPeriod}`,
            timeStructure(endBreak, endClass, parseInt(peroid!))
          ),
        },
        { new: true }
      );

      return res.status(201).json({
        message: "school time-table structure created successfully",
        data: classStructure,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "error finding school",
        data: school,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school timetable",
    });
  }
};
export const updateSchoolSMS = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { sendSMS } = req.body;

    const school = await schoolModel.findByIdAndUpdate(
      schoolID,
      { sendSMS },
      { new: true }
    );

    return res.status(201).json({
      message: "School SMS Notification status updated",
      data: school,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error updating school SMS Notification status",
      data: error.message,
    });
  }
};

export const updateClassTeacherGrading = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { allowClassTeacherGrading } = req.body;

    const school = await schoolModel.findByIdAndUpdate(
      schoolID,
      { allowClassTeacherGrading },
      { new: true }
    );

    return res.status(201).json({
      message: "School Class Teacher Grading status updated",
      data: school,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: "Error updating school Class Teacher Grading status",
      data: error.message,
    });
  }
};
