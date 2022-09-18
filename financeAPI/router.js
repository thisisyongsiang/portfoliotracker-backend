import express from 'express';
import { GetDividendEvents, GetHistoricalQuotes, GetQuote, GetSplitEvents, SearchSymbol } from './controller.js';

const financeRouter=express.Router();

financeRouter.get('/financeapi/historical/:ticker',(req,res)=>{
    console.log("get finance historical api")
    let startDate = req.query['startdate'];
    let endDate = req.query['enddate'];
        //interval is in format of '1d','1wk' and '1mo'
    let interval=req.query['interval'];

    GetHistoricalQuotes(req.params.ticker.toUpperCase(),startDate,endDate,interval)
        .then(val=>{
            res.status(200).send(val);
        })
        .catch(err=>{
            res.status(500).send(`Some Error occured. Error: ${err}`);
        });
})

financeRouter.get('/financeapi/searchsymbols/:term',(req,res)=>{
    console.log(`get finance search symbol ${req.params.terms}`);
    SearchSymbol(req.params.term)
    .then(val=>{
        res.status(200).send(val.quotes.filter(d=>{
            return d['symbol']}
        ));
    })
    .catch(err=>{
        res.status(500).send(`Some Error occured. Error: ${err}`);
    })
})

financeRouter.get('/financeapi/quote/:ticker',(req,res)=>{

    console.log(`get finance quote symbol ${req.params.ticker}`);
    GetQuote(req.params.ticker)
    .then(val=>{
        res.status(200).send(val);
    })
    .catch(err=>{
        res.status(500).send(`Some Error occured. Error: ${err}`);
    })
})
financeRouter.get('/financeapi/dividend/:ticker',async (req,res)=>{
    console.log(`get finance dividend symbol ${req.params.ticker}`);
    let startDate = req.query['startdate'];
    
    GetDividendEvents(req.params.ticker,startDate)
    .then(val=>{
        res.status(200).send(val);
    })
    .catch(err=>{
        res.status(500).send(`Some Error occured. Error: ${err}`);
    })
})
financeRouter.get('/financeapi/split/:ticker',(req,res)=>{
    console.log(`get finance split symbol ${req.params.ticker}`);
    let startDate = req.query['startdate'];
    
    GetSplitEvents(req.params.ticker,startDate)
    .then(val=>{
        res.status(200).send(val);
    })
    .catch(err=>{
        res.status(500).send(`Some Error occured. Error: ${err}`);
    })
})
export {financeRouter};