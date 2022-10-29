const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  refresh_token: { type: String, default: "" },
});

UserSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    delete ret.refresh_token;
    return ret;
  },
});

module.exports = mongoose.model("User", UserSchema);
