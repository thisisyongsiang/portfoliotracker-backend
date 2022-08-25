import express from 'express';
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from 'mongoose';
import User from './models/user.js';

const router_user = express.Router();

router_user.get("/user/all", async (req, res) => {
    console.log("Getting all User details...");
  
    User.find().exec((err, result) => {
      if (err) {
        console.log("Error: ", err)
      }
      else {
        res.send(result);
        console.log(result);
      }
    })
  });

  router_user.get("/user/select", async (req, res) => {
    const email = req.query.email;
    console.log(`Getting indiviual User details by email...${email}`);
  
    User.find({"emailAddress": email}).exec((err, result) => {
      if (err) {
        console.log("Error: ", err)
      }
      else {
        res.send(result);
      }
    })
  });

router_user.post("/user/add", async (req, res) => {
try {
    console.log("Adding New User... req.body: ", req.body);
    const newUser = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    emailAddress: req.body.emailAddress,
    });
    console.log(newUser);

    let existingUser = await User.find({emailAddress:newUser.emailAddress}).exec();
    if(existingUser.length===0){
      console.log('add');
      await User.create(newUser);
    }

    res.send("New User Added!");
} catch (err) {
    console.log("Error: ", err);
}
});

export { router_user };