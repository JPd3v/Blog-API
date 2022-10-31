const User = require("../models/user");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const {
  getToken,
  COOKIE_OPTIONS,
  getRefreshToken,
  verifyUser,
} = require("../utils/authenticate");
const { response } = require("express");

exports.post_user_sign_up = [
  body("first_name", "name must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("last_name", "last name must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("username", "email must not be empty")
    .trim()
    .isLength({ min: 1 })
    .normalizeEmail()
    .isEmail()
    .withMessage("email provided not valid")
    .escape(),
  body("password", "password must not be empty")
    .trim()
    .isLength({ min: 6 })
    .escape(),
  body(
    "confirm_password",
    "confirm password and password field must have the same value"
  )
    .trim()
    .isLength({ min: 6 })
    .custom((value, { req }) => value === req.body.password)
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(403).json(errors);
    }

    User.findOne({ username: req.body.username }).exec((err, found_user) => {
      if (err) {
        return res.status(403).json(err);
      }

      if (found_user) {
        return res.json({ response: "E-Mail already in use" });
      }
      bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
        if (err) {
          return next(err);
        }

        const user = new User({
          username: req.body.username,
          password: hashedPassword,
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          refresh_token: "",
        }).save((err, user) => {
          if (err) {
            return res.status(500).json({ response: err });
          }
          console.log(user._id);
          const token = getToken({ _id: user._id });
          const refreshToken = getRefreshToken({ _id: user._id });
          user.refresh_token = refreshToken;
          user.save((err) => {
            if (err) {
              return res.status(500).json({ response: err });
            }
            res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
            return res.status(200).json({ token });
          });
        });
      });
    });
  },
];

exports.post_user_log_in = [
  passport.authenticate("local", { session: false, failWithError: true }),
  body("username", "email must not be empty")
    .trim()
    .isLength({ min: 1 })
    .normalizeEmail()
    .isEmail()
    .withMessage("email provided not valid")
    .escape(),
  body("password", "password must not be empty")
    .trim()
    .isLength({ min: 6 })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(403).json(errors);
    }
    next();
  },
  (req, res, next) => {
    const token = getToken({ _id: req.user._id });
    const refreshToken = getRefreshToken({ _id: req.user._id });

    User.findById(req.user._id).exec((err, user) => {
      if (err) {
        res.status(500).json(err);
        return next(err);
      }
      user.refresh_token = refreshToken;

      user.save((err) => {
        if (err) {
          return res.status(500).json(err);
        } else {
          res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
          return res.json({ success: true, token });
        }
      });
    });
  },
  function (err, req, res, next) {
    return res.status(401).send({ success: false, message: err });
  },
];

exports.get_new_token = (req, res, next) => {
  const { signedCookies = {} } = req;
  const { refreshToken } = signedCookies;

  if (refreshToken) {
    try {
      const payload = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      const userId = payload._id;
      User.findOne({ _id: userId }).exec((err, user) => {
        if (err) {
          return res.status(500).json(err);
        }

        if (user) {
          if (user.refresh_token !== refreshToken) {
            return res.status(401).json({ message: "Unauthorized" });
          }

          const token = getToken({ _id: userId });
          // if the refresh token exists, then create new one and replace it
          const newRefreshToken = getRefreshToken({ _id: userId });
          user.refresh_token = newRefreshToken;
          user.save((err, user) => {
            if (err) {
              return res.status(500).json(err);
            }
            res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);
            return res.send({ success: true, token });
          });
        } else {
          return res.status(500).json(err);
        }
      });
    } catch (err) {
      return res.status(500).json({ err: "Unauthorized" });
    }
  } else {
    return res.status(500).json({ error: "Unauthorized" });
  }
};

exports.get_user_info = [
  verifyUser,
  (req, res) => {
    const userInfo = {
      _id: req.user._id,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
    };
    return res.json(userInfo);
  },
];

exports.get_log_out = [
  verifyUser,
  async (req, res, next) => {
    const { signedCookies = {} } = req;
    try {
      const doc = await User.findById(req.user);

      doc.refresh_token = "";
      await doc.save();

      res.clearCookie("refreshToken", COOKIE_OPTIONS);
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json(err);
    }
  },
];
