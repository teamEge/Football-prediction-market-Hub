require('dotenv').config();
const { ethers } = require('ethers');
const axios = require('axios');
const FootballDataABI = require('../FootballData.abi.json');

const infuraUrl = process.env.INFURA_URL;
const privateKey = process.env.PRIVATE_KEY;
const contractAddress = process.env.CONTRACT_ADDRESS;
const apiUrl = process.env.API_URL;
const apiKey = process.env.API_KEY;

const provider = new ethers.providers.JsonRpcProvider(infuraUrl);
const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(contractAddress, FootballDataABI, wallet);

// Sadece Şampiyonlar Ligi için ayarlandı.
const competitionId = 2001; // UEFA Şampiyonlar Ligi'nin ID'si.

async function fetchMatchDetails() {
    const matches = [];
    const today = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
        const response = await axios.get(`${apiUrl}/competitions/${competitionId}/matches`, {
            headers: {
                'X-Auth-Token': apiKey
            },
            params: {
                dateFrom: today,
                dateTo: endDate
            }
        });
        matches.push(...response.data.matches);
    } catch (error) {
        console.error(`Error fetching matches for competition ${competitionId}:`, error.response?.data || error.message);
    }

    return matches;
}

async function fetchMatchScore(matchId) {
    try {
        const response = await axios.get(`${apiUrl}/matches/${matchId}`, {
            headers: { 'X-Auth-Token': apiKey }
        });
        const score = response.data.score;
        return {
            homeScore: score.fullTime.home !== null ? score.fullTime.home : 'N/A',
            awayScore: score.fullTime.away !== null ? score.fullTime.away : 'N/A'
        };
    } catch (error) {
        console.error(`Error fetching match score for match ID ${matchId}:`, error.message);
        return { homeScore: 'N/A', awayScore: 'N/A' };
    }
}

async function addMatchToContract(homeTeam, awayTeam, score, endTime) {
    try {
        const tx = await contract.addMatch(homeTeam, awayTeam, score, endTime);
        await tx.wait();
        console.log(`Match added: ${homeTeam} vs ${awayTeam} with score ${score}`);
    } catch (error) {
        console.error(`Error adding match ${homeTeam} vs ${awayTeam}:`, error.message);
    }
}

async function updateContractWithMatchDetails() {
    const matches = await fetchMatchDetails();

    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const homeTeam = match.homeTeam.name;
        const awayTeam = match.awayTeam.name;
        const endTime = Math.floor(new Date(match.utcDate).getTime() / 1000); // Unix timestamp

        // Maç skorunu ayrı olarak çek
        const { homeScore, awayScore } = await fetchMatchScore(match.id);
        const score = `${homeScore}-${awayScore}`;

        try {
            // Maçı kontrata ekle
            await addMatchToContract(homeTeam, awayTeam, score, endTime);
        } catch (error) {
            console.error(`Error updating contract for ${homeTeam} vs ${awayTeam}:`, error.message);
        }
    }
}

// Her 30 saniyede bir çalışacak şekilde ayarlandı
setInterval(async () => {
    console.log('Updating contract with match details...');
    try {
        await updateContractWithMatchDetails();
    } catch (error) {
        console.error('Error in interval update:', error);
    }
}, 30000); // 30 saniye

// İlk çalıştırma
updateContractWithMatchDetails().catch((error) => {
    console.error('Unhandled error in initial execution:', error);
});
