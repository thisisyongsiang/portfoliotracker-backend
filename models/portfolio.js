import mongoose from "mongoose";

const Schema = mongoose.Schema;

const portfolioSchema = new Schema({
    emailAddress: {
        type: String,
        require: true,
        unique: true
    },
    cash: {
        type: Number
    },
    equity: [{
        name: String,
        ticker: {
            type: String,
            required: true,
            unique: true
        },
        bought: [{
            shares: Number,
            price: Number,
            added: Date
        }]
    }]
});

const Portfolio = mongoose.model("portfolio", portfolioSchema);

export default Portfolio;