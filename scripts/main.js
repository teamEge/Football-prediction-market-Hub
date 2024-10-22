require('dotenv').config();
const { ethers } = require('ethers');
const axios = require('axios');
const FootballDataABI = require('../FootballData.abi.json'); // Ana dizinde ise bir üst dizine çıkılmalı

const infuraUrl = process.env.INFURA_URL;
const privateKey = process.env.PRIVATE_KEY;
const contractAddress = process.env.CONTRACT_ADDRESS;
const apiUrl = process.env.API_URL;
const apiKey = process.env.API_KEY;

// Ethereum provider and signer setup
const provider = new ethers.JsonRpcProvider(infuraUrl);
const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(contractAddress, FootballDataABI, wallet);

// Yetkili liglerin kodları
const competitions = ['WC', 'CL', 'BL1', 'DED', 'BSA', 'PD', 'FL1', 'ELC', 'PPL', 'EC', 'SA', 'PL', 'CLI'];

async function fetchMatchesForCompetitions() {
    const matches = [];

    // Bugünün tarihi
    const today = new Date().toISOString().split('T')[0];
    // 3 gün sonrası
    const endDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    for (const competition of competitions) {
        try {
            const response = await axios.get(`${apiUrl}/competitions/${competition}/matches`, {
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
            console.error(`Error fetching matches for ${competition}:`, error.response.data);
        }
    }
    return matches;
}

async function addMatchesToContract(matches) {
    for (const match of matches) {
        const homeTeam = match.homeTeam.name;
        const awayTeam = match.awayTeam.name;
        const endTime = Math.floor(new Date(match.utcDate).getTime() / 1000); // Unix zaman damgasına çevir

        try {
            const tx = await contract.addMatch(homeTeam, awayTeam, endTime);
            await tx.wait();
            console.log(`Match added: ${homeTeam} vs ${awayTeam}`);
        } catch (error) {
            console.error(`Error adding match to contract: ${error}`);
        }
    }
}

async function main() {
    const matches = await fetchMatchesForCompetitions();

    await addMatchesToContract(matches);

    console.log('All matches have been processed.');
}

main().catch((error) => {
    console.error('Error in main:', error);
});
