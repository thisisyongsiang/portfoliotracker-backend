import yahooFinance from "yahoo-finance2";

export function GetHistoricalQuotes(ticker,startPeriod,endPeriod,interval){
    //interval is in format of '1d','1wk' and '1mo'
    let queryOptions={period1:startPeriod};
    if(endPeriod){
         queryOptions.period2=endPeriod;
    }
    if(interval){
        queryOptions.interval=interval
    }
    try{
        
        return yahooFinance.historical(ticker,queryOptions);
    }
    catch(err){
        console.log(err);
        return null;
    }

}
export function GetQuote(ticker){
    try {
        
    return yahooFinance.quote(ticker);
    } catch (error) {
        console.log(err);
        return null; 
    }
}
export function SearchSymbol(searchTerm){
    try {
    return yahooFinance.search(searchTerm)
    } catch (error) {
        console.log(err);
        return null; 
    }
}
export async function GetDividendEvents(ticker,startPeriod){
    let queryOptions={period1:startPeriod,
    events:"dividend"};    
   try{
       
       return await yahooFinance.historical(ticker,queryOptions,{validateResult:false});
   }
   catch(err){
    //    console.log(err);
       return null;
   }
}
export async function GetSplitEvents(ticker,startPeriod){
    console.log(ticker);
    console.log(startPeriod);
    let queryOptions={period1:startPeriod,
    events:"split"};    
   try{
      return await yahooFinance.historical(ticker,queryOptions,{validateResult:false});
   }
   catch(err){
    //    console.log(err);
       return null;
   }
}