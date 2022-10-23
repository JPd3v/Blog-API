require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");

app = express();

const mongoDB = process.env.MONGODB_ATLAS_URL;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error"));

app.get("/", (req, res) => {
  res.json({ text: "hello world" });
});

const SERVER_PORT = 3000;
app.listen(SERVER_PORT, () =>
  console.log(`server listening in port  ${SERVER_PORT}`)
);
