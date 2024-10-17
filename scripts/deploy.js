const { ethers } = require('hardhat');
require('dotenv').config();

async function main() {
    // Kontratın tanımını al
    const FootballData = await ethers.getContractFactory('FootballData');

    // Kontratı dağıt
    const footballData = await FootballData.deploy();

    // Dağıtım işleminin tamamlanmasını bekle
    await footballData.deployed();

    // Başarılı bir dağıtım sonrası adresi yazdır
    console.log('FootballData adres:', footballData.address);
}

// Hatanın yakalanması
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Hata:", error); // Daha ayrıntılı hata çıktısı
        process.exit(1);
    });
