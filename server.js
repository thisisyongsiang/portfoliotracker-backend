import express from 'express';
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import * as apps from './app.js';

dotenv.config();

const chkPort=val=>{
    let port =parseInt(val,10);
    if(port>=0){
      return port;
    }
    return false;
  }

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use (apps.router);

// Server Port
const port =chkPort(process.env.PORT||4200);

// Setup MongoDB Atlas Connection
const mongo_uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.3wmjdvj.mongodb.net/?retryWrites=true&w=majority`;
mongoose.connect(mongo_uri, {useNewUrlParser: true, useUnifiedTopology: true});
const conn = mongoose.connection;
conn.once("open", () => {
  console.log("MongoDB Atlas database connected successfully");
})
conn.on('error', console.error.bind(console, 'MongoDB Atlas connection error'));

// Server listening port
app.listen(port, () => {
  console.log(`Server listening on Port ${port}`);
});