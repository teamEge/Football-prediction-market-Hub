const { ethers } = require('hardhat');
require('dotenv').config();

async function main() {
    const FootballData = await ethers.getContractFactory('FootballData');

    console.log('Deploying contract...');

    const footballData = await FootballData.deploy();

    await footballData.waitForDeployment();
    console.log('FootballData contract deployed successfully. Address:', footballData.target);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Error during main execution:', error);
        process.exit(1);
    });
