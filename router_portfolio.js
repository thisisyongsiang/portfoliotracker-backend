import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import Portfolio from "./models/portfolio.js";
import {
  getPortfolioValue,
  getPortfolioAssetsAtDate,
  getPortfolioHistory,
  getPortfoliosHistory,
  getAssetInPortfolioValueHistory,
  getAssetInPortfolioValue,
} from "./portfolio/controller.js";
import { GetHistoricalQuotes, GetQuote } from "./financeAPI/controller.js";
import { router } from "./app.js";

const router_portfolio = express.Router();

router_portfolio.get("/portfolio/all", async (req, res) => {
  console.log("Getting all Portfolio details...");

  Portfolio.find().exec((err, result) => {
    if (err) {
      console.log("Error: ", err);
    } else {
      res.send(result);
    }
  });
});

// Add New Portfolio for User
router_portfolio.post("/portfolio/add", async (req, res) => {
  try {
    console.log("Adding New Portfolio.. req.body: ", req.body);

    const newPortfolio = new Portfolio({
      emailAddress: req.body.emailAddress,
      portfolio: req.body.portfolio,
      buy: req.body.buy,
      sell: req.body.sell,
    });

    let pf = await Portfolio.create(newPortfolio);

    res.status(200).send(pf);
  } catch (err) {
    console.error("Error: ", err);
    res.status(500).send("error occurred " + err);
  }
});

// Delete Portfolio for User by email and portfolio name
router_portfolio.delete("/portfolio/del", async (req, res) => {
  try {
    const email = req.query.email;
    const portfolio_name = req.query.portfolioName;
    console.log(`Deleting Portfolio ${portfolio_name} for User ${email}`);

    Portfolio.deleteOne(
      { emailAddress: email, portfolio: portfolio_name },
      function (err, result) {
        if (err) {
          console.log("Error: ", err);
          res.status(500).send(err);
        } else {
          console.log(`Deleted Portfolio ${portfolio_name} for User ${email}`);
          res.send(result);
        }
      }
    );
  } catch (err) {
    console.log("Error: ", err);
    res.status(500).send(err);
  }
});

// Get Portfolio Object of User by User email
router_portfolio.get("/portfolio/select", async (req, res) => {
  const email = req.query.email;

  Portfolio.find({ emailAddress: email }).exec((err, result) => {
    if (err) {
      console.log("Error: ", err);
    } else {
      res.send(result);
    }
  });
});

// Get single portfolio by email and portfolio name
router_portfolio.get("/portfolio/selectone", async (req, res) => {
  const email = req.query.email;
  const portfolioName = req.query.portfolioName;
  console.log(`Getting Portfolio ${portfolioName} for email ${email}`);
  Portfolio.find({ emailAddress: email, portfolio: portfolioName }).exec(
    (err, result) => {
      if (err) {
        console.log("Error: ", err);
      } else {
        res.send(result);
      }
    }
  );
});

// Add transaction to existing portfolio
router_portfolio.put("/portfolio/transaction/update", async (req, res) => {
  const email = req.body.emailAddress;
  const portfolio = req.body.portfolio;
  const transactionType = req.body.transactionType;
  const transaction = req.body.transaction;

  console.log(
    `Adding ${transactionType} transaction to portfolio ${portfolio} for user ${email}`
  );

  Portfolio.updateOne(
    { emailAddress: email, portfolio: portfolio },
    { $push: { [transactionType]: transaction } },
    function (err, result) {
      if (err) {
        res.send(err);
      } else {
        console.log(
          `Successfully Added ${transactionType} transaction to portfolio ${portfolio} for user ${email}`
        );
        res.send(result);
      }
    }
  );
});

// Delete transaction from existing portfolio
router_portfolio.put("/portfolio/transaction/del", async (req, res) => {
  const email = req.body.emailAddress;
  const portfolio = req.body.portfolio;
  const transactionType = req.body.transactionType;
  const transaction = req.body.transaction;

  console.log(
    `Deleting ${transactionType} transaction from portfolio ${portfolio} for user ${email}`
  );

  Portfolio.updateOne(
    { emailAddress: email, portfolio: portfolio },
    { $pull: { [transactionType]: transaction } },
    function (err, result) {
      if (err) {
        res.send(err);
      } else {
        console.log(
          `Successfully Deleted ${transactionType} transaction from portfolio ${portfolio} for user ${email}`
        );
        res.send(result);
      }
    }
  );
});

