require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const passport = require("passport");

const cors = require("cors");

require("./strategies/localStrategy");
require("./strategies/jwtStrategy");

app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser(process.env.COOKIE_SECRET));

// configure cors

const whitelist = process.env.WHITELISTED_DOMAINS
  ? process.env.WHITELISTED_DOMAINS
  : [];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },

  credentials: true,
};
app.use(cors(corsOptions));

// mongoDb config
const mongoDB = process.env.MONGODB_ATLAS_URL;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error"));

require("./models/comment");
require("./models/user");

app.get("/", (req, res) => {
  res.json({ text: "hello world" });
});

const articlesRouter = require("./routes/articles");
const userRouter = require("./routes/user");

app.use(passport.initialize());

// api routes
app.use("/articles", articlesRouter);
app.use("/user", userRouter);

const SERVER_PORT = 3000;
app.listen(SERVER_PORT, () =>
  console.log(`server listening in port  ${SERVER_PORT}`)
);
