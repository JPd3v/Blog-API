const Comment = require("../models/comment");
const { body, validationResult } = require("express-validator");
const { verifyUser } = require("../utils/authenticate");

exports.get_comments_article = (req, res, next) => {
  const articleId = req.params.id;

  Comment.find({ article_id: articleId })
    .sort({ timestamp: -1 })
    .exec((err, comentList) => {
      if (err) {
        return res.status(500).json(err);
      }
      return res.status(200).json(comentList);
    });
};

exports.post_comment_article = [
  body("name", "name cannot be empty").trim().isLength({ min: 1 }).escape(),
  body("comment", "comment cannot be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(403).json(errors);
    }

    const articleId = req.params.id;

    const comment = new Comment({
      article_id: articleId,
      name: req.body.name,
      comment: req.body.comment,
      timestamp: new Date(),
    }).save((err) => {
      if (err) {
        return res.status(500).json({ response: err });
      }
      return res
        .status(200)
        .json({ succes: true, response: "comment added succesfully" });
    });
  },
];

exports.delete_comment_article = [
  verifyUser,
  (req, res) => {
    const commentId = req.params.commentId;

    Comment.findByIdAndDelete(commentId, {}, (err) => {
      if (err) {
        return res.status(500).json(err);
      }
      return res
        .status(200)
        .json({ succes: true, response: "comment deleted succefully" });
    });
  },
];
