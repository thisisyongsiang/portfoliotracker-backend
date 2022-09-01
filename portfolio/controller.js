import { GetQuote } from "../financeAPI/controller.js";

export async function getPortfolioValue(portfolio){
    let assets={};
    portfolio.buy.forEach(b=>{
        assets[b.ticker]?assets[b.ticker+=b.quantity]:assets[b.ticker]=b.quantity;
    });
    portfolio.sell.forEach(s=>{
        assets[s.ticker]?assets[s.ticker]-=s.quantity:assets[s.ticker]=-s.quantity;
    });
    let value=await Object.entries(assets).reduce(async(assetVal,cur)=>{
        let quote = await GetQuote(cur[0]);
       return await assetVal+ cur[1]*quote['regularMarketPrice'];
    },0)
    return value;
}

export  function getPortfolioAssetsAtDate(portfolio,date){
    let assets={};
    portfolio.buy.forEach(b=>{
        if(b.date>date)return;
        assets[b.ticker]?assets[b.ticker+=b.quantity]:assets[b.ticker]=b.quantity;
    });

    portfolio.sell.forEach(s=>{
        if(s.date>date)return;
        assets[s.ticker]?assets[s.ticker]-=s.quantity:assets[s.ticker]=-s.quantity;
    });
    return assets;
}
