const { fetchMatchData } = require('./fetchMatchData'); 
const { updateContractData } = require('./updateContractData'); 

async function main() {

    const matchData = await fetchMatchData();


    if (matchData) {

        const formattedData = matchData.map(match => ({
            matchId: match.id, 
            homeTeam: match.homeTeam,
            awayTeam: match.awayTeam,
            score: match.score,
            isFinished: match.isFinished,
            endTime: match.endTime
        }));


        await updateContractData(formattedData);
    } else {
        console.error('No match data fetched');
    }
}

main().catch(error => {
    console.error('MainError', error);
});
