
//jshint esversion:6

//-----------------------------------------REQUIRED MODULES----------------------------------------//

require('dotenv').config()    //encorporated dotenv asap in project file.
const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose = require('mongoose');
const md5 = require('md5');



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


console.log(process.env.SECRET);



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
    password:md5("req.body.password")       //converting to hash 
  });

  newUser.save(function(err){   
    if(err)
    res.send(err);
    else
    res.render("secrets");
  });

});

app.post("/login",function(req,res){

  const username = req.body.username;
  const password = md5("req.body.password");    //converting to hash
  console.log(password);
  User.findOne({email:username},function(err,found){      

    if(err)
    res.send(err);
    else
    {
      if(password===found.password)     //comparing two hash values.
      res.render("secrets");
    }

  });
});



//-----------------------------------------PORT LISTENING-----------------------------------------//


app.listen(3000, function() {
  console.log("Server started on port 3000");
});


//-----------------------------------------END OF FILE------------------------------------------//
