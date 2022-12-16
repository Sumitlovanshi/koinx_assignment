const axios = require('axios');
const mongoose = require('mongoose');
const express = require('express');
const app = express();

mongoose.connect('mongodb://localhost:27017/mydatabase', { useNewUrlParser: true });

const transactionSchema = new mongoose.Schema({
  blockNumber: String,
  timeStamp: String,
  hash: String,
  nonce: String,
  blockHash: String,
  transactionIndex: String,
  from: String,
  to: String,
  value: String,
  gas: String,
  gasPrice: String,
  isError: String,
  txreceipt_status: String,
  input: String,
  contractAddress: String,
  cumulativeGasUsed: String,
  gasUsed: String,
  confirmations: String
});

const Transaction = mongoose.model('Transaction', transactionSchema);

async function getTransactions(address, apiKey) {
  try {
    const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&sort=asc&apikey=${apiKey}`;

    const response = await axios.get(url);
    const { data } = response;
    const { result } = data;
    const normalTransactions = result.filter(transaction => transaction.input === '0x');

    for (const transaction of normalTransactions) {
      const newTransaction = new Transaction(transaction);
      await newTransaction.save();
    }
  } catch (error) {
    console.error(error);
  }
}

app.get('/transactions', async (req, res) => {
  const apiKey = '75EE3VAMRNDFT7ZHH4EJ91HRIJZ4B89YRM'; //personal api key
  const address = '0xce94e5621a5f7068253c42558c147480f38b5e0d'; // given for testing in the doc itself
  const transactions = await getTransactions(address, apiKey);
  res.send(transactions);
});

app.listen(3000, () => {
  console.log('Ethereum transactions API listening on port 3000!');
});