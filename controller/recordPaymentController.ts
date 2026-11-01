import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import studentModel from "../model/studentModel";
import recordPaymentModel from "../model/recordPaymentModel";
import { Types } from "mongoose";

export const recordFeesPayment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { studentID } = req.params;
    const { feePaid, feePaidDate, paidByWho, paymentMode } = req.body;

    const school = await schoolModel.findById(schoolID);
    const student = await studentModel.findById(studentID);

    if (school) {
      const getTerm = school?.presentTerm;

      if (getTerm) {
        const getStudentClassFee: any = student?.classTermFee;
        const currentBalance = getStudentClassFee - feePaid;

        const recordSchoolFeesPayment = await recordPaymentModel.create({
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

        school?.recordPayments.push(
          new Types.ObjectId(recordSchoolFeesPayment._id)
        );
        student?.recordPayments.push(
          new Types.ObjectId(recordSchoolFeesPayment._id)
        );

        school?.save();
        student?.save();

        return res.status(201).json({
          message: "Sucessfully Recorded School fees Payment",
          data: recordSchoolFeesPayment,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "Current Term Not Selected",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "No School Found",
        status: 404,
      });
    }
  } catch (error: any) {
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

export const recordSecondFeePayment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { feePaid } = req.body;
    const { recordID } = req.params;

    const record = await recordPaymentModel.findById(recordID);

    if (record) {
      const pushRecord = record?.feePaid?.push(feePaid);
      if (pushRecord) {
        const getRecord = record?.feePaid;
        const totalFees = getRecord?.reduce(
          (accumulator: any, currentVal: any) => {
            return accumulator + currentVal;
          }
        );
        const lastFeePaid = getRecord[getRecord?.length - 1];
        const getClassFees = record?.classFees;

        if (totalFees === getClassFees) {
          const update = await recordPaymentModel.findByIdAndUpdate(
            record._id,
            { feePaymentComplete: true, feeBalance: totalFees },
            { new: true }
          );
          await record.save();

          return res.status(201).json({
            message: "Successfully Recorded New Payment. Payment Now Complete",
            data: {
              main: update,
              total: totalFees,
            },
            status: 201,
          });
        } else {
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
      } else {
        return res.status(404).json({
          message: "No Payment Added",
          status: 404,
        });
      }
    } else {
      return res.status(404).json({
        message: "Error Recording New Payment",
        status: 404,
      });
    }
  } catch (error: any) {
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

export const getAllFeeRecords = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const getAll = await schoolModel.findById(schoolID).populate({
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
  } catch (error: any) {
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

export const getOneFeeRecord = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { studentID } = req.params;

    const getAll = await studentModel.findById(studentID).populate({
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
  } catch (error: any) {
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

export const deleteFeesRecord = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { studentID } = req.params;
    const { recordID } = req.params;

    const school: any = await schoolModel.findById(schoolID);
    const student: any = await studentModel.findById(studentID);

    if (school) {
      const findRecord = await recordPaymentModel.findByIdAndDelete(recordID);

      school?.recordPayments?.pull(new Types.ObjectId(recordID));
      student?.recordPayments?.pull(new Types.ObjectId(recordID));

      await school.save();
      await student.save();

      return res.status(200).json({
        message: "Successfully Deleted Fees Record",
        data: findRecord,
        status: 200,
      });
    } else {
      return res.status(404).json({
        message: "Error Deleting Fees Record",
        status: 404,
      });
    }
  } catch (error: any) {
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
