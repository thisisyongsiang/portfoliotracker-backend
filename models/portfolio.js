import mongoose from "mongoose";

const Schema = mongoose.Schema;
const cashSchema=new Schema({
    ticker: String,
    name: String,
    type: String,
    value: Number,
    date: Date,
    currency: String
});
const portfolioSchema = new Schema({
    emailAddress: {
        type: String,
        require: true,
    },
    portfolio: {
        type: String,
        require: true
    },
    buy: [{
        ticker: String,
        name: String,
        price: Number,
        quantity: Number,
        value: Number,
        date: Date,
        fees: Number,
        currency: String,
        fxRate: Number,
        frequency: String
    }],
    sell: [{
        ticker: String,
        name: String,
        price: Number,
        quantity: Number,
        value: Number,
        date: Date,
        fees: Number,
        currency: String,
        fxRate: Number,
        frequency: String
    }],
    cash: [cashSchema]
});

const Portfolio = mongoose.model("portfolio", portfolioSchema);

export default Portfolio;