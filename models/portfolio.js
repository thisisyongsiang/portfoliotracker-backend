import mongoose from "mongoose";

const Schema = mongoose.Schema;

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
        fees: Number
    }]
});

const Portfolio = mongoose.model("portfolio", portfolioSchema);

export default Portfolio;