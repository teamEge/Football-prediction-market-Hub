const { ethers } = require("hardhat");

async function main() {
  // Hardhat'ın sağladığı signer'ları almak için hre kullanıyoruz
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // FootballData kontratını alıyoruz
  const FootballData = await hre.ethers.getContractFactory("FootballData");

  // Oracle adresini deployer'dan alıyoruz
  const oracleAddress = deployer.address;
  console.log("Oracle address set to:", oracleAddress);

  // FootballData kontratını deploy ediyoruz, oracle adresini constructor'a geçiriyoruz
  const footballDataContract = await FootballData.deploy(oracleAddress);
  await footballDataContract.deployed();

  console.log("FootballData contract deployed to:", footballDataContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
