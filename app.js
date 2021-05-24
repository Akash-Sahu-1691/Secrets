
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
const GoogleStrategy = require('passport-google-oauth20').Strategy;     //adding required package and using this package as passsport strategy
const findOrCreate = require('mongoose-findorcreate');    //adding new package to use the findorcreate() method functionality.

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
    googleId:String         //adding new field to store user's google id,
});


userSchema.plugin(passportLocalMongoose);   
userSchema.plugin(findOrCreate);      //add plugin to our userschema

const User =new mongoose.model("User",userSchema);

passport.use(User.createStrategy());

// passport.serializeUser(User.serializeUser());          //replacing them as they using local strategy     
// passport.deserializeUser(User.deserializeUser());          

passport.serializeUser(function(user, done) {       ////from passport docs, in configure setting, now this will work for any kind of authentication
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({             //Next part is to setup and configure google strategy.
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/secrets"
},
function(accessToken, refreshToken, profile, cb) {
  console.log(profile);     //logging profile into console.
  User.findOrCreate({ googleId: profile.id }, function (err, user) {  //after requiring package adn adding plugin,now this function will work.
    return cb(err, user);
  });
}
));
//-----------------------------------------SERVER SETUP-----------------------------------------//

app.get("/",function(req,res){

  res.render("home");

});

app.get("/auth/google",
  //Initializing authentication with google
  //use passport to authenticate our user with google strategy ,which we defined above
  passport.authenticate('google', { scope: ['profile'] })   //using google strategy
  //here scope means our site "secrets" wants user's profile info. from google, its email, profile data etc.
  // this line of code is sufficient to pop up google login page and will tell: Choose an account to continue to Secrets

);

app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }), //if authentication fails
  function(req, res) {
    // Successful authentication, redirect secrets.
    res.redirect('/secrets');   //means passport.use(new GoogleStrategy) has already completed and callback function has triggered.
                                  //where we can see the user's profile info on console.
  });



app.get("/login",function(req,res){

  res.render("login");

});


app.get("/register",function(req,res){



  res.render("register");

});

app.get("/secrets",function(req,res){
  if(req.isAuthenticated())   
  res.render("secrets");    
  else
  res.redirect("/login");   
})

app.get("/logout",function(req,res){ 
  req.logout();       
  res.redirect("/");
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