// Get all BUY transactions from user
router_portfolio.get("/portfolio/transaction/buy", async (req, res) => {
  const email = req.query.email;

  console.log(`Getting all BUY transactions for user ${email}`);

  Portfolio.find({ emailAddress: email }).exec((err, result) => {
    if (err) {
      console.log("Error: ", err);
    } else {
      console.log(
        `Successfully retrieved all BUY transactions for user ${email}`
      );

      let transactions = [];
      const func = (item, index, arr) => {
        const buys = item["buy"];
        transactions.push(...buys);
      };
      result.forEach(func);
      res.send(transactions);
    }
  });
});

// Get all SELL transactions from user
router_portfolio.get("/portfolio/transaction/sell", async (req, res) => {
  const email = req.query.email;

  console.log(`Getting all SELL transactions for user ${email}`);

  Portfolio.find({ emailAddress: email }).exec((err, result) => {
    if (err) {
      console.log("Error: ", err);
    } else {
      console.log(
        `Successfully retrieved all SELL transactions for user ${email}`
      );

      let transactions = [];
      const func = (item, index, arr) => {
        const sells = item["sell"];
        transactions.push(...sells);
      };
      result.forEach(func);
      res.send(transactions);
    }
  });
});

// Get user's portfolio names
router_portfolio.get("/portfolio/select/name", async (req, res) => {
  const email = req.query.email;
  console.log(`Getting ALL USER's Portfolio Names only by email...${email}`);

  Portfolio.find({ emailAddress: email }).exec((err, result) => {
    if (err) {
      console.log("Error: ", err);
    } else {
      let names = result.map((v) => {
        return v["portfolio"];
      });
      res.send(names);
    }
  });
});

//Get overall value of user
router_portfolio.get("/portfolio/overallValue", async (req, res) => {
  try {
    const email = req.query.email;
    console.log(`Getting OVERALL value of portfolios by email...${email}`);

    let portfolios = await Portfolio.find({ emailAddress: email });
    let overallValue = await portfolios.reduce(async (prevVal, curVal) => {
      let pfVal = await getPortfolioValue(curVal);
      return (await prevVal) + pfVal;
    }, 0);
    res.status(200).send({ value: overallValue });
  } catch (error) {
    console.error("error occurred at portfolio/overallValue " + error)
    res.status(500).send("error occurred : " + error);
  }
});

//Get each portfolio name and total value
router_portfolio.get("/portfolio/allStats", async (req, res) => {
  try {
    const email = req.query.email;
    console.log(`Getting value of each portfolio by email...${email}`);
    let valueList = [];
    let portfolios = await Portfolio.find({ emailAddress: email });
    for (let val of portfolios) {
      let pfVal = await getPortfolioValue(val);
      let object = await {
        name: val.portfolio,
        value: pfVal,
      };
      valueList.push(object);
    }

    console.log(valueList);
    res.status(200).send(valueList);
  } catch (error) {
    console.error("error occurred at portfolio/allStats " + error)
    res.status(500).send("error occurred : " + error);
  }
});

//Get value of single portfolio of user
router_portfolio.get("/portfolio/selectonevalue", async (req, res) => {
  try {
    const email = req.query.email;
    const portfolioName = req.query.portfolioName;
    console.log(
      `Getting portfolio value List of Portfolio:${portfolioName} by email...${email}`
    );
    let portfolio = await Portfolio.find({
      emailAddress: email,
      portfolio: portfolioName,
    });

    let pfVal = await getPortfolioValue(portfolio[0]);
    console.log(pfVal);
    res.status(200).send({ value: pfVal });
  } catch (error) {
    console.error("error occurred at portfolio/selectonevalue " + error);
    res.status(500).send("error occurred : " + error);
  }
});

