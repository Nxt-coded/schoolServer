"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.comment = void 0;
const comment = async (x) => {
    if (x >= 0 && x <= 5) {
        return "This is a very poor result.";
    }
    else if (x >= 6 && x <= 10) {
        return "This result is poor; it's not satisfactory.";
    }
    else if (x >= 11 && x <= 15) {
        return "Below average; needs significant improvement.";
    }
    else if (x >= 16 && x <= 20) {
        return "Below average; more effort required.";
    }
    else if (x >= 21 && x <= 25) {
        return "Fair but not satisfactory; strive harder.";
    }
    else if (x >= 26 && x <= 30) {
        return "Fair performance; potential for improvement.";
    }
    else if (x >= 31 && x <= 35) {
        return "Average; a steady effort is needed.";
    }
    else if (x >= 36 && x <= 40) {
        return "Average; showing gradual improvement.";
    }
    else if (x >= 41 && x <= 45) {
        return "Slightly above average; keep it up.";
    }
    else if (x >= 46 && x <= 50) {
        return "Decent work; shows potential.";
    }
    else if (x >= 51 && x <= 55) {
        return "Passable; satisfactory effort.";
    }
    else if (x >= 56 && x <= 60) {
        return "Satisfactory; good progress.";
    }
    else if (x >= 61 && x <= 65) {
        return "Good work; keep striving for excellence.";
    }
    else if (x >= 66 && x <= 70) {
        return "Commendable effort; very good.";
    }
    else if (x >= 71 && x <= 75) {
        return "Very good; consistent effort is visible.";
    }
    else if (x >= 76 && x <= 80) {
        return "Excellent performance; well done!";
    }
    else if (x >= 81 && x <= 85) {
        return "Outstanding achievement; impressive work!";
    }
    else if (x >= 86 && x <= 90) {
        return "Outstanding achievement; impressive work!";
    }
    else if (x >= 91 && x <= 95) {
        return "Brilliant performance; you’re a star!";
    }
    else if (x >= 96 && x <= 100) {
        return "Outstanding achievement; impressive work!";
    }
};
exports.comment = comment;
