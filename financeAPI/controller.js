import yahooFinance from "yahoo-finance2";

export function GetHistoricalQuotes(ticker,startPeriod,endPeriod){
    let queryOptions={};
    if(endPeriod){
         queryOptions={period1:startPeriod,period2:endPeriod};
    }
    else{
         queryOptions={period1:startPeriod};
    }
    return yahooFinance.historical(ticker,queryOptions);

}
export function GetQuote(ticker){
    return yahooFinance.quote(ticker);
}
export function SearchSymbol(searchTerm){

    return yahooFinance.search(searchTerm)
}