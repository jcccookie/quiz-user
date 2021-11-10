require("dotenv").config();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { ds, getEntityId, getEntityKind } = require("../../datastore");

const datastore = ds();

passport.serializeUser((user, cb) => {
  // console.log("serialize", user.accessToken);
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  // console.log("deserialize", user.accessToken);
  cb(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.LOCAL_CALLBACK_URL,
      // callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallBack: true,
    },
    async (accessToken, refreshToken, profile, cb) => {
      // Check user data
      // if user doesn't exist, create user and save data and token to datastore
      const query = datastore.createQuery("User");
      const userEntities = await datastore.runQuery(query);

      let isUserExisted = false;

      userEntities[0].forEach(async (user) => {
        if (user["email"] === profile._json.email) {
          isUserExisted = true;
          const key = datastore.key(["User", parseInt(getEntityId(user))]);
          const data = {
            email: user["email"],
            name: user["name"],
            session: accessToken,
          };

          await datastore.update({ key, data });
        }
      });

      if (!isUserExisted) {
        const key = datastore.key("User");
        const data = {
          name: profile.displayName,
          email: profile._json.email,
          session: accessToken,
        };
        await datastore.save({ key, data });
      }

      return cb(null, { accessToken, profile });
    }
  )
);
