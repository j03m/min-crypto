#!/usr/bin/env node
const creds = require("../../creds");
const Binance = require("binance-api-node").default;
const fetchAndCache = require("./fetch-and-cache");
const binanceClient = Binance({
  apiKey: creds.apiKey,
  apiSecret: creds.apiSecret,
});

fetchAndCache(binanceClient, 500).then((result) => {
  console.log("done!");
});