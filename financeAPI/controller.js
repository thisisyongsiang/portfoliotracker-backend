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
    return yahooFinance.quote(ticker);
}
export function SearchSymbol(searchTerm){

    return yahooFinance.search(searchTerm)
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