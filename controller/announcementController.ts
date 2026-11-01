import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import announcementModel from "../model/announcementModel";
import { Types } from "mongoose";
import eventModel from "../model/eventModel";
import paymentReceiptModel from "../model/paymentHistory";
import moment from "moment";

export const createSchoolAnnouncement = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { title, details, date } = req.body;

    const school = await schoolModel.findById(schoolID).populate({
      path: "announcements",
    });

    if (school && school.schoolName && school.status === "school-admin") {
      const classes = await announcementModel.create({
        title,
        details,
        date,
        status: "announcement",
      });

      school?.announcements.push(new Types.ObjectId(classes._id));
      school.save();

      return res.status(201).json({
        message: "announcement created successfully",
        data: classes,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "school not found",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school session",
      status: 404,
    });
  }
};

export const readSchoolAnnouncement = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const announcement = await schoolModel.findById(schoolID).populate({
      path: "announcements",
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });

    return res.status(201).json({
      message: "announcement read successfully",
      data: announcement,
      status: 201,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school announcement",
      status: 404,
    });
  }
};

export const createSchoolEvent = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { title, details, date } = req.body;

    const school = await schoolModel.findById(schoolID).populate({
      path: "events",
    });

    if (school && school.schoolName && school.status === "school-admin") {
      const event = await eventModel.create({
        title,
        details,
        date,
        status: "event",
      });

      school?.events.push(new Types.ObjectId(event._id));
      school.save();

      return res.status(201).json({
        message: "event created successfully",
        data: event,
        status: 201,
      });
    } else {
      return res.status(404).json({
        message: "school not found",
        status: 404,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school session",
      status: 404,
    });
  }
};

export const readSchoolEvent = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const announcement = await schoolModel.findById(schoolID).populate({
      path: "events",
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });

    return res.status(201).json({
      message: "events read successfully",
      data: announcement,
      status: 201,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school announcement",
      status: 404,
    });
  }
};

export const createSchoolPaynemtReceipt = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { costPaid, paymentRef } = req.body;

    const school = await schoolModel.findById(schoolID);
    const confirm = school?.receipt?.some((el: any) => {
      return el.paymentRef === paymentRef;
    });

    let arr: number[] = [];

    if (school && school.schoolName && school.status === "school-admin") {
      if (confirm) {
        const confirmData = school?.receipt?.find(
          (el: any) => el.paymentRef === paymentRef
        );

        return res.status(404).json({
          message: "payment ref already used before",
          data: confirmData,
          status: 404,
        });
      } else {
        await schoolModel.findByIdAndUpdate(
          school._id,
          {
            receipt: [
              ...school?.receipt,
              { costPaid, paymentRef, date: moment(Date.now()).format("lll") },
            ],
          },
          { new: true }
        );

        return res.status(201).json({
          message: "paid created successfully",
          data: school.receipt,
          status: 201,
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
      status: 404,
      data: error.message,
    });
  }
};

export const readSchoolPaynemtReceipt = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const announcement = await schoolModel.findById(schoolID).populate({
      path: "events",
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });

    return res.status(201).json({
      message: "events read successfully",
      data: announcement,
      status: 201,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Error creating school announcement",
      status: 404,
    });
  }
};
