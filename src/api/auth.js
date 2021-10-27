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
      res.cookie("userId", req.user.id, {
        expires: new Date(Date.now() + 8 * 3600000), // 8 hours
        httpOnly: false,
        // domain: ".localhost:3000",
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
  passport.authenticate("google"),
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
