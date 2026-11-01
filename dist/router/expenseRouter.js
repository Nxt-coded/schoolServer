"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const expenditureController_1 = require("../controller/expenditureController");
const router = (0, express_1.Router)();
router.route("/create-expense/:schoolID").post(expenditureController_1.createExpenditure);
router.route("/set-budget/:schoolID").patch(expenditureController_1.setTermlyBudget);
router.route("/read-expense/:schoolID").get(expenditureController_1.readTermExpenditure);
router.route("/read-term-budget/:schoolID").get(expenditureController_1.readTermBudget);
// daily expenses
router.route("/read-term-daily-expense/:schoolID").get(expenditureController_1.readTermDailyExpenses);
router.route("/create-term-daily-expense/:schoolID").post(expenditureController_1.createDailyExpenses);
exports.default = router;
