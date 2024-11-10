const { ethers } = require("hardhat");

async function main() {
  // Hardhat'ın sağladığı signer'ları almak için hre kullanıyoruz
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // FootballData kontratını alıyoruz
  const FootballData = await hre.ethers.getContractFactory("FootballData");

  // FootballData kontratını deploy ediyoruz
  const footballDataContract = await FootballData.deploy();
  await footballDataContract.deployed();

  console.log("FootballData contract deployed to:", footballDataContract.address);

  // Oracle adresi olarak deployer'ın adresini kullanıyoruz
  const oracleAddress = deployer.address;
  console.log("Oracle address set to:", oracleAddress);

  // Oracle adresini kontrata set etme işlemi
  await footballDataContract.setOracle(oracleAddress);
  console.log("Oracle address has been set in the contract.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
