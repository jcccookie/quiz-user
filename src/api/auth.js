const { Router } = require("express");
const dotenv = require("dotenv");
const passport = require("passport");

const router = new Router();
dotenv.config();

router.get(
  "/",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_LOCAL_HOST}/login/error`,
    successRedirect: `${process.env.CLIENT_LOCAL_HOST}/dashboard`,
  }),
  (req, res) => {
    console.log("server: login success");
  }
);

module.exports = router;
