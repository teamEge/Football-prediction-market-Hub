require("@nomicfoundation/hardhat-ethers");
require('@nomiclabs/hardhat-waffle');
require('dotenv').config();

module.exports = {
  solidity: "0.8.26",
  networks: {
    sepolia: {
      url: process.env.INFURA_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};

