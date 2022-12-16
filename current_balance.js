const express = require('express');
const app = express();
const request = require('request');
const { toWei } = require('web3-utils');

app.get('/balance', (req, res) => {
  const address = '0xce94e5621a5f7068253c42558c147480f38b5e0d';
  const apiKey = '75EE3VAMRNDFT7ZHH4EJ91HRIJZ4B89YRM';
  const etherscanUrl = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&sort=asc&apikey=${apiKey}`;

  request(etherscanUrl, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      const transactions = JSON.parse(body).result;
      let balance = 0;

      transactions.forEach((transaction) => {
        if (transaction.to === address) {
          balance += toWei(transaction.value, 'ether');
        } else if (transaction.from === address) {
          balance -= toWei(transaction.value, 'ether');
        }
      });

      balance = Number(fromWei(balance, 'ether'));

      const coingeckoUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr';
      request(coingeckoUrl, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          const price = JSON.parse(body).ethereum.inr;
          res.json({ balance: balance, price: price });
        } else {
          res.status(500).send({ error: 'Error fetching Ether price' });
        }
      });
    } else {
      res.status(500).send({ error: 'Error fetching transactions' });
    }
  });
});

app.listen(3000, () => {
    console.log('Ethereum balance API listening on port 3000!');
});