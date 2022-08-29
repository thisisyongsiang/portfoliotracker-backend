import express from 'express';
import { GetHistoricalQuotes, GetQuote, SearchSymbol } from './controller.js';

const financeRouter=express.Router();

financeRouter.get('/financeapi/historical/:ticker',(req,res)=>{
    let startDate = req.query['startdate'];
    let endDate = req.query['enddate'];
    GetHistoricalQuotes(req.params.ticker.toUpperCase(),startDate,endDate)
        .then(val=>{
            res.status(200).send(val);
        })
        .catch(err=>{
            res.status(500).send(`Some Error occured. Error: ${err}`);
        });
})

financeRouter.get('/financeapi/searchsymbols/:term',(req,res)=>{

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

    GetQuote(req.params.ticker)
    .then(val=>{
        res.status(200).send(val);
    })
    .catch(err=>{
        res.status(500).send(`Some Error occured. Error: ${err}`);
    })
})
export {financeRouter};