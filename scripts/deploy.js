const { ethers } = require('hardhat');
require('dotenv').config();

async function main() {
    // FootballData kontratını oluştur
    const FootballData = await ethers.getContractFactory('FootballData');

    console.log('Kontrat deploy ediliyor...');

    // Kontratı dağıt
    const footballData = await FootballData.deploy();

    // Dağıtım tamamlandıktan sonra, kontratın adresini yazdır
    await footballData.waitForDeployment(); // Burada yeni yöntem kullanılıyor
    console.log('FootballData kontratı başarıyla dağıtıldı. Adresi:', footballData.target);
}

// Ana işlemi çalıştır
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Ana işlem sırasında hata:', error);
        process.exit(1);
    });
