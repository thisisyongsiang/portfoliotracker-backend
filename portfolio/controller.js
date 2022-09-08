import { GetHistoricalQuotes, GetQuote } from "../financeAPI/controller.js";

export async function getPortfolioValue(portfolio) {
  let assets = {};
  portfolio.buy.forEach((b) => {
    assets[b.ticker]
      ? (assets[b.ticker] += b.quantity)
      : (assets[b.ticker] = b.quantity);
  });
  portfolio.sell.forEach((s) => {
    assets[s.ticker]
      ? (assets[s.ticker] -= s.quantity)
      : (assets[s.ticker] = -s.quantity);
  });
  let value = await Object.entries(assets).reduce(async (assetVal, cur) => {
    let quote = await GetQuote(cur[0]);
    return (await assetVal) + cur[1] * quote["regularMarketPrice"];
  }, 0);
  return value;
}

export async function getAssetInPortfolioValue(portfolio, assetSymbol) {
  try {
    let assetsQty = 0;
    portfolio[0].buy.forEach((b) => {
      b.ticker === assetSymbol ? (assetsQty += b.quantity) : null;
    });
    portfolio[0].sell.forEach((s) => {
      s.ticker === assetSymbol ? (assetsQty -= s.quantity) : null;
    });
    let quote = await GetQuote(assetSymbol);
    return (await quote["regularMarketPrice"]) * assetsQty;
  } catch (error) {
    throw error;
  }
}

export function getPortfolioAssetsAtDate(portfolio, date) {
  let assets = {};
  portfolio.buy.forEach((b) => {
    if (b.date > date) return;
    assets[b.ticker]
      ? assets[b.ticker] += b.quantity
      : (assets[b.ticker] = b.quantity);
  });

  portfolio.sell.forEach((s) => {
    if (s.date > date) return;
    assets[s.ticker]
      ? (assets[s.ticker] -= s.quantity)
      : (assets[s.ticker] = -s.quantity);
  });
  return assets;
}
export async function getPortfolioHistory(
  portfolio,
  startDate,
  endDate,
  interval = "1d"
) {
  let historical = {};
  let portfolioHistoricalValue = [];
  let assetsPrevDayVal = {};
  let initSkip = true;
  let eString = `${endDate.getFullYear()}-${String(
    endDate.getMonth() + 1
  ).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;

  try {
    for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
      let pfAssets = getPortfolioAssetsAtDate(portfolio[0], d);
      let dString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getDate()).padStart(2, "0")}`;
      let dailyPfValue = 0;
      // console.log(assetsPrevDayVal);
      assetsPrevDayVal["date"] = d.toDateString();

      for (let asset of Object.entries(pfAssets)) {
        dailyPfValue += await getAssetDailyValue(
          historical,
          asset,
          assetsPrevDayVal,
          d,
          dString,
          eString,
          interval
        );
      }
      let toAdd = true;
      let assetsPrevList = Object.entries(assetsPrevDayVal);
      assetsPrevList.shift();
      if (initSkip) {
        toAdd = assetsPrevList.reduce((chk, curAsset) => {
          return chk && curAsset[1].trading;
        }, true);
      } else {
        toAdd = assetsPrevList.reduce((chk, curAsset) => {
          return chk || curAsset[1].trading;
        }, false);
      }
      if (toAdd) {
        initSkip = false;
        portfolioHistoricalValue.push({
          date: new Date(d),
          value: dailyPfValue,
        });
      }
    }

    //   console.log("Start date "+startDate);
    //   console.log("End date "+endDate);
    return portfolioHistoricalValue;
  } catch (error) {
    throw "error occurred " + error;
  }
}

