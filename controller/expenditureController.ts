import { Request, Response } from "express";
import schoolModel from "../model/schoolModel";
import termModel from "../model/termModel";
import expenseModel from "../model/expenseModel";
import { Types } from "mongoose";
import moment from "moment";
import _ from "lodash";

export const createExpenditure = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { item, description, amount, paymentCategory, paymentMode } =
      req.body;

    const school = await schoolModel.findById(schoolID);
    if (school) {
      const getTerm = await termModel.findById(school.presentTermID);

      if (getTerm) {
        let createExpense = await expenseModel.create({
          item,
          description,
          amount,
          paymentCategory,
          paymentMode,
        });

        getTerm?.expense.push(new Types.ObjectId(createExpense?._id));
        getTerm?.save();

        return res.status(201).json({
          message: "expense added successfully",
          data: createExpense,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "unable to read school term",
        });
      }
    } else {
      return res.status(404).json({
        message: "unable to read school",
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school session",
      data: error.message,
    });
  }
};

export const readTermExpenditure = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const school = await schoolModel.findById(schoolID);
    if (school) {
      const getTerm = await termModel.findById(school.presentTermID).populate({
        path: "expense",
        options: {
          sort: {
            createdAt: -1,
          },
        },
      });

      return res.status(201).json({
        message: "retriving expense successfully",
        data: getTerm,
        status: 200,
      });
    } else {
      return res.status(404).json({
        message: "unable to read school",
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school session",
      data: error.message,
    });
  }
};

export const readTermBudget = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const school = await schoolModel.findById(schoolID);
    if (school) {
      const getTerm = await termModel.findById(school.presentTermID).populate({
        path: "expense",
        options: {
          sort: {
            createdAt: -1,
          },
        },
      });

      return res.status(201).json({
        message: "retriving term budget successfully",
        data: getTerm?.budget,
        status: 200,
      });
    } else {
      return res.status(404).json({
        message: "unable to read school",
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school session",
      data: error.message,
    });
  }
};

export const setTermlyBudget = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { budget } = req.body;

    const school = await schoolModel.findById(schoolID);

    if (school) {
      const getTerm = await termModel.findByIdAndUpdate(
        school.presentTermID,
        {
          budget,
        },
        { new: true }
      );

      return res.status(201).json({
        message: "budget set successfully",
        data: getTerm,
        status: 200,
      });
    } else {
      return res.status(404).json({
        message: "unable to read school",
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school session",
      data: error.message,
    });
  }
};

export const createDailyExpenses = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;
    const { item, description, amount, paymentCategory, paymentMode } =
      req.body;

    const school = await schoolModel.findById(schoolID);
    if (school) {
      const getTerm: any = await termModel.findById(school.presentTermID);

      const getWeekNumber = (date: Date) => {
        const currentDate: any = new Date(date.getTime());

        const startOfYear: any = new Date(currentDate.getFullYear(), 0, 1);

        const diffInMillis = currentDate - startOfYear;

        const diffInDays = Math.floor(diffInMillis / (1000 * 60 * 60 * 24));

        const startDayOfWeek = startOfYear.getDay();

        const adjustedDay = diffInDays + startDayOfWeek;

        return Math.ceil(adjustedDay / 7);
      };

      const today = new Date();

      if (getTerm) {
        let createExpense = await termModel.findByIdAndUpdate(
          getTerm._id,
          {
            expensePayOut: [
              ...getTerm.expensePayOut,
              {
                item,
                description,
                amount,
                paymentCategory,
                paymentMode,
                createdAt: moment(new Date().getTime()).format("LL"),
                month: moment(new Date().getTime()).format("LL").split(" ")[0],
                day: moment(new Date().getTime()).format("dddd"),
                weekValue: getWeekNumber(today),
              },
            ],
          },
          { new: true }
        );

        return res.status(201).json({
          message: "daily expense added successfully",
          data: createExpense,
          status: 201,
        });
      } else {
        return res.status(404).json({
          message: "unable to read school term",
        });
      }
    } else {
      return res.status(404).json({
        message: "unable to read school",
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school session",
      data: error.message,
    });
  }
};

export const readTermDailyExpenses = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { schoolID } = req.params;

    const school = await schoolModel.findById(schoolID);
    if (school) {
      const getTerm: any = await termModel.findById(school.presentTermID);

      let filterByMonth = _.groupBy(getTerm?.expensePayOut, "month");
      let filterByWeek = _.groupBy(getTerm?.expensePayOut, "weekValue");

      return res.status(201).json({
        message: "retriving daily expenses successfully",
        data: {
          allData: getTerm?.expensePayOut,
          week: filterByWeek,
          month: filterByMonth,
        },
        status: 200,
      });
    } else {
      return res.status(404).json({
        message: "unable to read school",
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      message: "Error creating school session",
      data: error.message,
    });
  }
};
