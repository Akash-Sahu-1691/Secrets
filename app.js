
//jshint esversion:6

//-----------------------------------------REQUIRED MODULES----------------------------------------//

require('dotenv').config()    //encorporated dotenv asap in project file.
const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require('express-session')    //adding required package
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


//-----------------------------------------BASIC SETUP--------------------------------------------//


app.set('view engine', 'ejs');

app.use(express.urlencoded({
  extended: true
}));
app.use(express.static("public"));


//----------------------------------------SESSION SETUP-------------------------------------------//

app.use(session({                   //setting session with some inital configuration

  secret: "This is Akash Sahu",
  resave:false,
  saveUninitialized:false

}));

app.use(passport.initialize());   // tells our app, to use passport and initializze the passport package.
app.use(passport.session());    //tells our app, that use passport to setup our session.

//-----------------------------------------MONGOOSE SETUP-----------------------------------------//


mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});

const userSchema = new mongoose.Schema({
    email:String,
    password:String
});


userSchema.plugin(passportLocalMongoose);   //It is what we are going to use hash and salt our password and to save our users into mongoDB database.
                                            //It handles such a heavy lifting for us.
const User =new mongoose.model("User",userSchema);

// use static authenticate method of model in LocalStrategy
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());                // serialise means put user identification into a cookie
passport.deserializeUser(User.deserializeUser());           //deserialise means opeining of cookie and see the andar ka maal.


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

app.get("/secrets",function(req,res){
  if(req.isAuthenticated())     //checking if the user is authenticated or not, means if the user is already loggin in, then he can render secrets page.
  res.render("secrets");    //as we have user's cookie, its info and all. and he is still logged in, so he can goo directly secrets page from home page, by url.
  else
  res.redirect("/login");   //if not loggin in
})

app.get("/logout",function(req,res){ 
  req.logout();       //to logout our loggin user.Invoking logout() will remove the req.user property and clear the login session (if any).
  res.redirect("/");
});


app.post("/register",function(req,res){

User.register({username : req.body.username}, req.body.password, function(err, user) {   
  //this method comes from passportLocalMongoose
  //this package will will create new user,save new user and  interacting with mongoose directly.
  if (err) {
  console.log(err);
  res.redirect("/register");
  }   
  else{
    passport.authenticate("local")(req,res,function(){    //type of authentication , we're performing is local.
      //this callback is only triggered, if we managed to setup a cookie successfully ,that saved their current logged in session
      //HERE
      res.redirect("/secrets");
    })
  }});
});

//HERE:- Means we are sending a cookie to our browser and telling it, to hold on that cookie becoz it holds some users credentials
//that will tell the server that , yes this user is authorized and can watch all that server's pages that requires authentication.

app.post("/login",function(req,res){

  const user = new User({
    username:req.body.username,
    password:req.body.password
  });

  req.login(user,function(err){   //login() method will check users credentials with users database,not found then produce err
    
    if(err)
    console.log(err);
    else{
    //In else means, user successfully logged in.
    passport.authenticate("local")(req,res,function(){    //type of authentication , we're performing is local.
      //this callback is only triggered, if we managed to setup a cookie successfully ,that saved their current logged in session
     //HERE
      res.redirect("/secrets");
    });

  }});
});



//-----------------------------------------PORT LISTENING-----------------------------------------//


app.listen(3000, function() {
  console.log("Server started on port 3000");
});


//-----------------------------------------END OF FILE------------------------------------------//
