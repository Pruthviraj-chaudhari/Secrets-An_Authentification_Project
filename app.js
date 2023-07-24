require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require("md5");

const app = express();
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));


mongoose.connect("mongodb://127.0.0.1:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true})
    .then(()=>{
        console.log("Successfuly connected to database.");
    })
    .catch(err=>{
        console.log("Error connecting to database:", err);
    });


const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
  });


const User = new mongoose.model("User", userSchema);


app.get("/", (req, res)=>{
    res.render("home");
});

app.get("/login", (req, res)=>{
    res.render("login");
});

app.get("/register", (req, res)=>{
    res.render("register");
});

app.get("/logout", (req, res)=>{
    res.render("home");
});


app.post("/register", (req, res)=>{
    
    const newUser = new User({
        email : req.body.username,
        password: md5(req.body.password)
    });

    newUser.save()
        .then(()=>{
            console.log("Account created successfuly");
            res.render("secrets");
        })
        .catch(err=>{
            console.log("Error creating account: ", err);
        });
});


app.post("/login", async (req, res) => {
    const email = req.body.username;
    const password = md5(req.body.password);
  
    User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (password === user.password) {
        return res.status(200).render("secrets");
      } else {
        return res.status(401).json({ error: "Invalid password" });
      }
    })
    .catch((err) => {
      console.error("Error during login:", err);
      res.status(500).json({ error: "Internal server error" });
    });

  });


  
app.listen(3000, ()=>{
    console.log("Server listening on port 3000");
})