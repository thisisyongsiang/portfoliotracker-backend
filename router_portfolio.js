import express from 'express';
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from 'mongoose';
import Portfolio from './models/portfolio.js';

const router_portfolio = express.Router();

router_portfolio.get("/portfolio/all", async (req, res) => {
    console.log("Getting all Portfolio details...");
  
    Portfolio.find().exec((err, result) => {
      if (err) {
        console.log("Error: ", err)
      }
      else {
        res.send(result);
      }
    })
});

router_portfolio.get("/portfolio/select", async (req, res) => {
    const email = req.query.email;
    console.log(`Getting indiviual Portfolio details by email...${email}`);

    Portfolio.find({"emailAddress": email}).exec((err, result) => {
        if (err) {
            console.log("Error: ", err)
        }
        else {
            res.send(result);
        }   
    })
});

router_portfolio.post("/portfolio/add", async (req, res) => {
try {
    console.log("Adding New Portfolio.. req.body: ", req.body);

    const newPortfolio = new Portfolio({
    emailAddress: req.body.emailAddress,
    cash: req.body.cash,
    equity: req.body.equity,
    });

    await Portfolio.create(newPortfolio);

    res.send("New Portfolio Added!");
    }catch (err) {
        console.log("Error: ", err);
    }
});

export { router_portfolio };