//Get List of portfolio Assets
router_portfolio.get("/portfolio/selectone/assets", async (req, res) => {
  try {
    const email = req.query.email;
    const portfolioName = req.query.portfolioName;
    console.log(
      `Getting asset List of Portfolio:${portfolioName} by email...${email}`
    );
    let portfolio = await Portfolio.find({
      emailAddress: email,
      portfolio: portfolioName,
    });
    let assetList = await getPortfolioAssetsAtDate(portfolio[0], new Date());
    let outputList = [];
    for (let asset in assetList) {
      // assetList[asset]
      let quote = await GetQuote(asset);
      outputList.push({
        symbol: asset,
        quantity:assetList[asset],
        shortName: quote["shortName"],
        longName: quote["longName"],
        regularMarketPrice: quote["regularMarketPrice"],
      });
    }
    res.status(200).send(outputList);
  } catch (error) {
    console.error("error occurred at selectone/assets " + error)
    res.status(500).send("error occurred : " + error);
  }
});
//Get List of transactions of one asset in one portfolio
router_portfolio.get(
  "/portfolio/selectone/asset/transactions",
  async (req, res) => {
    try {
      const email = req.query.email;
      const portfolioName = req.query.portfolioName;
      const assetSymbol = req.query.assetSymbol.toUpperCase();
      console.log(
        `Getting Transactions List of asset: ${assetSymbol} Portfolio:${portfolioName} by email...${email}`
      );
      let portfolio = await Portfolio.find({
        emailAddress: email,
        portfolio: portfolioName,
      });
      let buyList = portfolio[0].buy.toObject();
      let sellList = portfolio[0].sell.toObject();
      let output = { currQty: 0, transactions: [] };
      let currQty = 0;
      while (buyList.length > 0 || sellList.length > 0) {
        let next = false;
        if (buyList.length > 0) {
          if (buyList[0].ticker !== assetSymbol) {
            buyList.shift();
            next = true;
          }
        }
        if (sellList.length > 0) {
          if (sellList[0].ticker !== assetSymbol) {
            sellList.shift();
            next = true;
          }
        }

        if (next) continue;
        if (buyList.length > 0 && sellList.length === 0) {
          let buy = buyList.shift();
          currQty += buy.quantity;
          buy["type"] = "buy";
          output.transactions.push(buy);
          continue;
        } else if (sellList.length > 0 && buyList.length === 0) {
          let sell = sellList.shift();
          currQty -= sell.quantity;
          sell["type"] = "sell";
          output.transactions.push(sell);
          continue;
        } else {
          if (
            buyList[0].ticker === assetSymbol &&
            sellList[0].ticker === assetSymbol
          ) {
            if (buyList[0].date <= sellList[0].date) {
              let buy = buyList.shift();
              currQty += buy.quantity;
              buy["type"] = "buy";
              output.transactions.push(buy);
            } else {
              let sell = sellList.shift();
              currQty -= sell.quantity;
              sell["type"] = "sell";
              output.transactions.push(sell);
            }
            continue;
          }
        }
      }

      output.currQty = currQty;
      res.status(200).send(output);
    } catch (error) {
      console.error("error occurred at selectone/asset/transactions "+ error)
      res.status(500).send("error occurred : " + error);
    }
  }
);

router_portfolio.get(
  "/portfolio/selectone/allassettablestats",
  async (req, res) => {
    try {
      const email = req.query.email;
      const portfolioName = req.query.portfolioName;
      console.log(
        `Getting ALL TABLE STATS for asset List of Portfolio:${portfolioName} by email...${email}`
      );
      let portfolio = await Portfolio.find({
        emailAddress: email,
        portfolio: portfolioName,
      });
      let assetList = await getPortfolioAssetsAtDate(portfolio[0], new Date());
      let outputList = [];
      for (let asset in assetList) {
        let quote = await GetQuote(asset);
        let assetValue = await getAssetInPortfolioValue(portfolio, asset);

        let buyList = portfolio[0].buy.toObject();
        let sellList = portfolio[0].sell.toObject();
        let output = { currQty: 0, transactions: [] };
        let currQty = 0;
        while (buyList.length > 0 || sellList.length > 0) {
          let next = false;
          if (buyList.length > 0) {
            if (buyList[0].ticker !== asset) {
              buyList.shift();
              next = true;
            }
          }
          if (sellList.length > 0) {
            if (sellList[0].ticker !== asset) {
              sellList.shift();
              next = true;
            }
          }

          if (next) continue;
          if (buyList.length > 0 && sellList.length === 0) {
            let buy = buyList.shift();
            currQty += buy.quantity;
            buy["type"] = "buy";
            output.transactions.push(buy);
            continue;
          } else if (sellList.length > 0 && buyList.length === 0) {
            let sell = sellList.shift();
            currQty -= sell.quantity;
            sell["type"] = "sell";
            output.transactions.push(sell);
            continue;
          } else {
            if (buyList[0].ticker === asset && sellList[0].ticker === asset) {
              if (buyList[0].date <= sellList[0].date) {
                let buy = buyList.shift();
                currQty += buy.quantity;
                buy["type"] = "buy";
                output.transactions.push(buy);
              } else {
                let sell = sellList.shift();
                currQty -= sell.quantity;
                sell["type"] = "sell";
                output.transactions.push(sell);
              }
              continue;
            }
          }
        }

        output.currQty = currQty;

        outputList.push({
          symbol: asset,
          quantity: assetList[asset],
          shortName: quote["shortName"],
          longName: quote["longName"],
          regularMarketPrice: quote["regularMarketPrice"],
          value: assetValue,
          transactions: output,
        });
      }
      res.status(200).send(outputList);
    } catch (error) {
      console.error("selectone/allassettablestats: " + error);
      res.status(500).send("error occurred in  get table stats: " + error);
    }
  }
);

