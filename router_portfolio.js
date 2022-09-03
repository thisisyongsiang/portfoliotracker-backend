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

// Add New Portfolio for User
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

// Delete Portfolio for User by email and portfolio name
router_portfolio.delete("/portfolio/del", async(req, res) => {
  try {

    const email = req.query.email;
    const portfolio_name = req.query.portfolioName;
    console.log(`Deleting Portfolio ${portfolio_name} for User ${email}`);

    Portfolio.deleteOne({ "emailAddress": email, "portfolio": portfolio_name }, function (err, result) {
      if (err) {
        console.log("Error: ", err);
        res.send(err);
      }
      else {
        console.log(`Deleted Portfolio ${portfolio_name} for User ${email}`);
        res.send(result);
      }
    });
  } catch (err) {
    console.log("Error: ", err);
  }
});

// Get Portfolio Object of User by User email
router_portfolio.get("/portfolio/select", async (req, res) => {
    const email = req.query.email;http://localhost:4200/portfolio/add${email}`);

    Portfolio.find({"emailAddress": email}).exec((err, result) => {
        if (err) {
            console.log("Error: ", err)
        }
        else {
            res.send(result);
        }   
    })
});

// Get single portfolio by email and portfolio name
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

// Add transaction to existing portfolio
router_portfolio.put("/portfolio/transaction/update", async( req, res) => {
  const email = req.body.emailAddress;
  const portfolio = req.body.portfolio;
  const transactionType = req.body.transactionType;
  const transaction = req.body.transaction;

  console.log(`Adding ${transactionType} transaction to portfolio ${portfolio} for user ${email}`);

  Portfolio.updateOne(
    { "emailAddress": email, "portfolio": portfolio },
    { $push: { [transactionType]: transaction }},
    function(err, result) {
      if (err) {
        res.send(err);
      }
      else {
        console.log(`Successfully Added ${transactionType} transaction to portfolio ${portfolio} for user ${email}`);
        res.send(result);
      }
    });
});

// Delete transaction from existing portfolio
router_portfolio.put("/portfolio/transaction/del", async(req, res) => {
  const email = req.body.emailAddress;
  const portfolio = req.body.portfolio;
  const transactionType = req.body.transactionType;
  const transaction = req.body.transaction;

  console.log(`Deleting ${transactionType} transaction from portfolio ${portfolio} for user ${email}`);

  Portfolio.updateOne(
    { "emailAddress": email, "portfolio": portfolio },
    { $pull: { [transactionType]: transaction }},
    function(err, result) {
      if (err) {
        res.send(err);
      }
      else {
        console.log(`Successfully Deleted ${transactionType} transaction from portfolio ${portfolio} for user ${email}`);
        res.send(result);
      }
    });
})

// Get all BUY transactions from user
router_portfolio.get("/portfolio/transaction/buy", async(req, res) => {
  const email = req.query.email;

  console.log(`Getting all BUY transactions for user ${email}`);

  Portfolio.find({"emailAddress": email}).exec((err, result) => {
      if (err) {
          console.log("Error: ", err)
      }
      else {
        console.log(`Successfully retrieved all BUY transactions for user ${email}`);

        let transactions = [];
        const func = (item, index, arr) => {
          const buys = item['buy'];
          transactions.push(...buys);
        }
        result.forEach(func);
        res.send(transactions);
      }   
  })
});

// Get all SELL transactions from user
router_portfolio.get("/portfolio/transaction/sell", async(req, res) => {
  const email = req.query.email;

  console.log(`Getting all SELL transactions for user ${email}`);

  Portfolio.find({"emailAddress": email}).exec((err, result) => {
      if (err) {
          console.log("Error: ", err)
      }
      else {
        console.log(`Successfully retrieved all SELL transactions for user ${email}`);

        let transactions = [];
        const func = (item, index, arr) => {
          const sells = item['sell'];
          transactions.push(...sells);
        }
        result.forEach(func);
        res.send(transactions);
      }
  })
});

// Get user's portfolio names
router_portfolio.get("/portfolio/select/name", async (req, res) => {
  const email = req.query.email;
  console.log(`Getting ALL USER's Portfolio Names only by email...${email}`);

  Portfolio.find({"emailAddress": email}).exec((err, result) => {
      if (err) {
          console.log("Error: ", err)
      }
      else {
          let names= result.map(v=>{
            return v['portfolio'];
          })
          res.send(names);
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

//Get each portfolio name and total value
router_portfolio.get("/portfolio/allStats",async(req,res)=>{
  try {
    const email = req.query.email;
    console.log(`Getting value of each portfolio by email...${email}`);
    let valueList = [];
    let portfolios = await Portfolio.find({"emailAddress": email});
    for (let val of portfolios){
      let pfVal = await getPortfolioValue(val);
      let object = await { 
              name: val.portfolio,
              value: pfVal 
    } 
    valueList.push(object) 
  }

    console.log(valueList)
    res.status(200).send(valueList);
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
  let startDate=new Date(req.query.startDate);
  let endDate=new Date(req.query.endDate);

  let eString=`${endDate.getFullYear()}-${String(endDate.getMonth()+1).padStart(2,'0')}-${String(endDate.getDate()).padStart(2,'0')}`
  console.log(`Getting portfolio value over timeperiod of Portfolio:${portfolioName} by email...${email}`);
  let portfolio = await Portfolio.find({"emailAddress": email,"portfolio":portfolioName});
  let historical={};
  let portfolioHistoricalValue=[];
  let assetsPrevDayVal={};
  try {
    for(let d = startDate;d<endDate;d.setDate(d.getDate()+1)){
      let pfAssets=getPortfolioAssetsAtDate(portfolio[0],d);
      let dString=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
      let dailyPfValue=0;
      // console.log(assetsPrevDayVal);
      assetsPrevDayVal['date']=d.toDateString();
      
      for(let asset of Object.entries(pfAssets)){
        if (!historical[asset[0]]){
          let histQuote=await GetHistoricalQuotes(asset[0],dString,eString);
          historical[asset[0]]=histQuote;
        }
        if (historical[asset[0]].length===0)continue;
        let assetDate=new Date(historical[asset[0]][0].date);
        if(
          assetDate.getDate()===d.getDate()&&
          assetDate.getFullYear()===d.getFullYear()&&
          assetDate.getMonth()===d.getMonth()
          ){
          let dayAsset=historical[asset[0]].shift();
          dailyPfValue+=dayAsset['adjClose']*asset[1]; 
          assetsPrevDayVal[asset[0]]={val:dayAsset['adjClose']*asset[1],trading:true};
        }
        else{
          assetsPrevDayVal[asset[0]]?assetsPrevDayVal[asset[0]]['trading']=false:assetsPrevDayVal[asset[0]]={trading:false};
          dailyPfValue+=assetsPrevDayVal[asset[0]]['val']?assetsPrevDayVal[asset[0]]['val']:0;
          //considering some markets are active in some days while others are on holiday
        }
      }
      let toAdd = Object.entries(assetsPrevDayVal).reduce((chk,curAsset)=>{
        return chk||curAsset[1].trading;
      },false);
      if(toAdd){
        portfolioHistoricalValue.push({
          date:new Date(d),
          value:dailyPfValue
        });
      }
    }
    res.status(200).send(portfolioHistoricalValue);
  } catch (error) {
    console.log(error);
    res.status(500).send("error occurred "+error);
  }
})

export { router_portfolio };