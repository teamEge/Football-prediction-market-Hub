const { ethers } = require('hardhat');
require('dotenv').config();

async function main() {
    // Kontratın tanımını al
    const FootballData = await ethers.getContractFactory('FootballData');

    // Kontratı dağıt
    const footballData = await FootballData.deploy();



    console.log('FootballData adres:', footballData.address);
}

// Hatanın yakalanması
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
