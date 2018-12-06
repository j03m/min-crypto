#!/usr/bin/env node
const Client = require("../clients/gdax-client");
const creds = require("../gdax-creds.json");
const client = new Client(creds);
const fetchAndCache = require("./fetch-and-cache");

fetchAndCache(client, 300).then((result) => {
  console.log("done!");
});