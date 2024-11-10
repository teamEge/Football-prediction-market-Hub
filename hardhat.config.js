require("@nomicfoundation/hardhat-ethers");
require("dotenv").config();  // .env dosyasını kullanabilmek için ekleyin

module.exports = {
  solidity: "0.8.26",
  networks: {
    sepolia: {
      url: process.env.INFURA_URL,  // INFURA_URL çevresel değişkenini alır
      accounts: [process.env.PRIVATE_KEY]  // PRIVATE_KEY çevresel değişkenini alır
    }
  }
};
