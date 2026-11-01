"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const schoolModel_1 = __importDefault(require("../../model/schoolModel"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const GOOGLE_CLIENT_ID = "938639497902-18ng02iae50d323nd5i0gilva0bl4lqk.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";
// const GOOGLE_CLIENT_ID =
//   "76597312158-2o058qto2hgrmbe4ks4a8lbho51i1bd0.apps.googleusercontent.com";
// const GOOGLE_CLIENT_SECRET = "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";
// ${process.env.APP_URL_DEPLOY}
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    // callbackURL:
    //   "https://startschoolbe.onrender.com/api/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
    const user = await schoolModel_1.default.findOne({
        email: profile?.emails[0].value,
    });
    if (user) {
        return done(null, user);
    }
    else {
        await schoolModel_1.default.create({
            email: profile?.emails[0].value,
            verify: true,
        });
        return done(null, user);
    }
}));
passport_1.default.serializeUser(function (user, done) {
    done(null, user._id);
});
passport_1.default.deserializeUser(function (user, done) {
    done(null, user._id);
});
