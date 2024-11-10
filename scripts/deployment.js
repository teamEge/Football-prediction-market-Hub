const { ethers } = require("hardhat");
require("dotenv").config(); // .env dosyasını kullanmak için

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying BetContract with the account:", deployer.address);

  // BetContract kontratını dağıt (FootballData adresini ve komisyon adresini parametre olarak geç)
  const footballDataAddress = process.env.FOOTBALL_DATA_ADDRESS; // FootballData kontratının adresi
  const commissionAddress = deployer.address; // Komisyon adresi olarak deployer'ı kullanıyoruz

  const BetContract = await ethers.getContractFactory("BetContract");
  const betContract = await BetContract.deploy(footballDataAddress, commissionAddress);
  console.log("BetContract deployed to:", betContract.address);

  // Opsiyonel: Eğer komisyon adresini değiştirmek isterseniz
  // await betContract.setCommissionAddress(newCommissionAddress);
}

// Hata yakalama
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
