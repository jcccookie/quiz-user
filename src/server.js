const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const passport = require("passport");
const cors = require("cors");

const { ds, getEntityId, getEntityKind } = require("../datastore");
const datastore = ds();

require("./auth/passport");

const PORT = process.env.PORT || 8080;

const app = express();

app.enable("trust proxy");
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
dotenv.config();

const whitelist = [
  "http://localhost:3000",
  "https://quiz-app-467.herokuapp.com",
];
const corsOptions = {
  origin: whitelist,
  credentials: true,
};

app.use(cors(corsOptions));

app.use(
  cookieSession({
    key: "quiz-session",
    keys: ["key1", "key2"],
    maxAge: 3600000,
    httpOnly: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

const authRouter = require("./api/auth");
app.use("/auth/google", authRouter);

app.get("/", (req, res, next) => {
  try {
    res.send("<h1>User Backend Home</h1>");
  } catch (err) {
    next(err);
  }
});

const checkUserLoggedIn = (req, res, next) => {
  req.user ? next() : res.status(401).send({ Error: "User is invalid" });
};

app.get("/profile", checkUserLoggedIn, (req, res, next) => {
  try {
    res.status(200).send(req.user);
  } catch (err) {
    next(err);
  }
});

app.get("/logout", (req, res, next) => {
  try {
    req.session = null;
    req.logout();
    res
      .status(200)
      .cookie("userId", "", { expires: new Date() })
      .cookie("name", "", { expires: new Date() })
      .cookie("email", "", { expires: new Date() })
      .cookie("auth", false, { expires: new Date() })
      .redirect(process.env.CLIENT_HOST);
  } catch (err) {
    next(err);
  }
});

const throwError = ({ code, message }) => {
  const error = new Error(message);
  error.statusCode = code;
  throw error;
};

// check if the session from client is matched with the session in the datastore
app.get("/session", async (req, res, next) => {
  try {
    const { sessionId, email } = req.query;

    if (!sessionId) {
      throwError({ code: 401, message: "session doesn't exist" });
    }

    if (!email) {
      throwError({ code: 401, message: "email doesn't exist" });
    }

    const query = datastore.createQuery("User");
    const userEntities = await datastore.runQuery(query);

    let isUserAuthenticated = false;
    userEntities[0].forEach((user) => {
      if (user["email"] === email && user["session"] === sessionId) {
        isUserAuthenticated = true;
        res.status(200).send("session is valid");
      }
    });

    if (!isUserAuthenticated) {
      throwError({ code: 401, message: "session is not valid" });
    }
  } catch (err) {
    next(err);
  }
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
