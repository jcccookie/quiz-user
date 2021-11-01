const { Router } = require("express");
const dotenv = require("dotenv");
const passport = require("passport");

const router = new Router();
dotenv.config();

const setUserIDResponseCookie = (req, res, next) => {
  // if user-id cookie is out of date, update it
  if (req.user?.id !== req.cookies["userId"]) {
    // if user successfully signed in, store user-id in cookie
    if (req.user) {
      res
        .cookie("userId", req.user.id, {
          expires: new Date(Date.now() + 1 * 3600000), // 1 hours
          // domain: ".localhost:3000",
          httpOnly: false,
        })
        .cookie("name", req.user.displayName, {
          expires: new Date(Date.now() + 1 * 3600000), // 1 hours
          // domain: ".localhost:3000",
          httpOnly: false,
        })
        .cookie("email", req.user._json.email, {
          expires: new Date(Date.now() + 1 * 3600000), // 1 hours
          // domain: ".localhost:3000",
          httpOnly: false,
        })
        .cookie("auth", true, {
          expires: new Date(Date.now() + 1 * 3600000), // 1 hours
          // domain: ".localhost:3000",
          httpOnly: false,
        });
    } else {
      res.clearCookie("userId");
    }
  }
  next();
};

router.get(
  "/",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/callback",
  passport.authenticate("google", {
    // failureRedirect: `${process.env.CLIENT_LOCAL_HOST}/login/error}`,
    // successRedirect: `${process.env.CLIENT_LOCAL_HOST}/dashboard`,
  }),
  setUserIDResponseCookie,
  (req, res, next) => {
    if (req.user) {
      res.redirect(`${process.env.CLIENT_LOCAL_HOST}/dashboard`);
    } else {
      res.redirect(`${process.env.CLIENT_LOCAL_HOST}/login/error}`);
    }
    next();
  }
);

module.exports = router;
