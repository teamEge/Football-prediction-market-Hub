// scripts/deployBetContract.js

const { ethers } = require("ethers");
const provider = new ethers.JsonRpcProvider(process.env.INFURA_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

async function main() {
    // Hardhat'e özgü getSigners() fonksiyonunu kullanalım
    const [deployer] = await hre.ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    // BetContract'ı alıyoruz
    const BetContract = await hre.ethers.getContractFactory("BetContract");
  
    // Kontratı deploy ederken constructor'a parametreler ekliyoruz
    const footballDataContractAddress = "0xac38a7f8b0d6476e5ccf0e344777697da1621464";  // FootballData contract address
    const commissionAddress = "0x7A97C59E2473292C45D1fe2ebfeFE796782dD8ED";  // Commission address
    
    const betContract = await BetContract.deploy(footballDataContractAddress, commissionAddress);
  
    console.log("BetContract deployed to:", betContract.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  
  
  
