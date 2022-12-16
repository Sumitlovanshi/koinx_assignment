const request = require('request');
const { MongoClient } = require('mongodb');
const express = require('express');
const app = express();
const cron = require('node-cron');

const url = 'mongodb://localhost:27017';
const dbName = 'ethereum_prices';

async function fetchEthereumPrice() {
  const apiUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr';

  request(apiUrl, (error, response, body) => {
    if (error) {
      console.error(error);
    } else if (response.statusCode !== 200) {
      console.error(`Request failed with status code ${response.statusCode}`);
    } else {
      const price = JSON.parse(body).ethereum.inr;

      const client = new MongoClient(url);
      client.connect((error) => {
        if (error) {
          console.error(error);
        } else {
          console.log('Connected to MongoDB');

          const db = client.db(dbName);
          const collection = db.collection('prices');

          collection.insertOne({ price: price }, (error, result) => {
            if (error) {
              console.error(error);
            } else {
              console.log(`Ethereum price stored: ${price} INR`);
            }
            client.close();
          });
        }
      });
    }
  });
}


cron.schedule('*/10 * * * *', () => {
  fetchEthereumPrice();
});

app.listen(3000, () => {
  console.log('Ethereum Price API listening on port 3000!');
});