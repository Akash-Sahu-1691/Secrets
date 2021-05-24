
//jshint esversion:6

//-----------------------------------------REQUIRED MODULES----------------------------------------//

require('dotenv').config()   
const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require('express-session')  
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;     
const findOrCreate = require('mongoose-findorcreate');    

//-----------------------------------------BASIC SETUP--------------------------------------------//


app.set('view engine', 'ejs');

app.use(express.urlencoded({
  extended: true
}));
app.use(express.static("public"));


//----------------------------------------SESSION SETUP-------------------------------------------//

app.use(session({                   
  secret: "This is Akash Sahu",
  resave:false,
  saveUninitialized:false

}));

app.use(passport.initialize());   
app.use(passport.session());    

//-----------------------------------------MONGOOSE SETUP-----------------------------------------//


mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});

const userSchema = new mongoose.Schema({
    email:String,
    password:String,
    googleId:String,
    secret:String        //Adding new field to store secret
});


userSchema.plugin(passportLocalMongoose);   
userSchema.plugin(findOrCreate);      

const User =new mongoose.model("User",userSchema);

passport.use(User.createStrategy());

      

passport.serializeUser(function(user, done) {      
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({           
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/secrets"
},
function(accessToken, refreshToken, profile, cb) {
  console.log(profile);   
  User.findOrCreate({ googleId: profile.id }, function (err, user) {  
    return cb(err, user);
  });
}
));
//-----------------------------------------SERVER SETUP-----------------------------------------//

app.get("/",function(req,res){

  res.render("home");

});

app.get("/auth/google",passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/secrets');  
  });



app.get("/login",function(req,res){

  res.render("login");

});


app.get("/register",function(req,res){



  res.render("register");

});

app.get("/secrets",function(req,res){

  User.find({secret:{$ne:null}},function(err,foundUsers){  //this will search all our user Db and look for secret field whose value isnt null.
    if(err)
    console.log(err);
    else{
      if(foundUsers)
      res.render("secrets",{secrets:foundUsers}); //we are actually passing array of users
    }
  });
});

app.get("/logout",function(req,res){ 
  req.logout();       
  res.redirect("/");
});

app.get("/submit",function(req,res){
  if(req.isAuthenticated())       //Checking authentication, same as above
  res.render("submit");    
  else
  res.redirect("/login");  
});

app.post("/submit",function(req,res){
  const submittedSecret = req.body.secret;    //saving their secret msg
  //Next thing is to find the current user in our DB and save this msg to their account
  //passport very handlly save the user details when we initiate new login session
  console.log(req.user.id);

  User.findById(req.user.id,function(err,found){
    if(err)
    console.log(err);
    else{
      if(found)
      found.secret = submittedSecret;
      found.save(function(){
        res.redirect("/secrets");
      });
    }
  });
});

app.post("/register",function(req,res){

User.register({username : req.body.username}, req.body.password, function(err, user) {   
   if (err) {
  console.log(err);
  res.redirect("/register");
  }   
  else{
    passport.authenticate("local")(req,res,function(){   
      res.redirect("/secrets");
    })
  }});
});


app.post("/login",function(req,res){

  const user = new User({
    username:req.body.username,
    password:req.body.password
  });

  req.login(user,function(err){   
    
    if(err)
    console.log(err);
    else{
    passport.authenticate("local")(req,res,function(){    
      res.redirect("/secrets");
    });

  }});
});



//-----------------------------------------PORT LISTENING-----------------------------------------//


app.listen(3000, function() {
  console.log("Server started on port 3000");
});


//-----------------------------------------END OF FILE------------------------------------------//
