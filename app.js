
//jshint esversion:6

//-----------------------------------------REQUIRED MODULES----------------------------------------//


const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
//During save, documents are encrypted and then signed. During find, documents are authenticated and then decrypted


//-----------------------------------------BASIC SETUP--------------------------------------------//


app.set('view engine', 'ejs');

app.use(express.urlencoded({
  extended: true
}));
app.use(express.static("public"));


//-----------------------------------------MONGOOSE SETUP-----------------------------------------//


mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true, useUnifiedTopology: true});

const userSchema = new mongoose.Schema({
    email:String,
    password:String
});

//You can either use a single secret string of any length; or a pair of base64 strings (a 32-byte encryptionKey and a 64-byte signingKey).
// You have to create a variable containing of any string and that variable should be put against secret: as js object.

// .....

// { secret : variableName }

const secret = "This is our little secret";

//ADD plugin before creating a model**

userSchema.plugin(encrypt, { secret: secret ,encryptedFields: ['password'] });
// This adds _ct and _ac fields to the schema, as well as pre 'init' and pre 'save' middleware,
// and encrypt, decrypt, sign, and authenticate instance methods


const User =new mongoose.model("User",userSchema);


//-----------------------------------------SERVER SETUP-----------------------------------------//

app.get("/",function(req,res){

  res.render("home");

});


app.get("/login",function(req,res){

  res.render("login");

});


app.get("/register",function(req,res){

  res.render("register");

});


app.post("/register",function(req,res){

  const newUser = new User({
    email:req.body.username,
    password:req.body.password
  });

  newUser.save(function(err){   //encrypt here
    if(err)
    res.send(err);
    else
    res.render("secrets");
  });

});

app.post("/login",function(req,res){

  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email:username},function(err,found){      //decrypt here,comes in original form

    if(err)
    res.send(err);
    else
    {
      if(password===found.password)
      res.render("secrets");
    }

  });
});



//-----------------------------------------PORT LISTENING-----------------------------------------//


app.listen(3000, function() {
  console.log("Server started on port 3000");
});


//-----------------------------------------END OF FILE------------------------------------------//
