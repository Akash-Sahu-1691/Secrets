//jshint esversion:6

//-----------------------------------------REQUIRED MODULES----------------------------------------//

require("dotenv").config(); //encorporated dotenv asap in project file.
const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); //adding bcrypt
const saltRounds = 10;

//-----------------------------------------BASIC SETUP--------------------------------------------//

app.set("view engine", "ejs");

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.static("public"));

//-----------------------------------------MONGOOSE SETUP-----------------------------------------//

mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

console.log(process.env.SECRET);

const User = new mongoose.model("User", userSchema);

//-----------------------------------------SERVER SETUP-----------------------------------------//

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", function (req, res) {
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    // Store hash in your password DB.

    const newUser = new User({
      email: req.body.username,
      password: hash,
    });

    newUser.save(function (err) {
      if (err) res.send(err);
      else res.render("secrets");
    });
  });
});

app.post("/login", function (req, res) {
  const username = req.body.username;
  const password = req.body.password; //converting to hash

  User.findOne({ email: username }, function (err, found) {
    if (err) res.send(err);
    else {
      bcrypt.compare(password, found.password, function (err, result) {
        //found.password is hash from password DB.
        if (result === true) res.render("secrets");
      });
    }
  });
});

//-----------------------------------------PORT LISTENING-----------------------------------------//

app.listen(3000, function () {
  console.log("Server started on port 3000");
});

//-----------------------------------------END OF FILE------------------------------------------//
