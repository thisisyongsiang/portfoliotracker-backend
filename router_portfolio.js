import express from 'express';
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from 'mongoose';
import Portfolio from './models/portfolio.js';
import { getPortfolioValue,getPortfolioAssetsAtDate } from './portfolio/controller.js';
import { GetHistoricalQuotes } from './financeAPI/controller.js';

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

router_portfolio.get("/portfolio/equity", async (req, res) => {
    console.log("Getting all Equity Portfolio details...");

    Portfolio.find({ "portfolio": "equity" }).exec((err, result) => {
      if (err) {
        console.log("Error: ", err)
      }
      else {
        res.send(result);
      }
    })
});

router_portfolio.get("/portfolio/equity/select", async (req, res) => {
    const email = req.query.email;
    console.log(`Getting individual Equity Portfolio details by email...${email}`);

    Portfolio.find({ "portfolio": "equity", "emailAddress": email }).exec((err, result) => {
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
    console.log(`Getting ALL USER's Portfolio details by email...${email}`);

    Portfolio.find({"emailAddress": email}).exec((err, result) => {
        if (err) {
            console.log("Error: ", err)
        }
        else {
            res.send(result);
        }   
    })
});

router_portfolio.get("/portfolio/selectone", async (req, res) => {
  const email = req.query.email;
  const portfolioName = req.query.portfolioName;
  console.log(`Getting Portfolio ${portfolioName} for email ${email}`);
  Portfolio.find({"emailAddress": email,"portfolio":portfolioName}).exec((err, result) => {
      if (err) {
          console.log("Error: ", err)
      }
      else {
          res.send(result);
      }   
  })
});

//Get overall value of user
router_portfolio.get("/portfolio/overallValue",async(req,res)=>{
  try {
    const email = req.query.email;
    console.log(`Getting OVERALL value of portfolios by email...${email}`);
  
    let portfolios = await Portfolio.find({"emailAddress": email});
    let overallValue=await  portfolios.reduce(async (prevVal,curVal)=>{
      let pfVal=await getPortfolioValue(curVal);
      return await prevVal+pfVal;
    },0);
    res.status(200).send({value:overallValue});
  } catch (error) {
    res.status(500).send('error occurred : '+error);
  }
})
//Get value of single portfolio of user
router_portfolio.get("/portfolio/selectonevalue",async(req,res)=>{
  try {
    const email=req.query.email;
    const portfolioName=req.query.portfolioName;
    console.log(`Getting portfolio value of Portfolio:${portfolioName} by email...${email}`);
    let portfolio = await Portfolio.find({"emailAddress": email,"portfolio":portfolioName});
    let pfVal= await getPortfolioValue(portfolio[0]);
    res.status(200).send({value:pfVal});
  } catch (error) {
    res.status(500).send('error occurred : '+error);
  }
})

//Get list of portfolioValues over a timeperiod
router_portfolio.get('/portfolio/selectonevalue/timeperiod',async(req,res)=>{
  const email=req.query.email;
  const portfolioName=req.query.portfolioName;
  const startDate=new Date(req.query.startDate);
  const endDate=new Date(req.query.endDate);
  console.log(`Getting portfolio value over timeperiod of Portfolio:${portfolioName} by email...${email}`);
  let portfolio = await Portfolio.find({"emailAddress": email,"portfolio":portfolioName});
  let historical={};
  for(let d = startDate;d<=endDate;d.setDate(d.getDate()+1)){
    let pfAssets=getPortfolioAssetsAtDate(portfolio[0],d);
    let dString=`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`
    await Object.entries(pfAssets).forEach(async a=>{
      if(!historical[a[0]]){
        let histQuote = await GetHistoricalQuotes(a[0],dString,req.query.endDate);
        historical[a[0]]=histQuote;
      };
    })

  }
  res.sendStatus(200);
})


router_portfolio.post("/portfolio/add", async (req, res) => {
try {
    console.log("Adding New Portfolio.. req.body: ", req.body);

    const newPortfolio = new Portfolio({
    emailAddress: req.body.emailAddress,
    portfolio: req.body.portfolio,
    buy: req.body.buy,
    sell: req.body.sell
    });

    await Portfolio.create(newPortfolio);

    res.send("New Portfolio Added!");
    }catch (err) {
        console.log("Error: ", err);
    }
});

export { router_portfolio };