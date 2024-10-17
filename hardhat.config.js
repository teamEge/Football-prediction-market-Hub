require("@nomicfoundation/hardhat-ethers");
require('dotenv').config();

module.exports = {
    solidity: "0.8.27",
    networks: {
        sepolia: {
            url: process.env.INFURA_URL,
            accounts: [process.env.PRIVATE_KEY]
        }
    }
};
