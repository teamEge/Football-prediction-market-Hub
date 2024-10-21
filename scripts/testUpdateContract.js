const { updateContractData } = require('./updateContractData'); // updateContractData fonksiyonunu içe aktarıyoruz

async function main() {
    const matchData = [
        {
            matchId: null, // Yeni maç eklemek için matchId null
            homeTeam: "Team A",
            awayTeam: "Team B",
            score: "1-0",
            isFinished: false,
            endTime: Math.floor(Date.now() / 1000) + 3600 // 1 saat sonra
        },
        {
            matchId: 0, // Var olan maçı güncellemek için matchId
            homeTeam: "Team C",
            awayTeam: "Team D",
            score: "2-1",
            isFinished: true,
            endTime: Math.floor(Date.now() / 1000) - 3600 // 1 saat önce
        }
    ];

    await updateContractData(matchData); // matchData'yı kontrata güncelle
}

main().catch(error => {
    console.error('TestError', error); // Hata durumunda konsola yazdır
});