//Get Value of one asset in one portfolio
router_portfolio.get("/portfolio/selectone/asset/value", async (req, res) => {
  const email = req.query.email;
  const portfolioName = req.query.portfolioName;
  const assetSymbol = req.query.assetSymbol.toUpperCase();
  console.log(
    `Getting Value of asset: ${assetSymbol} in Portfolio:${portfolioName} by email...${email}`
  );
  try {
    let portfolio = await Portfolio.find({
      emailAddress: email,
      portfolio: portfolioName,
    });
    let assetValue = await getAssetInPortfolioValue(portfolio, assetSymbol);
    res.status(200).send({ value: assetValue });
  } catch (error) {
    console.error("error occurred at selectone/asset/value" + error);
    res.status(500).send(error);
  }
});
//Get list of one portfolioValues over a timeperiod
router_portfolio.get(
  "/portfolio/selectonevalue/timeperiod",
  async (req, res) => {
    const email = req.query.email;
    const portfolioName = req.query.portfolioName;
    const interval = req.query.interval;
    let startDate = new Date(req.query.startDate);
    let endDate = new Date(req.query.endDate);

    console.log(
      `Getting portfolio value over timeperiod of Portfolio:${portfolioName} by email...${email}`
    );
    let portfolio = await Portfolio.find({
      emailAddress: email,
      portfolio: portfolioName,
    });
    getPortfolioHistory(portfolio, startDate, endDate, interval)
      .then((portfolioHistoricalValue) => {
        res.status(200).send(portfolioHistoricalValue);
      })
      .catch((error) => {
        console.error("error occurred at get portfoliovalue over timeperiod " + error);
        res.status(500).send("error occurred at get portfoliovalue over timeperiod " + error);
      });
  }
);

//Get list of one user asset value over a timeperiod
router_portfolio.get(
  "/portfolio/selectoneasset/timeperiod",
  async (req, res) => {
    const email = req.query.email;
    const interval = req.query.interval;
    const portfolioName = req.query.portfolioName;
    const assetSymbol = req.query.assetSymbol.toUpperCase();
    let startDate = new Date(req.query.startDate);
    let endDate = new Date(req.query.endDate);
    console.log(
      `Getting asset ${assetSymbol} value over timeperiod of Portfolio:${portfolioName} by email...${email}`
    );
    let portfolio = await Portfolio.find({
      emailAddress: email,
      portfolio: portfolioName,
    });
    getAssetInPortfolioValueHistory(
      portfolio,
      assetSymbol,
      startDate,
      endDate,
      interval
    )
      .then((assetHistoricalValue) => {
        res.status(200).send(assetHistoricalValue);
      })
      .catch((error) => {
        console.log("error occurred at selectoneasset/timeperiod " + error);
        res.status(500).send("error occurred " + error);
      });
  }
);

//Get list of overall portfolio Values over a timeperiod
router_portfolio.get("/portfolio/overallValue/timeperiod", async (req, res) => {
  const email = req.query.email;
  const interval = req.query.interval;
  let startDate = new Date(req.query.startDate);
  let endDate = new Date(req.query.endDate);

  console.log(
    `Getting overall portfolio value over timeperiod  by email...${email}`
  );
  let portfolio = await Portfolio.find({ emailAddress: email });
  getPortfoliosHistory(portfolio, startDate, endDate, interval)
    .then((portfolioHistoricalValue) => {
      res.status(200).send(portfolioHistoricalValue);
    })
    .catch((error) => {
      console.error("error occurred at portfolio/overallValue/timeperiod " + error);
      res.status(500).send("error occurred " + error);
    });
});

export { router_portfolio };
