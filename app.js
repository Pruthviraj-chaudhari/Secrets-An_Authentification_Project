require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: "My secret",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());


// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Successfully connected to the database.");
  })
  .catch(err => {
    console.log("Error connecting to the database:", err);
  });

  
// User model and passport setup
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true
  },
  password: {
    type: String
  }
});

userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("User", userSchema);

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// Routes
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/logout", (req, res) => {
    req.logout(() => {
        res.redirect("/");
    });    
});

app.get("/secrets", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

// Post 
app.post('/register', (req, res) => {
  User.register(new User({ username: req.body.username }), req.body.password, (err, user) => {
    if (err) {
      console.error(err);
      return res.redirect('/register');
    }
    passport.authenticate('local')(req, res, () => {
      res.redirect('/secrets');
    });
  });
});

app.post('/login', passport.authenticate('local', {
      successRedirect: '/secrets', 
      failureRedirect: '/login'
    })
);

// 404 error handler
app.use((req, res) => {
  res.status(404).send("Page not found");
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
