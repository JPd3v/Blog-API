const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ArticleSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: [{ type: String, required: true }],
  published: { type: Boolean, required: true },
  published_date: { type: Date },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
});

module.exports = mongoose.model("Article", ArticleSchema);
