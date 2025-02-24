require('dotenv').config();
const { ethers } = require('ethers');
const axios = require('axios');
const FootballDataABI = require('../FootballData.abi.json');

// Environment variables
const infuraUrl = process.env.INFURA_URL;
const privateKey = process.env.PRIVATE_KEY;
const contractAddress = process.env.FOOTBALL_DATA_CONTRACT_ADDRESS;
const apiUrl = process.env.API_URL;
const apiKey = process.env.API_KEY;

// Ethereum provider and wallet connection
const provider = new ethers.providers.JsonRpcProvider(infuraUrl);
const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(contractAddress, FootballDataABI, wallet);

// Champions League (CL) competitionId
const competitionId = 2001;

// Function to fetch match details from the API
async function fetchMatchDetails() {
    const matches = [];
    const today = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 20-day interval

    try {
        const response = await axios.get(`${apiUrl}/competitions/${competitionId}/matches`, {
            headers: { 'X-Auth-Token': apiKey },
            params: { dateFrom: today, dateTo: endDate }
        });
        matches.push(...response.data.matches);
    } catch (error) {
        console.error(`Error fetching matches for competition ${competitionId}:`, error.response?.data || error.message);
    }

    return matches;
}

// Function to fetch the score and status of a specific match
async function fetchMatchScore(matchId) {
    try {
        const response = await axios.get(`${apiUrl}/matches/${matchId}`, {
            headers: { 'X-Auth-Token': apiKey }
        });
        const score = response.data.score;
        return {
            homeScore: score.fullTime.home !== null ? score.fullTime.home : 'N/A',
            awayScore: score.fullTime.away !== null ? score.fullTime.away : 'N/A',
            status: response.data.status // Adding match status
        };
    } catch (error) {
        console.error(`Error fetching match score for match ID ${matchId}:`, error.message);
        return { homeScore: 'N/A', awayScore: 'N/A', status: 'N/A' };
    }
}

// Function to add a match to the contract
async function addMatchToContract(homeTeam, awayTeam, score, endTime) {
    try {
        const tx = await contract.addMatch(homeTeam, awayTeam, score, endTime);
        await tx.wait();
        console.log(`Match added: ${homeTeam} vs ${awayTeam} with score ${score}`);
    } catch (error) {
        console.error(`Error adding match ${homeTeam} vs ${awayTeam}:`, error.message);
    }
}

// Function to mark a match as "finished" in the contract
async function finishMatchInContract(index) {
    try {
        const tx = await contract.finishMatches(index);
        await tx.wait();
        console.log(`Match at index ${index} marked as finished.`);
    } catch (error) {
        console.error(`Error finishing match at index ${index}:`, error.message);
    }
}

// Function to update the contract with match details
async function updateContractWithMatchDetails() {
    const matches = await fetchMatchDetails();

    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const homeTeam = match.homeTeam.name;
        const awayTeam = match.awayTeam.name;
        const endTime = Math.floor(new Date(match.utcDate).getTime() / 1000);
        const { homeScore, awayScore, status } = await fetchMatchScore(match.id);
        const score = `${homeScore}-${awayScore}`;

        try {
            // Add the match to the contract
            await addMatchToContract(homeTeam, awayTeam, score, endTime);

            // If the match status is FINISHED, mark it in the contract
            if (status === 'FINISHED') {
                await finishMatchInContract(i);
            }
        } catch (error) {
            console.error(`Error updating contract for ${homeTeam} vs ${awayTeam}:`, error.message);
        }
    }
}

// Start the contract update process at regular intervals
setInterval(async () => {
    console.log('Updating contract with match details...');
    try {
        await updateContractWithMatchDetails();
    } catch (error) {
        console.error('Error in interval update:', error);
    }
}, 120000); // Updates every 2 minutes

// Initial execution
updateContractWithMatchDetails().catch((error) => {
    console.error('Unhandled error in initial execution:', error);
});
