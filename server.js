const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
require("./src/passport/passport");
const passport = require("passport");

const PORT = process.env.PORT || 8080;

const app = express();

app.enable("trust proxy");
app.use(cookieParser());
dotenv.config();

app.use(
  cookieSession({
    name: "session-name",
    keys: ["key1", "key2"],
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.send("<h1>HOME</h1>");
});

app.get("/failed", (req, res) => {
  res.send("<h1>Log in Failed.</h1>");
});

const checkUserLoggedIn = (req, res, next) => {
  req.user ? next() : res.status(401).send({ Error: "User is invalid" });
};

app.get("/profile", checkUserLoggedIn, (req, res) => {
  console.log(req.user);
  res.send(`<h1>${req.user.displayName}'s Profile Page</h1>`);
});

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/failed",
  }),
  (req, res) => {
    res.redirect("/profile");
  }
);

app.get("/logout", (req, res) => {
  req.session = null;
  req.logout();
  res.redirect("/");
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).send({
    Error: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
