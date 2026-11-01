import { Application, NextFunction, Request, Response } from "express";
import school from "./router/schoolRouter";
import session from "./router/sessionRouter";
import staff from "./router/staffRouter";
import payment from "./router/paymentRouter";
import classes from "./router/classRouter";
import subject from "./router/subjectRouter";
import event from "./router/anouncementRouter";
import performance from "./router/performanceRouter";
import article from "./router/articleRouter";

import student from "./router/studentRouter";
import timetable from "./router/timeTableRouter";
import attendance from "./router/attendanceRouter";
import quiz from "./router/quizRouter";
import lessonNote from "./router/lessonNoteRouter";
import assignment from "./router/assignmentResolveRouter";
import remark from "./router/remarkRouter";
import store from "./router/storeRouter";
import gallary from "./router/gallaryRouter";
import complain from "./router/complainRouter";
import reportCard from "./router/reportCardRouter";
import pastQuestion from "./router/pastQuestionRouter";
import expense from "./router/expenseRouter";
import recordPay from "./router/recordPaymentRouter";
import social from "./router/passportRoute";
import scheme from "./router/schemeOfWorkRouter";
import exam from "./router/exanimationRouter";
import midTest from "./router/midTestRouter";
import outgone from "./router/outGoneStudentRouter";
import resultHistory from "./router/resultHistoryRouter";
import course from "./router/courseRouter";
import teachSubject from "./router/teachSubjectRouter";
import teachSubjectTopic from "./router/teachSubjectTopicRouter";
import docxRepair from "./router/docxRepairRouter";
import teachSubjectQuiz from "./router/teachTopicQuiz";

import { HTTP } from "./utils/enums";
import { mainError } from "./error/mianError";
import { handleError } from "./error/handleError";

export const mainApp = (app: Application) => {
  try {
    app.use("/api", docxRepair); // Register the docx repair endpoint
    app.use("/api", teachSubjectQuiz);
    app.use("/api", teachSubjectTopic);
    app.use("/api", teachSubject);
    app.use("/api", payment); // Moved up
    app.use("/api", school);
    app.use("/api", exam);
    app.use("/api", scheme);
    app.use("/api", session);
    app.use("/api", staff);
    app.use("/api", classes);
    app.use("/api", subject);
    app.use("/api", outgone);

    app.use("/api", course);
    app.use("/api", event);

    app.use("/api", midTest);
    app.use("/api", attendance);
    app.use("/api", quiz);
    app.use("/api", lessonNote);
    app.use("/api", performance);
    app.use("/api", remark);
    app.use("/api", store);
    app.use("/api", article);
    app.use("/api", reportCard);
    app.use("/api", pastQuestion);

    app.use("/api", expense);
    app.use("/api", recordPay);
    app.use("/api", social);

    app.use("/api", student);
    app.use("/api", timetable);
    app.use("/api", assignment);
    app.use("/api", gallary);
    app.use("/api", complain);
    app.use("/api", resultHistory);

    app.get("/", (req: Request, res: Response) => {
      try {
        return res.status(200).json({
          message: "School API",
        });
      } catch (error) {
        return res.status(404).json({
          message: "Error loading",
        });
      }
    });

    app.get(
      "/.well-known/pki-validation/34E413B6620F83D024BFEC2183C0C835.txt",
      (req: Request, res: Response) => {
        // return res.status(200).json({ message: "Awesome" });

        return res.sendFile(
          " http://51.21.84.107/.well-known/pki-validation/34E413B6620F83D024BFEC2183C0C835.txt"
        );
      }
    );

    app.all("*", (req: Request, res: Response, next: NextFunction) => {
      next(
        new mainError({
          name: `Route Error`,
          message: `Route Error: because the page, ${req.originalUrl} doesn't exist`,
          status: HTTP.BAD_REQUEST,
          success: false,
        })
      );
    });
    app.use(handleError);
  } catch (error) {
    return error;
  }
};
