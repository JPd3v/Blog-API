const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  article: { type: Schema.Types.ObjectId, ref: "Article" },
  name: { type: String, required: true },
  comment: { type: String, required: true },
  timestamp: { type: Date, required: true },
});

module.exports = mongoose.model("Comment", CommentSchema);
