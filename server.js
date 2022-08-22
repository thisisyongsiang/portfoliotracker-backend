import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import * as apps from './app.js';

const chkPort=val=>{
    let port =parseInt(val,10);
    if(port>=0){
      return port;
    }
    return false;
  }

let app=express();
app.use(cors());
app.use(bodyParser.json());
app.use (apps.router);
//listen to provided port or else use port 4200
const port =chkPort(process.env.PORT||4200);
app.on("listening",()=>{
    console.log("listening on port : " + port);
})

app.listen(port);

console.log("listening on port 4200");