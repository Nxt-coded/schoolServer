import { Router } from "express";
import {
  createDailyExpenses,
  createExpenditure,
  readTermBudget,
  readTermDailyExpenses,
  readTermExpenditure,
  setTermlyBudget,
} from "../controller/expenditureController";

const router: Router = Router();

router.route("/create-expense/:schoolID").post(createExpenditure);

router.route("/set-budget/:schoolID").patch(setTermlyBudget);

router.route("/read-expense/:schoolID").get(readTermExpenditure);
router.route("/read-term-budget/:schoolID").get(readTermBudget);

// daily expenses
router.route("/read-term-daily-expense/:schoolID").get(readTermDailyExpenses);
router.route("/create-term-daily-expense/:schoolID").post(createDailyExpenses);

export default router;
