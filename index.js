const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const mongodb = require("mongodb")
var bcryptjs = require("bcryptjs");
var nodemailer = require("nodemailer");
const mongoClient = mongodb.MongoClient;
const cors = require("cors");
require('dotenv').config();
//const url = "mongodb+srv://Tnahsin79:tnahsin79@guvi-zen.iisub.mongodb.net?retryWrites=true&w=majority";
const url = "mongodb+srv://Tnahsin79:tnahsin79@guvi-capstone.iisub.mongodb.net?retryWrites=true&w=majority";
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
      var link = `http://localhost:3000/valid/${user.insertedId}`;
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

app.get("/login/:email/:pwd", async function (req, res) {
  try {
    var client = await mongoClient.connect(url);
    var db = client.db("react-login");
    //find the user with email
    var user = await db.collection("user").findOne({ Email: req.params.email });
    if (user && user.isActivated) {
      //comapare the password
      var result = await bcryptjs.compare(req.params.pwd, user.Password);
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
        message: "No such user exists, kindly register yourself!!!! or activate account"
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

app.get('/profile/:id', async function (req, res) {
  try {
    var client = await mongoClient.connect(url);
    var db = client.db("react-login");
    var user = await db.collection("user").findOne({ _id: mongodb.ObjectID(req.params.id) });
    //var user = await db.collection("user").findOne({ _id: mongodb.ObjectID(req.body.Id) });
    res.json(user);
  }
  catch (error) {
    res.json({
      message: "Something went wrong: " + error
    })
  }
});

app.get('/friends/:id', async function (req, res) {
  try {
    var client = await mongoClient.connect(url);
    var db = client.db("react-login");
    var user = await db.collection("user").findOne({ _id: mongodb.ObjectID(req.params.id) });
    res.json(user.Friends);
  }
  catch (error) {
    res.json({
      message: "Something went wrong: " + error
    })
  }
});

app.put("/addPost", async function (req, res) {
  try {
    var client = await mongoClient.connect(url);
    var db = client.db("react-login");
    var user = await db.collection("user").findOne({ _id: mongodb.ObjectID(req.body.Id) });
    if (user) {
      let posts = user.Posts;
      let id = posts.length + 1;
      posts.push({
        post_id: id,
        name: req.body.Name,
        //media: req.body.Media,
        text: req.body.Text,
        likes: 0
      });
      await db.collection("user")
        .findOneAndUpdate(
          { _id: mongodb.ObjectID(req.body.Id) },
          {
            $set: {
              Posts: posts
            }
          }
        );
      res.json({
        message: "Post Added"
      });
    }
    else {
      console.log("Post not added");
    }

  }
  catch (error) {
    console.log("ERROR: " + error);
    res.json({
      message: "Something went wrong: " + error
    })
  }
});

app.get('/users', async function (req, res) {
  try {
    var client = await mongoClient.connect(url);
    var db = client.db("react-login");
    var users = await db.collection("user").find().toArray();
    res.json(users);
  }
  catch (error) {
    res.json({
      message: "Something went wrong: " + error
    })
  }
});

app.put("/addFriend/:id", async function (req, res) {
  try {
    var client = await mongoClient.connect(url);
    var db = client.db("react-login");
    var user = await db.collection("user").findOne({ _id: mongodb.ObjectID(req.params.id) });
    
      let friends = user.Friends;
      friends.push({
        email: req.body.Email,
        name: req.body.Name
      });
      await db.collection("user")
        .findOneAndUpdate(
          { _id: mongodb.ObjectID(req.params.id) },
          {
            $set: {
              Friends: friends
            }
          }
        );
      res.json({
        message: "Post Added"
      });
    

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
});


require('dotenv').config();
*/