export async function getPortfoliosHistory(
  portfolios,
  startDate,
  endDate,
  interval = "1d"
) {
  let historical = {};
  let portfolioHistoricalValue = [];
  let assetsPrevDayVal = {};
  let initSkip = true;
  let eString = `${endDate.getFullYear()}-${String(
    endDate.getMonth() + 1
  ).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;

  try {
    for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
      let dailyPfValue = 0;
      let dString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getDate()).padStart(2, "0")}`;
      assetsPrevDayVal["date"] = d.toDateString();
      let overallAssets = {};
      for (let pf of portfolios) {
        let pfAssets = getPortfolioAssetsAtDate(pf, d);
        for (let asset of Object.entries(pfAssets)) {
          !overallAssets[asset[0]]
            ? (overallAssets[asset[0]] = asset[1])
            : (overallAssets[asset[0]] += asset[1]);
        }
      }
      for (let asset of Object.entries(overallAssets)) {
        dailyPfValue += await getAssetDailyValue(
          historical,
          asset,
          assetsPrevDayVal,
          d,
          dString,
          eString,
          interval
        );
      }
      let toAdd = true;
      let assetsPrevList = Object.entries(assetsPrevDayVal);
      assetsPrevList.shift();

      if (initSkip) {
        toAdd = assetsPrevList.reduce((chk, curAsset) => {
          return chk && curAsset[1].trading;
        }, true);
      } else {
        toAdd = assetsPrevList.reduce((chk, curAsset) => {
          return chk || curAsset[1].trading;
        }, false);
      }
      if (toAdd) {
        initSkip = false;
        portfolioHistoricalValue.push({
          date: new Date(d),
          value: dailyPfValue,
        });
      }
    }
    //   console.log("Start date "+startDate);
    //   console.log("End date "+endDate);
    return portfolioHistoricalValue;
  } catch (error) {
    throw error;
  }
}

export async function getAssetInPortfolioValueHistory(
  portfolio,
  assetSymbol,
  startDate,
  endDate,
  interval = "1d"
) {
  let historical = {};
  let assetHistoricalValue = [];
  let assetsPrevDayVal = {};
  let initSkip = true;
  let eString = `${endDate.getFullYear()}-${String(
    endDate.getMonth() + 1
  ).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;
  try {
    for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
      let pfAssets = getPortfolioAssetsAtDate(portfolio[0], d);
      let dString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getDate()).padStart(2, "0")}`;
      assetsPrevDayVal["date"] = d.toDateString();
      if (!pfAssets[assetSymbol]) {
        return null;
      }
      let asset = [assetSymbol, pfAssets[assetSymbol]];
      let dailyValue = await getAssetDailyValue(
        historical,
        asset,
        assetsPrevDayVal,
        d,
        dString,
        eString,
        interval
      );
      let toAdd = true;
      let assetsPrevList = Object.entries(assetsPrevDayVal);
      assetsPrevList.shift();
      if (initSkip) {
        toAdd = assetsPrevList.reduce((chk, curAsset) => {
          return chk && curAsset[1].trading;
        }, true);
      } else {
        toAdd = assetsPrevList.reduce((chk, curAsset) => {
          return chk || curAsset[1].trading;
        }, false);
      }
      if (toAdd) {
        initSkip = false;
        assetHistoricalValue.push({
          date: new Date(d),
          value: dailyValue,
        });
      }
    }
    return assetHistoricalValue;
  } catch (error) {
    throw "error occurred " + error;
  }
}
async function getAssetDailyValue(
  historical,
  asset,
  assetsPrevDayVal,
  d,
  dString,
  eString,
  interval = "1d"
) {
  let dailyPfValue = 0;
  if (!historical[asset[0]]) {
    let histQuote = await GetHistoricalQuotes(
      asset[0],
      dString,
      eString,
      interval
    );
    historical[asset[0]] = histQuote;
  }
  if (historical[asset[0]].length === 0) return;
  let assetDate = new Date(historical[asset[0]][0].date);
  if (
    assetDate.getDate() === d.getDate() &&
    assetDate.getFullYear() === d.getFullYear() &&
    assetDate.getMonth() === d.getMonth()
  ) {
    let dayAsset = historical[asset[0]][0];
    if (historical[asset[0]].length > 1) {
      dayAsset = historical[asset[0]].shift();
    }
    dailyPfValue = dayAsset["adjClose"] * asset[1];
    assetsPrevDayVal[asset[0]] = {
      val: dayAsset["adjClose"] * asset[1],
      trading: true,
    };
  } else {
    assetsPrevDayVal[asset[0]]
      ? (assetsPrevDayVal[asset[0]]["trading"] = false)
      : (assetsPrevDayVal[asset[0]] = { trading: false });
    dailyPfValue = assetsPrevDayVal[asset[0]]["val"]
      ? assetsPrevDayVal[asset[0]]["val"]
      : 0;

    //considering some markets are active in some days while others are on holiday
  }
  return dailyPfValue;
}
