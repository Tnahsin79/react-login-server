const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const mongodb = require("mongodb")
var bcryptjs = require("bcryptjs");
var nodemailer = require("nodemailer");
const mongoClient = mongodb.MongoClient;
const cors = require("cors");
require('dotenv').config();
const url = "mongodb+srv://Tnahsin79:tnahsin79@guvi-zen.iisub.mongodb.net?retryWrites=true&w=majority";
app.use(bodyParser.json());
app.use(cors({
  origin: "http://localhost:3000"
}));

console.log("server started...");

//GET users listing. 
app.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

app.post("/signup", async function (req, res) {
  try {
    var client = await mongoClient.connect(url);
    var db = client.db("react-login");
    var user = await db.collection("user").findOne({ Email: req.body.Email });
    if (!user) {
      //generate salt
      let salt = await bcryptjs.genSalt(10);
      //hash password
      let hash = await bcryptjs.hash(req.body.Password, salt);
      //store in db
      req.body.Password = hash;
      user = await db.collection("user").insertOne(req.body);
      res.json({
        message: "User Registered!"
      });
      var link=`http://localhost:3000/valid/${user.insertedId}`;
      //req.body=req.body.json();
      var data = `
      <p>you have registration requst</p>
      <h3>Validating link</h3>
      <p>${link}<p>
      `;
      let transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        //port: 465,
        //secure: true, // true for 465, false for other ports
        auth: {
          user: "webdevtesting79@gmail.com", // generated ethereal user
          pass: "tsukuyomi79" // generated ethereal password
        }
      });

      let mailOptions = {
        from: "webdevtesting79@gmail.com", // sender address
        to: req.body.Email, // list of receivers
        subject: "testing...", // Subject line
        text: "Hello world.......", // plain text body
        html: data // html body
      };

      // send mail with defined transport object
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("error: " + error);
        }
        else {
          console.log("Message sent: %s", info.messageId);
          console.log("email sent: %s", info.response);
          //console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }
      });
    }
    else {
      alert("Email aleady registrered!");
    }
  }
  catch (error) {
    console.log("ERROR: " + error);
    res.json({
      message: "Something went wrong: " + error
    })
  }
});

app.get("/login", async function (req, res) {
  try {
    var client = await mongoClient.connect(url);
    var db = client.db("react-login");
    //find the user with email
    var user = await db.collection("user").findOne({ Email: req.body.Email });
    if (user) {
      //comapare the password
      var result = await bcryptjs.compare(req.body.Password, user.Password);
      if (result) {
        //alert("ACCESS GRANTED :)");
        res.json({
          status: true,
          id: user._id,
          name: user.Name,
          email: user.Email
        });
      }
      else {
        //alert("ACCESS DENIED :( (incorrect username/password");
        res.json({
          status: false,
          message: "wrong email or password"
        });
      }
    }
    else {
      //alert("No such user exists, kindly register yourself!!!!");
      res.json({
        status: false,
        message: "No such user exists, kindly register yourself!!!!"
      });
    }
  }
  catch (error) {
    res.json({
      message: "Something went wrong: " + error
    })
  }
});

app.put("/valid", async function (req, res) {
  try {
    var client = await mongoClient.connect(url);
    var db = client.db("react-login");
    var user = await db.collection("user").findOne({ _id: mongodb.ObjectID(req.body.Id) });
    if (user) {
      await db.collection("user")
        .findOneAndUpdate(
          { _id: mongodb.ObjectID(req.body.Id) },
          {
            $set: {
              isActivated: true
            }
          }
        );
      res.json({
        message: "Account activated"
      });
    }
    else {
      console.log("no user found");
    }

  }
  catch (error) {
    console.log("ERROR: " + error);
    res.json({
      message: "Something went wrong: " + error
    })
  }
});

const port = process.env.PORT || 3001;
app.listen(port);


/*app.post("/reset", async function (req, res) {
  try {
    var client = await mongoClient.connect(process.env.URL);
    var db = client.db("user-login");
    //find the user with email
    var user = await db.collection("user").findOne({ email: req.body.email });
    if (user) {
      //comapare the password
      var result = await bcryptjs.compare(req.body.password, user.password);
      if (result) {
        //alert("ACCESS GRANTED :)");
        res.json({
          message: "ACCESS GRANTED :)"
        });
      }
      else {
        //alert("ACCESS DENIED :( (incorrect username/password");
        res.json({
          message: "ACCESS DENIED :( (incorrect username/password)"
        });
      }
    }
    else {
      //alert("No such user exists, kindly register yourself!!!!");
      res.json({
        message: "No such user exists, kindly register yourself!!!!"
      });
    }
  }
  catch (error) {
    res.json({
      message: "Something went wrong: " + error
    })
  }
});*/

/*
require('dotenv').config();
*/
